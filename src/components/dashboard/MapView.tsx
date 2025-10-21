import { useEffect, useRef, useState, lazy, Suspense } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Locate } from "lucide-react";
import { categorizeActivity } from "@/utils/activityCategories";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { offlineStorage } from "@/utils/offlineStorage";

// Lazy load mapbox pour optimiser le chargement initial
const loadMapbox = () => import("mapbox-gl");

interface MapViewProps {
  filters: {
    dateFrom: string;
    dateTo: string;
    categories: string[];
    departments: string[];
  };
  onEntrepriseSelect?: (entreprise: Entreprise) => void;
  selectionMode?: boolean;
  selectedEntreprises?: Entreprise[];
  onToggleSelection?: (entreprise: Entreprise) => void;
  tourneeRoute?: {
    entreprises: Entreprise[];
    pointDepartLat?: number;
    pointDepartLng?: number;
  };
  fullHeight?: boolean;
}

interface Entreprise {
  id: string;
  nom: string;
  adresse: string;
  code_postal: string;
  ville?: string;
  latitude: number;
  longitude: number;
  siret: string;
  date_demarrage: string;
  interlocuteur?: string;
  numero_voie?: string;
  type_voie?: string;
  nom_voie?: string;
  administration?: string;
  capital?: number;
  activite?: string;
  code_naf: string;
}

