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

    // Normaliser le point de départ (accepter lat/lng ou latitude/longitude)
    const rawStart = point_depart as any;
    const startPoint = rawStart
      ? { 
          lat: rawStart.lat ?? rawStart.latitude, 
          lng: rawStart.lng ?? rawStart.longitude 
        }
      : { 
          lat: entreprises[0].latitude, 
          lng: entreprises[0].longitude 
        };
    
    // Valider le point de départ
    if (!Number.isFinite(startPoint.lat) || !Number.isFinite(startPoint.lng)) {
      throw new Error(`Point de départ invalide: lat=${startPoint.lat}, lng=${startPoint.lng}`);
    }
    
    // Filtrer les entreprises avec coordonnées invalides
    const validEntreprises = entreprises.filter(e => 
      Number.isFinite(e.latitude) && Number.isFinite(e.longitude)
    );
    
    if (validEntreprises.length === 0) {
      throw new Error("Aucune entreprise avec des coordonnées GPS valides");
    }
    
    if (validEntreprises.length < entreprises.length) {
      console.warn(`⚠️ ${entreprises.length - validEntreprises.length} entreprise(s) ignorée(s) (coordonnées invalides)`);
    }

    // Utiliser l'API Mapbox Optimization pour résoudre le TSP (Traveling Salesman Problem)
    // Cette API trouve automatiquement le meilleur ordre pour minimiser le temps de trajet
    const coordinates = validEntreprises.map(e => `${e.longitude},${e.latitude}`).join(';');
    
    // Si on a un point de départ différent, on l'ajoute comme premier point fixe
    // roundtrip=true est nécessaire pour que l'API fonctionne
    const optimizationUrl = point_depart
      ? `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${startPoint.lng},${startPoint.lat};${coordinates}?source=first&destination=last&roundtrip=true&geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_TOKEN}`
      : `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordinates}?source=first&roundtrip=true&geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_TOKEN}`;
    
    console.log('🎯 Appel Mapbox Optimization API pour optimisation réelle du temps de trajet');
    
    const mapboxResponse = await fetch(optimizationUrl);
    
    if (!mapboxResponse.ok) {
      console.error('❌ Erreur Mapbox Optimization:', mapboxResponse.status);
      const errorText = await mapboxResponse.text();
      console.error('Détails:', errorText);
      throw new Error(`Erreur Mapbox Optimization (${mapboxResponse.status}): ${errorText}`);
    }

    const mapboxData = await mapboxResponse.json();
    console.log('Response Mapbox:', JSON.stringify(mapboxData, null, 2));
    
    if (!mapboxData.trips || mapboxData.trips.length === 0) {
      console.error('Pas de trips dans la réponse:', mapboxData);
      throw new Error("Aucun itinéraire optimisé trouvé par Mapbox");
    }

    const trip = mapboxData.trips[0];
    
    // Récupérer l'ordre optimisé des waypoints
    const waypointOrder = mapboxData.waypoints
      .filter((wp: any) => wp.waypoint_index !== undefined)
      .sort((a: any, b: any) => a.waypoint_index - b.waypoint_index);
    
    // Si on a un point de départ, on enlève le premier waypoint (qui est le point de départ)
    const relevantWaypoints = point_depart ? waypointOrder.slice(1) : waypointOrder;
    
    // Réorganiser les entreprises selon l'ordre optimisé de Mapbox
    const sortedEntreprises = relevantWaypoints.map((wp: any) => {
      const originalIndex = point_depart ? wp.waypoint_index - 1 : wp.waypoint_index;
      return validEntreprises[originalIndex];
    });
    
    console.log('✅ Ordre optimisé par Mapbox (minimum de temps de trajet):', sortedEntreprises.map((e: Entreprise) => e.nom));

    const distanceKm = trip.distance / 1000; // Conversion mètres -> km
    const tempsTrajetMinutes = trip.duration / 60; // Conversion secondes -> minutes
    const tempsVisites = sortedEntreprises.length * 15; // 15 min par visite
    const tempsTotal = tempsTrajetMinutes + tempsVisites;

    console.log('✅ Itinéraire optimisé (minimum de temps):', {
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
        explication: `Itinéraire optimisé pour temps minimum: ${Math.round(distanceKm)} km, ${Math.floor(tempsTotal / 60)}h${Math.round(tempsTotal % 60).toString().padStart(2, '0')} avec ${sortedEntreprises.length} arrêts`,
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
