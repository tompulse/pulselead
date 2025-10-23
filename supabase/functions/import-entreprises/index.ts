import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EntrepriseInput {
  nom?: string;
  siret?: string;
  adresse?: string;
  code_postal?: string;
  ville?: string;
  telephone?: string;
  email?: string;
  site_web?: string;
  activite?: string;
  forme_juridique?: string;
  dirigeant?: string;
  date_demarrage?: string;
  capital?: number | string;
  effectifs?: number | string;
  chiffre_affaires?: number | string;
  code_naf?: string;
  numero_voie?: string;
  type_voie?: string;
  nom_voie?: string;
  latitude?: number | string;
  longitude?: number | string;
  [key: string]: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user has admin role
    const { data: hasAdminRole } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!hasAdminRole) {
      return new Response(
        JSON.stringify({ error: 'Accès refusé. Vous devez être administrateur.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { entreprises } = await req.json();

    if (!Array.isArray(entreprises)) {
      throw new Error('Le format des données est invalide. Un tableau est attendu.');
    }

    console.log(`Starting import of ${entreprises.length} entreprises...`);

    // Clean and transform data
    const cleanedData = entreprises
      .map((ent: EntrepriseInput) => {
        // Clean SIRET
        const siret = String(ent.siret || '').replace(/\s+/g, '').trim();
        
        if (!siret || siret.length < 14) {
          return null;
        }

        // Parse numeric fields
        const parseNumber = (value: any): number | null => {
          if (value === null || value === undefined || value === '') return null;
          const num = typeof value === 'string' ? parseFloat(value.replace(/[^\\d.-]/g, '')) : Number(value);
          return isNaN(num) ? null : num;
        };

        return {
          siret,
          nom: String(ent.nom || '').trim() || null,
          adresse: String(ent.adresse || '').trim() || null,
          numero_voie: String(ent.numero_voie || '').trim() || null,
          type_voie: String(ent.type_voie || '').trim() || null,
          nom_voie: String(ent.nom_voie || '').trim() || null,
          code_postal: String(ent.code_postal || '').trim() || null,
          ville: String(ent.ville || '').trim() || null,
          telephone: String(ent.telephone || '').trim() || null,
          email: String(ent.email || '').trim() || null,
          site_web: String(ent.site_web || '').trim() || null,
          activite: String(ent.activite || '').trim() || null,
          forme_juridique: String(ent.forme_juridique || '').trim() || null,
          dirigeant: String(ent.dirigeant || '').trim() || null,
          code_naf: String(ent.code_naf || '').trim() || null,
          date_demarrage: ent.date_demarrage || null,
          capital: parseNumber(ent.capital),
          effectifs: parseNumber(ent.effectifs),
          chiffre_affaires: parseNumber(ent.chiffre_affaires),
          latitude: parseNumber(ent.latitude),
          longitude: parseNumber(ent.longitude),
          enrichi: false,
          score_lead: 0,
        };
      })
      .filter((ent): ent is NonNullable<typeof ent> => ent !== null);

    console.log(`Cleaned data: ${cleanedData.length} valid entreprises`);

    // Remove duplicates by SIRET (keep first occurrence)
    const uniqueData = Array.from(
      new Map(cleanedData.map(item => [item.siret, item])).values()
    );

    console.log(`After deduplication: ${uniqueData.length} unique entreprises`);

    if (uniqueData.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Aucune entreprise valide à importer' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Batch insert (500 at a time to avoid timeouts)
    const batchSize = 500;
    let totalInserted = 0;
    let totalUpdated = 0;

    for (let i = 0; i < uniqueData.length; i += batchSize) {
      const batch = uniqueData.slice(i, i + batchSize);
      
      const { error: upsertError, count } = await supabase
        .from('entreprises')
        .upsert(batch, { 
          onConflict: 'siret',
          count: 'exact'
        });

      if (upsertError) {
        console.error(`Error upserting batch ${i}-${i + batch.length}:`, upsertError);
        throw upsertError;
      }

      totalInserted += count || 0;
      console.log(`Processed batch ${i / batchSize + 1}: ${count} records`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: uniqueData.length,
        inserted: totalInserted,
        message: `Import réussi : ${totalInserted} entreprises synchronisées`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erreur lors de l\'import'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
