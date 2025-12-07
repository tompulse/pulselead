import { useState } from 'react';
import { NouveauxSitesListView } from '@/components/dashboard/NouveauxSitesListView';
import { NafFilters } from '@/components/dashboard/NafFilters';
import { MobileFiltersBar } from '@/components/dashboard/MobileFiltersBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useInfiniteQuery } from '@tanstack/react-query';
import { nouveauxSitesService } from '@/services/nouveauxSitesService';
import { TourneeCreationModal } from '@/components/dashboard/TourneeCreationModal';
import { Route, X, CheckSquare } from 'lucide-react';

interface ProspectsViewContainerProps {
  filters: any;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  userId: string;
  onEntrepriseSelect?: (entreprise: any) => void;
  onAIFiltersReady?: (fn: any) => void;
}

export const ProspectsViewContainer = ({ 
  filters, 
  setFilters,
  userId,
  onEntrepriseSelect 
}: ProspectsViewContainerProps) => {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedSites, setSelectedSites] = useState<any[]>([]);
  const [showTourneeModal, setShowTourneeModal] = useState(false);

  // Fetch count for filters display
  const { data } = useInfiniteQuery({
    queryKey: ['nouveaux-sites', filters],
    queryFn: ({ pageParam = 0 }) => nouveauxSitesService.fetchNouveauxSites(filters, pageParam),
    getNextPageParam: (lastPage) => lastPage.hasMore ? 1 : undefined,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });

  const totalCount = data?.pages[0]?.total || 0;
  const resultsCount = data?.pages[0]?.total || 0;

  const toggleSiteSelection = (site: any) => {
    setSelectedSites(prev => {
      const exists = prev.find(s => s.id === site.id);
      if (exists) {
        return prev.filter(s => s.id !== site.id);
      }
      return [...prev, site];
    });
  };

  const clearSelection = () => {
    setSelectedSites([]);
    setSelectionMode(false);
  };

  const handleTourneeSuccess = () => {
    setShowTourneeModal(false);
    clearSelection();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Selection mode bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-4 border-b border-accent/20">
        <div className="flex items-center gap-3">
          <Button
            variant={selectionMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (selectionMode) {
                clearSelection();
              } else {
                setSelectionMode(true);
              }
            }}
            className={selectionMode ? "bg-accent text-primary" : "border-accent/30"}
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            {selectionMode ? 'Annuler' : 'Sélectionner'}
          </Button>
          
          {selectionMode && selectedSites.length > 0 && (
            <>
              <span className="text-sm text-muted-foreground">
                {selectedSites.length} site{selectedSites.length > 1 ? 's' : ''} sélectionné{selectedSites.length > 1 ? 's' : ''}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSites([])}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {selectionMode && selectedSites.length >= 2 && (
          <Button
            onClick={() => setShowTourneeModal(true)}
            className="bg-accent hover:bg-accent/90 text-primary font-semibold"
          >
            <Route className="w-4 h-4 mr-2" />
            Créer une tournée ({selectedSites.length})
          </Button>
        )}
      </div>

      {/* Mobile filters bar */}
      <MobileFiltersBar
        filters={filters}
        setFilters={setFilters}
        resultsCount={resultsCount}
        totalCount={totalCount}
      />
      
      <div className="flex-1 flex gap-4 overflow-hidden p-4">
        {/* Sidebar Filtres NAF - Desktop only */}
        <div className="w-80 shrink-0 glass-card rounded-xl border border-accent/20 overflow-hidden hidden lg:block">
          <ScrollArea className="h-full">
            <NafFilters
              filters={filters}
              setFilters={setFilters}
              resultsCount={resultsCount}
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
            onToggleSelection={toggleSiteSelection}
          />
        </div>
      </div>

      {/* Modal création tournée */}
      <TourneeCreationModal
        open={showTourneeModal}
        onOpenChange={setShowTourneeModal}
        selectedSites={selectedSites}
        userId={userId}
        onSuccess={handleTourneeSuccess}
      />
    </div>
  );
};