export const MapView = ({ 
  filters, 
  onEntrepriseSelect,
  selectionMode = false,
  selectedEntreprises = [],
  onToggleSelection,
  tourneeRoute,
  fullHeight = false
}: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapboxLoaded, setMapboxLoaded] = useState(false);
  const markersRef = useRef<any[]>([]);
  const isMobile = useIsMobile();
  const [selectedEntreprise, setSelectedEntreprise] = useState<Entreprise | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [mapboxgl, setMapboxgl] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const userMarkerRef = useRef<any>(null);
  const [geolocating, setGeolocating] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(true);

  // Fetch Mapbox token from backend
  useEffect(() => {
    const fetchToken = async () => {
      try {
        if (import.meta.env.DEV) {
          console.log('[MapView] Fetching Mapbox token from backend...');
        }
        
        // Check localStorage for temporary token first
        const tempToken = localStorage.getItem('mapbox_temp_token');
        if (tempToken) {
          if (import.meta.env.DEV) {
            console.log('[MapView] Using temporary token from localStorage ✅');
          }
          setMapboxToken(tempToken);
          setTokenLoading(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('[MapView] Error fetching token:', error);
          setTokenError(true);
          setTokenLoading(false);
          return;
        }

        if (data?.token) {
          if (import.meta.env.DEV) {
            console.log('[MapView] Token fetched successfully ✅');
          }
          setMapboxToken(data.token);
          setTokenError(false);
        } else {
          console.error('[MapView] No token in response');
          setTokenError(true);
        }
      } catch (err) {
        console.error('[MapView] Exception fetching token:', err);
        setTokenError(true);
      } finally {
        setTokenLoading(false);
      }
    };

    fetchToken();
  }, []);

  // Fetch entreprises from Supabase with offline cache
  useEffect(() => {
    const fetchEntreprises = async () => {
      setLoading(true);
      
      const cacheKey = `entreprises_${JSON.stringify(filters)}`;
      
      // Essayer de charger depuis le cache d'abord
      try {
        const cachedData = await offlineStorage.get<Entreprise[]>(cacheKey);
        if (cachedData) {
          setEntreprises(cachedData);
          setLoading(false);
          // Continuer à charger les données fraîches en arrière-plan
        }
      } catch (error) {
        console.error('Erreur de lecture du cache:', error);
      }
      
      // Charger les données depuis Supabase
      let query = (supabase as any)
        .from("entreprises")
        .select("*")
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      // Apply date filters
      if (filters.dateFrom || filters.dateTo) {
        query = query.or(`date_demarrage.is.null,and(date_demarrage.gte.${filters.dateFrom || "1900-01-01"},date_demarrage.lte.${filters.dateTo || "2100-12-31"})`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching entreprises:", error);
        // Si on a des données en cache et qu'il y a une erreur réseau, utiliser le cache
        const cachedData = await offlineStorage.get<Entreprise[]>(cacheKey);
        if (cachedData) {
          toast.info("Mode hors-ligne: affichage des données en cache");
          setEntreprises(cachedData);
        } else {
          setEntreprises([]);
        }
      } else {
        let filtered = data || [];
        
        // Filter by departments first
        if (filters.departments && filters.departments.length > 0) {
          filtered = filtered.filter((ent: Entreprise) => {
            const codePostal = ent.code_postal;
            if (!codePostal) return false;
            
            const normalizedCP = codePostal.length === 4 ? '0' + codePostal : codePostal;
            const dept = normalizedCP.substring(0, 2);
            
            if (normalizedCP.startsWith('20')) {
              // Corse: impossible de distinguer 2A vs 2B via le code postal => on inclut si l'un des deux est sélectionné
              return filters.departments.includes('2A') || filters.departments.includes('2B');
            }
            
            return filters.departments.includes(dept);
          });
        }
        
        // Filter by categories using the same logic as FilterOnboarding
        if (filters.categories && filters.categories.length > 0) {
          filtered = filtered.filter((ent: Entreprise) => {
            const category = categorizeActivity(ent.activite);
            return filters.categories.includes(category);
          });
        }
        
        setEntreprises(filtered);
        
        // Sauvegarder dans le cache
        try {
          await offlineStorage.set(cacheKey, filtered);
        } catch (error) {
          console.error('Erreur de sauvegarde du cache:', error);
        }
      }
      setLoading(false);
    };

    fetchEntreprises();
  }, [filters]);

  // Lazy load Mapbox library
  useEffect(() => {
    let mounted = true;
    
    const initMapbox = async () => {
      try {
        const mapboxModule = await loadMapbox();
        if (mounted) {
          setMapboxgl(mapboxModule.default);
          setMapboxLoaded(true);
        }
      } catch (error) {
        console.error("Error loading Mapbox:", error);
        setMapboxLoaded(false);
      }
    };

    // Délai léger pour permettre au reste de la page de se charger d'abord
    const timer = setTimeout(initMapbox, isMobile ? 500 : 100);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [isMobile]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxgl || !mapboxLoaded || !mapboxToken) return;

    // Wait for container to have non-zero size
    const rect = mapContainer.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      if (import.meta.env.DEV) {
        console.warn('[MapView] Container has zero size, waiting...', { width: rect.width, height: rect.height });
      }
      // Retry after a short delay
      const retryTimer = setTimeout(() => {
        if (mapContainer.current) {
          const newRect = mapContainer.current.getBoundingClientRect();
          if (import.meta.env.DEV) {
            console.log('[MapView] Retry container size:', { width: newRect.width, height: newRect.height });
          }
        }
      }, 200);
      return () => clearTimeout(retryTimer);
    }

    if (import.meta.env.DEV) {
      console.log('[MapView] Initializing map with container size:', { width: rect.width, height: rect.height });
    }

    mapboxgl.accessToken = mapboxToken;

    // Determine initial center and zoom
    let initialCenter: [number, number] = [2.3522, 46.2276];
    let initialZoom = isMobile ? 5 : 5.5;

    const mapOptions: any = {
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: initialCenter,
      zoom: initialZoom,
      projection: { name: "mercator" },
    };

    // Optimisations mobiles
    if (isMobile) {
      mapOptions.pitchWithRotate = false;
      mapOptions.dragRotate = false;
      mapOptions.touchPitch = false;
    }

    map.current = new mapboxgl.Map(mapOptions);

    // Add error handler for Mapbox errors
    map.current.on('error', (e: any) => {
      console.error('[MapView] Mapbox error:', e);
      if (e.error?.message?.includes('401') || e.error?.message?.includes('token')) {
        toast.error('Token Mapbox invalide ou expiré');
        setTokenError(true);
      } else {
        toast.error('Erreur de chargement de la carte');
      }
    });

    map.current.on('load', () => {
      if (import.meta.env.DEV) {
        console.log('[MapView] Map loaded successfully ✅');
      }
      // Force resize after map is fully loaded
      setTimeout(() => {
        try { 
          map.current?.resize();
          if (import.meta.env.DEV) {
            console.log('[MapView] Map resized after load');
          }
        } catch {}
      }, 100);
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Force a resize shortly after mount to correct initial canvas size
    setTimeout(() => {
      try { map.current?.resize(); } catch {}
    }, 200);

    // Optimisation: désactiver certaines fonctionnalités lourdes sur mobile
    if (isMobile) {
      map.current.scrollZoom.disable();
    }

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxgl, mapboxLoaded, isMobile, mapboxToken]);

  // Ensure proper sizing when container resizes (e.g., tab/view toggles)
  useEffect(() => {
    if (!mapboxLoaded || !map.current || !mapContainer.current) return;
    const ro = new ResizeObserver(() => {
      try { map.current?.resize(); } catch {}
    });
    ro.observe(mapContainer.current);
    const onResize = () => { try { map.current?.resize(); } catch {} };
    window.addEventListener('resize', onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [mapboxLoaded]);

  // Géolocalisation utilisateur
  const handleLocateUser = () => {
    if (!map.current || !mapboxgl) return;

    setGeolocating(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userPos: [number, number] = [longitude, latitude];
          
          setUserLocation(userPos);
          
          // Supprimer l'ancien marqueur utilisateur s'il existe
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }

          // Créer un marqueur personnalisé pour l'utilisateur
          const el = document.createElement('div');
          el.innerHTML = `
            <div style="
              width: 24px;
              height: 24px;
              background: #FF6B00;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 0 0 4px rgba(255,107,0,0.2), 0 2px 8px rgba(255,107,0,0.6);
              animation: pulse 2s infinite;
            "></div>
          `;
          
          userMarkerRef.current = new mapboxgl.Marker({ element: el })
            .setLngLat(userPos)
            .addTo(map.current);

          // Centrer la carte sur la position de l'utilisateur
          map.current.flyTo({
            center: userPos,
            zoom: 12,
            duration: 1500
          });

          setGeolocating(false);
          toast.success("Position détectée");
        },
        (error) => {
          setGeolocating(false);
          console.error("Erreur de géolocalisation:", error);
          toast.error("Impossible de détecter votre position");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setGeolocating(false);
      toast.error("Géolocalisation non supportée");
    }
  };

  // Add markers when entreprises change (avec clustering optimisé)
  useEffect(() => {
    if (!map.current || !mapboxgl || !mapboxLoaded) return;

    // Si on affiche une tournée, ne pas afficher les marqueurs individuels
    if (tourneeRoute) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Ne rien faire si pas d'entreprises
    if (entreprises.length === 0) return;

    // Sur mobile avec beaucoup de marqueurs, on utilise un clustering simple
    const shouldCluster = isMobile && entreprises.length > 50;
    
    if (shouldCluster) {
      // Clustering basique par zone géographique
      const gridSize = 0.5; // Taille de la grille en degrés
      const clusters = new Map<string, Entreprise[]>();
      
      entreprises.forEach((entreprise) => {
        const gridX = Math.floor(entreprise.longitude / gridSize);
        const gridY = Math.floor(entreprise.latitude / gridSize);
        const key = `${gridX},${gridY}`;
        
        if (!clusters.has(key)) {
          clusters.set(key, []);
        }
        clusters.get(key)!.push(entreprise);
      });

      // Créer un marqueur par cluster
      clusters.forEach((clusterEntreprises) => {
        const avgLng = clusterEntreprises.reduce((sum, e) => sum + e.longitude, 0) / clusterEntreprises.length;
        const avgLat = clusterEntreprises.reduce((sum, e) => sum + e.latitude, 0) / clusterEntreprises.length;
        
        const el = document.createElement('div');
        el.className = 'cluster-marker';
        el.style.cssText = `
          width: 40px;
          height: 40px;
          background: #00FFF0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0A0F1E;
          font-weight: bold;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,255,240,0.4);
          cursor: pointer;
        `;
        el.textContent = clusterEntreprises.length.toString();
        
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([avgLng, avgLat])
          .addTo(map.current);

        el.addEventListener('click', () => {
          // Zoom sur le cluster
          if (clusterEntreprises.length === 1) {
            const entreprise = clusterEntreprises[0];
            setSelectedEntreprise(entreprise);
            setDetailsOpen(true);
          } else {
            map.current?.flyTo({ 
              center: [avgLng, avgLat], 
              zoom: Math.min(map.current.getZoom() + 2, 14),
              duration: 800
            });
          }
        });

        markersRef.current.push(marker);
      });
    } else {
      // Mode normal : un marqueur par entreprise
      entreprises.forEach((entreprise) => {
        const isSelected = selectedEntreprises.some(e => e.id === entreprise.id);
        const markerColor = selectionMode && isSelected ? "#FF6B00" : "#00FFF0";
        
        const marker = new mapboxgl.Marker({ color: markerColor })
          .setLngLat([entreprise.longitude, entreprise.latitude])
          .addTo(map.current);

        // Open modal on marker click
        marker.getElement().addEventListener('click', () => {
          if (selectionMode && onToggleSelection) {
            onToggleSelection(entreprise);
          } else if (isMobile) {
            setSelectedEntreprise(entreprise);
            setDetailsOpen(true);
          } else {
            onEntrepriseSelect?.(entreprise);
          }
        });

        markersRef.current.push(marker);
      });
    }

    // Fit bounds to markers - always center on visible markers after adding them
    if (entreprises.length > 0) {
      // Attendre un peu que les marqueurs soient bien ajoutés au DOM
      const centerMap = () => {
        if (!map.current) return;
        
        const bounds = new mapboxgl.LngLatBounds();
        entreprises.forEach((e) => bounds.extend([e.longitude, e.latitude]));
        
        // Animation de centrage
        map.current.fitBounds(bounds, { 
          padding: isMobile ? 40 : 60,
          duration: isMobile ? 800 : 1200,
          maxZoom: 12
        });
      };

      // Petit délai pour s'assurer que les marqueurs sont bien ajoutés
      setTimeout(centerMap, 100);
    }
  }, [entreprises, mapboxgl, mapboxLoaded, isMobile, selectionMode, selectedEntreprises, onToggleSelection]);

  // Afficher l'itinéraire de la tournée
  useEffect(() => {
    if (!map.current || !mapboxgl || !mapboxLoaded || !tourneeRoute || !tourneeRoute.entreprises.length) return;

    // Supprimer les marqueurs existants immédiatement
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const setupTourneeDisplay = async () => {
      if (!map.current || !map.current.isStyleLoaded()) {
        setTimeout(() => setupTourneeDisplay(), 100);
        return;
      }

      // Supprimer les couches précédentes si elles existent
      if (map.current.getLayer('tournee-route')) {
        map.current.removeLayer('tournee-route');
      }
      if (map.current.getSource('tournee-route')) {
        map.current.removeSource('tournee-route');
      }

      // Construire les coordonnées de la route via l'API Mapbox Directions
      const waypoints: [number, number][] = [];
      if (tourneeRoute.pointDepartLat && tourneeRoute.pointDepartLng) {
        waypoints.push([tourneeRoute.pointDepartLng, tourneeRoute.pointDepartLat]);
      }
      
      tourneeRoute.entreprises.forEach(e => {
        waypoints.push([e.longitude, e.latitude]);
      });

      // Utiliser l'API Mapbox Directions pour obtenir l'itinéraire routier
      const getRoutingCoordinates = async () => {
        if (waypoints.length < 2) return waypoints;

        try {
          // L'API Mapbox Directions accepte jusqu'à 25 waypoints
          const coordinatesString = waypoints
            .map(coord => `${coord[0]},${coord[1]}`)
            .join(';');
          
          const response = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`
          );

          if (!response.ok) {
            console.error('Mapbox Directions API error:', response.status);
            return waypoints; // Fallback to straight lines
          }

          const data = await response.json();
          
          if (data.routes && data.routes.length > 0) {
            // Retourner les coordonnées de l'itinéraire routier
            return data.routes[0].geometry.coordinates;
          }
          
          return waypoints; // Fallback to straight lines
        } catch (error) {
          console.error('Error fetching route:', error);
          return waypoints; // Fallback to straight lines
        }
      };

      const coordinates = await getRoutingCoordinates();

      // Ajouter la source de la route
      map.current.addSource('tournee-route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates
          }
        }
      });

      // Ajouter la couche de ligne
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

      // Ajouter le marqueur de départ si présent (non cliquable)
      if (tourneeRoute.pointDepartLat && tourneeRoute.pointDepartLng) {
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
            color: white;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 2px 8px rgba(255,107,0,0.6);
            pointer-events: none;
          ">
            🏁
          </div>
        `;
        
        const startMarker = new mapboxgl.Marker({ element: startEl })
          .setLngLat([tourneeRoute.pointDepartLng, tourneeRoute.pointDepartLat])
          .addTo(map.current);
        
        markersRef.current.push(startMarker);
      }

      // Ajouter les marqueurs numérotés pour chaque arrêt (non cliquables)
      tourneeRoute.entreprises.forEach((entreprise, index) => {
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
            pointer-events: none;
          ">
            ${index + 1}
          </div>
        `;
        
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([entreprise.longitude, entreprise.latitude])
          .addTo(map.current);
        
        markersRef.current.push(marker);
      });

      // Ajuster la vue pour montrer toute la route avec un délai
      setTimeout(() => {
        if (coordinates.length > 0 && map.current) {
          const bounds = new mapboxgl.LngLatBounds();
          coordinates.forEach(coord => bounds.extend(coord));
          map.current.fitBounds(bounds, { padding: isMobile ? 60 : 100, duration: 1000, maxZoom: 14 });
        }
      }, 200);
    };

    setupTourneeDisplay();

    return () => {
      if (map.current?.getLayer('tournee-route')) {
        map.current.removeLayer('tournee-route');
      }
      if (map.current?.getSource('tournee-route')) {
        map.current.removeSource('tournee-route');
      }
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
    };
  }, [tourneeRoute?.entreprises, tourneeRoute?.pointDepartLat, tourneeRoute?.pointDepartLng, mapboxgl, mapboxLoaded, isMobile]);

  return (
    <>
      <div className={`${fullHeight ? 'h-full' : 'h-[calc(100vh-140px)]'} rounded-2xl overflow-hidden shadow-2xl border border-accent/20 relative`}>
        {tokenLoading || !mapboxLoaded ? (
          // Skeleton loader pendant le chargement
          <div className="absolute inset-0 bg-card">
            <Skeleton className="w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="animate-spin w-10 h-10 border-3 border-accent border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-muted-foreground font-medium">
                  {tokenLoading ? 'Récupération du token...' : 'Initialisation de la carte...'}
                </p>
              </div>
            </div>
          </div>
        ) : tokenError ? (
          // Error overlay when token is missing or invalid
          <div className="absolute inset-0 bg-card flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md mx-auto p-6">
              <div className="inline-flex p-4 bg-destructive/10 rounded-2xl">
                <MapPin className="w-16 h-16 text-destructive" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">Token Mapbox manquant</h3>
                <p className="text-muted-foreground">
                  Le token Mapbox n'est pas configuré ou est invalide.
                  <br />
                  Contactez l'administrateur pour configurer MAPBOX_PUBLIC_TOKEN.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Ou utilisez un token temporaire :</p>
                <input
                  type="text"
                  placeholder="Collez votre token Mapbox ici"
                  className="w-full px-3 py-2 border border-accent/50 rounded-lg bg-background text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.currentTarget;
                      const token = input.value.trim();
                      if (token) {
                        localStorage.setItem('mapbox_temp_token', token);
                        setMapboxToken(token);
                        setTokenError(false);
                        toast.success('Token temporaire enregistré');
                      }
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">Appuyez sur Entrée pour valider</p>
              </div>
            </div>
          </div>
        ) : (
          <div ref={mapContainer} className="absolute inset-0" />
        )}
        
        {/* Bouton de géolocalisation */}
        {mapboxLoaded && !tourneeRoute && !tokenError && (
          <Button
            onClick={handleLocateUser}
            disabled={geolocating || !map.current}
            size="icon"
            className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg"
            title="Me localiser"
          >
            <Locate className={`h-4 w-4 ${geolocating ? 'animate-spin' : ''}`} />
          </Button>
        )}
        
        {loading && mapboxLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-10">
            <div className="text-center space-y-3">
              <div className="animate-spin w-10 h-10 border-3 border-accent border-t-transparent rounded-full mx-auto" />
              <p className="text-sm text-muted-foreground font-medium">Chargement des données...</p>
            </div>
          </div>
        )}

        {!loading && entreprises.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-gradient-to-br from-background to-card/50">
            <div className="text-center space-y-6 animate-fade-in">
              <div className="inline-flex p-4 bg-accent/10 rounded-2xl">
                <MapPin className="w-20 h-20 text-accent" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-bold">Aucune entreprise trouvée</h3>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                  Aucune donnée ne correspond à vos filtres actuels.
                  <br />
                  Ajustez les filtres ou importez des données.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
