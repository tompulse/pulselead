import { useState, Dispatch, SetStateAction } from "react";
import { List, Building, Factory, Route, Calendar as CalendarIcon } from "lucide-react";
import { ListView } from "./ListView";
import { NouveauxSitesListView } from "./NouveauxSitesListView";
import { TourneeFilters } from "./TourneeFilters";
import { NafFilters } from "./NafFilters";
import { useTourneeManager } from "@/hooks/useTourneeManager";
import { useToast } from "@/hooks/use-toast";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { nouveauxSitesService } from "@/services/nouveauxSitesService";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { format } from "date-fns";

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

// Méthode exposée pour l'assistant IA
export interface ApplyAIFiltersParams {
  view: "creations" | "nouveaux-sites";
  filters: {
    categories?: string[];
    departments?: string[];
    formesJuridiques?: string[];
    dateFrom?: string;
    dateTo?: string;
    codesNaf?: string[];
  };
  tourneeName: string;
  tourneeDate: Date;
}

export const ProspectsView = ({
  filters,
  setFilters,
  userId,
  onEntrepriseSelect,
  selectionMode: externalSelectionMode = false,
  selectedEntreprises: externalSelectedEntreprises = [],
  onToggleSelection: externalOnToggleSelection,
  onAIFiltersApply,
  onAIFiltersReady,
}: ProspectsViewProps & { 
  onAIFiltersApply?: (params: ApplyAIFiltersParams) => void;
  onAIFiltersReady?: (applyFn: (params: ApplyAIFiltersParams) => void) => void;
}) => {
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
  const { entreprises, totalCount } = useDashboardData(filters);
  const resultsCount = entreprises.length;

  // Filtres pour les nouveaux sites
  const [nouveauxSitesFilters, setNouveauxSitesFilters] = useState({
    searchQuery: "",
    codesNaf: [] as string[],
    departments: [] as string[],
    categories: [] as string[]
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

  // Méthode pour appliquer les filtres de l'IA
  const applyAIFilters = (params: ApplyAIFiltersParams) => {
    setActiveView(params.view);
    
    if (params.view === 'creations') {
      // Appliquer les filtres de créations
      setFilters((prev: any) => ({
        ...prev,
        categories: params.filters.categories || [],
        departments: params.filters.departments || [],
        formesJuridiques: params.filters.formesJuridiques || [],
        dateFrom: params.filters.dateFrom || "",
        dateTo: params.filters.dateTo || ""
      }));
      
      // Activer le mode tournée et pré-remplir
      setTourneeActive(true);
      setTourneeName(params.tourneeName);
      setTourneeDate(format(params.tourneeDate, "yyyy-MM-dd"));
    } else {
      // Appliquer les filtres de nouveaux sites
      setNouveauxSitesFilters({
        searchQuery: "",
        codesNaf: params.filters.codesNaf || [],
        departments: params.filters.departments || [],
        categories: params.filters.categories || []
      });
      
      // Activer le mode tournée et pré-remplir
      setNouveauxSitesTourneeActive(true);
      setNouveauxSitesTourneeName(params.tourneeName);
      setNouveauxSitesTourneeDate(format(params.tourneeDate, "yyyy-MM-dd"));
    }
    
    if (onAIFiltersApply) {
      onAIFiltersApply(params);
    }
  };

  // Exposer la fonction au parent
  if (onAIFiltersReady) {
    onAIFiltersReady(applyAIFilters);
  }

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

          {/* Bouton Créer une tournée unifié */}
          <div className="p-4 border-b border-accent/20 bg-gradient-to-br from-accent/5 via-transparent to-transparent">
            <Button
              onClick={activeView === 'creations' ? handleCreateTournee : handleCreateNouveauxSitesTournee}
              variant={
                (activeView === 'creations' ? tourneeActive : nouveauxSitesTourneeActive) 
                  ? "default" 
                  : "outline"
              }
              className={`w-full ${
                (activeView === 'creations' ? tourneeActive : nouveauxSitesTourneeActive)
                  ? "bg-gradient-to-r from-accent to-accent/80 hover:shadow-lg hover:shadow-accent/30 text-primary" 
                  : "border-accent/50 hover:bg-accent/10 hover:border-accent hover:shadow-md"
              } transition-all h-10 font-semibold`}
              size="sm"
            >
              <Route className="w-4 h-4 mr-2" />
              {(activeView === 'creations' ? tourneeActive : nouveauxSitesTourneeActive)
                ? "✓ Mode tournée actif" 
                : "🚀 Créer une tournée"}
            </Button>
            
            {/* Panneau de configuration pour Créations */}
            {activeView === 'creations' && tourneeActive && (
              <div className="space-y-3 p-3 mt-3 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent rounded-lg border border-accent/30 shadow-sm">
                <div className="space-y-2">
                  <Label htmlFor="tournee-name-creations" className="text-xs font-semibold text-accent">Nom de la tournée</Label>
                  <Input
                    id="tournee-name-creations"
                    placeholder="Ex: Tournée Sud"
                    value={tourneeName}
                    onChange={(e) => setTourneeName(e.target.value)}
                    className="h-9 text-sm border-accent/30 focus:border-accent focus:ring-accent/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tournee-date-creations" className="text-xs font-semibold text-accent">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-9 text-sm justify-start text-left font-normal border-accent/30 hover:bg-accent/10 hover:border-accent/50"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tourneeDate ? format(new Date(tourneeDate), "dd/MM/yyyy") : "Choisir une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={tourneeDate ? new Date(tourneeDate) : undefined}
                        onSelect={(date) => setTourneeDate(date ? format(date, "yyyy-MM-dd") : "")}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {selectedEntreprises.length > 0 && (
                  <div className="text-xs bg-accent/10 text-accent font-semibold rounded-lg px-3 py-2 border border-accent/20">
                    {selectedEntreprises.length} entreprise(s) sélectionnée(s)
                  </div>
                )}
                <Button
                  onClick={handleOptimize}
                  disabled={selectedEntreprises.length < 2 || isOptimizing || !tourneeName.trim()}
                  className="w-full h-9 text-xs bg-gradient-to-r from-accent via-accent to-accent/80 transition-colors disabled:opacity-50"
                  size="sm"
                >
                  <Route className="w-3.5 h-3.5 mr-2" />
                  {isOptimizing ? "Optimisation..." : "Optimiser la tournée"}
                </Button>
              </div>
            )}

            {/* Panneau de configuration pour Nouveaux Sites */}
            {activeView === 'nouveaux-sites' && nouveauxSitesTourneeActive && (
              <div className="space-y-3 p-3 mt-3 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent rounded-lg border border-accent/30 shadow-sm">
                <div className="space-y-2">
                  <Label htmlFor="tournee-name-sites" className="text-xs font-semibold text-accent">Nom de la tournée</Label>
                  <Input
                    id="tournee-name-sites"
                    placeholder="Ex: Tournée Est"
                    value={nouveauxSitesTourneeName}
                    onChange={(e) => setNouveauxSitesTourneeName(e.target.value)}
                    className="h-9 text-sm border-accent/30 focus:border-accent focus:ring-accent/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tournee-date-sites" className="text-xs font-semibold text-accent">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-9 text-sm justify-start text-left font-normal border-accent/30 hover:bg-accent/10 hover:border-accent/50"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {nouveauxSitesTourneeDate ? format(new Date(nouveauxSitesTourneeDate), "dd/MM/yyyy") : "Choisir une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={nouveauxSitesTourneeDate ? new Date(nouveauxSitesTourneeDate) : undefined}
                        onSelect={(date) => setNouveauxSitesTourneeDate(date ? format(date, "yyyy-MM-dd") : "")}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {selectedNouveauxSites.length > 0 && (
                  <div className="text-xs bg-accent/10 text-accent font-semibold rounded-lg px-3 py-2 border border-accent/20">
                    {selectedNouveauxSites.length} site(s) sélectionné(s)
                  </div>
                )}
                <Button
                  onClick={handleOptimizeNouveauxSites}
                  disabled={selectedNouveauxSites.length < 2 || isOptimizingNouveauxSites || !nouveauxSitesTourneeName.trim()}
                  className="w-full h-9 text-xs bg-gradient-to-r from-accent via-accent to-accent/80 transition-colors disabled:opacity-50"
                  size="sm"
                >
                  <Route className="w-3.5 h-3.5 mr-2" />
                  {isOptimizingNouveauxSites ? "Optimisation..." : "Optimiser la tournée"}
                </Button>
              </div>
            )}
          </div>

          {activeView === 'creations' ? (
            <TourneeFilters
              filters={filters}
              setFilters={setFilters}
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
