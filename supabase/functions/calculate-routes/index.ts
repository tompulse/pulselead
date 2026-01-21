import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RouteRequest {
  waypoints: Array<{ lat: number; lng: number }>;
  startPoint?: { lat: number; lng: number };
}

interface MapboxResponse {
  routes: Array<{
    distance: number;
    duration: number;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { waypoints, startPoint }: RouteRequest = await req.json();

    // Accept either:
    // - 2+ waypoints (classic)
    // - 1+ waypoints + a startPoint (so KPIs include the start, matching the map)
    const hasStart = !!(startPoint && Number.isFinite(startPoint.lat) && Number.isFinite(startPoint.lng));
    const wpCount = Array.isArray(waypoints) ? waypoints.length : 0;
    const totalPoints = (hasStart ? 1 : 0) + wpCount;

    if (!waypoints || totalPoints < 2) {
      return new Response(
        JSON.stringify({ error: 'Au moins 2 points sont requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN');
    if (!mapboxToken) {
      console.error('MAPBOX_ACCESS_TOKEN not found');
      return new Response(
        JSON.stringify({ error: 'Configuration manquante' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construire les coordonnées pour Mapbox
    const allPoints = startPoint ? [startPoint, ...waypoints] : waypoints;
    const coordinates = allPoints.map(p => `${p.lng},${p.lat}`).join(';');

    console.log('Calculating routes for coordinates:', coordinates);

    // Appel 1: Avec péages (pas d'exclusion)
    const urlWithTolls = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&access_token=${mapboxToken}`;
    
    // Appel 2: Sans péages
    const urlWithoutTolls = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&exclude=toll&access_token=${mapboxToken}`;

    console.log('Fetching routes from Mapbox...');

    const [responseWithTolls, responseWithoutTolls] = await Promise.all([
      fetch(urlWithTolls),
      fetch(urlWithoutTolls)
    ]);

    if (!responseWithTolls.ok || !responseWithoutTolls.ok) {
      console.error('Mapbox API error:', {
        withTolls: responseWithTolls.status,
        withoutTolls: responseWithoutTolls.status
      });
      return new Response(
        JSON.stringify({ error: 'Erreur lors du calcul des routes' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const dataWithTolls: MapboxResponse = await responseWithTolls.json();
    const dataWithoutTolls: MapboxResponse = await responseWithoutTolls.json();

    if (!dataWithTolls.routes?.[0] || !dataWithoutTolls.routes?.[0]) {
      console.error('No routes found in Mapbox response');
      return new Response(
        JSON.stringify({ error: 'Aucune route trouvée' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const routeWithTolls = dataWithTolls.routes[0];
    const routeWithoutTolls = dataWithoutTolls.routes[0];

    console.log('Routes calculated successfully:', {
      withTolls: { distance: routeWithTolls.distance, duration: routeWithTolls.duration },
      withoutTolls: { distance: routeWithoutTolls.distance, duration: routeWithoutTolls.duration }
    });

    return new Response(
      JSON.stringify({
        withTolls: {
          distance_km: (routeWithTolls.distance / 1000).toFixed(1),
          duration_minutes: Math.round(routeWithTolls.duration / 60)
        },
        withoutTolls: {
          distance_km: (routeWithoutTolls.distance / 1000).toFixed(1),
          duration_minutes: Math.round(routeWithoutTolls.duration / 60)
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in calculate-routes:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
