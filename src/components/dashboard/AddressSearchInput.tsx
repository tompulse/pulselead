import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Loader2, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AddressSearchInputProps {
  onAddressSelect: (address: string, lat: number, lng: number) => void;
  selectedAddress?: string;
  selectedLat?: number;
  selectedLng?: number;
}

interface Suggestion {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
}

export const AddressSearchInput = ({
  onAddressSelect,
  selectedAddress,
  selectedLat,
  selectedLng
}: AddressSearchInputProps) => {
  const [searchQuery, setSearchQuery] = useState(selectedAddress || "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (!error && data?.token) {
          setMapboxToken(data.token);
        }
      } catch (err) {
        console.error("Error fetching Mapbox token:", err);
      }
    };
    fetchToken();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search addresses with Mapbox Geocoding API
  const searchAddresses = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      return;
    }

    if (!mapboxToken) {
      console.warn('[AddressSearch] Mapbox token not available');
      toast.error("Service de recherche d'adresse indisponible", {
        description: "Veuillez vérifier la configuration Mapbox"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${mapboxToken}&country=fr&language=fr&limit=5&types=address,place,locality`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.features || []);
        setShowSuggestions(true);
      } else {
        console.error('[AddressSearch] Mapbox API error:', response.status);
        toast.error("Erreur lors de la recherche d'adresse");
      }
    } catch (error) {
      console.error("Error searching addresses:", error);
      toast.error("Impossible de rechercher l'adresse");
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      searchAddresses(value);
    }, 300);
  };

  // Select an address from suggestions
  const handleSelectSuggestion = (suggestion: Suggestion) => {
    const [lng, lat] = suggestion.center;
    setSearchQuery(suggestion.place_name);
    setSuggestions([]);
    setShowSuggestions(false);
    onAddressSelect(suggestion.place_name, lat, lng);
    toast.success("Point de départ défini");
  };

  // Use current location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding to get address
        if (mapboxToken) {
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?` +
              `access_token=${mapboxToken}&language=fr&limit=1`
            );
            
            if (response.ok) {
              const data = await response.json();
              const placeName = data.features?.[0]?.place_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
              setSearchQuery(placeName);
              onAddressSelect(placeName, latitude, longitude);
              toast.success("Position actuelle définie comme point de départ");
            }
          } catch (error) {
            console.error("Reverse geocoding error:", error);
            setSearchQuery(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            onAddressSelect(`Ma position`, latitude, longitude);
          }
        } else {
          setSearchQuery(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          onAddressSelect(`Ma position`, latitude, longitude);
        }
        
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Accès à la localisation refusé");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Position non disponible");
            break;
          case error.TIMEOUT:
            toast.error("Délai de localisation dépassé");
            break;
          default:
            toast.error("Erreur de localisation");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Clear selection
  const handleClear = () => {
    setSearchQuery("");
    setSuggestions([]);
    onAddressSelect("", 0, 0);
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label className="text-xs font-semibold text-accent flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5" />
        Point de départ
      </Label>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Tapez une adresse..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="h-9 text-sm pl-8 pr-8 border-accent/30 focus:border-accent focus:ring-accent/20"
          />
          {isLoading && (
            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-accent" />
          )}
          {searchQuery && !isLoading && (
            <button
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          
          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-accent/30 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-accent/10 transition-colors border-b border-border/50 last:border-b-0 flex items-start gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{suggestion.place_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="h-9 w-9 border-accent/30 hover:bg-accent/10 hover:border-accent/50 flex-shrink-0"
          title="Utiliser ma position actuelle"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4 text-accent" />
          )}
        </Button>
      </div>
      
      {/* Show selected coordinates */}
      {selectedLat && selectedLng && selectedLat !== 0 && selectedLng !== 0 && (
        <div className="text-[10px] text-muted-foreground bg-accent/5 rounded px-2 py-1 border border-accent/20">
          📍 {selectedLat.toFixed(5)}, {selectedLng.toFixed(5)}
        </div>
      )}
    </div>
  );
};
