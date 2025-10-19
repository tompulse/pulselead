import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";

interface MapViewProps {
  filters: any;
}

interface Entreprise {
  id: string;
  nom: string;
  adresse: string;
  code_postal: string;
  latitude: number;
  longitude: number;
  siret: string;
  date_demarrage: string;
  interlocuteur?: string;
}

export const MapView = ({ filters }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Fetch entreprises from Supabase
  useEffect(() => {
    const fetchEntreprises = async () => {
      setLoading(true);
      // Using any cast due to type generation lag
      const { data, error } = await (supabase as any)
        .from("entreprises")
        .select("*")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .gte("date_demarrage", filters.dateFrom || "1900-01-01")
        .lte("date_demarrage", filters.dateTo || "2100-12-31");

      if (error) {
        console.error("Error fetching entreprises:", error);
      } else {
        setEntreprises(data || []);
      }
      setLoading(false);
    };

    fetchEntreprises();
  }, [filters]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = "pk.eyJ1IjoicmF3c3MiLCJhIjoiY21nd3FuN3plMHF6YjJrc2JzMHU5enZqbCJ9.DW7r1fzAlHdCdlQatpAEuQ";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [2.3522, 48.8566], // Paris
      zoom: 5,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      map.current?.remove();
    };
  }, []);

  // Add markers when entreprises change
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    entreprises.forEach((entreprise) => {
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        className: 'lead-popup'
      }).setHTML(`
        <div style="
          background: linear-gradient(135deg, hsl(220 40% 10% / 0.95), hsl(220 20% 5% / 0.95));
          backdrop-filter: blur(20px);
          border: 1px solid hsl(190 95% 60% / 0.3);
          border-radius: 12px;
          padding: 16px;
          min-width: 280px;
          box-shadow: 0 8px 32px hsl(0 0% 0% / 0.6), 0 0 20px hsl(190 95% 60% / 0.2);
        ">
          <h3 style="
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 12px;
            color: hsl(0 0% 98%);
            background: linear-gradient(135deg, hsl(190 95% 60%), hsl(190 95% 70%));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          ">${entreprise.nom}</h3>
          
          <div style="
            display: flex;
            flex-direction: column;
            gap: 10px;
            font-size: 13px;
            color: hsl(0 0% 90%);
          ">
            <div style="display: flex; align-items: start; gap: 8px;">
              <span style="color: hsl(190 95% 60%);">📍</span>
              <span style="color: hsl(0 0% 75%);">${entreprise.adresse || "Adresse non disponible"}</span>
            </div>
            
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: hsl(190 95% 60%);">🏢</span>
              <span><strong style="color: hsl(190 95% 60%);">SIRET:</strong> ${entreprise.siret}</span>
            </div>
            
            ${entreprise.interlocuteur ? `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: hsl(190 95% 60%);">👤</span>
              <span><strong style="color: hsl(190 95% 60%);">Interlocuteur:</strong> ${entreprise.interlocuteur}</span>
            </div>
            ` : ''}
            
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: hsl(190 95% 60%);">📅</span>
              <span><strong style="color: hsl(190 95% 60%);">Démarrage:</strong> ${entreprise.date_demarrage || "N/A"}</span>
            </div>
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker({ color: "#00FFF0" })
        .setLngLat([entreprise.longitude, entreprise.latitude])
        .setPopup(popup)
        .addTo(map.current!);

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
    <div className="glass-card h-full rounded-xl overflow-hidden relative">
      <div ref={mapContainer} className="w-full h-full" />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black-deep/50 backdrop-blur-sm">
          <div className="text-center space-y-2">
            <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-muted-foreground">Chargement des données...</p>
          </div>
        </div>
      )}

      {!loading && entreprises.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-4 animate-fade-in">
            <MapPin className="w-16 h-16 text-accent mx-auto" />
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">Aucune entreprise trouvée</h3>
              <p className="text-muted-foreground max-w-md">
                Aucune donnée ne correspond à vos filtres actuels.
                <br />
                Ajustez les filtres ou importez des données dans Supabase.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
