import { useState, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Route, X } from "lucide-react";
import { nouveauxSitesService, NouveauxSitesFilters } from "@/services/nouveauxSitesService";
import { NouveauxSitesListView } from "@/components/dashboard/NouveauxSitesListView";
import { NafFilters } from "@/components/dashboard/NafFilters";
import { MobileFiltersBar } from "@/components/dashboard/MobileFiltersBar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TourneeCreationModal } from "@/components/dashboard/TourneeCreationModal";

interface NouveauSite {
  id: string;
  nom: string;
  ville: string | null;
  code_postal: string | null;
  latitude: number | null;
  longitude: number | null;
  adresse: string | null;
}

interface ProspectsViewContainerProps {
  filters: NouveauxSitesFilters;
  setFilters: React.Dispatch<React.SetStateAction<NouveauxSitesFilters>>;
  userId: string;
  onEntrepriseSelect?: (entrepriseId: string) => void;
  onAIFiltersReady?: (callback: (filters: Partial<NouveauxSitesFilters>) => void) => void;
  onSwitchToTournees?: () => void;
}

export const ProspectsViewContainer = ({
  filters,
  setFilters,
  userId,
  onEntrepriseSelect,
  onAIFiltersReady,
  onSwitchToTournees,
}: ProspectsViewContainerProps) => {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedSites, setSelectedSites] = useState<NouveauSite[]>([]);
  const [showCreationModal, setShowCreationModal] = useState(false);

  // Fetch for total count
  const { data } = useInfiniteQuery({
    queryKey: ['nouveaux-sites', filters],
    queryFn: ({ pageParam = 0 }) => nouveauxSitesService.fetchNouveauxSites(filters, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });

  const totalCount = data?.pages[0]?.total || 0;

  const handleToggleSelection = useCallback((site: NouveauSite) => {
    setSelectedSites(prev => {
      const exists = prev.find(s => s.id === site.id);
      if (exists) {
        return prev.filter(s => s.id !== site.id);
      }
      return [...prev, site];
    });
  }, []);

  const handleClearSelection = () => {
    setSelectedSites([]);
    setSelectionMode(false);
  };

  const handleCreateTournee = () => {
    if (selectedSites.length < 2) {
      return;
    }
    setShowCreationModal(true);
  };

  const handleTourneeCreated = () => {
    handleClearSelection();
    onSwitchToTournees?.();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Tournee creation bar - visible when selection mode active */}
      {selectionMode && (
        <div className="flex items-center justify-between gap-4 p-3 bg-accent/10 border-b border-accent/30">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-accent/20">
              {selectedSites.length} sélectionné{selectedSites.length > 1 ? 's' : ''}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearSelection}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Annuler
            </Button>
          </div>
          <Button 
            onClick={handleCreateTournee}
            disabled={selectedSites.length < 2}
            className="bg-accent hover:bg-accent/90"
          >
            <Route className="w-4 h-4 mr-2" />
            Créer tournée ({selectedSites.length})
          </Button>
        </div>
      )}

      {/* Mobile filters bar */}
      <MobileFiltersBar
        filters={filters}
        setFilters={setFilters}
        resultsCount={totalCount}
        totalCount={totalCount}
      />
      
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Sidebar Filtres NAF - Desktop only */}
        <div className="w-80 shrink-0 glass-card rounded-xl border border-accent/20 overflow-hidden hidden lg:block">
          <ScrollArea className="h-full">
            {/* Button to enable selection mode */}
            <div className="p-4 border-b border-accent/20">
              <Button 
                onClick={() => setSelectionMode(!selectionMode)}
                variant={selectionMode ? "secondary" : "outline"}
                className="w-full border-accent/30"
              >
                <Route className="w-4 h-4 mr-2" />
                {selectionMode ? "Mode sélection actif" : "Créer une tournée"}
              </Button>
            </div>
            <NafFilters
              filters={filters}
              setFilters={setFilters}
              resultsCount={totalCount}
              totalCount={totalCount}
            />
          </ScrollArea>
        </div>

        {/* Liste des sites */}
        <div className="flex-1 overflow-hidden">
          <NouveauxSitesListView
            filters={filters}
            onSiteSelect={onEntrepriseSelect}
            selectionMode={selectionMode}
            selectedSites={selectedSites}
            onToggleSelection={handleToggleSelection}
          />
        </div>
      </div>

      {/* Modal de création de tournée */}
      <TourneeCreationModal
        isOpen={showCreationModal}
        onClose={() => setShowCreationModal(false)}
        selectedSites={selectedSites}
        userId={userId}
        onSuccess={handleTourneeCreated}
      />
    </div>
  );
};
