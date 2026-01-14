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

// Calculer la matrice de durées entre tous les points via Mapbox Matrix API
async function getDistanceMatrix(points: { lat: number; lng: number }[], token: string): Promise<number[][] | null> {
  if (points.length < 2) return null;
  
  const coords = points.map(p => `${p.lng},${p.lat}`).join(';');
  const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${coords}?annotations=duration&access_token=${token}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    console.warn('[optimize-tournee] Matrix API error:', res.status);
    return null;
  }
  
  const data = await res.json();
  if (data.code !== 'Ok' || !data.durations) {
    console.warn('[optimize-tournee] Matrix API no durations:', data.code);
    return null;
  }
  
  return data.durations;
}

// Algorithme Nearest Neighbor pour TSP (meilleur compromis vitesse/qualité)
function nearestNeighborTSP(matrix: number[][], startIdx: number): number[] {
  const n = matrix.length;
  const visited = new Set<number>([startIdx]);
  const path = [startIdx];
  let current = startIdx;
  
  while (visited.size < n) {
    let nearestIdx = -1;
    let nearestDist = Infinity;
    
    for (let i = 0; i < n; i++) {
      if (!visited.has(i) && matrix[current][i] < nearestDist) {
        nearestDist = matrix[current][i];
        nearestIdx = i;
      }
    }
    
    if (nearestIdx === -1) break;
    
    visited.add(nearestIdx);
    path.push(nearestIdx);
    current = nearestIdx;
  }
  
  return path;
}

// Amélioration 2-opt pour optimiser le chemin
function twoOptImprove(path: number[], matrix: number[][]): number[] {
  let improved = true;
  let bestPath = [...path];
  
  while (improved) {
    improved = false;
    
    for (let i = 1; i < bestPath.length - 1; i++) {
      for (let j = i + 1; j < bestPath.length; j++) {
        // Calculer le coût actuel du segment
        const costBefore = 
          matrix[bestPath[i - 1]][bestPath[i]] + 
          (j < bestPath.length - 1 ? matrix[bestPath[j]][bestPath[j + 1]] : 0);
        
        // Calculer le coût si on inverse le segment
        const costAfter = 
          matrix[bestPath[i - 1]][bestPath[j]] + 
          (j < bestPath.length - 1 ? matrix[bestPath[i]][bestPath[j + 1]] : 0);
        
        if (costAfter < costBefore - 0.1) { // Seuil pour éviter les micro-optimisations
          // Inverser le segment entre i et j
          const newPath = [...bestPath];
          const segment = newPath.slice(i, j + 1).reverse();
          newPath.splice(i, j - i + 1, ...segment);
          bestPath = newPath;
          improved = true;
        }
      }
    }
  }
  
  return bestPath;
}

