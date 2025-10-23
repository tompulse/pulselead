import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// List of valid categories (extended)
const VALID_CATEGORIES = [
  'livraison', 'restauration', 'construction', 'immobilier', 
  'commerce', 'energie', 'transport', 'technologie', 
  'services', 'sante', 'industrie', 'communication',
  'agriculture', 'education', 'artisanat', 'finance',
  'culture', 'juridique', 'activité non précisée'
];

// Background task to qualify entreprises
async function qualifyEntreprisesBackground(
  supabase: any,
  lovableApiKey: string,
  entrepriseIds: string[]
) {
  console.log(`Qualifying ${entrepriseIds.length} entreprises in background...`);
  
  // Process in small batches to respect rate limits
  const batchSize = 10;
  let qualified = 0;
  
  for (let i = 0; i < entrepriseIds.length; i += batchSize) {
    const batch = entrepriseIds.slice(i, i + batchSize);
    
    // Get entreprise details
    const { data: entreprises } = await supabase
      .from('entreprises')
      .select('id, activite, administration, forme_juridique')
      .in('id', batch);
    
    if (!entreprises) continue;
    
    // Qualify each in parallel
    await Promise.all(
      entreprises.map(async (ent: any) => {
        try {
          const prompt = `Analyse cette entreprise et détermine sa catégorie d'activité principale.

CONTEXTE:
- Activité: ${ent.activite || 'Non spécifiée'}
- Administration: ${ent.administration || 'Non spécifiée'}
- Forme juridique: ${ent.forme_juridique || 'Non spécifiée'}

CATÉGORIES DISPONIBLES (tu DOIS choisir UNE de ces catégories):
- livraison: Coursiers, livreurs, transport de colis
- restauration: Restaurants, traiteurs, food trucks, cafés
- construction: BTP, travaux, rénovation, maçonnerie
- immobilier: SCI, agences, gestion locative, promotion
- commerce: Boutiques, vente, négoce, distribution
- energie: Électricité, gaz, panneaux solaires, énergie renouvelable
- transport: Taxis, VTC, transporteurs, déménagement
- technologie: IT, développement, services numériques
- services: Conseil, formation, services aux entreprises, holdings
- sante: Professions médicales, paramédicales, bien-être
- industrie: Fabrication, production, usines
- communication: Marketing, publicité, médias, graphisme
- agriculture: Exploitation agricole, viticulture, élevage
- education: Enseignement, formation, cours
- artisanat: Artisans, réparation, services à la personne
- finance: Banque, assurance, gestion de patrimoine
- culture: Spectacles, événementiel, sport, loisirs
- juridique: Avocats, notaires, services juridiques

RÈGLES IMPORTANTES:
- Tu DOIS choisir la catégorie la PLUS PROCHE même si ce n'est pas parfait
- NE retourne JAMAIS "other", "autre" ou "activité non précisée"
- Si l'activité n'est pas claire, choisis "services" par défaut
- Privilégie toujours une catégorie spécifique

EXEMPLES:
- Restaurant = "restauration"
- Coursier vélo = "livraison"
- SCI = "immobilier"
- Plombier = "construction"
- Développeur freelance = "technologie"
- Coach = "services"

Réponds UNIQUEMENT: "categorie|confidence" (ex: "restauration|95")`;

          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash-lite',
              messages: [{ role: 'user', content: prompt }],
            }),
          });

          if (!aiResponse.ok) {
            console.error(`AI error for ${ent.id}: ${aiResponse.status}`);
            return;
          }

          const aiData = await aiResponse.json();
          const response = aiData.choices[0].message.content.trim();
          const [categorie, confidenceStr] = response.split('|');
          const confidence = parseInt(confidenceStr) || 50;

          // Validate category
          const cleanedCategory = categorie.toLowerCase().trim();
          const finalCategory = VALID_CATEGORIES.includes(cleanedCategory) 
            ? cleanedCategory 
            : 'services';

          await supabase
            .from('entreprises')
            .update({
              categorie_qualifiee: finalCategory,
              categorie_confidence: VALID_CATEGORIES.includes(cleanedCategory) ? confidence : 50,
              date_qualification: new Date().toISOString(),
            })
            .eq('id', ent.id);

          qualified++;
          console.log(`Qualified ${ent.id}: ${finalCategory} (${confidence}%)`);
        } catch (err) {
          console.error(`Error qualifying ${ent.id}:`, err);
        }
      })
    );
    
    // Wait between batches to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`Background qualification complete: ${qualified}/${entrepriseIds.length}`);
}

