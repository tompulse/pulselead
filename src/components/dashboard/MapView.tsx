import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";
import { ACTIVITY_CATEGORIES } from "@/utils/activityCategories";
import { EntrepriseDetails } from "./EntrepriseDetails";

interface MapViewProps {
  filters: {
    dateFrom: string;
    dateTo: string;
    categories: string[];
    departments: string[];
  };
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

export const MapView = ({ filters }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedEntreprise, setSelectedEntreprise] = useState<Entreprise | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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
        // Filter by categories if needed
        let filtered = data || [];
        if (filters.categories && filters.categories.length > 0) {
          filtered = filtered.filter((ent: Entreprise) => {
            const codeNaf = ent.code_naf;
            if (!codeNaf) return false;
            
            return filters.categories.some(cat => {
              const categoryRanges = ACTIVITY_CATEGORIES[cat];
              if (!categoryRanges) return false;
              
              return categoryRanges.some(range => {
                if (range.includes('-')) {
                  const [start, end] = range.split('-');
                  return codeNaf >= start && codeNaf <= end;
                }
                return codeNaf.startsWith(range);
              });
            });
          });
        }

        // Filter by departments if selected
        if (filters.departments && filters.departments.length > 0) {
          filtered = filtered.filter((ent: Entreprise) => {
            const codePostal = ent.code_postal;
            if (!codePostal) return false;
            
            // Normaliser le code postal (ajouter 0 devant si nécessaire)
            const normalizedCP = codePostal.length === 4 ? '0' + codePostal : codePostal;
            const dept = normalizedCP.substring(0, 2);
            const deptCorse = normalizedCP.substring(0, 3); // Pour la Corse (2A, 2B)
            
            return filters.departments.includes(dept) || filters.departments.includes(deptCorse);
          });
        }
        
        setEntreprises(filtered);
      }
      setLoading(false);
    };

    fetchEntreprises();
  }, [filters]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = "pk.eyJ1IjoicmF3c3MiLCJhIjoiY21nd3FuN3plMHF6YjJrc2JzMHU5enZqbCJ9.DW7r1fzAlHdCdlQatpAEuQ";

    // Determine initial center and zoom
    let initialCenter: [number, number] = [2.3522, 46.2276];
    let initialZoom = 5.5;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: initialCenter,
      zoom: initialZoom,
      projection: { name: "mercator" },
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      map.current?.remove();
    };
  }, []); // Re-initialize only once

  // Add markers when entreprises change
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    entreprises.forEach((entreprise) => {
      const marker = new mapboxgl.Marker({ color: "#00FFF0" })
        .setLngLat([entreprise.longitude, entreprise.latitude])
        .addTo(map.current!);

      // Open modal on marker click
      marker.getElement().addEventListener('click', () => {
        setSelectedEntreprise(entreprise);
        setDetailsOpen(true);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to markers if we have data
    if (entreprises.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      entreprises.forEach((e) => bounds.extend([e.longitude, e.latitude]));
      map.current?.fitBounds(bounds, { padding: 50 });
    }
  }, [entreprises]);

  return (
    <>
      <div className="h-[calc(100vh-140px)] rounded-2xl overflow-hidden shadow-2xl border border-accent/20 relative">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="text-center space-y-4">
              <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full mx-auto" />
              <p className="text-muted-foreground font-medium">Chargement de la carte...</p>
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

      <EntrepriseDetails
        entreprise={selectedEntreprise}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  );
};
