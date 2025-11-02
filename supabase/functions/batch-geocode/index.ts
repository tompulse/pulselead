import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { table } = await req.json();
    const targetTable = table || 'entreprises';

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN')!;

    if (!mapboxToken) {
      throw new Error('MAPBOX_ACCESS_TOKEN not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer toutes les entreprises sans coordonnées
    const { data: entreprises, error: fetchError } = await supabase
      .from(targetTable)
      .select('id, adresse, numero_voie, type_voie, nom_voie, ville, code_postal, latitude, longitude')
      .or('latitude.is.null,longitude.is.null');

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${entreprises?.length || 0} ${targetTable} to geocode`);

    let successCount = 0;
    let errorCount = 0;

    // Traiter par lots de 10 pour éviter rate limiting
    const batchSize = 10;
    for (let i = 0; i < (entreprises?.length || 0); i += batchSize) {
      const batch = entreprises!.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (entreprise) => {
        try {
          // Construire l'adresse complète
          let adresseComplete = entreprise.adresse;
          
          // Si pas d'adresse mais des champs séparés, construire l'adresse
          if (!adresseComplete && (entreprise.numero_voie || entreprise.type_voie || entreprise.nom_voie)) {
            adresseComplete = [
              entreprise.numero_voie,
              entreprise.type_voie,
              entreprise.nom_voie
            ].filter(Boolean).join(' ');
          }
          
          // Construire l'adresse de recherche
          const searchQuery = [
            adresseComplete,
            entreprise.ville,
            entreprise.code_postal
          ].filter(Boolean).join(', ');

          if (!searchQuery) {
            console.warn(`No search query for ${entreprise.id}`);
            errorCount++;
            return;
          }

          // Appeler l'API Mapbox Geocoding
          const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxToken}&country=FR&limit=1`;
          
          const geocodeResponse = await fetch(geocodeUrl);
          const geocodeData = await geocodeResponse.json();

          if (geocodeData.features && geocodeData.features.length > 0) {
            const [longitude, latitude] = geocodeData.features[0].center;

            // Préparer les updates
            const updates: any = { latitude, longitude };
            
            // Si l'adresse était null mais qu'on l'a construite, la sauvegarder
            if (!entreprise.adresse && adresseComplete) {
              updates.adresse = adresseComplete;
            }

            // Mettre à jour l'entreprise
            const { error: updateError } = await supabase
              .from(targetTable)
              .update(updates)
              .eq('id', entreprise.id);

            if (updateError) {
              console.error(`Update error for ${entreprise.id}:`, updateError);
              errorCount++;
            } else {
              successCount++;
            }
          } else {
            errorCount++;
          }

          // Pause pour respecter les rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error geocoding ${entreprise.id}:`, error);
          errorCount++;
        }
      }));
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Géocodage terminé: ${successCount} succès, ${errorCount} erreurs`,
        successCount,
        errorCount,
        total: entreprises?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in batch-geocode:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
