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
  ville?: string;
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
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const tempToken = localStorage.getItem('mapbox_temp_token');
        if (tempToken) {
          console.log('[TourneeMap] Using temp token');
          setMapboxToken(tempToken);
          setTokenLoading(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error || !data?.token) {
          console.error('[TourneeMap] Token error:', error);
          setTokenError(true);
          setTokenLoading(false);
          return;
        }

        console.log('[TourneeMap] Token fetched successfully');
        setMapboxToken(data.token);
        setTokenError(false);
      } catch (err) {
        console.error('[TourneeMap] Exception:', err);
        setTokenError(true);
      } finally {
        setTokenLoading(false);
      }
    };

    fetchToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || tokenError || map.current) return;

    console.log('[TourneeMap] Initializing map with', entreprises.length, 'entreprises');

    // Filtrer les entreprises avec coordonnées valides
    const validEntreprises = entreprises.filter(e => 
      Number.isFinite(e.latitude) && Number.isFinite(e.longitude)
    );
    console.log('[TourneeMap] Valid entreprises:', validEntreprises.length);

    const initMap = () => {
      if (!mapContainer.current) return;

      mapboxgl.accessToken = mapboxToken;

      // Calculate center
      let center: [number, number] = [2.3522, 46.2276];
      if (pointDepartLat && pointDepartLng && 
          Number.isFinite(pointDepartLat) && Number.isFinite(pointDepartLng)) {
        center = [pointDepartLng, pointDepartLat];
      } else if (validEntreprises.length > 0) {
        const avgLng = validEntreprises.reduce((sum, e) => sum + e.longitude, 0) / validEntreprises.length;
        const avgLat = validEntreprises.reduce((sum, e) => sum + e.latitude, 0) / validEntreprises.length;
        center = [avgLng, avgLat];
      }

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center,
        zoom: 10,
        projection: { name: "mercator" } as any,
      });

      map.current.on('error', (e: any) => {
        console.error('[TourneeMap] Map error:', e);
      });

      map.current.on('load', () => {
        console.log('[TourneeMap] Map loaded');
        setMapLoaded(true);
        setTimeout(() => {
          map.current?.resize();
        }, 100);
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    };

    // Delay map initialization slightly
    const timer = setTimeout(initMap, 100);

    return () => {
      clearTimeout(timer);
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      setMapLoaded(false);
    };
  }, [mapboxToken, tokenError]);

  // Add route and markers when map is loaded
  useEffect(() => {
    if (!map.current || !mapLoaded || entreprises.length === 0) {
      console.log('[TourneeMap] Not ready:', { 
        hasMap: !!map.current, 
        mapLoaded, 
        entreprisesCount: entreprises.length 
      });
      return;
    }

    console.log('[TourneeMap] Adding route and markers');

    const setupRoute = async () => {
      if (!map.current?.isStyleLoaded()) {
        setTimeout(setupRoute, 100);
        return;
      }

      // Clean up existing
      if (map.current.getLayer('tournee-route')) {
        map.current.removeLayer('tournee-route');
      }
      if (map.current.getSource('tournee-route')) {
        map.current.removeSource('tournee-route');
      }
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      // Filtrer entreprises valides et construire waypoints
      const validEntreprises = entreprises.filter(e => 
        Number.isFinite(e.latitude) && Number.isFinite(e.longitude)
      );

      if (validEntreprises.length === 0) {
        console.warn('[TourneeMap] Aucune entreprise avec coordonnées GPS valides');
        return;
      }

      const waypoints: [number, number][] = [];
      if (pointDepartLat && pointDepartLng && 
          Number.isFinite(pointDepartLat) && Number.isFinite(pointDepartLng)) {
        waypoints.push([pointDepartLng, pointDepartLat]);
      }
      validEntreprises.forEach(e => waypoints.push([e.longitude, e.latitude]));

      console.log('[TourneeMap] Waypoints valides:', waypoints.length, 'entreprises:', validEntreprises.length);

      // Get route from Mapbox
      try {
        const coords = waypoints.map(c => `${c[0]},${c[1]}`).join(';');
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`
        );

        let routeCoords = waypoints;
        if (response.ok) {
          const data = await response.json();
          if (data.routes?.[0]?.geometry?.coordinates) {
            routeCoords = data.routes[0].geometry.coordinates;
            console.log('[TourneeMap] Route fetched, coords:', routeCoords.length);
          }
        }

        // Add route layer
        if (map.current) {
          map.current.addSource('tournee-route', {
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

          map.current.addLayer({
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

          console.log('[TourneeMap] Route layer added');
        }

        // Add start marker
        if (pointDepartLat && pointDepartLng && map.current) {
          const startEl = document.createElement('div');
          startEl.style.width = '48px';
          startEl.style.height = '48px';
          startEl.style.background = 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)';
          startEl.style.border = '4px solid white';
          startEl.style.borderRadius = '50%';
          startEl.style.display = 'flex';
          startEl.style.alignItems = 'center';
          startEl.style.justifyContent = 'center';
          startEl.style.fontSize = '24px';
          startEl.style.boxShadow = '0 4px 12px rgba(255,107,0,0.8), 0 0 20px rgba(255,107,0,0.4)';
          startEl.style.cursor = 'pointer';
          startEl.style.transition = 'transform 0.2s';
          startEl.textContent = '🏁';
          startEl.title = 'Point de départ';
          
          startEl.onmouseover = () => {
            startEl.style.transform = 'scale(1.15)';
          };
          startEl.onmouseout = () => {
            startEl.style.transform = 'scale(1)';
          };
          
          const startMarker = new mapboxgl.Marker({ element: startEl })
            .setLngLat([pointDepartLng, pointDepartLat])
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<strong>🏁 Départ</strong><br/>Votre position actuelle'))
            .addTo(map.current);
          markersRef.current.push(startMarker);
          console.log('[TourneeMap] Start marker added');
        }

        // Add numbered markers (only valid entreprises)
        validEntreprises.forEach((e, idx) => {
          if (!map.current) return;
          
          const isLastStop = idx === validEntreprises.length - 1;
          
          const el = document.createElement('div');
          el.style.width = isLastStop ? '48px' : '40px';
          el.style.height = isLastStop ? '48px' : '40px';
          el.style.background = isLastStop 
            ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
            : 'linear-gradient(135deg, #00FFF0 0%, #00D4C8 100%)';
          el.style.border = isLastStop ? '4px solid white' : '3px solid white';
          el.style.borderRadius = '50%';
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          el.style.color = isLastStop ? 'white' : '#0A0F1E';
          el.style.fontWeight = 'bold';
          el.style.fontSize = isLastStop ? '24px' : '16px';
          el.style.boxShadow = isLastStop 
            ? '0 4px 12px rgba(16,185,129,0.8), 0 0 20px rgba(16,185,129,0.4)'
            : '0 2px 8px rgba(0,255,240,0.6)';
          el.style.cursor = 'pointer';
          el.style.transition = 'transform 0.2s';
          el.textContent = isLastStop ? '🏁' : String(idx + 1);
          el.title = isLastStop ? `Arrivée: ${e.nom}` : `Arrêt ${idx + 1}: ${e.nom}`;
          
          el.onmouseover = () => {
            el.style.transform = 'scale(1.15)';
          };
          el.onmouseout = () => {
            el.style.transform = 'scale(1)';
          };
          
          const popupContent = isLastStop
            ? `<strong>🏁 Arrivée - Arrêt ${idx + 1}</strong><br/>${e.nom}<br/><small>${e.adresse || e.ville || ''}</small>`
            : `<strong>Arrêt ${idx + 1}</strong><br/>${e.nom}<br/><small>${e.adresse || e.ville || ''}</small>`;
          
          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([e.longitude, e.latitude])
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
            .addTo(map.current);
          markersRef.current.push(marker);
        });

        console.log('[TourneeMap] Markers added:', markersRef.current.length);

        // Fit bounds
        setTimeout(() => {
          if (routeCoords.length > 0 && map.current) {
            const bounds = new mapboxgl.LngLatBounds();
            routeCoords.forEach((coord: any) => bounds.extend(coord));
            map.current.fitBounds(bounds, { padding: 80, duration: 1000, maxZoom: 14 });
            console.log('[TourneeMap] Bounds fitted');
          }
        }, 300);
      } catch (error) {
        console.error('[TourneeMap] Setup error:', error);
      }
    };

    setupRoute();
  }, [mapLoaded, entreprises, pointDepartLat, pointDepartLng]);

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
