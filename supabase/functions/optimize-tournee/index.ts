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

// Algorithme du plus proche voisin pour optimisation de base
function nearestNeighborOptimization(
  startPoint: { lat: number; lng: number },
  points: Entreprise[]
): Entreprise[] {
  if (points.length === 0) return [];
  
  const result: Entreprise[] = [];
  const remaining = [...points];
  let current = startPoint;
  
  while (remaining.length > 0) {
    let nearestIdx = 0;
    let minDist = calculateDistance(current.lat, current.lng, remaining[0].latitude, remaining[0].longitude);
    
    for (let i = 1; i < remaining.length; i++) {
      const dist = calculateDistance(current.lat, current.lng, remaining[i].latitude, remaining[i].longitude);
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = i;
      }
    }
    
    const nearest = remaining.splice(nearestIdx, 1)[0];
    result.push(nearest);
    current = { lat: nearest.latitude, lng: nearest.longitude };
  }
  
  return result;
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

    // Pré-optimisation avec algorithme du plus proche voisin
    const optimizedOrder = nearestNeighborOptimization(startPoint, entreprises);
    
    console.log('✅ Ordre optimisé (plus proche voisin):', optimizedOrder.map(e => e.nom));

    // Construire l'URL pour Mapbox Directions API
    // Format: lng,lat pour chaque point
    const coordinates = [
      `${startPoint.lng},${startPoint.lat}`,
      ...optimizedOrder.map(e => `${e.longitude},${e.latitude}`)
    ].join(';');

    // Appel à Mapbox Directions API pour obtenir l'itinéraire réel
    const mapboxUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_TOKEN}`;
    
    console.log('📍 Appel Mapbox Directions API avec', optimizedOrder.length + 1, 'points');
    
    const mapboxResponse = await fetch(mapboxUrl);
    
    if (!mapboxResponse.ok) {
      console.error('❌ Erreur Mapbox:', mapboxResponse.status);
      // Fallback sur calcul approximatif si Mapbox échoue
      let totalDistance = 0;
      let currentPoint = startPoint;
      
      for (const entreprise of optimizedOrder) {
        totalDistance += calculateDistance(
          currentPoint.lat,
          currentPoint.lng,
          entreprise.latitude,
          entreprise.longitude
        );
        currentPoint = { lat: entreprise.latitude, lng: entreprise.longitude };
      }
      
      const tempsTrajet = (totalDistance / 60) * 60; // 60 km/h en minutes
      const tempsVisites = optimizedOrder.length * 15; // 15 min par visite
      const tempsTotal = tempsTrajet + tempsVisites;
      
      return new Response(
        JSON.stringify({
          ordre_optimise: optimizedOrder.map(e => e.id),
          entreprises_ordonnees: optimizedOrder,
          distance_totale_km: Math.round(totalDistance * 10) / 10,
          temps_estime_minutes: Math.round(tempsTotal),
          explication: `Itinéraire optimisé avec ${optimizedOrder.length} arrêts (calcul approximatif)`,
          route_geometry: null,
          fallback: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const mapboxData = await mapboxResponse.json();
    
    if (!mapboxData.routes || mapboxData.routes.length === 0) {
      throw new Error("Aucun itinéraire trouvé par Mapbox");
    }

    const route = mapboxData.routes[0];
    const distanceKm = route.distance / 1000; // Conversion mètres -> km
    const tempsTrajetMinutes = route.duration / 60; // Conversion secondes -> minutes
    const tempsVisites = optimizedOrder.length * 15; // 15 min par visite
    const tempsTotal = tempsTrajetMinutes + tempsVisites;

    console.log('✅ Itinéraire calculé:', {
      distance: Math.round(distanceKm) + ' km',
      temps: Math.round(tempsTotal) + ' min',
      arrêts: optimizedOrder.length
    });

    return new Response(
      JSON.stringify({
        ordre_optimise: optimizedOrder.map(e => e.id),
        entreprises_ordonnees: optimizedOrder,
        distance_totale_km: Math.round(distanceKm * 10) / 10,
        temps_estime_minutes: Math.round(tempsTotal),
        temps_trajet_minutes: Math.round(tempsTrajetMinutes),
        explication: `Itinéraire optimisé: ${Math.round(distanceKm)} km, ${Math.floor(tempsTotal / 60)}h${Math.round(tempsTotal % 60).toString().padStart(2, '0')} avec ${optimizedOrder.length} arrêts`,
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
