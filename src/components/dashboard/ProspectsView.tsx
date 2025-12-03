import { useState, Dispatch, SetStateAction } from "react";
import { Route, Calendar as CalendarIcon, Filter } from "lucide-react";
import { NouveauxSitesListView } from "./NouveauxSitesListView";
import { NafFilters } from "./NafFilters";
import { useTourneeManager } from "@/hooks/useTourneeManager";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { nouveauxSitesService } from "@/services/nouveauxSitesService";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProspectsViewProps {
  filters: {
    dateFrom: string;
    dateTo: string;
    categories: string[];
    departments: string[];
    formesJuridiques?: string[];
    searchQuery?: string;
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
  filters: {
    categories?: string[];
    departments?: string[];
    formesJuridiques?: string[];
    taillesEntreprise?: string[];
    dateFrom?: string;
    dateTo?: string;
    codesNaf?: string[];
  };
  tourneeName: string;
  tourneeDate: Date;
}

const ProspectsView = ({
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
  
  // États pour les tournées
  const [tourneeActive, setTourneeActive] = useState(false);
  const [tourneeName, setTourneeName] = useState("");
  const [tourneeDate, setTourneeDate] = useState("");

  const [nouveauxSitesFilters, setNouveauxSitesFilters] = useState({
    searchQuery: "",
    codesNaf: [] as string[],
    departments: [] as string[],
    categories: [] as string[],
    formesJuridiques: [] as string[],
    taillesEntreprise: [] as string[]
  });

  // Query pour tous les nouveaux sites (pour le compteur)
  const { data: nouveauxSitesDataAll } = useQuery({
    queryKey: ['nouveaux-sites-total'],
    queryFn: () => nouveauxSitesService.fetchNouveauxSites({}),
    staleTime: 10 * 60 * 1000,
  });

  // Query avec filtres (pour la vue)
  const { data: nouveauxSitesData } = useQuery({
    queryKey: ['nouveaux-sites', nouveauxSitesFilters],
    queryFn: () => nouveauxSitesService.fetchNouveauxSites(nouveauxSitesFilters),
    staleTime: 5 * 60 * 1000,
  });

  const nouveauxSitesTotalCount = nouveauxSitesDataAll?.total ?? 0;
  const nouveauxSitesFilteredCount = nouveauxSitesData?.filteredCount ?? 0;
  
  // Manager pour les tournées
  const {
    selectedEntreprises: selectedSites,
    toggleEntreprise: toggleSite,
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
    if (selectedSites.length < 2) {
      return;
    }
    
    if (!tourneeName.trim()) {
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const result = await optimizeTournee(
        selectedSites,
        position.coords.latitude,
        position.coords.longitude
      );

      if (result) {
        await createTournee({
          nom: tourneeName,
          date: tourneeDate || new Date().toISOString().split('T')[0],
          entreprises: result.optimizedOrder.map((id: string) => 
            selectedSites.find(e => e.id === id)
          ).filter(Boolean)
        });

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

  // Méthode pour appliquer les filtres de l'IA
  const applyAIFilters = (params: ApplyAIFiltersParams) => {
    setNouveauxSitesFilters({
      searchQuery: "",
      codesNaf: params.filters.codesNaf || [],
      departments: params.filters.departments || [],
      categories: params.filters.categories || [],
      formesJuridiques: params.filters.formesJuridiques || [],
      taillesEntreprise: params.filters.taillesEntreprise || []
    });
    
    setTourneeActive(true);
    setTourneeName(params.tourneeName);
    setTourneeDate(format(params.tourneeDate, "yyyy-MM-dd"));
    
    if (onAIFiltersApply) {
      onAIFiltersApply(params);
    }
  };

  // Exposer la fonction au parent
  if (onAIFiltersReady) {
    onAIFiltersReady(applyAIFilters);
  }

  const isMobile = useIsMobile();

  // Version mobile
  if (isMobile) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="shrink-0 space-y-2 px-3 pb-2">
          <div className="flex gap-2">
            <Button
              onClick={handleCreateTournee}
              variant={tourneeActive ? "default" : "outline"}
              className="flex-1 h-9 text-xs"
              size="sm"
            >
              <Route className="w-3.5 h-3.5 mr-2" />
              {tourneeActive ? "Mode tournée actif" : "Créer une tournée"}
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-3">
                  <Filter className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh]">
                <SheetHeader>
                  <SheetTitle>Filtres</SheetTitle>
                </SheetHeader>
                <div className="overflow-y-auto h-full pb-6 mt-4">
                  <NafFilters
                    filters={nouveauxSitesFilters}
                    setFilters={setNouveauxSitesFilters}
                    resultsCount={nouveauxSitesFilteredCount}
                    totalCount={nouveauxSitesTotalCount}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {tourneeActive && (
            <div className="space-y-2 p-3 bg-accent/10 rounded-lg border border-accent/30">
              <Input
                placeholder="Nom de la tournée"
                value={tourneeName}
                onChange={(e) => setTourneeName(e.target.value)}
                className="h-9 text-sm"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full h-9 text-sm justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tourneeDate ? format(new Date(tourneeDate), "dd/MM/yyyy") : "Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={tourneeDate ? new Date(tourneeDate) : undefined}
                    onSelect={(date) => setTourneeDate(date ? format(date, "yyyy-MM-dd") : "")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {selectedSites.length > 0 && (
                <div className="text-xs text-center py-2 bg-accent/20 rounded">
                  {selectedSites.length} sélectionné(s)
                </div>
              )}
              <Button
                onClick={handleOptimize}
                disabled={selectedSites.length < 2 || isOptimizing || !tourneeName.trim()}
                className="w-full h-9 text-xs"
                size="sm"
              >
                {isOptimizing ? "Optimisation..." : "Optimiser"}
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-3 hide-scrollbar">
          <div className="max-w-md mx-auto space-y-3">
            <NouveauxSitesListView
              filters={nouveauxSitesFilters}
              onSiteSelect={onEntrepriseSelect}
              selectionMode={tourneeActive}
              selectedSites={selectedSites}
              onToggleSelection={toggleSite}
            />
          </div>
        </div>
      </div>
    );
  }

  // Version desktop
  return (
    <div className="h-full flex flex-col overflow-hidden gap-3">
      <div className="flex-1 overflow-hidden min-h-0 flex gap-3">
        {/* Filtres */}
        <div className="w-64 shrink-0 glass-card overflow-y-auto">
          <div className="p-4 border-b border-border/50 space-y-3">
            <Button
              onClick={handleCreateTournee}
              variant={tourneeActive ? "default" : "outline"}
              className={`w-full ${
                tourneeActive
                  ? "bg-gradient-to-r from-accent to-accent/80 hover:shadow-lg hover:shadow-accent/30 text-primary" 
                  : "border-accent/50 hover:bg-accent/10 hover:border-accent hover:shadow-md"
              } transition-all h-8 text-xs px-3`}
              size="sm"
            >
              <Route className="w-3.5 h-3.5 mr-2" />
              {tourneeActive ? "✓ Mode tournée actif" : "Créer une tournée"}
            </Button>
          </div>

          <div className="border-b border-accent/20">
            {tourneeActive && (
              <div className="space-y-3 p-3 mt-3 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent rounded-lg border border-accent/30 shadow-sm">
                <div className="space-y-2">
                  <Label htmlFor="tournee-name" className="text-xs font-semibold text-accent">Nom de la tournée</Label>
                  <Input
                    id="tournee-name"
                    placeholder="Ex: Tournée Sud"
                    value={tourneeName}
                    onChange={(e) => setTourneeName(e.target.value)}
                    className="h-9 text-sm border-accent/30 focus:border-accent focus:ring-accent/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tournee-date" className="text-xs font-semibold text-accent">Date</Label>
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
                {selectedSites.length > 0 && (
                  <div className="text-xs bg-accent/10 text-accent font-semibold rounded-lg px-3 py-2 border border-accent/20">
                    {selectedSites.length} entreprise(s) sélectionnée(s)
                  </div>
                )}
                <Button
                  onClick={handleOptimize}
                  disabled={selectedSites.length < 2 || isOptimizing || !tourneeName.trim()}
                  className="w-full h-9 text-xs bg-gradient-to-r from-accent via-accent to-accent/80 transition-colors disabled:opacity-50"
                  size="sm"
                >
                  <Route className="w-3.5 h-3.5 mr-2" />
                  {isOptimizing ? "Optimisation..." : "Optimiser la tournée"}
                </Button>
              </div>
            )}
          </div>

          <NafFilters
            filters={nouveauxSitesFilters}
            setFilters={setNouveauxSitesFilters}
            resultsCount={nouveauxSitesFilteredCount}
            totalCount={nouveauxSitesTotalCount}
          />
        </div>

        {/* Content - Liste */}
        <div className="flex-1 overflow-hidden min-h-0 glass-card">
          <NouveauxSitesListView
            filters={nouveauxSitesFilters}
            onSiteSelect={onEntrepriseSelect}
            selectionMode={tourneeActive}
            selectedSites={selectedSites}
            onToggleSelection={toggleSite}
          />
        </div>
      </div>
    </div>
  );
};

export default ProspectsView;
export { ProspectsView };