// Calculer le coût total d'un chemin
function calculatePathCost(path: number[], matrix: number[][]): number {
  let cost = 0;
  for (let i = 0; i < path.length - 1; i++) {
    cost += matrix[path[i]][path[i + 1]];
  }
  return cost;
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
          message: "Impossible de géocoder les adresses fournies.",
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

    // NOUVEAU: Utiliser l'API Matrix + algorithme TSP personnalisé
    console.log('🎯 Calcul de la matrice de durées via Mapbox Matrix API...');
    
    // Construire la liste de tous les points (départ + entreprises)
    const allPoints = [
      { lat: startPoint.lat, lng: startPoint.lng },
      ...validEntreprises.map(e => ({ lat: e.latitude, lng: e.longitude }))
    ];
    
    const matrix = await getDistanceMatrix(allPoints, MAPBOX_TOKEN);
    
    let sortedEntreprises: Entreprise[];
    
    if (matrix) {
      console.log('✅ Matrice reçue, optimisation TSP avec Nearest Neighbor + 2-opt...');
      
      // Nearest Neighbor depuis le point de départ (index 0)
      const initialPath = nearestNeighborTSP(matrix, 0);
      console.log('📍 Chemin initial (Nearest Neighbor):', initialPath.map(i => i === 0 ? 'DÉPART' : validEntreprises[i - 1].nom));
      
      const initialCost = calculatePathCost(initialPath, matrix);
      console.log('⏱️ Durée initiale:', Math.round(initialCost / 60), 'min');
      
      // Amélioration 2-opt
      const optimizedPath = twoOptImprove(initialPath, matrix);
      const optimizedCost = calculatePathCost(optimizedPath, matrix);
      console.log('📍 Chemin optimisé (2-opt):', optimizedPath.map(i => i === 0 ? 'DÉPART' : validEntreprises[i - 1].nom));
      console.log('⏱️ Durée optimisée:', Math.round(optimizedCost / 60), 'min');
      console.log('🎉 Gain:', Math.round((initialCost - optimizedCost) / 60), 'min');
      
      // Extraire les entreprises dans l'ordre optimisé (sans le point de départ)
      sortedEntreprises = optimizedPath
        .filter(i => i > 0) // Exclure le point de départ
        .map(i => validEntreprises[i - 1]); // Décaler l'index car 0 = départ
    } else {
      // Fallback: utiliser l'API Optimized Trips de Mapbox
      console.log('⚠️ Fallback vers Mapbox Optimized Trips API...');
      
      const coordinates = validEntreprises.map(e => `${e.longitude},${e.latitude}`).join(';');
      const optimizationUrl = point_depart
        ? `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${startPoint.lng},${startPoint.lat};${coordinates}?source=first&destination=last&roundtrip=false&geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`
        : `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordinates}?roundtrip=false&geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
      
      const mapboxResponse = await fetch(optimizationUrl);
      
      if (!mapboxResponse.ok) {
        console.error('❌ Erreur Mapbox Optimization:', mapboxResponse.status);
        // Fallback ultime: garder l'ordre original
        sortedEntreprises = validEntreprises;
      } else {
        const mapboxData = await mapboxResponse.json();
        
        if (!mapboxData.trips || mapboxData.trips.length === 0) {
          sortedEntreprises = validEntreprises;
        } else {
          const waypoints = mapboxData.waypoints;
          const startOffset = point_depart ? 1 : 0;
          
          const waypointMapping = waypoints
            .slice(startOffset)
            .map((wp: any, originalIdx: number) => ({
              originalIndex: originalIdx,
              visitOrder: wp.waypoint_index - startOffset,
              entreprise: validEntreprises[originalIdx]
            }));
          
          waypointMapping.sort((a: any, b: any) => a.visitOrder - b.visitOrder);
          sortedEntreprises = waypointMapping.map((m: any) => m.entreprise);
        }
      }
    }
    
    console.log('✅ Ordre final optimisé:', sortedEntreprises.map((e: Entreprise) => e.nom));

    // KPI: calculer via Directions API sur l'ordre optimisé
    const routePoints = [
      { lat: startPoint.lat, lng: startPoint.lng },
      ...sortedEntreprises.map((e) => ({ lat: e.latitude, lng: e.longitude })),
    ].filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));

    let distanceKm: number | null = null;
    let tempsTrajetMinutes: number | null = null;
    let routeGeometry: any = null;

    if (routePoints.length >= 2) {
      const directionsCoords = routePoints.map((p) => `${p.lng},${p.lat}`).join(';');
      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${directionsCoords}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;

      console.log('📊 Calcul KPI via Directions API...');
      const directionsRes = await fetch(directionsUrl);
      if (directionsRes.ok) {
        const directionsData = await directionsRes.json();
        const route = directionsData?.routes?.[0];

        if (route?.distance != null && route?.duration != null) {
          distanceKm = route.distance / 1000;
          tempsTrajetMinutes = route.duration / 60;
          routeGeometry = route.geometry;
        } else {
          console.warn('[optimize-tournee] Directions: aucune route trouvée');
        }
      } else {
        console.warn('[optimize-tournee] Directions error status:', directionsRes.status);
      }
    }

    // Fallback KPI depuis la matrice si disponible
    if ((distanceKm === null || tempsTrajetMinutes === null) && matrix) {
      const pathIndices = [0, ...sortedEntreprises.map((e) => validEntreprises.indexOf(e) + 1)];
      const durationSec = calculatePathCost(pathIndices, matrix);
      tempsTrajetMinutes = durationSec / 60;
      // Estimation distance: ~50km/h moyen
      distanceKm = (tempsTrajetMinutes / 60) * 50;
    }

    console.log('✅ KPI final:', {
      distance_km: Math.round((distanceKm || 0) * 10) / 10,
      duration_min: Math.round(tempsTrajetMinutes || 0),
      arrêts: sortedEntreprises.length,
    });

    return new Response(
      JSON.stringify({
        ordre_optimise: sortedEntreprises.map((e: Entreprise) => e.id),
        entreprises_ordonnees: sortedEntreprises,
        distance_totale_km: Math.round(((distanceKm || 0) * 10)) / 10,
        temps_estime_minutes: Math.round(tempsTrajetMinutes || 0),
        temps_trajet_minutes: Math.round(tempsTrajetMinutes || 0),
        explication: `Itinéraire optimisé: ${Math.round(distanceKm || 0)} km, ${Math.floor((tempsTrajetMinutes || 0) / 60)}h${Math.round((tempsTrajetMinutes || 0) % 60).toString().padStart(2, '0')} avec ${sortedEntreprises.length} arrêts`,
        route_geometry: routeGeometry,
        fallback: false,
        algorithm: matrix ? 'nearest_neighbor_2opt' : 'mapbox_optimized_trips'
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
