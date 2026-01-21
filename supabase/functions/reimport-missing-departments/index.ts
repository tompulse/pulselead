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

// NAF hierarchy extraction
function getNafHierarchy(codeNaf: string | null): { section: string | null; division: string | null; groupe: string | null; classe: string | null } {
  if (!codeNaf || codeNaf.length < 2) {
    return { section: null, division: null, groupe: null, classe: null };
  }

  const division = codeNaf.substring(0, 2);
  const groupe = codeNaf.length >= 3 ? codeNaf.substring(0, 3) : null;
  const classe = codeNaf.length >= 4 ? codeNaf.substring(0, 4) : null;

  // Division to section mapping
  const divisionToSection: Record<string, string> = {
    '01': 'A', '02': 'A', '03': 'A',
    '05': 'B', '06': 'B', '07': 'B', '08': 'B', '09': 'B',
    '10': 'C', '11': 'C', '12': 'C', '13': 'C', '14': 'C', '15': 'C', '16': 'C', '17': 'C', '18': 'C',
    '19': 'C', '20': 'C', '21': 'C', '22': 'C', '23': 'C', '24': 'C', '25': 'C', '26': 'C', '27': 'C',
    '28': 'C', '29': 'C', '30': 'C', '31': 'C', '32': 'C', '33': 'C',
    '35': 'D',
    '36': 'E', '37': 'E', '38': 'E', '39': 'E',
    '41': 'F', '42': 'F', '43': 'F',
    '45': 'G', '46': 'G', '47': 'G',
    '49': 'H', '50': 'H', '51': 'H', '52': 'H', '53': 'H',
    '55': 'I', '56': 'I',
    '58': 'J', '59': 'J', '60': 'J', '61': 'J', '62': 'J', '63': 'J',
    '64': 'K', '65': 'K', '66': 'K',
    '68': 'L',
    '69': 'M', '70': 'M', '71': 'M', '72': 'M', '73': 'M', '74': 'M', '75': 'M',
    '77': 'N', '78': 'N', '79': 'N', '80': 'N', '81': 'N', '82': 'N',
    '84': 'O',
    '85': 'P',
    '86': 'Q', '87': 'Q', '88': 'Q',
    '90': 'R', '91': 'R', '92': 'R', '93': 'R',
    '94': 'S', '95': 'S', '96': 'S',
    '97': 'T', '98': 'T',
    '99': 'U',
  };

  return {
    section: divisionToSection[division] || null,
    division,
    groupe,
    classe,
  };
}

function parseDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  
  // Format DD/MM/YYYY
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  
  // Format YYYYMMDD
  if (/^\d{8}$/.test(dateStr)) {
    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
  }
  
  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.substring(0, 10);
  }
  
  return null;
}

