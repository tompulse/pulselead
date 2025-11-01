import { useState, Dispatch, SetStateAction } from "react";
import { List, Building, Factory } from "lucide-react";
import { ListView } from "./ListView";
import { NouveauxSitesListView } from "./NouveauxSitesListView";
import { TourneeFilters } from "./TourneeFilters";
import { NafFilters } from "./NafFilters";
import { useTourneeManager } from "@/hooks/useTourneeManager";
import { useToast } from "@/hooks/use-toast";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { nouveauxSitesService } from "@/services/nouveauxSitesService";

interface ProspectsViewProps {
  filters: {
    dateFrom: string;
    dateTo: string;
    categories: string[];
    departments: string[];
    formesJuridiques?: string[];
    searchQuery?: string;
    typeEvenement?: string[];
    // subcategories removed
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
  const [activeView, setActiveView] = useState<'creations' | 'nouveaux-sites'>('creations');
  const [tourneeActive, setTourneeActive] = useState(false);
  const [tourneeName, setTourneeName] = useState("");
  const [tourneeDate, setTourneeDate] = useState("");
  
  // Filtres pour les créations
  const { entreprises, totalCount, qualifiedCount } = useDashboardData(filters);
  const resultsCount = qualifiedCount ?? 0;

  // Filtres pour les nouveaux sites
  const [nouveauxSitesFilters, setNouveauxSitesFilters] = useState({
    searchQuery: "",
    codesNaf: [] as string[],
    departments: [] as string[],
    categoriesEntreprise: [] as string[]
  });

  // Query pour tous les nouveaux sites (pour le bouton)
  const { data: nouveauxSitesDataAll } = useQuery({
    queryKey: ['nouveaux-sites-total'],
    queryFn: () => nouveauxSitesService.fetchNouveauxSites({}),
    staleTime: 10 * 60 * 1000, // Cache plus long car change rarement
  });

  // Query avec filtres (pour la vue)
  const { data: nouveauxSitesData } = useQuery({
    queryKey: ['nouveaux-sites', nouveauxSitesFilters],
    queryFn: () => nouveauxSitesService.fetchNouveauxSites(nouveauxSitesFilters),
    enabled: activeView === 'nouveaux-sites',
    staleTime: 5 * 60 * 1000,
  });

  const nouveauxSitesTotalCount = nouveauxSitesDataAll?.total ?? 0;
  const nouveauxSitesFilteredCount = nouveauxSitesData?.filteredCount ?? 0;
  
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
      {/* Header avec sélection de vue sur une seule ligne */}
      <div className="glass-card border-b border-accent/20 px-4 py-2.5 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-bold gradient-text flex items-center gap-2 shrink-0">
            <div className="p-1.5 bg-accent/10 rounded-lg">
              <List className="h-4 w-4 text-accent" />
            </div>
            Prospects
          </h2>
          
          {/* Boutons de sélection de vue */}
          <div className="flex gap-2">
            <Button
              variant={activeView === 'creations' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('creations')}
              className="h-8"
            >
              <Building className="w-3.5 h-3.5 mr-1.5" />
              Créations
              <span className="ml-1.5 text-xs opacity-70">({resultsCount})</span>
            </Button>
            <Button
              variant={activeView === 'nouveaux-sites' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('nouveaux-sites')}
              className="h-8"
            >
              <Factory className="w-3.5 h-3.5 mr-1.5" />
              Nouveaux Sites
              <span className="ml-1.5 text-xs opacity-70">({nouveauxSitesTotalCount})</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden min-h-0 flex gap-3">
        {/* Filtres */}
        <div className="w-80 shrink-0 glass-card overflow-y-auto">
          {activeView === 'creations' ? (
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
          ) : (
            <NafFilters
              filters={nouveauxSitesFilters}
              setFilters={setNouveauxSitesFilters}
              resultsCount={nouveauxSitesFilteredCount}
              totalCount={nouveauxSitesTotalCount}
            />
          )}
        </div>

        {/* Content - Liste */}
        <div className="flex-1 overflow-hidden min-h-0 glass-card">
          {activeView === 'creations' ? (
            <ListView
              filters={filters}
              onEntrepriseSelect={onEntrepriseSelect}
              selectionMode={internalSelectionMode}
              selectedEntreprises={internalSelectedEntreprises}
              onToggleSelection={internalOnToggleSelection}
            />
          ) : (
            <NouveauxSitesListView
              filters={nouveauxSitesFilters}
              onSiteSelect={onEntrepriseSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
};
