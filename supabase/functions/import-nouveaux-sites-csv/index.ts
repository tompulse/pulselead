import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Lambert 93 (EPSG:2154) to WGS84 (EPSG:4326) conversion
function lambert93ToWGS84(x: number, y: number): { lat: number; lng: number } | null {
  if (!x || !y || isNaN(x) || isNaN(y)) return null;
  
  // Check bounds for metropolitan France
  if (x < 100000 || x > 1300000 || y < 6000000 || y > 7200000) return null;

  const n = 0.7256077650532670;
  const c = 11754255.426096;
  const xs = 700000.0;
  const ys = 12655612.049876;
  const e = 0.0818191910428158;
  const a = 6378137.0;

  const dx = x - xs;
  const dy = ys - y;
  const r = Math.sqrt(dx * dx + dy * dy);
  const gamma = Math.atan2(dx, dy);
  const lambda0 = 3 * Math.PI / 180;
  const lng = (lambda0 + gamma / n) * 180 / Math.PI;
  
  const latIso = -Math.log(r / c) / n;
  let lat = 2 * Math.atan(Math.exp(latIso)) - Math.PI / 2;
  
  for (let i = 0; i < 10; i++) {
    const sinLat = Math.sin(lat);
    const eSinLat = e * sinLat;
    const newLat = 2 * Math.atan(
      Math.pow((1 + eSinLat) / (1 - eSinLat), e / 2) * Math.exp(latIso)
    ) - Math.PI / 2;
    if (Math.abs(newLat - lat) < 1e-12) break;
    lat = newLat;
  }

  const latDeg = lat * 180 / Math.PI;
  
  // Validate output
  if (latDeg < 41 || latDeg > 51.5 || lng < -5.5 || lng > 10) return null;
  
  return { lat: latDeg, lng };
}

// NAF code to category mapping
const NAF_TO_CATEGORY: Record<string, string> = {
  // BTP & Construction
  '41': 'BTP & Construction', '42': 'BTP & Construction', '43': 'BTP & Construction',
  // Transport & Logistique  
  '49': 'Transport & Logistique', '50': 'Transport & Logistique', '51': 'Transport & Logistique', 
  '52': 'Transport & Logistique', '53': 'Transport & Logistique',
  // Commerce & Distribution
  '45': 'Commerce & Distribution', '46': 'Commerce & Distribution', '47': 'Commerce & Distribution',
  // Industrie & Manufacturing
  '10': 'Industrie & Manufacturing', '11': 'Industrie & Manufacturing', '12': 'Industrie & Manufacturing',
  '13': 'Industrie & Manufacturing', '14': 'Industrie & Manufacturing', '15': 'Industrie & Manufacturing',
  '16': 'Industrie & Manufacturing', '17': 'Industrie & Manufacturing', '18': 'Industrie & Manufacturing',
  '19': 'Industrie & Manufacturing', '20': 'Industrie & Manufacturing', '21': 'Industrie & Manufacturing',
  '22': 'Industrie & Manufacturing', '23': 'Industrie & Manufacturing', '24': 'Industrie & Manufacturing',
  '25': 'Industrie & Manufacturing', '26': 'Industrie & Manufacturing', '27': 'Industrie & Manufacturing',
  '28': 'Industrie & Manufacturing', '29': 'Industrie & Manufacturing', '30': 'Industrie & Manufacturing',
  '31': 'Industrie & Manufacturing', '32': 'Industrie & Manufacturing', '33': 'Industrie & Manufacturing',
  // Services aux entreprises
  '62': 'Services aux entreprises', '63': 'Services aux entreprises', '69': 'Services aux entreprises',
  '70': 'Services aux entreprises', '71': 'Services aux entreprises', '72': 'Services aux entreprises',
  '73': 'Services aux entreprises', '74': 'Services aux entreprises', '77': 'Services aux entreprises',
  '78': 'Services aux entreprises', '79': 'Services aux entreprises', '80': 'Services aux entreprises',
  '81': 'Services aux entreprises', '82': 'Services aux entreprises',
  // Santé & Action sociale
  '86': 'Santé & Action sociale', '87': 'Santé & Action sociale', '88': 'Santé & Action sociale',
  // Hôtellerie & Restauration
  '55': 'Hôtellerie & Restauration', '56': 'Hôtellerie & Restauration',
  // Agriculture & Agroalimentaire
  '01': 'Agriculture & Agroalimentaire', '02': 'Agriculture & Agroalimentaire', '03': 'Agriculture & Agroalimentaire',
  // Immobilier
  '68': 'Immobilier',
  // Finance & Assurance
  '64': 'Finance & Assurance', '65': 'Finance & Assurance', '66': 'Finance & Assurance',
  // Éducation & Formation
  '85': 'Éducation & Formation',
  // Arts, Culture & Loisirs
  '90': 'Arts, Culture & Loisirs', '91': 'Arts, Culture & Loisirs', '92': 'Arts, Culture & Loisirs', '93': 'Arts, Culture & Loisirs',
  // Énergie & Environnement
  '35': 'Énergie & Environnement', '36': 'Énergie & Environnement', '37': 'Énergie & Environnement', 
  '38': 'Énergie & Environnement', '39': 'Énergie & Environnement',
  // Information & Communication
  '58': 'Information & Communication', '59': 'Information & Communication', '60': 'Information & Communication', '61': 'Information & Communication',
};

