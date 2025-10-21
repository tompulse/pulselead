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

    // Utiliser l'API Mapbox Optimization pour un ordre vraiment optimal (résout le TSP)
    const coordinates = [
      `${startPoint.lng},${startPoint.lat}`,
      ...entreprises.map(e => `${e.longitude},${e.latitude}`)
    ].join(';');

    // API Mapbox Optimization - résout le problème du voyageur de commerce
    const optimizationUrl = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordinates}?source=first&destination=last&roundtrip=false&geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_TOKEN}`;
    
    console.log('🎯 Appel Mapbox Optimization API (TSP) avec', entreprises.length + 1, 'points');
    
    const mapboxResponse = await fetch(optimizationUrl);
    
    if (!mapboxResponse.ok) {
      console.error('❌ Erreur Mapbox Optimization:', mapboxResponse.status);
      const errorText = await mapboxResponse.text();
      console.error('Détails:', errorText);
      throw new Error(`Mapbox Optimization API error: ${mapboxResponse.status}`);
    }

    const mapboxData = await mapboxResponse.json();
    
    if (!mapboxData.trips || mapboxData.trips.length === 0) {
      throw new Error("Aucun itinéraire optimisé trouvé par Mapbox");
    }

    const trip = mapboxData.trips[0];
    
    // Récupérer l'ordre optimisé depuis les waypoints de Mapbox
    // waypoint_index indique l'ordre optimal
    const waypointOrder = mapboxData.waypoints
      .slice(1) // Exclure le point de départ
      .sort((a: any, b: any) => a.waypoint_index - b.waypoint_index)
      .map((wp: any) => wp.waypoint_index - 1); // -1 car le premier est le départ

    const optimizedOrder = waypointOrder.map((idx: number) => entreprises[idx]);

    console.log('✅ Ordre optimal (TSP Mapbox):', optimizedOrder.map((e: Entreprise) => e.nom));

    const distanceKm = trip.distance / 1000; // Conversion mètres -> km
    const tempsTrajetMinutes = trip.duration / 60; // Conversion secondes -> minutes
    const tempsVisites = optimizedOrder.length * 15; // 15 min par visite
    const tempsTotal = tempsTrajetMinutes + tempsVisites;

    console.log('✅ Itinéraire optimal calculé:', {
      distance: Math.round(distanceKm) + ' km',
      temps: Math.round(tempsTotal) + ' min',
      arrêts: optimizedOrder.length
    });

    return new Response(
      JSON.stringify({
        ordre_optimise: optimizedOrder.map((e: Entreprise) => e.id),
        entreprises_ordonnees: optimizedOrder,
        distance_totale_km: Math.round(distanceKm * 10) / 10,
        temps_estime_minutes: Math.round(tempsTotal),
        temps_trajet_minutes: Math.round(tempsTrajetMinutes),
        explication: `Itinéraire optimal: ${Math.round(distanceKm)} km, ${Math.floor(tempsTotal / 60)}h${Math.round(tempsTotal % 60).toString().padStart(2, '0')} avec ${optimizedOrder.length} arrêts`,
        route_geometry: trip.geometry, // GeoJSON de la route complète
        waypoints: mapboxData.waypoints, // Points de passage avec données GPS
        legs: trip.legs, // Détails de chaque segment
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
