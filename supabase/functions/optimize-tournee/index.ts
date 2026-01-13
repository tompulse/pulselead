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

    // Utiliser l'API Mapbox Optimized Trips (optimise par temps de trajet)
    console.log('🎯 Appel Mapbox Optimized Trips API');
    
    const coordinates = validEntreprises.map(e => `${e.longitude},${e.latitude}`).join(';');
    
    const optimizationUrl = point_depart
      ? `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${startPoint.lng},${startPoint.lat};${coordinates}?source=first&destination=last&roundtrip=false&geometries=geojson&overview=full&steps=true&annotations=duration,distance&access_token=${MAPBOX_TOKEN}`
      : `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordinates}?source=first&destination=last&roundtrip=false&geometries=geojson&overview=full&steps=true&annotations=duration,distance&access_token=${MAPBOX_TOKEN}`;
    
    const mapboxResponse = await fetch(optimizationUrl);
    
    if (!mapboxResponse.ok) {
      console.error('❌ Erreur Mapbox Optimization:', mapboxResponse.status);
      const errorText = await mapboxResponse.text();
      console.error('Détails:', errorText);
      throw new Error(`Erreur Mapbox Optimization (${mapboxResponse.status}): ${errorText}`);
    }

    const mapboxData = await mapboxResponse.json();
    console.log('Response Mapbox code:', mapboxData.code);
    
    if (!mapboxData.trips || mapboxData.trips.length === 0) {
      console.error('Pas de trips dans la réponse:', mapboxData);
      throw new Error("Aucun itinéraire optimisé trouvé par Mapbox");
    }

    const trip = mapboxData.trips[0];
    const waypoints = mapboxData.waypoints;
    
    // Si on a un point de départ personnalisé, le premier waypoint est le départ, on l'ignore
    const startOffset = point_depart ? 1 : 0;
    
    // Les waypoints dans la réponse Mapbox contiennent:
    // - waypoint_index: l'ordre dans lequel visiter ce point (0, 1, 2, ...)
    // - la position dans le tableau correspond à l'ordre d'entrée
    const waypointMapping = waypoints
      .slice(startOffset)
      .map((wp: any, originalIdx: number) => ({
        originalIndex: originalIdx,
        visitOrder: wp.waypoint_index - startOffset,
        entreprise: validEntreprises[originalIdx]
      }));
    
    // Trier par ordre de visite (waypoint_index)
    waypointMapping.sort((a: any, b: any) => a.visitOrder - b.visitOrder);
    
    // Extraire les entreprises dans l'ordre optimisé
    const sortedEntreprises = waypointMapping.map((m: any) => m.entreprise);
    
    console.log('✅ Ordre optimisé:', sortedEntreprises.map((e: Entreprise) => e.nom));

    const distanceKm = trip.distance / 1000; // Conversion mètres -> km
    const tempsTrajetMinutes = trip.duration / 60; // Conversion secondes -> minutes
    const tempsVisites = sortedEntreprises.length * 15; // 15 min par visite
    const tempsTotal = tempsTrajetMinutes + tempsVisites;
    
    console.log('✅ Itinéraire optimisé:', {
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
        explication: `Itinéraire optimisé: ${Math.round(distanceKm)} km, ${Math.floor(tempsTotal / 60)}h${Math.round(tempsTotal % 60).toString().padStart(2, '0')} avec ${sortedEntreprises.length} arrêts`,
        route_geometry: trip.geometry,
        waypoints: mapboxData.waypoints,
        legs: trip.legs,
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