function getCategoryFromNaf(codeNaf: string | null): string | null {
  if (!codeNaf) return null;
  const prefix = codeNaf.substring(0, 2);
  return NAF_TO_CATEGORY[prefix] || null;
}

function parseDate(dateStr: string): string | null {
  if (!dateStr) return null;
  // Format DD/MM/YYYY
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { entreprises, batchIndex, totalBatches } = await req.json();

    if (!entreprises || !Array.isArray(entreprises)) {
      return new Response(
        JSON.stringify({ error: 'No entreprises array provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing batch ${batchIndex + 1}/${totalBatches} with ${entreprises.length} records`);

    const records = entreprises
      .map((row: any) => {
        const siret = row.siret?.toString().trim();
        const nom = row.Entreprise?.trim() || row.denominationUsuelleEtablissement?.trim() || row.enseigne1Etablissement?.trim();
        
        if (!siret || !nom) return null;

        // Parse coordinates
        const lambertX = parseFloat(row.coordonneeLambertAbscisseEtablissement);
        const lambertY = parseFloat(row.coordonneeLambertOrdonneeEtablissement);
        const coords = lambert93ToWGS84(lambertX, lambertY);

        // Build address
        const addressParts = [
          row.numeroVoieEtablissement,
          row.typeVoieEtablissement,
          row.libelleVoieEtablissement
        ].filter(Boolean);
        const adresse = addressParts.join(' ') || null;

        // Get NAF code (prefer establishment level)
        const codeNaf = row.activitePrincipaleEtablissement || row.activitePrincipaleUniteLegale || null;

        // Determine category
        const categorieDetaille = getCategoryFromNaf(codeNaf);

        // Company size
        const categorieEntreprise = row.categorieEntreprise?.trim() || 'Non spécifié';

        return {
          siret,
          nom,
          date_creation: parseDate(row.dateCreationEtablissement),
          est_siege: row.etablissementSiege === 'VRAI',
          complement_adresse: row.complementAdresseEtablissement || null,
          numero_voie: row.numeroVoieEtablissement || null,
          type_voie: row.typeVoieEtablissement || null,
          libelle_voie: row.libelleVoieEtablissement || null,
          code_postal: row.codePostalEtablissement || null,
          ville: row.libelleCommuneEtablissement || null,
          adresse,
          code_naf: codeNaf,
          categorie_entreprise: categorieEntreprise,
          categorie_detaillee: categorieDetaille,
          coordonnee_lambert_x: lambertX || null,
          coordonnee_lambert_y: lambertY || null,
          latitude: coords?.lat || null,
          longitude: coords?.lng || null,
        };
      })
      .filter(Boolean);

    if (records.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          inserted: 0, 
          message: 'No valid records to insert',
          batchIndex
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upsert records in smaller chunks to avoid payload limits
    const chunkSize = 100;
    let totalInserted = 0;
    const errors: string[] = [];

    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      const { error } = await supabase
        .from('nouveaux_sites')
        .upsert(chunk, { 
          onConflict: 'siret',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error(`Chunk error:`, error);
        errors.push(error.message);
      } else {
        totalInserted += chunk.length;
      }
    }

    console.log(`Batch ${batchIndex + 1} complete: ${totalInserted} records inserted`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        inserted: totalInserted,
        errors: errors.length > 0 ? errors : undefined,
        batchIndex
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Import error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
