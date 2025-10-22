import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Entreprise {
  id: string;
  nom: string;
  adresse: string;
  latitude: number;
  longitude: number;
}

interface TourneeMapProps {
  entreprises: Entreprise[];
  pointDepartLat?: number;
  pointDepartLng?: number;
}

export const TourneeMap = ({
  entreprises,
  pointDepartLat,
  pointDepartLng,
}: TourneeMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(true);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const tempToken = localStorage.getItem('mapbox_temp_token');
        if (tempToken) {
          setMapboxToken(tempToken);
          setTokenLoading(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error || !data?.token) {
          setTokenError(true);
          setTokenLoading(false);
          return;
        }

        setMapboxToken(data.token);
        setTokenError(false);
      } catch (err) {
        console.error('Error fetching token:', err);
        setTokenError(true);
      } finally {
        setTokenLoading(false);
      }
    };

    fetchToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || tokenError) return;

    // Wait for container to have dimensions
    const checkContainer = () => {
      if (!mapContainer.current) return false;
      const rect = mapContainer.current.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    if (!checkContainer()) {
      const timer = setTimeout(() => {
        if (checkContainer()) {
          initMap();
        }
      }, 100);
      return () => clearTimeout(timer);
    }

    initMap();

    function initMap() {
      if (!mapContainer.current || map.current) return;

      mapboxgl.accessToken = mapboxToken!;

      // Calculate center
      let center: [number, number] = [2.3522, 46.2276];
      if (pointDepartLat && pointDepartLng) {
        center = [pointDepartLng, pointDepartLat];
      } else if (entreprises.length > 0) {
        const avgLng = entreprises.reduce((sum, e) => sum + e.longitude, 0) / entreprises.length;
        const avgLat = entreprises.reduce((sum, e) => sum + e.latitude, 0) / entreprises.length;
        center = [avgLng, avgLat];
      }

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center,
        zoom: 10,
        projection: { name: "mercator" },
      });

      map.current.on('error', (e: any) => {
        console.error('Mapbox error:', e);
        if (e.error?.message?.includes('401') || e.error?.message?.includes('token')) {
          toast.error('Token Mapbox invalide');
          setTokenError(true);
        }
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.current.on('load', () => {
        setTimeout(() => {
          map.current?.resize();
        }, 100);
      });
    }

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken, tokenError]);

  // Add route and markers
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded() || entreprises.length === 0) return;

    const setupRoute = async () => {
      if (!map.current || !map.current.isStyleLoaded()) {
        setTimeout(setupRoute, 100);
        return;
      }

      // Remove existing layers and markers
      if (map.current.getLayer('tournee-route')) {
        map.current.removeLayer('tournee-route');
      }
      if (map.current.getSource('tournee-route')) {
        map.current.removeSource('tournee-route');
      }
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      // Build waypoints
      const waypoints: [number, number][] = [];
      if (pointDepartLat && pointDepartLng) {
        waypoints.push([pointDepartLng, pointDepartLat]);
      }
      entreprises.forEach(e => waypoints.push([e.longitude, e.latitude]));

      // Get route from Mapbox Directions API
      const getRoute = async () => {
        if (waypoints.length < 2) return waypoints;

        try {
          const coords = waypoints.map(c => `${c[0]},${c[1]}`).join(';');
          const response = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`
          );

          if (!response.ok) return waypoints;
          const data = await response.json();
          return data.routes?.[0]?.geometry?.coordinates || waypoints;
        } catch (error) {
          console.error('Error fetching route:', error);
          return waypoints;
        }
      };

      const routeCoords = await getRoute();

      // Add route layer
      map.current!.addSource('tournee-route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoords
          }
        }
      });

      map.current!.addLayer({
        id: 'tournee-route',
        type: 'line',
        source: 'tournee-route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#00FFF0',
          'line-width': 4,
          'line-opacity': 0.8
        }
      });

      // Add start marker
      if (pointDepartLat && pointDepartLng) {
        const startEl = document.createElement('div');
        startEl.innerHTML = `
          <div style="
            width: 40px;
            height: 40px;
            background: #FF6B00;
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 2px 8px rgba(255,107,0,0.6);
          ">🏁</div>
        `;
        const startMarker = new mapboxgl.Marker({ element: startEl })
          .setLngLat([pointDepartLng, pointDepartLat])
          .addTo(map.current!);
        markersRef.current.push(startMarker);
      }

      // Add numbered markers
      entreprises.forEach((e, idx) => {
        const el = document.createElement('div');
        el.innerHTML = `
          <div style="
            width: 36px;
            height: 36px;
            background: #00FFF0;
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0A0F1E;
            font-weight: bold;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,255,240,0.6);
          ">${idx + 1}</div>
        `;
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([e.longitude, e.latitude])
          .addTo(map.current!);
        markersRef.current.push(marker);
      });

      // Fit bounds
      setTimeout(() => {
        if (routeCoords.length > 0 && map.current) {
          const bounds = new mapboxgl.LngLatBounds();
          routeCoords.forEach(coord => bounds.extend(coord as [number, number]));
          map.current.fitBounds(bounds, { padding: 80, duration: 1000, maxZoom: 14 });
        }
      }, 300);
    };

    const timer = setTimeout(setupRoute, 100);
    return () => clearTimeout(timer);
  }, [entreprises, pointDepartLat, pointDepartLng]);

  if (tokenLoading) {
    return (
      <div className="h-full w-full bg-card rounded-xl flex items-center justify-center">
        <div className="text-center space-y-3">
          <Skeleton className="w-full h-full absolute inset-0" />
          <div className="relative z-10">
            <div className="animate-spin w-10 h-10 border-3 border-accent border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-muted-foreground mt-3">Chargement de la carte...</p>
          </div>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="h-full w-full bg-card rounded-xl flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="inline-flex p-4 bg-destructive/10 rounded-2xl">
            <MapPin className="w-12 h-12 text-destructive" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Token Mapbox manquant</h3>
            <p className="text-sm text-muted-foreground">
              Contactez l'administrateur pour configurer le token Mapbox.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Token temporaire :</p>
            <input
              type="text"
              placeholder="Collez votre token Mapbox"
              className="w-full px-3 py-2 border border-accent/50 rounded-lg bg-background text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const token = e.currentTarget.value.trim();
                  if (token) {
                    localStorage.setItem('mapbox_temp_token', token);
                    setMapboxToken(token);
                    setTokenError(false);
                    toast.success('Token enregistré');
                  }
                }
              }}
            />
            <p className="text-xs text-muted-foreground">Appuyez sur Entrée</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapContainer} className="h-full w-full rounded-xl" />
  );
};
