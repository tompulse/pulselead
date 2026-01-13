import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Conversion Lambert 93 (EPSG:2154) vers WGS84 (EPSG:4326) - Formule corrigée
function lambert93ToWGS84(x: number, y: number): { lat: number; lng: number } | null {
  if (!x || !y || x === 0 || y === 0) return null;
  if (x < 100000 || x > 1300000 || y < 6000000 || y > 7200000) return null;

  // Paramètres officiels Lambert 93 (EPSG:2154)
  const n = 0.7256077650532670;
  const c = 11754255.426096;
  const xs = 700000;
  const ys = 12655612.049876;
  const e = 0.08181919106;  // Excentricité GRS80
  const lambda0 = 3 * Math.PI / 180;  // Méridien central = 3°E

  try {
    const dx = x - xs;
    const dy = ys - y;  // CORRECTION: ys - y, pas y - ys
    const R = Math.sqrt(dx * dx + dy * dy);
    const gamma = Math.atan2(dx, dy);  // CORRECTION: atan2(dx, dy) sans négation
    const lambda = lambda0 + gamma / n;
    const L = -Math.log(R / c) / n;
    
    // Latitude isométrique inverse avec itérations
    let phi = 2 * Math.atan(Math.exp(L)) - Math.PI / 2;

    for (let i = 0; i < 10; i++) {
      const eSinPhi = e * Math.sin(phi);
      phi = 2 * Math.atan(
        Math.pow((1 + eSinPhi) / (1 - eSinPhi), e / 2) * Math.exp(L)
      ) - Math.PI / 2;
    }

    const lat = phi * 180 / Math.PI;
    const lng = lambda * 180 / Math.PI;

    // Validation France métropolitaine
    if (lat < 41 || lat > 51.5 || lng < -5.5 || lng > 10) {
      console.log(`Coords hors France: lat=${lat}, lng=${lng}`);
      return null;
    }
    
    return { lat, lng };
  } catch (error) {
    console.error("Error converting Lambert to WGS84:", error);
    return null;
  }
}

// NAF hierarchy extraction from code
function getNafHierarchy(codeNaf: string | null): { 
  section: string | null; 
  division: string | null; 
  groupe: string | null; 
  classe: string | null; 
} {
  if (!codeNaf) return { section: null, division: null, groupe: null, classe: null };
  
  const code = codeNaf.replace(/\./g, '').toUpperCase();
  
  // Division = 2 premiers chiffres
  const division = code.substring(0, 2);
  
  // Groupe = 2 premiers chiffres + 1 chiffre (ex: "412")
  const groupe = code.length >= 3 ? code.substring(0, 3) : null;
  
  // Classe = 4 premiers caractères (ex: "41.20" devient "4120")
  const classe = code.length >= 4 ? code.substring(0, 4) : null;
  
  // Section mapping based on division
  const divisionNum = parseInt(division, 10);
  let section: string | null = null;
  
  if (divisionNum >= 1 && divisionNum <= 3) section = 'A';
  else if (divisionNum >= 5 && divisionNum <= 9) section = 'B';
  else if (divisionNum >= 10 && divisionNum <= 33) section = 'C';
  else if (divisionNum >= 35 && divisionNum <= 35) section = 'D';
  else if (divisionNum >= 36 && divisionNum <= 39) section = 'E';
  else if (divisionNum >= 41 && divisionNum <= 43) section = 'F';
  else if (divisionNum >= 45 && divisionNum <= 47) section = 'G';
  else if (divisionNum >= 49 && divisionNum <= 53) section = 'H';
  else if (divisionNum >= 55 && divisionNum <= 56) section = 'I';
  else if (divisionNum >= 58 && divisionNum <= 63) section = 'J';
  else if (divisionNum >= 64 && divisionNum <= 66) section = 'K';
  else if (divisionNum === 68) section = 'L';
  else if (divisionNum >= 69 && divisionNum <= 75) section = 'M';
  else if (divisionNum >= 77 && divisionNum <= 82) section = 'N';
  else if (divisionNum === 84) section = 'O';
  else if (divisionNum === 85) section = 'P';
  else if (divisionNum >= 86 && divisionNum <= 88) section = 'Q';
  else if (divisionNum >= 90 && divisionNum <= 93) section = 'R';
  else if (divisionNum >= 94 && divisionNum <= 96) section = 'S';
  else if (divisionNum >= 97 && divisionNum <= 98) section = 'T';
  else if (divisionNum === 99) section = 'U';
  
  return { section, division, groupe, classe };
}

