import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Entreprise {
  id: string;
  nom: string;
  latitude: number;
  longitude: number;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  telephone?: string;
}

interface OptimizationRequest {
  entreprises: Entreprise[];
  point_depart?: { lat: number; lng: number };
}

// Calcul de distance Haversine pour pré-tri
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { entreprises, point_depart }: OptimizationRequest = await req.json();
    
    console.log('🚀 Optimisation de tournée demandée:', { 
      nbEntreprises: entreprises.length,
      hasStartPoint: !!point_depart 
    });
    
    if (!entreprises || entreprises.length === 0) {
      throw new Error("Aucune entreprise fournie");
    }

    const MAPBOX_TOKEN = Deno.env.get('MAPBOX_ACCESS_TOKEN');
    if (!MAPBOX_TOKEN) {
      throw new Error('MAPBOX_ACCESS_TOKEN is not configured');
    }

    // Déterminer le point de départ
    const startPoint = point_depart || {
      lat: entreprises[0].latitude,
      lng: entreprises[0].longitude
    };

    // Trier les entreprises par distance depuis le point de départ (plus proche d'abord)
    const entreprisesWithDistance = entreprises.map(e => ({
      ...e,
      distance: calculateDistance(startPoint.lat, startPoint.lng, e.latitude, e.longitude)
    }));
    
    entreprisesWithDistance.sort((a, b) => a.distance - b.distance);
    
    const sortedEntreprises = entreprisesWithDistance.map(({ distance, ...e }) => e);
    
    // Créer l'itinéraire avec les entreprises triées par proximité
    const coordinates = [
      `${startPoint.lng},${startPoint.lat}`,
      ...sortedEntreprises.map(e => `${e.longitude},${e.latitude}`)
    ].join(';');

    // API Mapbox Directions pour obtenir l'itinéraire
    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_TOKEN}`;
    
    console.log('🎯 Appel Mapbox Directions API avec ordre par proximité:', sortedEntreprises.length + 1, 'points');
    
    const mapboxResponse = await fetch(directionsUrl);
    
    if (!mapboxResponse.ok) {
      console.error('❌ Erreur Mapbox Directions:', mapboxResponse.status);
      const errorText = await mapboxResponse.text();
      console.error('Détails:', errorText);
      throw new Error(`Mapbox Directions API error: ${mapboxResponse.status}`);
    }

    const mapboxData = await mapboxResponse.json();
    
    if (!mapboxData.routes || mapboxData.routes.length === 0) {
      throw new Error("Aucun itinéraire trouvé par Mapbox");
    }

    const route = mapboxData.routes[0];
    
    console.log('✅ Ordre par proximité:', sortedEntreprises.map((e: Entreprise) => e.nom));

    const distanceKm = route.distance / 1000; // Conversion mètres -> km
    const tempsTrajetMinutes = route.duration / 60; // Conversion secondes -> minutes
    const tempsVisites = sortedEntreprises.length * 15; // 15 min par visite
    const tempsTotal = tempsTrajetMinutes + tempsVisites;

    console.log('✅ Itinéraire calculé par proximité:', {
      distance: Math.round(distanceKm) + ' km',
      temps: Math.round(tempsTotal) + ' min',
      arrêts: sortedEntreprises.length
    });

    return new Response(
      JSON.stringify({
        ordre_optimise: sortedEntreprises.map((e: Entreprise) => e.id),
        entreprises_ordonnees: sortedEntreprises,
        distance_totale_km: Math.round(distanceKm * 10) / 10,
        temps_estime_minutes: Math.round(tempsTotal),
        temps_trajet_minutes: Math.round(tempsTrajetMinutes),
        explication: `Itinéraire par proximité: ${Math.round(distanceKm)} km, ${Math.floor(tempsTotal / 60)}h${Math.round(tempsTotal % 60).toString().padStart(2, '0')} avec ${sortedEntreprises.length} arrêts`,
        route_geometry: route.geometry, // GeoJSON de la route complète
        waypoints: mapboxData.waypoints, // Points de passage avec données GPS
        legs: route.legs, // Détails de chaque segment
        fallback: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Error in optimize-tournee:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
