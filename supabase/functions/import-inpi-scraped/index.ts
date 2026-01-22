import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mapping des formes juridiques
const FORME_JURIDIQUE_CODES: Record<string, string> = {
  "SARL": "5499",
  "SAS": "5710",
  "SASU": "5720",
  "SA": "5202",
  "SNC": "3220",
  "SELARL": "5485",
  "SELAS": "5785",
  "EURL": "5498"
};

interface ScrapedCompany {
  siren?: string;
  siret?: string;
  nom?: string;
  dirigeant?: string;
  fonction_dirigeant?: string;
  adresse?: string;
  adresse_complete?: string;
  code_postal?: string;
  ville?: string;
  code_naf?: string;
  activite?: string;
  forme_juridique?: string;
  capital?: string;
  date_creation?: string;
}

function cleanSiren(siren: string | undefined): string | null {
  if (!siren) return null;
  const clean = siren.replace(/\D/g, '');
  if (clean.length === 14) return clean.slice(0, 9);
  if (clean.length === 9) return clean;
  return null;
}

function cleanSiret(siret: string | undefined): string | null {
  if (!siret) return null;
  const clean = siret.replace(/\D/g, '');
  if (clean.length === 14) return clean;
  return null;
}

function extractCodePostalVille(adresse: string | undefined): { codePostal: string | null; ville: string | null } {
  if (!adresse) return { codePostal: null, ville: null };
  
  const match = adresse.toUpperCase().match(/(\d{5})\s+([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÆ\-\s]+)/);
  if (match) {
    return {
      codePostal: match[1],
      ville: match[2].trim().replace(/\s*FRANCE\s*$/i, '').trim()
    };
  }
  return { codePostal: null, ville: null };
}

function getDepartement(codePostal: string | null): string | null {
  if (!codePostal || codePostal.length < 2) return null;
  if (codePostal.startsWith('97') || codePostal.startsWith('98')) {
    return codePostal.slice(0, 3);
  }
  return codePostal.slice(0, 2);
}

function parseDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  
  // Essayer différents formats
  const formats = [
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // DD/MM/YYYY
    /^(\d{4})-(\d{2})-(\d{2})$/,   // YYYY-MM-DD
    /^(\d{2})-(\d{2})-(\d{4})$/    // DD-MM-YYYY
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format === formats[0]) { // DD/MM/YYYY
        return `${match[3]}-${match[2]}-${match[1]}`;
      } else if (format === formats[1]) { // YYYY-MM-DD
        return dateStr;
      } else if (format === formats[2]) { // DD-MM-YYYY
        return `${match[3]}-${match[2]}-${match[1]}`;
      }
    }
  }
  
  return null;
}

function transformCompany(raw: ScrapedCompany): Record<string, unknown> {
  // Extraire code postal et ville
  let codePostal = raw.code_postal;
  let ville = raw.ville;
  
  if (!codePostal) {
    const extracted = extractCodePostalVille(raw.adresse_complete || raw.adresse);
    codePostal = extracted.codePostal;
    ville = extracted.ville || ville;
  }
  
  // SIRET / SIREN
  let siret = cleanSiret(raw.siret);
  const siren = cleanSiren(raw.siren);
  
  if (siren && !siret) {
    siret = siren + "00010";
  }
  
  // Catégorie juridique
  let categorieJuridique: string | null = null;
  if (raw.forme_juridique) {
    const formeUpper = raw.forme_juridique.toUpperCase().replace(/\s/g, '');
    categorieJuridique = FORME_JURIDIQUE_CODES[formeUpper] || null;
  }
  
  // Capital
  let capital: number | null = null;
  if (raw.capital) {
    const cleanCapital = raw.capital.replace(/[^\d.,]/g, '').replace(',', '.');
    const parsed = parseFloat(cleanCapital);
    if (!isNaN(parsed)) capital = parsed;
  }
  
  return {
    siret,
    siren,
    nom: raw.nom?.trim().slice(0, 255) || null,
    dirigeant: raw.dirigeant?.trim().slice(0, 255) || null,
    fonction_dirigeant: raw.fonction_dirigeant?.trim().slice(0, 100) || null,
    adresse: (raw.adresse_complete || raw.adresse)?.slice(0, 500) || null,
    code_postal: codePostal,
    ville: ville?.slice(0, 100) || null,
    departement: getDepartement(codePostal),
    code_naf: raw.code_naf?.trim().slice(0, 10) || null,
    activite: raw.activite?.trim().slice(0, 500) || null,
    forme_juridique: raw.forme_juridique?.slice(0, 100) || null,
    categorie_juridique: categorieJuridique,
    date_creation: parseDate(raw.date_creation),
    capital,
    est_siege: true,
    source: "INPI_SCRAPING",
    enrichi_dirigeant: !!raw.dirigeant,
    date_enrichissement_dirigeant: raw.dirigeant ? new Date().toISOString() : null
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { companies, update_existing = false } = await req.json();

    if (!companies || !Array.isArray(companies)) {
      return new Response(
        JSON.stringify({ error: "Le champ 'companies' (tableau) est requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📥 Import de ${companies.length} entreprises (update: ${update_existing})`);

    const stats = {
      total: companies.length,
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: 0
    };

    const errors: Array<{ index: number; nom: string; error: string }> = [];

    // Traiter par batch de 100
    const BATCH_SIZE = 100;
    
    for (let i = 0; i < companies.length; i += BATCH_SIZE) {
      const batch = companies.slice(i, i + BATCH_SIZE);
      
      for (let j = 0; j < batch.length; j++) {
        const company = batch[j];
        const index = i + j;
        
        try {
          const transformed = transformCompany(company);
          
          // Vérifier champs obligatoires
          if (!transformed.siret && !transformed.nom) {
            stats.skipped++;
            continue;
          }
          
          // Vérifier si existe
          if (transformed.siret) {
            const { data: existing } = await supabase
              .from('nouveaux_sites')
              .select('id')
              .eq('siret', transformed.siret)
              .limit(1)
              .single();
            
            if (existing) {
              if (update_existing) {
                const { error: updateError } = await supabase
                  .from('nouveaux_sites')
                  .update(transformed)
                  .eq('siret', transformed.siret);
                
                if (updateError) throw updateError;
                stats.updated++;
              } else {
                stats.skipped++;
              }
              continue;
            }
          }
          
          // Insert
          const { error: insertError } = await supabase
            .from('nouveaux_sites')
            .insert(transformed);
          
          if (insertError) throw insertError;
          stats.inserted++;
          
        } catch (error) {
          stats.errors++;
          errors.push({
            index,
            nom: company.nom || 'Inconnu',
            error: error instanceof Error ? error.message : String(error)
          });
          console.error(`❌ Erreur ligne ${index}: ${error}`);
        }
      }
      
      console.log(`   Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${stats.inserted} inserted, ${stats.skipped} skipped`);
    }

    console.log(`✅ Import terminé: ${stats.inserted} inserted, ${stats.updated} updated, ${stats.skipped} skipped, ${stats.errors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        stats,
        errors: errors.slice(0, 10) // Limiter les erreurs retournées
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Erreur fatale:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erreur interne",
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
