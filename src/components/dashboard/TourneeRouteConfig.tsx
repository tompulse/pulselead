import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Loader2, X, Search, Home, Flag, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Suggestion {
  id: string;
  place_name: string;
  center: [number, number];
}

interface RouteEndpoint {
  type: 'address' | 'current_location';
  address: string;
  lat: number;
  lng: number;
}

interface ArrivalOption {
  type: 'last_prospect' | 'return_start' | 'custom_address';
  address?: string;
  lat?: number;
  lng?: number;
}

interface TourneeRouteConfigProps {
  startPoint: RouteEndpoint | null;
  arrivalOption: ArrivalOption;
  onStartPointChange: (point: RouteEndpoint | null) => void;
  onArrivalOptionChange: (option: ArrivalOption) => void;
  disabled?: boolean;
}

export const TourneeRouteConfig = ({
  startPoint,
  arrivalOption,
  onStartPointChange,
  onArrivalOptionChange,
  disabled = false,
}: TourneeRouteConfigProps) => {
  const [startQuery, setStartQuery] = useState(startPoint?.address || "");
  const [arrivalQuery, setArrivalQuery] = useState(arrivalOption.address || "");
  const [startSuggestions, setStartSuggestions] = useState<Suggestion[]>([]);
  const [arrivalSuggestions, setArrivalSuggestions] = useState<Suggestion[]>([]);
  const [isLoadingStart, setIsLoadingStart] = useState(false);
  const [isLoadingArrival, setIsLoadingArrival] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showArrivalSuggestions, setShowArrivalSuggestions] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const startContainerRef = useRef<HTMLDivElement>(null);
  const arrivalContainerRef = useRef<HTMLDivElement>(null);
  const startDebounceRef = useRef<NodeJS.Timeout>();
  const arrivalDebounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const tempToken = localStorage.getItem('mapbox_temp_token');
        if (tempToken) {
          setMapboxToken(tempToken);
          return;
        }
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

  useEffect(() => {
    if (startPoint?.address && startPoint.address !== startQuery) {
      setStartQuery(startPoint.address);
    }
  }, [startPoint?.address]);

  useEffect(() => {
    if (arrivalOption.address && arrivalOption.address !== arrivalQuery) {
      setArrivalQuery(arrivalOption.address);
    }
  }, [arrivalOption.address]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (startContainerRef.current && !startContainerRef.current.contains(event.target as Node)) {
        setShowStartSuggestions(false);
      }
      if (arrivalContainerRef.current && !arrivalContainerRef.current.contains(event.target as Node)) {
        setShowArrivalSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchAddresses = async (query: string, type: 'start' | 'arrival') => {
    if (!query.trim() || query.length < 3 || !mapboxToken) {
      type === 'start' ? setStartSuggestions([]) : setArrivalSuggestions([]);
      return;
    }

    type === 'start' ? setIsLoadingStart(true) : setIsLoadingArrival(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${mapboxToken}&country=fr&language=fr&limit=5&types=address,place,locality`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (type === 'start') {
          setStartSuggestions(data.features || []);
          setShowStartSuggestions(true);
        } else {
          setArrivalSuggestions(data.features || []);
          setShowArrivalSuggestions(true);
        }
      }
    } catch (error) {
      console.error("Error searching addresses:", error);
    } finally {
      type === 'start' ? setIsLoadingStart(false) : setIsLoadingArrival(false);
    }
  };

  const handleStartSearchChange = (value: string) => {
    setStartQuery(value);
    if (startDebounceRef.current) clearTimeout(startDebounceRef.current);
    startDebounceRef.current = setTimeout(() => searchAddresses(value, 'start'), 300);
  };

  const handleArrivalSearchChange = (value: string) => {
    setArrivalQuery(value);
    if (arrivalDebounceRef.current) clearTimeout(arrivalDebounceRef.current);
    arrivalDebounceRef.current = setTimeout(() => searchAddresses(value, 'arrival'), 300);
  };

  const handleSelectStartSuggestion = (suggestion: Suggestion) => {
    const [lng, lat] = suggestion.center;
    setStartQuery(suggestion.place_name);
    setStartSuggestions([]);
    setShowStartSuggestions(false);
    onStartPointChange({
      type: 'address',
      address: suggestion.place_name,
      lat,
      lng,
    });
    toast.success("Point de départ défini");
  };

  const handleSelectArrivalSuggestion = (suggestion: Suggestion) => {
    const [lng, lat] = suggestion.center;
    setArrivalQuery(suggestion.place_name);
    setArrivalSuggestions([]);
    setShowArrivalSuggestions(false);
    onArrivalOptionChange({
      type: 'custom_address',
      address: suggestion.place_name,
      lat,
      lng,
    });
    toast.success("Point d'arrivée défini");
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        if (mapboxToken) {
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?` +
              `access_token=${mapboxToken}&language=fr&limit=1`
            );
            
            if (response.ok) {
              const data = await response.json();
              const placeName = data.features?.[0]?.place_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
              setStartQuery(placeName);
              onStartPointChange({
                type: 'current_location',
                address: placeName,
                lat: latitude,
                lng: longitude,
              });
              toast.success("Position actuelle définie");
            }
          } catch (error) {
            console.error("Reverse geocoding error:", error);
            setStartQuery("Ma position");
            onStartPointChange({
              type: 'current_location',
              address: "Ma position",
              lat: latitude,
              lng: longitude,
            });
          }
        } else {
          setStartQuery("Ma position");
          onStartPointChange({
            type: 'current_location',
            address: "Ma position",
            lat: latitude,
            lng: longitude,
          });
        }
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        toast.error("Erreur de localisation");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleClearStart = () => {
    setStartQuery("");
    setStartSuggestions([]);
    onStartPointChange(null);
  };

  const handleArrivalTypeChange = (value: string) => {
    if (value === 'last_prospect') {
      onArrivalOptionChange({ type: 'last_prospect' });
      setArrivalQuery("");
    } else if (value === 'return_start') {
      onArrivalOptionChange({ type: 'return_start' });
      setArrivalQuery("");
    } else {
      onArrivalOptionChange({ type: 'custom_address' });
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-xl bg-card/50 border border-accent/20">
      <div className="flex items-center gap-2 text-sm font-semibold text-accent">
        <Navigation className="w-4 h-4" />
        Configuration de l'itinéraire
      </div>

      {/* Point de départ */}
      <div className="space-y-2" ref={startContainerRef}>
        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Home className="w-3.5 h-3.5 text-orange-400" />
          Point de départ
        </Label>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Saisissez une adresse..."
              value={startQuery}
              onChange={(e) => handleStartSearchChange(e.target.value)}
              onFocus={() => startSuggestions.length > 0 && setShowStartSuggestions(true)}
              disabled={disabled}
              className="h-9 text-sm pl-8 pr-8 border-accent/30 focus:border-accent"
            />
            {isLoadingStart && (
              <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-accent" />
            )}
            {startQuery && !isLoadingStart && (
              <button
                onClick={handleClearStart}
                disabled={disabled}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            
            {showStartSuggestions && startSuggestions.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-accent/30 rounded-lg shadow-lg overflow-hidden max-h-40 overflow-y-auto">
                {startSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSelectStartSuggestion(suggestion)}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-accent/10 border-b border-border/50 last:border-b-0 flex items-start gap-2"
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
            disabled={isLocating || disabled}
            className="h-9 w-9 border-accent/30 hover:bg-accent/10"
            title="Ma position actuelle"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 text-accent" />
            )}
          </Button>
        </div>

        {startPoint && startPoint.lat !== 0 && (
          <div className="text-[10px] text-muted-foreground bg-accent/5 rounded px-2 py-1 border border-accent/20">
            📍 {startPoint.lat.toFixed(5)}, {startPoint.lng.toFixed(5)}
          </div>
        )}
      </div>

      {/* Point d'arrivée */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Flag className="w-3.5 h-3.5 text-green-400" />
          Point d'arrivée
        </Label>
        
        <RadioGroup
          value={arrivalOption.type}
          onValueChange={handleArrivalTypeChange}
          className="space-y-2"
          disabled={disabled}
        >
          <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/5 transition-colors">
            <RadioGroupItem value="last_prospect" id="last_prospect" />
            <Label htmlFor="last_prospect" className="text-xs cursor-pointer flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Dernier prospect de la liste
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/5 transition-colors">
            <RadioGroupItem value="return_start" id="return_start" />
            <Label htmlFor="return_start" className="text-xs cursor-pointer flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
              Revenir au point de départ
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/5 transition-colors">
            <RadioGroupItem value="custom_address" id="custom_address" />
            <Label htmlFor="custom_address" className="text-xs cursor-pointer flex items-center gap-2">
              <Home className="w-3.5 h-3.5 text-purple-400" />
              Autre adresse
            </Label>
          </div>
        </RadioGroup>

        {/* Input pour adresse personnalisée */}
        {arrivalOption.type === 'custom_address' && (
          <div className="pl-6 space-y-2" ref={arrivalContainerRef}>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Saisissez l'adresse d'arrivée..."
                value={arrivalQuery}
                onChange={(e) => handleArrivalSearchChange(e.target.value)}
                onFocus={() => arrivalSuggestions.length > 0 && setShowArrivalSuggestions(true)}
                disabled={disabled}
                className="h-9 text-sm pl-8 pr-8 border-accent/30 focus:border-accent"
              />
              {isLoadingArrival && (
                <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-accent" />
              )}
              
              {showArrivalSuggestions && arrivalSuggestions.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-accent/30 rounded-lg shadow-lg overflow-hidden max-h-40 overflow-y-auto">
                  {arrivalSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSelectArrivalSuggestion(suggestion)}
                      className="w-full px-3 py-2 text-left text-xs hover:bg-accent/10 border-b border-border/50 last:border-b-0 flex items-start gap-2"
                    >
                      <MapPin className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{suggestion.place_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {arrivalOption.lat && arrivalOption.lng && arrivalOption.lat !== 0 && (
              <div className="text-[10px] text-muted-foreground bg-accent/5 rounded px-2 py-1 border border-accent/20">
                📍 {arrivalOption.lat.toFixed(5)}, {arrivalOption.lng.toFixed(5)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
