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
import { useAdminStatus } from "@/hooks/useAdminStatus";

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
  
  // États pour les tournées de créations
  const [tourneeActive, setTourneeActive] = useState(false);
  const [tourneeName, setTourneeName] = useState("");
  const [tourneeDate, setTourneeDate] = useState("");
  
  // États pour les tournées de nouveaux sites
  const [nouveauxSitesTourneeActive, setNouveauxSitesTourneeActive] = useState(false);
  const [nouveauxSitesTourneeName, setNouveauxSitesTourneeName] = useState("");
  const [nouveauxSitesTourneeDate, setNouveauxSitesTourneeDate] = useState("");
  
  const { isAdmin } = useAdminStatus();
  
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
  
  // Managers pour les créations et nouveaux sites
  const {
    selectedEntreprises,
    toggleEntreprise,
    clearSelection,
    createTournee,
    optimizeTournee,
    isOptimizing,
    isCreating
  } = useTourneeManager(userId);
  
  const {
    selectedEntreprises: selectedNouveauxSites,
    toggleEntreprise: toggleNouveauSite,
    clearSelection: clearNouveauxSitesSelection,
    createTournee: createNouveauxSitesTournee,
    optimizeTournee: optimizeNouveauxSitesTournee,
    isOptimizing: isOptimizingNouveauxSites,
    isCreating: isCreatingNouveauxSites
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

  const handleCreateNouveauxSitesTournee = () => {
    setNouveauxSitesTourneeActive(!nouveauxSitesTourneeActive);
    if (nouveauxSitesTourneeActive) {
      clearNouveauxSitesSelection();
      setNouveauxSitesTourneeName("");
      setNouveauxSitesTourneeDate("");
    }
  };

  const handleOptimizeNouveauxSites = async () => {
    if (selectedNouveauxSites.length < 2) {
      return;
    }
    
    if (!nouveauxSitesTourneeName.trim()) {
      return;
    }

    // Obtenir la position de l'utilisateur
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const result = await optimizeNouveauxSitesTournee(
        selectedNouveauxSites,
        position.coords.latitude,
        position.coords.longitude
      );

      if (result) {
        // Créer la tournée avec le résultat optimisé
        await createNouveauxSitesTournee({
          nom: nouveauxSitesTourneeName,
          date: nouveauxSitesTourneeDate || new Date().toISOString().split('T')[0],
          entreprises: result.optimizedOrder.map((id: string) => 
            selectedNouveauxSites.find(e => e.id === id)
          ).filter(Boolean)
        });

        // Succès - réinitialiser
        setNouveauxSitesTourneeActive(false);
        clearNouveauxSitesSelection();
        setNouveauxSitesTourneeName("");
        setNouveauxSitesTourneeDate("");
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
      <div className="flex-1 overflow-hidden min-h-0 flex gap-3">
        {/* Filtres */}
        <div className="w-80 shrink-0 glass-card overflow-y-auto">
          {/* Sélection de vue */}
          <div className="p-4 border-b border-border/50">
            <div className="flex gap-2">
              <Button
                variant={activeView === 'creations' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('creations')}
                className="flex-1 justify-start"
              >
                <Building className="w-4 h-4 mr-2" />
                Créations
                {isAdmin && <span className="ml-auto text-xs opacity-70">({resultsCount})</span>}
              </Button>
              <Button
                variant={activeView === 'nouveaux-sites' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('nouveaux-sites')}
                className="flex-1 justify-start"
              >
                <Factory className="w-4 h-4 mr-2" />
                Nouveaux Sites
                {isAdmin && <span className="ml-auto text-xs opacity-70">({nouveauxSitesTotalCount})</span>}
              </Button>
            </div>
          </div>

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
              tourneeActive={nouveauxSitesTourneeActive}
              onToggleTournee={handleCreateNouveauxSitesTournee}
              tourneeName={nouveauxSitesTourneeName}
              setTourneeName={setNouveauxSitesTourneeName}
              tourneeDate={nouveauxSitesTourneeDate}
              setTourneeDate={setNouveauxSitesTourneeDate}
              selectedCount={selectedNouveauxSites.length}
              onOptimize={handleOptimizeNouveauxSites}
              isOptimizing={isOptimizingNouveauxSites}
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
              selectionMode={nouveauxSitesTourneeActive}
              selectedSites={selectedNouveauxSites}
              onToggleSelection={toggleNouveauSite}
            />
          )}
        </div>
      </div>
    </div>
  );
};