// Requalify entreprises with invalid categories
async function requalifyInvalidCategories(
  supabase: any,
  lovableApiKey: string
) {
  console.log('Checking for invalid categories...');
  
  // Find all entreprises with invalid categories (excluding "activité non précisée" which is now valid)
  const { data: invalidEntreprises } = await supabase
    .from('entreprises')
    .select('id, nom, siret, activite, forme_juridique, administration')
    .or(`categorie_qualifiee.eq.autre,categorie_qualifiee.eq.Autre,categorie_qualifiee.like.%impossible%,categorie_qualifiee.like.exploitation%,categorie_qualifiee.like.compte tenu%,categorie_qualifiee.like.il est impossible%`)
    .limit(100);

  if (!invalidEntreprises || invalidEntreprises.length === 0) {
    console.log('No invalid categories found');
    return;
  }

  console.log(`Found ${invalidEntreprises.length} entreprises with invalid categories, requalifying...`);
  
  // Process in small batches
  const batchSize = 10;
  let requalified = 0;

  for (let i = 0; i < invalidEntreprises.length; i += batchSize) {
    const batch = invalidEntreprises.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (ent: any) => {
        try {
          const prompt = `Analyse cette entreprise et détermine sa catégorie d'activité principale.

CONTEXTE:
- Nom: ${ent.nom}
- Activité: ${ent.activite || 'Non spécifiée'}
- Administration: ${ent.administration || 'Non spécifiée'}
- Forme juridique: ${ent.forme_juridique || 'Non spécifiée'}

CATÉGORIES DISPONIBLES (tu DOIS choisir UNE de ces catégories):
- livraison: Coursiers, livreurs, transport de colis
- restauration: Restaurants, traiteurs, food trucks, cafés
- construction: BTP, travaux, rénovation, maçonnerie
- immobilier: SCI, agences, gestion locative, promotion
- commerce: Boutiques, vente, négoce, distribution
- energie: Électricité, gaz, panneaux solaires, énergie renouvelable
- transport: Taxis, VTC, transporteurs, déménagement
- technologie: IT, développement, services numériques
- services: Conseil, formation, services aux entreprises, holdings
- sante: Professions médicales, paramédicales, bien-être
- industrie: Fabrication, production, usines
- communication: Marketing, publicité, médias, graphisme
- agriculture: Exploitation agricole, viticulture, élevage
- education: Enseignement, formation, cours
- artisanat: Artisans, réparation, services à la personne
- finance: Banque, assurance, gestion de patrimoine
- culture: Spectacles, événementiel, sport, loisirs
- juridique: Avocats, notaires, services juridiques

RÈGLES IMPORTANTES:
- Tu DOIS choisir la catégorie la PLUS PROCHE même si ce n'est pas parfait
- NE retourne JAMAIS "other", "autre" ou "activité non précisée"
- Si l'activité n'est pas claire, choisis "services" par défaut
- Privilégie toujours une catégorie spécifique

Réponds UNIQUEMENT: "categorie|confidence" (ex: "restauration|95")`;

          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash-lite',
              messages: [{ role: 'user', content: prompt }],
            }),
          });

          if (!aiResponse.ok) {
            console.error(`AI error for ${ent.id}: ${aiResponse.status}`);
            // Fallback to services
            await supabase
              .from('entreprises')
              .update({
                categorie_qualifiee: 'services',
                categorie_confidence: 50,
                date_qualification: new Date().toISOString(),
              })
              .eq('id', ent.id);
            return;
          }

          const aiData = await aiResponse.json();
          const response = aiData.choices[0].message.content.trim();
          const [categorie, confidenceStr] = response.split('|');
          const confidence = parseInt(confidenceStr) || 50;

          // Validate category
          const cleanedCategory = categorie.toLowerCase().trim();
          const finalCategory = VALID_CATEGORIES.includes(cleanedCategory) 
            ? cleanedCategory 
            : 'services';

          await supabase
            .from('entreprises')
            .update({
              categorie_qualifiee: finalCategory,
              categorie_confidence: VALID_CATEGORIES.includes(cleanedCategory) ? confidence : 50,
              date_qualification: new Date().toISOString(),
            })
            .eq('id', ent.id);

          requalified++;
          console.log(`Requalified ${ent.id}: ${finalCategory} (${confidence}%)`);
        } catch (err) {
          console.error(`Error requalifying ${ent.id}:`, err);
        }
      })
    );
    
    // Wait between batches to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`Requalification complete: ${requalified}/${invalidEntreprises.length}`);
}

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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
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

    // Clean and transform data (supports BODACC & standard format)
    const cleanedData = entreprises
      .map((ent: any) => {
        // Handle BODACC format: registre is an array with SIRET
        let siret = '';
        if (Array.isArray(ent.registre) && ent.registre.length > 0) {
          siret = String(ent.registre[0]).replace(/\s+/g, '').trim();
        } else if (ent.siret) {
          siret = String(ent.siret).replace(/\s+/g, '').trim();
        }
        
        if (!siret || siret.length < 9) {
          return null;
        }

        // Parse JSON strings from BODACC
        let personneData: any = {};
        let etablissementData: any = {};
        
        try {
          if (typeof ent.listepersonnes === 'string') {
            const parsed = JSON.parse(ent.listepersonnes);
            personneData = parsed.personne || {};
          }
          if (typeof ent.listeetablissements === 'string') {
            const parsed = JSON.parse(ent.listeetablissements);
            etablissementData = parsed.etablissement || {};
          }
        } catch (e) {
          // Ignore parsing errors
        }

        // Parse numeric fields
        const parseNumber = (value: any): number | null => {
          if (value === null || value === undefined || value === '') return null;
          const num = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : Number(value);
          return isNaN(num) ? null : num;
        };

        // Extract address from BODACC format
        const adresseSiege = personneData.adresseSiegeSocial || etablissementData.adresse || {};
        const capital = personneData.capital?.montantCapital || ent.capital;

        return {
          siret,
          nom: ent.commercant || personneData.denomination || ent.nom || null,
          adresse: ent.adresse || null,
          numero_voie: adresseSiege.numeroVoie || ent.numero_voie || null,
          type_voie: adresseSiege.typeVoie || ent.type_voie || null,
          nom_voie: adresseSiege.nomVoie || ent.nom_voie || null,
          code_postal: ent.cp || adresseSiege.codePostal || ent.code_postal || null,
          ville: ent.ville || adresseSiege.ville || null,
          telephone: ent.telephone || null,
          email: ent.email || null,
          site_web: ent.site_web || null,
          activite: etablissementData.activite || ent.activite || null,
          forme_juridique: personneData.formeJuridique || ent.forme_juridique || null,
          dirigeant: ent.dirigeant || null,
          code_naf: ent.code_naf || null,
          date_demarrage: ent.dateparution || ent.date_demarrage || null,
          capital: parseNumber(capital),
          effectifs: parseNumber(ent.effectifs),
          chiffre_affaires: parseNumber(ent.chiffre_affaires),
          latitude: parseNumber(ent.latitude),
          longitude: parseNumber(ent.longitude),
          administration: personneData.administration || ent.administration || null,
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

    // Batch insert (250 at a time to reduce memory)
    const batchSize = 250;
    let totalInserted = 0;
    const newEntrepriseIds: string[] = [];

    for (let i = 0; i < uniqueData.length; i += batchSize) {
      const batch = uniqueData.slice(i, i + batchSize);
      
      // Get existing SIRETs before upsert
      const existingSirets = new Set(
        (await supabase
          .from('entreprises')
          .select('siret')
          .in('siret', batch.map(e => e.siret)))
          .data?.map(e => e.siret) || []
      );

      const { error: upsertError, data: upsertedData } = await supabase
        .from('entreprises')
        .upsert(batch, { 
          onConflict: 'siret',
        })
        .select('id, siret');

      if (upsertError) {
        console.error(`Error upserting batch ${i}-${i + batch.length}:`, upsertError);
        throw upsertError;
      }

      // Track new insertions
      if (upsertedData) {
        const newIds = upsertedData
          .filter(e => !existingSirets.has(e.siret))
          .map(e => e.id);
        newEntrepriseIds.push(...newIds);
        totalInserted += newIds.length;
      }

      console.log(`DB batch ${i / batchSize + 1}/${Math.ceil(uniqueData.length / batchSize)}: inserted/updated ${upsertedData?.length} records`);
      
      // Clear batch from memory
      batch.length = 0;
    }

    // Qualify new entreprises in background (max 100 to control costs)
    if (newEntrepriseIds.length > 0) {
      const toQualify = newEntrepriseIds.slice(0, 100);
      console.log(`Starting background qualification for ${toQualify.length} new entreprises...`);
      
      // Launch background tasks without blocking response
      qualifyEntreprisesBackground(supabase, lovableApiKey, toQualify)
        .then(() => {
          // After qualifying new enterprises, requalify invalid categories
          console.log('Starting requalification of invalid categories...');
          return requalifyInvalidCategories(supabase, lovableApiKey);
        })
        .catch((err: Error) => {
          console.error('Background qualification error:', err);
        });
    } else {
      // Even if no new entreprises, check for invalid categories
      requalifyInvalidCategories(supabase, lovableApiKey).catch((err: Error) => {
        console.error('Requalification error:', err);
      });
    }

    const qualificationMessage = newEntrepriseIds.length > 0
      ? ` (${Math.min(newEntrepriseIds.length, 100)} seront qualifiées automatiquement par IA)`
      : '';

    return new Response(
      JSON.stringify({
        success: true,
        total: uniqueData.length,
        inserted: totalInserted,
        newEntreprises: newEntrepriseIds.length,
        message: `Import réussi : ${totalInserted} nouvelles entreprises${qualificationMessage}`
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
