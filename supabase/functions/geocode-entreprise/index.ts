import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { adresse, ville, code_postal } = await req.json();
    console.log('[geocode-entreprise] Géocodage demandé:', { adresse, ville, code_postal });

    if (!adresse && !ville) {
      return new Response(
        JSON.stringify({ 
          error: 'Adresse ou ville requise',
          latitude: null,
          longitude: null 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN');
    if (!mapboxToken) {
      console.error('[geocode-entreprise] MAPBOX_ACCESS_TOKEN non configuré');
      return new Response(
        JSON.stringify({ 
          error: 'Token Mapbox non configuré',
          latitude: null,
          longitude: null 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Construire la requête d'adresse
    const addressParts = [];
    if (adresse) addressParts.push(adresse);
    if (code_postal) addressParts.push(code_postal);
    if (ville) addressParts.push(ville);
    addressParts.push('France');
    
    const searchText = addressParts.join(', ');
    console.log('[geocode-entreprise] Recherche Mapbox:', searchText);

    // Appeler l'API Mapbox Geocoding
    const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchText)}.json?access_token=${mapboxToken}&country=FR&limit=1`;
    
    const response = await fetch(geocodingUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[geocode-entreprise] Erreur Mapbox:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: `Erreur Mapbox (${response.status})`,
          latitude: null,
          longitude: null 
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      console.log('[geocode-entreprise] Aucun résultat trouvé pour:', searchText);
      return new Response(
        JSON.stringify({ 
          error: 'Adresse introuvable',
          latitude: null,
          longitude: null 
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const [longitude, latitude] = data.features[0].center;
    console.log('[geocode-entreprise] ✅ Coordonnées trouvées:', { latitude, longitude });

    return new Response(
      JSON.stringify({ 
        latitude,
        longitude,
        place_name: data.features[0].place_name 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('[geocode-entreprise] ❌ Erreur:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        latitude: null,
        longitude: null 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