// Parse date from various formats
function parseDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const str = String(dateStr).trim();
  
  // Format DD/MM/YYYY
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  
  // Format YYYYMMDD
  if (str.length === 8 && !isNaN(Number(str))) {
    return `${str.substring(0, 4)}-${str.substring(4, 6)}-${str.substring(6, 8)}`;
  }
  
  // Format YYYY-MM-DD (already correct)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const body = await req.json();
    const entreprises = body.entreprises || [];
    console.log(`📊 Received ${entreprises.length} entreprises`);

    if (!Array.isArray(entreprises) || entreprises.length === 0) {
      throw new Error('No entreprises data provided');
    }

    const mappedData = entreprises.map((row: any) => {
      // Support multiple column name formats
      const siret = String(row.siret || '').trim();
      
      // Name: try multiple possible columns, for EI combine nom + prénom if no company name
      const entrepriseNom = String(
        row.enseigne1Etablissement || 
        row.Entreprise || 
        row.denominationUsuelleEtablissement ||
        row.nom ||
        ''
      ).trim();
      
      // For entrepreneurs individuels: combine nomUniteLegale + prenom1UniteLegale
      const nomFamille = String(row.nomUniteLegale || '').trim();
      const prenom = String(row.prenom1UniteLegale || '').trim();
      const nomComplet = [nomFamille, prenom].filter(Boolean).join(' ');
      
      // Use company name if available, otherwise use nom + prénom for EI
      const nom = entrepriseNom || nomComplet || 'Entreprise sans nom';
      
      if (!siret) return null;

      // Build full address
      const adresseComplete = [
        row.numeroVoieEtablissement || row.numeroVoie,
        row.typeVoieEtablissement || row.typeVoie,
        row.libelleVoieEtablissement || row.libelleVoie
      ].filter(Boolean).join(' ');

      // Convert Lambert coordinates to WGS84
      const lambertX = parseFloat(row.coordonneeLambertAbscisseEtablissement || row.coordonnee_lambert_x || 0);
      const lambertY = parseFloat(row.coordonneeLambertOrdonneeEtablissement || row.coordonnee_lambert_y || 0);
      
      let latitude = null;
      let longitude = null;
      if (!isNaN(lambertX) && !isNaN(lambertY) && lambertX !== 0 && lambertY !== 0) {
        const coords = lambert93ToWGS84(lambertX, lambertY);
        if (coords) {
          latitude = coords.lat;
          longitude = coords.lng;
        }
      }

      // Parse creation date (multiple formats)
      const dateCreation = parseDate(
        row.dateCreationEtablissement || 
        row['date création'] || 
        row.date_creation
      );

      // Get NAF code
      const codeNaf = String(
        row.activitePrincipaleEtablissement || 
        row.activitePrincipaleUniteLegale ||
        row.code_naf ||
        ''
      ).trim() || null;

      // Get NAF hierarchy
      const nafHierarchy = getNafHierarchy(codeNaf);

      // Company size
      const categorieEntreprise = row.categorieEntreprise 
        ? String(row.categorieEntreprise).toUpperCase().trim() 
        : 'Non spécifié';

      // Legal form
      const categorieJuridique = row.categorieJuridiqueUniteLegale 
        ? String(row.categorieJuridiqueUniteLegale).trim()
        : null;

      // Is headquarters (handle VRAI/FAUX format)
      const estSiege = 
        row.etablissementSiege === 'VRAI' || 
        row.etablissementSiege === true || 
        row.siège === 'true' || 
        row.siège === true ||
        row.est_siege === true;

      return {
        siret,
        nom,
        date_creation: dateCreation,
        est_siege: estSiege,
        categorie_juridique: categorieJuridique,
        categorie_entreprise: categorieEntreprise,
        complement_adresse: row.complementAdresseEtablissement || row.complement_adresse || null,
        numero_voie: row.numeroVoieEtablissement || row.numero_voie || null,
        type_voie: row.typeVoieEtablissement || row.type_voie || null,
        libelle_voie: row.libelleVoieEtablissement || row.libelle_voie || null,
        code_postal: row.codePostalEtablissement || row.code_postal ? String(row.codePostalEtablissement || row.code_postal) : null,
        ville: row.libelleCommuneEtablissement || row.ville || null,
        coordonnee_lambert_x: lambertX || null,
        coordonnee_lambert_y: lambertY || null,
        latitude,
        longitude,
        code_naf: codeNaf,
        naf_section: nafHierarchy.section,
        naf_division: nafHierarchy.division,
        naf_groupe: nafHierarchy.groupe,
        naf_classe: nafHierarchy.classe,
        adresse: adresseComplete || null
      };
    }).filter(Boolean);

    console.log(`✅ Mapped ${mappedData.length} valid entreprises`);

    // Deduplicate by SIRET
    const uniqueData = mappedData.reduce((acc: any[], current: any) => {
      const exists = acc.find(item => item.siret === current.siret);
      if (!exists) acc.push(current);
      return acc;
    }, []);

    console.log(`🔄 After deduplication: ${uniqueData.length} entreprises`);

    // Insert in batches of 300 to avoid timeouts
    const BATCH_SIZE = 300;
    let totalInserted = 0;
    let totalErrors = 0;

    for (let i = 0; i < uniqueData.length; i += BATCH_SIZE) {
      const batch = uniqueData.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(uniqueData.length / BATCH_SIZE);
      
      console.log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} records)`);
      
      const { error } = await supabaseClient
        .from('nouveaux_sites')
        .upsert(batch, { 
          onConflict: 'siret',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error(`❌ Batch ${batchNum} error:`, error.message);
        totalErrors += batch.length;
      } else {
        totalInserted += batch.length;
        console.log(`✅ Batch ${batchNum}: ${batch.length} records inserted`);
      }
    }

    console.log(`🎉 Import complete: ${totalInserted} inserted, ${totalErrors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        inserted: totalInserted,
        errors: totalErrors,
        total: entreprises.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Import error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
