import { useState, Dispatch, SetStateAction } from "react";
import { List } from "lucide-react";
import { ListView } from "./ListView";
import { TourneeFilters } from "./TourneeFilters";
import { useTourneeManager } from "@/hooks/useTourneeManager";
import { useToast } from "@/hooks/use-toast";
import { useDashboardData } from "@/hooks/useDashboardData";

interface ProspectsViewProps {
  filters: {
    dateFrom: string;
    dateTo: string;
    buildingTypes?: string[];
    zoneTypes?: string[];
    departments: string[];
    searchQuery?: string;
    typeEvenement?: string[];
  };
  setFilters: Dispatch<SetStateAction<any>>;
  userId: string;
  onEntrepriseSelect?: (entreprise: any) => void;
  selectionMode?: boolean;
  selectedEntreprises?: any[];
  onToggleSelection?: (entreprise: any) => void;
}

export const ProspectsView = ({
  filters,
  setFilters,
  userId,
  onEntrepriseSelect,
  selectionMode: externalSelectionMode = false,
  selectedEntreprises: externalSelectedEntreprises = [],
  onToggleSelection: externalOnToggleSelection,
}: ProspectsViewProps) => {
  const { toast } = useToast();
  const [tourneeActive, setTourneeActive] = useState(false);
  const [tourneeName, setTourneeName] = useState("");
  const [tourneeDate, setTourneeDate] = useState("");
  
  const { entreprises, totalCount, qualifiedCount } = useDashboardData(filters);
  
  const resultsCount = qualifiedCount ?? 0;
  
  const {
    selectedEntreprises,
    toggleEntreprise,
    clearSelection,
    createTournee,
    optimizeTournee,
    isOptimizing,
    isCreating
  } = useTourneeManager(userId);
  const handleCreateTournee = () => {
    setTourneeActive(!tourneeActive);
    if (tourneeActive) {
      clearSelection();
      setTourneeName("");
      setTourneeDate("");
    }
  };

  const handleOptimize = async () => {
    if (selectedEntreprises.length < 2) {
      return;
    }
    
    if (!tourneeName.trim()) {
      return;
    }

    // Obtenir la position de l'utilisateur
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const result = await optimizeTournee(
        selectedEntreprises,
        position.coords.latitude,
        position.coords.longitude
      );

      if (result) {
        // Créer la tournée avec le résultat optimisé
        await createTournee({
          nom: tourneeName,
          date: tourneeDate || new Date().toISOString().split('T')[0],
          entreprises: result.optimizedOrder.map((id: string) => 
            selectedEntreprises.find(e => e.id === id)
          ).filter(Boolean)
        });

        // Succès - réinitialiser
        setTourneeActive(false);
        clearSelection();
        setTourneeName("");
        setTourneeDate("");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'obtenir votre position",
        variant: "destructive"
      });
    }
  };

  const internalSelectionMode = externalSelectionMode || tourneeActive;
  const internalSelectedEntreprises = externalSelectionMode ? externalSelectedEntreprises : selectedEntreprises;
  const internalOnToggleSelection = externalSelectionMode ? externalOnToggleSelection : toggleEntreprise;

  return (
    <div className="h-full flex flex-col overflow-hidden gap-3">
      {/* Header */}
      <div className="glass-card border-b border-accent/20 px-4 py-2.5 shrink-0 flex items-center justify-between">
        <h2 className="text-base font-bold gradient-text flex items-center gap-2">
          <div className="p-1.5 bg-accent/10 rounded-lg">
            <List className="h-4 w-4 text-accent" />
          </div>
          Prospects
        </h2>
      </div>

      <div className="flex-1 overflow-hidden min-h-0 flex gap-3">
        {/* Filtres */}
        <div className="w-52 shrink-0 glass-card overflow-y-auto">
          <TourneeFilters
            filters={filters}
            setFilters={setFilters}
            tourneeActive={!externalSelectionMode ? tourneeActive : undefined}
            onToggleTournee={!externalSelectionMode ? handleCreateTournee : undefined}
            tourneeName={tourneeName}
            setTourneeName={setTourneeName}
            tourneeDate={tourneeDate}
            setTourneeDate={setTourneeDate}
            selectedCount={selectedEntreprises.length}
            onOptimize={handleOptimize}
            isOptimizing={isOptimizing}
            resultsCount={resultsCount}
          />
        </div>

        {/* Content - Liste */}
        <div className="flex-1 overflow-hidden min-h-0">
          <ListView
            filters={filters}
            onEntrepriseSelect={onEntrepriseSelect}
            selectionMode={internalSelectionMode}
            selectedEntreprises={internalSelectedEntreprises}
            onToggleSelection={internalOnToggleSelection}
          />
        </div>
      </div>
    </div>
  );
};
