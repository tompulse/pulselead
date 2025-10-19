import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";
import { ACTIVITY_CATEGORIES } from "@/utils/activityCategories";
import { REGIONS_DATA } from "@/utils/regionsData";

interface MapViewProps {
  filters: {
    dateFrom: string;
    dateTo: string;
    categories: string[];
    region: string;
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
  const currentPopupRef = useRef<mapboxgl.Popup | null>(null); // Pour gérer le popup ouvert

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
            const dept = codePostal.substring(0, 2);
            return filters.departments.includes(dept) || filters.departments.includes(codePostal.substring(0, 3));
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

    // Determine initial center and zoom based on region filter
    let initialCenter: [number, number] = [2.3522, 46.2276];
    let initialZoom = 5.5;

    if (filters.region && filters.region !== "all") {
      const regionData = REGIONS_DATA[filters.region as keyof typeof REGIONS_DATA];
      if (regionData) {
        initialCenter = regionData.center as [number, number];
        initialZoom = regionData.zoom;
      }
    }

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
  }, [filters.region]); // Re-initialize map when region changes

  // Add markers when entreprises change
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    entreprises.forEach((entreprise) => {
      // Format address from separate fields
      const addressParts = [
        entreprise.numero_voie,
        entreprise.type_voie,
        entreprise.nom_voie
      ].filter(Boolean).join(' ');
      
      const locationParts = [
        entreprise.code_postal,
        entreprise.ville
      ].filter(Boolean).join(' ');
      
      const formattedAddress = addressParts && locationParts 
        ? `${addressParts}, ${locationParts}`
        : addressParts || locationParts || entreprise.adresse || "Adresse non disponible";

      // Format capital with € and thousands separator
      const formattedCapital = entreprise.capital 
        ? `${entreprise.capital.toLocaleString('fr-FR')} €`
        : null;

      const popup = new mapboxgl.Popup({ 
        offset: 25,
        className: 'lead-popup',
        closeButton: false, // On gère la croix nous-mêmes
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
            position: relative;
          ">
            <button 
              onclick="this.closest('.mapboxgl-popup').remove()"
              style="
                position: absolute;
                top: 8px;
                right: 8px;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: hsl(220 40% 10%);
                border: 1px solid hsl(190 95% 60% / 0.5);
                color: hsl(190 95% 60%);
                font-size: 24px;
                line-height: 1;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                padding: 0;
              "
              onmouseover="this.style.background='hsl(190 95% 60%)'; this.style.color='hsl(220 40% 10%)'; this.style.transform='scale(1.1)';"
              onmouseout="this.style.background='hsl(220 40% 10%)'; this.style.color='hsl(190 95% 60%)'; this.style.transform='scale(1)';"
            >×</button>
            
            <h3 style="
              font-size: 18px;
              font-weight: 700;
              margin-bottom: 16px;
              color: hsl(0 0% 98%);
              background: linear-gradient(135deg, hsl(190 95% 60%), hsl(190 95% 70%));
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              padding-right: 40px;
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
        <div style="padding: 40px 20px; text-align: center; background: linear-gradient(135deg, hsl(220 40% 10%), hsl(220 20% 5%)); border-radius: 12px;">
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
        // Fermer le popup précédent s'il existe
        if (currentPopupRef.current && currentPopupRef.current !== popup) {
          currentPopupRef.current.remove();
        }
        currentPopupRef.current = popup;
        
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
    <div className="h-[calc(100vh-280px)] rounded-2xl overflow-hidden shadow-2xl border border-accent/20 relative">
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
  );
};
