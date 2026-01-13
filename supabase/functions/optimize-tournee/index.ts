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
  optimize_by?: 'duration' | 'distance'; // 'duration' par défaut
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

// Géocodage Mapbox pour compléter les coordonnées manquantes
async function geocodeOne(query: string, token: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1&language=fr`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn('[optimize-tournee] Geocoding error status:', res.status);
    return null;
  }
  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature?.center) return null;
  const [lng, lat] = feature.center;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function buildQuery(e: Entreprise): string | null {
  // Priorité à l'adresse complète, sinon ville + CP
  const parts: string[] = [];
  if (e.adresse) parts.push(e.adresse);
  if (e.code_postal) parts.push(e.code_postal);
  if (e.ville) parts.push(e.ville);
  parts.push('France');
  const query = parts.filter(Boolean).join(', ');
  return query.trim().length > 0 ? query : null;
}

async function hydrateCoordinates(entreprises: Entreprise[], token: string): Promise<Entreprise[]> {
  let geocodedCount = 0;
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
        geocodedCount++;
        enriched.push({ ...e, latitude: result.lat, longitude: result.lng });
      } else {
        enriched.push(e);
      }
    } catch (err) {
      console.warn('[optimize-tournee] Geocoding exception for', e.nom, err);
      enriched.push(e);
    }
  }

  console.log(`[optimize-tournee] Géocodage effectué pour ${geocodedCount}/${entreprises.length} entreprise(s) sans coordonnées`);
  return enriched;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { entreprises, point_depart, optimize_by = 'duration' }: OptimizationRequest = await req.json();
    
    console.log('🚀 Optimisation de tournée demandée:', { 
      nbEntreprises: entreprises.length,
      hasStartPoint: !!point_depart,
      optimizeBy: optimize_by
    });
    
    if (!entreprises || entreprises.length === 0) {
      throw new Error("Aucune entreprise fournie");
    }

    const MAPBOX_TOKEN = Deno.env.get('MAPBOX_ACCESS_TOKEN');
    if (!MAPBOX_TOKEN) {
      throw new Error('MAPBOX_ACCESS_TOKEN is not configured');
    }

    // Enrichir automatiquement les coordonnées manquantes avec le géocodage
    console.log('🔍 Enrichissement automatique des coordonnées manquantes...');
    const enrichedEntreprises = await hydrateCoordinates(entreprises, MAPBOX_TOKEN);

    // Normaliser le point de départ
    const rawStart = point_depart as any;
    
    // Filtrer les entreprises avec coordonnées valides
    const validEntreprises = enrichedEntreprises.filter(e => 
      Number.isFinite(e.latitude) && Number.isFinite(e.longitude)
    );
    
    if (validEntreprises.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "Aucune coordonnée GPS valide trouvée",
          message: "Impossible de géocoder les adresses fournies. Vérifiez que les entreprises ont des adresses ou villes valides.",
          fallback: true,
          ordre_optimise: entreprises.map(e => e.id),
          entreprises_ordonnees: entreprises
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Calcul du point de départ final (utilisateur si fourni, sinon 1er prospect)
    const startPoint = rawStart
      ? { lat: rawStart.lat ?? rawStart.latitude, lng: rawStart.lng ?? rawStart.longitude }
      : { lat: validEntreprises[0].latitude, lng: validEntreprises[0].longitude };

    if (!Number.isFinite(startPoint.lat) || !Number.isFinite(startPoint.lng)) {
      throw new Error(`Point de départ invalide: lat=${startPoint.lat}, lng=${startPoint.lng}`);
    }

    if (!rawStart) {
      console.log('📍 Point de départ par défaut: première entreprise');
    }
    
    if (validEntreprises.length < enrichedEntreprises.length) {
      console.warn(`⚠️ ${enrichedEntreprises.length - validEntreprises.length} entreprise(s) ignorée(s) (géocodage impossible)`);
    }

    // Optimisation par durée (API Mapbox Optimized Trips) ou par distance (Matrix API + heuristique)
    let sortedEntreprises: Entreprise[] = [];
    let tripDistanceMeters = 0;
    let tripDurationSeconds = 0;
    let routeGeometry: any = null;
    let legs: any[] | null = null;
    let responseWaypoints: any = null;

    if (optimize_by === 'distance') {
      console.log('🎯 Optimisation demandée: DISTANCE (Matrix API + heuristique)');

      // Pour rester cohérent avec le comportement existant:
      // - si point_depart n'est pas fourni, on garde le 1er prospect comme départ fixe
      const fixedFirst = point_depart ? null : validEntreprises[0];
      const candidates = point_depart ? validEntreprises : validEntreprises.slice(1);
      const start = point_depart
        ? startPoint
        : { lat: fixedFirst!.latitude, lng: fixedFirst!.longitude };

      const coordsForMatrix = [
        `${start.lng},${start.lat}`,
        ...candidates.map((e) => `${e.longitude},${e.latitude}`),
      ];

      const buildHaversineMatrix = () => {
        const nodes = [{ lat: start.lat, lng: start.lng }, ...candidates.map((e) => ({ lat: e.latitude, lng: e.longitude }))];
        return nodes.map((a) =>
          nodes.map((b) => calculateDistance(a.lat, a.lng, b.lat, b.lng) * 1000) // km -> m
        );
      };

      let distMatrix: (number | null)[][] | null = null;

      // Matrix API: limite Mapbox = 25 coords max
      if (coordsForMatrix.length <= 25) {
        const matrixUrl = `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${coordsForMatrix.join(';')}?annotations=distance,duration&access_token=${MAPBOX_TOKEN}`;
        const matrixRes = await fetch(matrixUrl);
        if (matrixRes.ok) {
          const matrixData = await matrixRes.json();
          distMatrix = matrixData?.distances ?? null;
          if (!distMatrix) {
            console.warn('[optimize-tournee] Matrix API: distances manquantes, fallback Haversine');
          }
        } else {
          console.warn('[optimize-tournee] Matrix API error status:', matrixRes.status);
        }
      } else {
        console.warn(`[optimize-tournee] Trop de points (${coordsForMatrix.length}) pour la Matrix API, fallback Haversine`);
      }

      if (!distMatrix) {
        distMatrix = buildHaversineMatrix();
      }

      // Heuristique: plus proche voisin (chemin ouvert) depuis l'index 0
      const n = distMatrix.length;
      const visited = new Array(n).fill(false);
      visited[0] = true;
      let current = 0;
      const orderIdx: number[] = [];

      const getCost = (i: number, j: number) => {
        const v = distMatrix?.[i]?.[j];
        return typeof v === 'number' && Number.isFinite(v) ? v : Number.POSITIVE_INFINITY;
      };

      for (let step = 0; step < n - 1; step++) {
        let best = -1;
        let bestCost = Number.POSITIVE_INFINITY;
        for (let j = 1; j < n; j++) {
          if (visited[j]) continue;
          const c = getCost(current, j);
          if (c < bestCost) {
            bestCost = c;
            best = j;
          }
        }
        if (best === -1) break;
        visited[best] = true;
        orderIdx.push(best);
        current = best;
      }

      const orderedCandidates = orderIdx.map((idx) => candidates[idx - 1]).filter(Boolean);
      sortedEntreprises = fixedFirst ? [fixedFirst, ...orderedCandidates] : orderedCandidates;

      console.log('✅ Ordre optimisé (distance minimale):', sortedEntreprises.map((e) => e.nom));

      // KPIs + géométrie: Directions API sur l'ordre choisi
      const directionsCoords = point_depart
        ? [`${startPoint.lng},${startPoint.lat}`, ...sortedEntreprises.map((e) => `${e.longitude},${e.latitude}`)].join(';')
        : sortedEntreprises.map((e) => `${e.longitude},${e.latitude}`).join(';');

      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${directionsCoords}?geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_TOKEN}`;
      const dirRes = await fetch(directionsUrl);
      if (!dirRes.ok) {
        const errText = await dirRes.text();
        throw new Error(`Erreur Mapbox Directions (${dirRes.status}): ${errText}`);
      }
      const dirData = await dirRes.json();
      const route = dirData?.routes?.[0];
      if (!route) {
        throw new Error('Aucun itinéraire trouvé par Mapbox Directions');
      }

      tripDistanceMeters = route.distance ?? 0;
      tripDurationSeconds = route.duration ?? 0;
      routeGeometry = route.geometry ?? null;
      legs = route.legs ?? null;

      // Fabriquer un champ "waypoints" minimal (pour debug / compat)
      responseWaypoints = point_depart
        ? [
            { location: [startPoint.lng, startPoint.lat], waypoint_index: 0, name: 'Départ' },
            ...sortedEntreprises.map((e, i) => ({ location: [e.longitude, e.latitude], waypoint_index: i + 1, name: e.nom })),
          ]
        : sortedEntreprises.map((e, i) => ({ location: [e.longitude, e.latitude], waypoint_index: i, name: e.nom }));

    } else {
      console.log('🎯 Optimisation demandée: DURÉE (Mapbox Optimized Trips)');

      // Utiliser l'API Mapbox Optimization pour résoudre le TSP (Traveling Salesman Problem)
      const coordinates = validEntreprises.map(e => `${e.longitude},${e.latitude}`).join(';');
      const profile = 'driving';
      const annotations = 'duration,distance';

      const optimizationUrl = point_depart
        ? `https://api.mapbox.com/optimized-trips/v1/mapbox/${profile}/${startPoint.lng},${startPoint.lat};${coordinates}?source=first&destination=last&roundtrip=false&geometries=geojson&overview=full&steps=true&annotations=${annotations}&access_token=${MAPBOX_TOKEN}`
        : `https://api.mapbox.com/optimized-trips/v1/mapbox/${profile}/${coordinates}?source=first&destination=last&roundtrip=false&geometries=geojson&overview=full&steps=true&annotations=${annotations}&access_token=${MAPBOX_TOKEN}`;

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
      const waypoints = mapboxData.waypoints;
      const startOffset = point_depart ? 1 : 0;

      const waypointMapping = waypoints
        .slice(startOffset)
        .map((wp: any, originalIdx: number) => ({
          originalIndex: originalIdx,
          visitOrder: wp.waypoint_index - startOffset,
          entreprise: validEntreprises[originalIdx],
        }));

      waypointMapping.sort((a: any, b: any) => a.visitOrder - b.visitOrder);
      sortedEntreprises = waypointMapping.map((m: any) => m.entreprise);

      console.log('✅ Ordre optimisé (durée minimale):', sortedEntreprises.map((e: Entreprise) => e.nom));

      tripDistanceMeters = trip.distance ?? 0;
      tripDurationSeconds = trip.duration ?? 0;
      routeGeometry = trip.geometry ?? null;
      legs = trip.legs ?? null;
      responseWaypoints = waypoints;
    }

    const distanceKm = tripDistanceMeters / 1000;
    const tempsTrajetMinutes = tripDurationSeconds / 60;
    const tempsVisites = sortedEntreprises.length * 15; // 15 min par visite
    const tempsTotal = tempsTrajetMinutes + tempsVisites;

    const modeLabel = optimize_by === 'distance' ? 'distance minimale' : 'durée minimale';

    console.log(`✅ Itinéraire optimisé (${modeLabel}):`, {
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
        optimize_by: optimize_by,
        explication: `Itinéraire optimisé (${modeLabel}): ${Math.round(distanceKm)} km, ${Math.floor(tempsTotal / 60)}h${Math.round(tempsTotal % 60).toString().padStart(2, '0')} avec ${sortedEntreprises.length} arrêts`,
        route_geometry: routeGeometry,
        waypoints: responseWaypoints,
        legs,
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