function parseCSV(text: string): any[] {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
  
  return lines.slice(1).map(line => {
    const values = line.split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  }).filter(row => row.siret);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const targetDepartments = body.targetDepartments || ['30', '31', '32', '33', '34', '35', '36', '37', '38', '39'];
    const csvUrl = body.csvUrl;
    let entreprises = body.entreprises;

    // If csvUrl is provided, fetch and parse the CSV
    if (csvUrl && !entreprises) {
      console.log(`📥 Fetching CSV from: ${csvUrl}`);
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status}`);
      }
      const csvText = await response.text();
      entreprises = parseCSV(csvText);
      console.log(`📊 Parsed ${entreprises.length} rows from CSV`);
    }

    if (!entreprises || !Array.isArray(entreprises) || entreprises.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No entreprises data provided. Send either "entreprises" array or "csvUrl"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const depts = targetDepartments;
    console.log(`🔍 Filtering for departments: ${depts.join(', ')}`);

    const records = entreprises
      .map((row: any) => {
        let siret = row.siret?.toString().trim();
        if (!siret) return null;
        
        // Pad SIRET if needed (13 digits -> 14)
        if (/^\d{13}$/.test(siret)) {
          siret = '0' + siret;
        }
        
        // Validate SIRET format (14 digits, no scientific notation)
        if (!/^\d{14}$/.test(siret) || siret.includes('E')) {
          return null;
        }

        const nom = row.Entreprise?.trim() || row.denominationUsuelleEtablissement?.trim() || row.enseigne1Etablissement?.trim();
        if (!nom || nom === '[ND]') return null;

        // Parse coordinates
        const lambertX = parseFloat(row.coordonneeLambertAbscisseEtablissement);
        const lambertY = parseFloat(row.coordonneeLambertOrdonneeEtablissement);
        const coords = lambert93ToWGS84(lambertX, lambertY);
        
        // Skip records without valid GPS
        if (!coords) return null;

        // Build address
        const addressParts = [
          row.numeroVoieEtablissement,
          row.typeVoieEtablissement,
          row.libelleVoieEtablissement
        ].filter(Boolean);
        const adresse = addressParts.join(' ') || null;

        // Get NAF code
        const codeNaf = row.activitePrincipaleEtablissement || row.activitePrincipaleUniteLegale || null;
        const nafHierarchy = getNafHierarchy(codeNaf);

        // Get postal code
        let codePostal = row.codePostalEtablissement?.toString().trim() || null;
        if (codePostal && codePostal.length === 4) {
          codePostal = '0' + codePostal;
        }

        // Filter by target departments
        if (!codePostal || codePostal.length < 2) return null;
        const dept = codePostal.substring(0, 2);
        if (!depts.includes(dept)) return null;

        // Company size - normalize
        let categorieEntreprise = row.categorieEntreprise?.toString().trim() || 'Non spécifié';
        if (!['GE', 'ETI', 'PME'].includes(categorieEntreprise)) {
          categorieEntreprise = 'Non spécifié';
        }

        // Legal category
        const categorieJuridique = row.categorieJuridiqueUniteLegale?.toString().trim() || null;

        return {
          siret,
          nom,
          date_creation: parseDate(row.dateCreationEtablissement),
          est_siege: row.etablissementSiege === 'VRAI',
          complement_adresse: row.complementAdresseEtablissement || null,
          numero_voie: row.numeroVoieEtablissement || null,
          type_voie: row.typeVoieEtablissement || null,
          libelle_voie: row.libelleVoieEtablissement || null,
          code_postal: codePostal,
          ville: row.libelleCommuneEtablissement || null,
          adresse,
          code_naf: codeNaf,
          naf_section: nafHierarchy.section,
          naf_division: nafHierarchy.division,
          naf_groupe: nafHierarchy.groupe,
          naf_classe: nafHierarchy.classe,
          categorie_entreprise: categorieEntreprise,
          categorie_juridique: categorieJuridique,
          coordonnee_lambert_x: lambertX || null,
          coordonnee_lambert_y: lambertY || null,
          latitude: coords.lat,
          longitude: coords.lng,
        };
      })
      .filter(Boolean);

    console.log(`✅ Found ${records.length} valid records for departments ${depts.join(', ')}`);

    if (records.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          inserted: 0, 
          message: 'No valid records found for specified departments',
          targetDepartments: depts
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deduplicate by SIRET
    const uniqueRecords = Array.from(
      new Map(records.map((r: any) => [r.siret, r])).values()
    );

    console.log(`📊 Unique records after deduplication: ${uniqueRecords.length}`);

    // Upsert records in chunks
    const chunkSize = 200;
    let totalInserted = 0;
    const errors: string[] = [];

    for (let i = 0; i < uniqueRecords.length; i += chunkSize) {
      const chunk = uniqueRecords.slice(i, i + chunkSize);
      const { error } = await supabase
        .from('nouveaux_sites')
        .upsert(chunk, { 
          onConflict: 'siret',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error(`❌ Chunk error:`, error);
        errors.push(error.message);
      } else {
        totalInserted += chunk.length;
        console.log(`✅ Chunk ${Math.floor(i / chunkSize) + 1}: ${chunk.length} records inserted`);
      }
    }

    console.log(`🎉 Total inserted: ${totalInserted} records`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        inserted: totalInserted,
        targetDepartments: depts,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Import error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
