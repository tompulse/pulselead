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
      console.log('🎯 Optimisation demandée: DISTANCE (Matrix API + optimisation exacte si possible)');

      // Pour rester cohérent avec le mode durée (optimized-trips):
      // - start fixé (point_depart si fourni, sinon 1er prospect)
      // - destination fixée au dernier point fourni (dernier prospect de la liste courante)
      const fixedFirst = point_depart ? null : validEntreprises[0];
      const fixedLast = validEntreprises.length >= 2 ? validEntreprises[validEntreprises.length - 1] : null;
      const intermediate = point_depart
        ? validEntreprises.slice(0, -1)
        : validEntreprises.slice(1, -1);

      if (!fixedLast) {
        // Cas 1 seul point
        sortedEntreprises = fixedFirst ? [fixedFirst] : validEntreprises;
      } else {
        const start = point_depart
          ? startPoint
          : { lat: fixedFirst!.latitude, lng: fixedFirst!.longitude };

        // Nœuds pour la matrice: start + intermédiaires + end
        const nodes = [
          { lat: start.lat, lng: start.lng, name: point_depart ? 'Départ' : fixedFirst!.nom },
          ...intermediate.map((e) => ({ lat: e.latitude, lng: e.longitude, name: e.nom })),
          { lat: fixedLast.latitude, lng: fixedLast.longitude, name: fixedLast.nom },
        ];

        const coordsForMatrix = nodes.map((n) => `${n.lng},${n.lat}`);

        const buildHaversineMatrix = (): number[][] => {
          return nodes.map((a) =>
            nodes.map((b) => calculateDistance(a.lat, a.lng, b.lat, b.lng) * 1000) // km -> m
          );
        };

        let rawMatrix: (number | null)[][] | null = null;

        // Matrix API: limite Mapbox = 25 coords max
        if (coordsForMatrix.length <= 25) {
          const matrixUrl = `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${coordsForMatrix.join(';')}?annotations=distance&access_token=${MAPBOX_TOKEN}`;
          const matrixRes = await fetch(matrixUrl);
          if (matrixRes.ok) {
            const matrixData = await matrixRes.json();
            rawMatrix = matrixData?.distances ?? null;
            if (!rawMatrix) console.warn('[optimize-tournee] Matrix API: distances manquantes, fallback Haversine');
          } else {
            console.warn('[optimize-tournee] Matrix API error status:', matrixRes.status);
          }
        } else {
          console.warn(`[optimize-tournee] Trop de points (${coordsForMatrix.length}) pour la Matrix API, fallback Haversine`);
        }

        const dist: number[][] = (rawMatrix ?? buildHaversineMatrix()).map((row) =>
          row.map((v) => (typeof v === 'number' && Number.isFinite(v) ? v : Number.POSITIVE_INFINITY))
        );

        // Optimiser la séquence des intermédiaires avec start/end fixés
        const startIdx = 0;
        const endIdx = nodes.length - 1;
        const m = nodes.length - 2; // nb intermédiaires

        const computePathCost = (route: number[]) => {
          let total = 0;
          for (let i = 1; i < route.length; i++) {
            total += dist[route[i - 1]][route[i]];
          }
          return total;
        };

        const nearestNeighbor = (): number[] => {
          const visited = new Array(nodes.length).fill(false);
          visited[startIdx] = true;
          visited[endIdx] = true; // end fixé, on ne le visite qu'à la fin

          const route: number[] = [startIdx];
          let current = startIdx;

          for (let step = 0; step < m; step++) {
            let best = -1;
            let bestCost = Number.POSITIVE_INFINITY;
            for (let j = 1; j <= m; j++) {
              if (visited[j]) continue;
              const c = dist[current][j];
              if (c < bestCost) {
                bestCost = c;
                best = j;
              }
            }
            if (best === -1) break;
            visited[best] = true;
            route.push(best);
            current = best;
          }

          route.push(endIdx);
          return route;
        };

        const exactHeldKarpFixedEnd = (): number[] | null => {
          // DP sur les intermédiaires 1..m, fin fixée sur endIdx
          if (m === 0) return [startIdx, endIdx];
          if (m > 12) return null;

          const size = 1 << m;
          const dp: number[][] = Array.from({ length: size }, () => Array(nodes.length).fill(Number.POSITIVE_INFINITY));
          const parent: number[][] = Array.from({ length: size }, () => Array(nodes.length).fill(-1));

          // init: start -> i
          for (let i = 1; i <= m; i++) {
            const mask = 1 << (i - 1);
            dp[mask][i] = dist[startIdx][i];
            parent[mask][i] = startIdx;
          }

          for (let mask = 1; mask < size; mask++) {
            for (let last = 1; last <= m; last++) {
              if (!(mask & (1 << (last - 1)))) continue;
              const prevMask = mask ^ (1 << (last - 1));
              if (prevMask === 0) continue;

              for (let prev = 1; prev <= m; prev++) {
                if (!(prevMask & (1 << (prev - 1)))) continue;
                const cand = dp[prevMask][prev] + dist[prev][last];
                if (cand < dp[mask][last]) {
                  dp[mask][last] = cand;
                  parent[mask][last] = prev;
                }
              }
            }
          }

          const fullMask = size - 1;
          let bestLast = -1;
          let bestCost = Number.POSITIVE_INFINITY;

          for (let last = 1; last <= m; last++) {
            const cost = dp[fullMask][last] + dist[last][endIdx];
            if (cost < bestCost) {
              bestCost = cost;
              bestLast = last;
            }
          }

          if (bestLast === -1) return null;

          // reconstruct
          const routeRev: number[] = [endIdx, bestLast];
          let mask = fullMask;
          let curr = bestLast;

          while (true) {
            const p = parent[mask][curr];
            if (p === -1 || p === startIdx) break;
            routeRev.push(p);
            mask = mask ^ (1 << (curr - 1));
            curr = p;
          }

          routeRev.push(startIdx);
          const route = routeRev.reverse();
          // insert endIdx already present at end
          return route;
        };

        let bestRoute = exactHeldKarpFixedEnd() ?? nearestNeighbor();

        // Si heuristique: 2-opt sur les intermédiaires (start/end fixés)
        if (m > 2 && m > 12) {
          let improved = true;
          let iterations = 0;
          const maxIterations = 50;

          while (improved && iterations < maxIterations) {
            improved = false;
            iterations++;

            for (let i = 1; i < bestRoute.length - 2; i++) {
              for (let k = i + 1; k < bestRoute.length - 1; k++) {
                const candidate = [
                  ...bestRoute.slice(0, i),
                  ...bestRoute.slice(i, k + 1).reverse(),
                  ...bestRoute.slice(k + 1),
                ];
                if (computePathCost(candidate) + 1e-6 < computePathCost(bestRoute)) {
                  bestRoute = candidate;
                  improved = true;
                }
              }
            }
          }
        }

        // bestRoute = [startIdx, ...intermediateIdx, endIdx]
        const orderedIntermediate = bestRoute
          .slice(1, -1)
          .map((idx) => intermediate[idx - 1])
          .filter(Boolean);

        sortedEntreprises = point_depart
          ? [...orderedIntermediate, fixedLast]
          : [fixedFirst!, ...orderedIntermediate, fixedLast];
      }

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
