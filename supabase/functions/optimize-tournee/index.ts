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
}

interface OptimizationRequest {
  entreprises: Entreprise[];
  point_depart?: { lat: number; lng: number };
}

// Géocodage Mapbox pour compléter les coordonnées manquantes
async function geocodeOne(query: string, token: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1&language=fr`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature?.center) return null;
  const [lng, lat] = feature.center;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function buildQuery(e: Entreprise): string | null {
  const parts: string[] = [];
  if (e.adresse) parts.push(e.adresse);
  if (e.code_postal) parts.push(e.code_postal);
  if (e.ville) parts.push(e.ville);
  parts.push('France');
  const query = parts.filter(Boolean).join(', ');
  return query.trim().length > 0 ? query : null;
}

async function hydrateCoordinates(entreprises: Entreprise[], token: string): Promise<Entreprise[]> {
  const enriched: Entreprise[] = [];

  for (const e of entreprises) {
    const hasCoords = Number.isFinite(e.latitude) && Number.isFinite(e.longitude);
    if (hasCoords) {
      enriched.push(e);
      continue;
    }

    const query = buildQuery(e);
    if (!query) {
      enriched.push(e);
      continue;
    }

    try {
      const result = await geocodeOne(query, token);
      if (result) {
        enriched.push({ ...e, latitude: result.lat, longitude: result.lng });
      } else {
        enriched.push(e);
      }
    } catch {
      enriched.push(e);
    }
  }

  return enriched;
}

// Calcul distance Haversine en km (vol d'oiseau)
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Algorithme Nearest Neighbor basé sur la DISTANCE (km)
// Commence au point de départ, va toujours au point le plus proche non visité
function nearestNeighborByDistance(
  startPoint: { lat: number; lng: number },
  entreprises: Entreprise[]
): Entreprise[] {
  if (entreprises.length === 0) return [];
  if (entreprises.length === 1) return entreprises;

  const remaining = [...entreprises];
  const result: Entreprise[] = [];
  let currentLat = startPoint.lat;
  let currentLng = startPoint.lng;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = haversineKm(currentLat, currentLng, remaining[i].latitude, remaining[i].longitude);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    const nearest = remaining.splice(nearestIdx, 1)[0];
    result.push(nearest);
    currentLat = nearest.latitude;
    currentLng = nearest.longitude;
  }

  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { entreprises, point_depart }: OptimizationRequest = await req.json();
    
    console.log('🚀 Optimisation par km (nearest neighbor):', { 
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

    // Enrichir les coordonnées manquantes
    const enrichedEntreprises = await hydrateCoordinates(entreprises, MAPBOX_TOKEN);

    // Filtrer entreprises avec coordonnées valides
    const validEntreprises = enrichedEntreprises.filter(e => 
      Number.isFinite(e.latitude) && Number.isFinite(e.longitude)
    );
    
    if (validEntreprises.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "Aucune coordonnée GPS valide",
          fallback: true,
          ordre_optimise: entreprises.map(e => e.id),
          entreprises_ordonnees: entreprises
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Point de départ: fourni ou premier prospect
    const rawStart = point_depart as any;
    const startPoint = rawStart
      ? { lat: rawStart.lat ?? rawStart.latitude, lng: rawStart.lng ?? rawStart.longitude }
      : { lat: validEntreprises[0].latitude, lng: validEntreprises[0].longitude };

    if (!Number.isFinite(startPoint.lat) || !Number.isFinite(startPoint.lng)) {
      throw new Error(`Point de départ invalide`);
    }

    // OPTIMISATION: Nearest Neighbor par distance (km)
    console.log('📍 Optimisation nearest neighbor par distance...');
    const sortedEntreprises = nearestNeighborByDistance(startPoint, validEntreprises);
    
    console.log('✅ Ordre optimisé:', sortedEntreprises.map(e => e.nom));

    // Calculer les KPI réels via Mapbox Directions API
    const routePoints = [
      startPoint,
      ...sortedEntreprises.map(e => ({ lat: e.latitude, lng: e.longitude })),
    ];

    let distanceKm: number | null = null;
    let tempsTrajetMinutes: number | null = null;
    let routeGeometry: any = null;

    if (routePoints.length >= 2) {
      const directionsCoords = routePoints.map(p => `${p.lng},${p.lat}`).join(';');
      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${directionsCoords}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;

      const directionsRes = await fetch(directionsUrl);
      if (directionsRes.ok) {
        const directionsData = await directionsRes.json();
        const route = directionsData?.routes?.[0];

        if (route?.distance != null && route?.duration != null) {
          distanceKm = route.distance / 1000;
          tempsTrajetMinutes = route.duration / 60;
          routeGeometry = route.geometry;
        }
      }
    }

    // Fallback: calcul Haversine si Directions échoue
    if (distanceKm === null) {
      let totalDist = haversineKm(startPoint.lat, startPoint.lng, sortedEntreprises[0].latitude, sortedEntreprises[0].longitude);
      for (let i = 0; i < sortedEntreprises.length - 1; i++) {
        totalDist += haversineKm(
          sortedEntreprises[i].latitude, sortedEntreprises[i].longitude,
          sortedEntreprises[i + 1].latitude, sortedEntreprises[i + 1].longitude
        );
      }
      // Facteur 1.3 pour approximer la distance route vs vol d'oiseau
      distanceKm = totalDist * 1.3;
      // Estimation temps: ~40km/h moyen en ville
      tempsTrajetMinutes = (distanceKm / 40) * 60;
    }

    console.log('✅ KPI final:', {
      distance_km: Math.round((distanceKm || 0) * 10) / 10,
      duration_min: Math.round(tempsTrajetMinutes || 0),
      arrêts: sortedEntreprises.length,
    });

    return new Response(
      JSON.stringify({
        ordre_optimise: sortedEntreprises.map(e => e.id),
        entreprises_ordonnees: sortedEntreprises,
        distance_totale_km: Math.round((distanceKm || 0) * 10) / 10,
        temps_estime_minutes: Math.round(tempsTrajetMinutes || 0),
        temps_trajet_minutes: Math.round(tempsTrajetMinutes || 0),
        explication: `Itinéraire optimisé: ${Math.round(distanceKm || 0)} km, ${Math.floor((tempsTrajetMinutes || 0) / 60)}h${Math.round((tempsTrajetMinutes || 0) % 60).toString().padStart(2, '0')} avec ${sortedEntreprises.length} arrêts`,
        route_geometry: routeGeometry,
        fallback: false,
        algorithm: 'nearest_neighbor_distance'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('❌ Error in optimize-tournee:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
