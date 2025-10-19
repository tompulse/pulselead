import { useEffect, useRef, useState, lazy, Suspense } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";
import { categorizeActivity } from "@/utils/activityCategories";
import { useIsMobile } from "@/hooks/use-mobile";
import { EntrepriseDetails } from "./EntrepriseDetails";
import { Skeleton } from "@/components/ui/skeleton";

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

export const MapView = ({ filters, onEntrepriseSelect }: MapViewProps) => {
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

  // Fetch entreprises from Supabase
  useEffect(() => {
    const fetchEntreprises = async () => {
      setLoading(true);
      
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
        setEntreprises([]);
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
    if (!mapContainer.current || !mapboxgl || !mapboxLoaded) return;

    mapboxgl.accessToken = "pk.eyJ1IjoicmF3c3MiLCJhIjoiY21nd3FuN3plMHF6YjJrc2JzMHU5enZqbCJ9.DW7r1fzAlHdCdlQatpAEuQ";

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

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Optimisation: désactiver certaines fonctionnalités lourdes sur mobile
    if (isMobile) {
      map.current.scrollZoom.disable();
    }

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxgl, mapboxLoaded, isMobile]);

  // Add markers when entreprises change (avec clustering optimisé)
  useEffect(() => {
    if (!map.current || !mapboxgl || !mapboxLoaded) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

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
        const marker = new mapboxgl.Marker({ color: "#00FFF0" })
          .setLngLat([entreprise.longitude, entreprise.latitude])
          .addTo(map.current);

        // Open modal on marker click
        marker.getElement().addEventListener('click', () => {
          if (isMobile) {
            setSelectedEntreprise(entreprise);
            setDetailsOpen(true);
          } else {
            onEntrepriseSelect?.(entreprise);
          }
        });

        markersRef.current.push(marker);
      });
    }

    // Fit bounds to markers if we have data
    if (entreprises.length > 0 && map.current.isStyleLoaded()) {
      const bounds = new mapboxgl.LngLatBounds();
      entreprises.forEach((e) => bounds.extend([e.longitude, e.latitude]));
      
      // Animation plus rapide sur mobile
      map.current.fitBounds(bounds, { 
        padding: isMobile ? 30 : 50,
        duration: isMobile ? 600 : 1000,
        maxZoom: 14
      });
    }
  }, [entreprises, mapboxgl, mapboxLoaded, isMobile]);

  return (
    <>
      <div className="h-[calc(100vh-140px)] rounded-2xl overflow-hidden shadow-2xl border border-accent/20 relative">
        {!mapboxLoaded ? (
          // Skeleton loader pendant le chargement de Mapbox
          <div className="absolute inset-0 bg-card">
            <Skeleton className="w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="animate-spin w-10 h-10 border-3 border-accent border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-muted-foreground font-medium">Initialisation de la carte...</p>
              </div>
            </div>
          </div>
        ) : (
          <div ref={mapContainer} className="absolute inset-0" />
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

      {isMobile && (
        <EntrepriseDetails
          entreprise={selectedEntreprise}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </>
  );
};
