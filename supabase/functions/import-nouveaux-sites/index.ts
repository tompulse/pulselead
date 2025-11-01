import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Conversion Lambert 93 (EPSG:2154) vers WGS84 (EPSG:4326)
// Formules simplifiées pour la France métropolitaine
function lambert93ToWGS84(x: number, y: number): { lat: number; lng: number } | null {
  if (!x || !y || x === 0 || y === 0) return null;

  // Constantes Lambert 93
  const n = 0.7256077650532670;
  const c = 11754255.426096;
  const xs = 700000;
  const ys = 12655612.049876;
  const e = 0.08248325676;
  const lambda0 = 0.04079234433198; // 3° en radians

  try {
    const dx = x - xs;
    const dy = y - ys;

    const R = Math.sqrt(dx * dx + dy * dy);
    const gamma = Math.atan2(dx, -dy);

    const lambda = lambda0 + gamma / n;

    const L = -Math.log(R / c) / n;
    let phi = 2 * Math.atan(Math.exp(L)) - Math.PI / 2;

    // Iterations pour la latitude
    for (let i = 0; i < 10; i++) {
      const eSinPhi = e * Math.sin(phi);
      phi = 2 * Math.atan(
        Math.pow((1 + eSinPhi) / (1 - eSinPhi), e / 2) * Math.exp(L)
      ) - Math.PI / 2;
    }

    const lat = phi * 180 / Math.PI;
    const lng = lambda * 180 / Math.PI;

    // Validation des coordonnées (France métropolitaine approximativement)
    if (lat < 41 || lat > 51 || lng < -5 || lng > 10) {
      return null;
    }

    return { lat, lng };
  } catch (error) {
    console.error("Error converting Lambert to WGS84:", error);
    return null;
  }
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

    // Parse JSON uniquement (l'utilisateur devra convertir Excel -> JSON)
    const body = await req.json();
    const entreprises = body.entreprises || [];
    console.log(`📊 Received ${entreprises.length} entreprises`);

    if (!Array.isArray(entreprises) || entreprises.length === 0) {
      throw new Error('No entreprises data provided');
    }

    // Mapping des colonnes Excel vers la structure de base de données
    const mappedData = entreprises.map((row: any) => {
      // Reconstruire l'adresse complète
      const adresseComplete = [
        row.numeroVoieEtablissement,
        row.typeVoieEtablissement,
        row.libelleVoieEtablissement
      ].filter(Boolean).join(' ');

      // Convertir les coordonnées Lambert en WGS84
      let latitude = null;
      let longitude = null;
      
      const lambertX = parseFloat(row.coordonneeLambertAbscisseEtablissement);
      const lambertY = parseFloat(row.coordonneeLambertOrdonneeEtablissement);
      
      if (!isNaN(lambertX) && !isNaN(lambertY) && lambertX !== 0 && lambertY !== 0) {
        const coords = lambert93ToWGS84(lambertX, lambertY);
        if (coords) {
          latitude = coords.lat;
          longitude = coords.lng;
        }
      }

      // Parser la date de création
      let dateCreation = null;
      if (row['date création']) {
        try {
          const dateStr = String(row['date création']);
          // Format: YYYYMMDD ou DD/MM/YYYY
          if (dateStr.length === 8 && !dateStr.includes('/')) {
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            dateCreation = `${year}-${month}-${day}`;
          } else if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              dateCreation = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
          }
        } catch (e) {
          console.warn('Error parsing date:', row['date création']);
        }
      }

      return {
        siret: String(row.siret || '').trim(),
        nom: String(row.Entreprise || '').trim(),
        date_creation: dateCreation,
        est_siege: row.siège === 'true' || row.siège === true || row.siège === 'Oui',
        categorie_juridique: row.categorieJuridiqueUniteLegale ? String(row.categorieJuridiqueUniteLegale) : null,
        categorie_entreprise: row.categorieEntreprise ? String(row.categorieEntreprise).toUpperCase() : null,
        complement_adresse: row.complementAdresseEtablissement || null,
        numero_voie: row.numeroVoieEtablissement || null,
        type_voie: row.typeVoieEtablissement || null,
        libelle_voie: row.libelleVoieEtablissement || null,
        code_postal: row.codePostalEtablissement ? String(row.codePostalEtablissement) : null,
        ville: row.libelleCommuneEtablissement || null,
        coordonnee_lambert_x: lambertX || null,
        coordonnee_lambert_y: lambertY || null,
        latitude,
        longitude,
        code_naf: row.activitePrincipaleEtablissement ? String(row.activitePrincipaleEtablissement) : null,
        adresse: adresseComplete || null
      };
    }).filter(item => item.siret && item.nom); // Filtrer les lignes sans SIRET ou nom

    console.log(`✅ Mapped ${mappedData.length} valid entreprises`);

    // Dédupliquer par SIRET (garder la première occurrence)
    const uniqueData = mappedData.reduce((acc: any[], current: any) => {
      const exists = acc.find(item => item.siret === current.siret);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    console.log(`🔄 After deduplication: ${uniqueData.length} entreprises`);

    // Insertion par batch de 500
    const BATCH_SIZE = 500;
    let totalInserted = 0;
    let totalErrors = 0;

    for (let i = 0; i < uniqueData.length; i += BATCH_SIZE) {
      const batch = uniqueData.slice(i, i + BATCH_SIZE);
      
      const { data, error } = await supabaseClient
        .from('nouveaux_sites')
        .upsert(batch, { 
          onConflict: 'siret',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, error);
        totalErrors += batch.length;
      } else {
        totalInserted += batch.length;
        console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} entreprises inserted`);
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
