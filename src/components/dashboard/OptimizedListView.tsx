import { memo, useCallback, useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Calendar, MapPin, Building2, CheckCircle2 } from "lucide-react";
import { categorizeActivity } from "@/utils/activityCategories";

interface Entreprise {
  id: string;
  nom: string;
  siret: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  activite?: string;
  categorie_qualifiee?: string;
  forme_juridique?: string;
  latitude?: number;
  longitude?: number;
  telephone?: string;
  email?: string;
}

interface OptimizedListViewProps {
  entreprises: Entreprise[];
  onEntrepriseSelect?: (entreprise: Entreprise) => void;
  selectionMode?: boolean;
  selectedEntreprises?: Entreprise[];
  onToggleSelection?: (entreprise: Entreprise) => void;
}

const EntrepriseCard = memo(({ 
  entreprise, 
  onSelect, 
  selectionMode, 
  isSelected, 
  onToggle 
}: {
  entreprise: Entreprise;
  onSelect?: (e: Entreprise) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggle?: (e: Entreprise) => void;
}) => {
  const getCategoryInfo = useCallback((activite: string | undefined, categorieQualifiee: string | undefined) => {
    const category = categorizeActivity(activite, categorieQualifiee);
    const categoryConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      restaurant: { label: "Restaurant", variant: "default" },
      commerce_alimentaire: { label: "Commerce Alimentaire", variant: "secondary" },
      service: { label: "Service", variant: "outline" },
      commerce: { label: "Commerce", variant: "outline" },
      autre: { label: "Autre", variant: "outline" },
    };
    return categoryConfig[category] || categoryConfig.autre;
  }, []);

  const categoryInfo = getCategoryInfo(entreprise.activite, entreprise.categorie_qualifiee);
  const hasCoordinates = Number.isFinite(entreprise.latitude) && Number.isFinite(entreprise.longitude);

  const handleClick = useCallback(() => {
    if (selectionMode) {
      onToggle?.(entreprise);
    } else {
      onSelect?.(entreprise);
    }
  }, [selectionMode, onToggle, onSelect, entreprise]);

  return (
    <Card 
      className="glass-card hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              {selectionMode && (
                <div className="shrink-0 mt-0.5">
                  {isSelected ? (
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm line-clamp-1 text-foreground">
                  {entreprise.nom}
                </h3>
                {entreprise.activite && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {entreprise.activite}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="line-clamp-1">
                {entreprise.ville && entreprise.code_postal 
                  ? `${entreprise.ville} (${entreprise.code_postal})`
                  : entreprise.ville || entreprise.code_postal || "Localisation inconnue"}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5 items-end shrink-0">
            <Badge variant={categoryInfo.variant} className="text-xs whitespace-nowrap">
              {categoryInfo.label}
            </Badge>
            {hasCoordinates && (
              <Badge variant="outline" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                GPS
              </Badge>
            )}
          </div>
        </div>

        {!selectionMode && (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(entreprise);
              }}
            >
              <Phone className="h-3 w-3 mr-1" />
              Appeler
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(entreprise);
              }}
            >
              <Calendar className="h-3 w-3 mr-1" />
              RDV
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.entreprise.id === nextProps.entreprise.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.selectionMode === nextProps.selectionMode
  );
});

EntrepriseCard.displayName = "EntrepriseCard";

export const OptimizedListView = memo(({
  entreprises,
  onEntrepriseSelect,
  selectionMode,
  selectedEntreprises = [],
  onToggleSelection,
}: OptimizedListViewProps) => {
  const [displayCount, setDisplayCount] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const isSelected = useCallback((entreprise: Entreprise) => {
    return selectedEntreprises.some(e => e.id === entreprise.id);
  }, [selectedEntreprises]);

  // Infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < entreprises.length) {
          setDisplayCount(prev => Math.min(prev + 50, entreprises.length));
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [displayCount, entreprises.length]);

  // Reset display count when entreprises change
  useEffect(() => {
    setDisplayCount(50);
  }, [entreprises]);

  const displayedEntreprises = entreprises.slice(0, displayCount);

  if (entreprises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
        <Building2 className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm">Aucune entreprise trouvée</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
      <div className="space-y-3 p-4">
        {displayedEntreprises.map((entreprise) => (
          <EntrepriseCard
            key={entreprise.id}
            entreprise={entreprise}
            onSelect={onEntrepriseSelect}
            selectionMode={selectionMode}
            isSelected={isSelected(entreprise)}
            onToggle={onToggleSelection}
          />
        ))}
        {displayCount < entreprises.length && (
          <div ref={sentinelRef} className="h-20 flex items-center justify-center">
            <div className="animate-pulse text-sm text-muted-foreground">
              Chargement...
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

OptimizedListView.displayName = "OptimizedListView";
