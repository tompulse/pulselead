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
  numero_voie?: string;
  type_voie?: string;
  nom_voie?: string;
  administration?: string;
  capital?: number;
  activite?: string;
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
      
      let query = (supabase as any)
        .from("entreprises")
        .select("*")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .not("activite", "is", null); // Exclure les entreprises sans activité

      // Only apply date filters if we have valid dates AND the entreprise has a date_demarrage
      if (filters.dateFrom || filters.dateTo) {
        query = query.or(`date_demarrage.is.null,and(date_demarrage.gte.${filters.dateFrom || "1900-01-01"},date_demarrage.lte.${filters.dateTo || "2100-12-31"})`);
      }

      const { data, error } = await query;

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
      // Format address from separate fields
      const formattedAddress = [
        entreprise.numero_voie,
        entreprise.type_voie,
        entreprise.nom_voie,
        entreprise.code_postal
      ].filter(Boolean).join(' ') || entreprise.adresse || "Adresse non disponible";

      // Format capital with € and thousands separator
      const formattedCapital = entreprise.capital 
        ? `${entreprise.capital.toLocaleString('fr-FR')} €`
        : null;

      const popup = new mapboxgl.Popup({ 
        offset: 25,
        className: 'lead-popup',
        closeButton: true,
        closeOnClick: false,
        maxWidth: '400px'
      });

      // Create the popup content
      const createPopupContent = async () => {
        let formattedAdmin = entreprise.administration;
        let formattedActivite = entreprise.activite;

        // Call AI to format administration and activite if they exist
        if (entreprise.administration || entreprise.activite) {
          try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/format-lead-details`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({
                administration: entreprise.administration,
                activite: entreprise.activite,
              }),
            });

            if (response.ok) {
              const formatted = await response.json();
              formattedAdmin = formatted.administration || formattedAdmin;
              formattedActivite = formatted.activite || formattedActivite;
            }
          } catch (error) {
            console.error("Error formatting lead details:", error);
          }
        }

        return `
          <div style="
            background: linear-gradient(135deg, hsl(220 40% 10%), hsl(220 20% 5%));
            border: 1px solid hsl(190 95% 60% / 0.3);
            border-radius: 12px;
            padding: 20px;
            min-width: 300px;
            max-width: 400px;
            box-shadow: 0 8px 32px hsl(0 0% 0% / 0.6);
          ">
            <h3 style="
              font-size: 18px;
              font-weight: 700;
              margin-bottom: 16px;
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
              font-size: 14px;
              color: hsl(0 0% 90%);
            ">
              <div style="display: flex; align-items: start; gap: 10px;">
                <span style="color: hsl(190 95% 60%); font-size: 18px; min-width: 24px;">📍</span>
                <span style="color: hsl(0 0% 75%); line-height: 1.5;">${formattedAddress}</span>
              </div>
              
              ${formattedActivite ? `
              <div style="display: flex; align-items: start; gap: 10px;">
                <span style="color: hsl(190 95% 60%); font-size: 18px; min-width: 24px;">💼</span>
                <span style="color: hsl(0 0% 85%); line-height: 1.5;">${formattedActivite}</span>
              </div>
              ` : ''}
              
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="color: hsl(190 95% 60%); font-size: 18px; min-width: 24px;">🏢</span>
                <span style="line-height: 1.5;"><strong style="color: hsl(190 95% 60%);">SIRET:</strong> ${entreprise.siret}</span>
              </div>
              
              ${formattedAdmin ? `
              <div style="display: flex; align-items: start; gap: 10px;">
                <span style="color: hsl(190 95% 60%); font-size: 18px; min-width: 24px;">👤</span>
                <span style="line-height: 1.5;"><strong style="color: hsl(190 95% 60%);">Contact:</strong> ${formattedAdmin}</span>
              </div>
              ` : ''}
              
              ${formattedCapital ? `
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="color: hsl(190 95% 60%); font-size: 18px; min-width: 24px;">💰</span>
                <span style="line-height: 1.5;"><strong style="color: hsl(190 95% 60%);">Capital:</strong> ${formattedCapital}</span>
              </div>
              ` : ''}
              
              ${entreprise.date_demarrage ? `
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="color: hsl(190 95% 60%); font-size: 18px; min-width: 24px;">📅</span>
                <span style="line-height: 1.5;"><strong style="color: hsl(190 95% 60%);">Démarrage:</strong> ${entreprise.date_demarrage}</span>
              </div>
              ` : ''}
            </div>
          </div>
        `;
      };

      // Set initial loading content
      popup.setHTML(`
        <div style="padding: 20px; text-align: center;">
          <div style="
            width: 24px;
            height: 24px;
            border: 2px solid hsl(190 95% 60%);
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          "></div>
          <style>
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          </style>
        </div>
      `);

      // Update content when popup opens
      popup.on('open', async () => {
        const content = await createPopupContent();
        popup.setHTML(content);
      });

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
