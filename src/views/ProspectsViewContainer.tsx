import { NouveauxSitesListView } from '@/components/dashboard/NouveauxSitesListView';
import { NafFilters } from '@/components/dashboard/NafFilters';
import { MobileFiltersBar } from '@/components/dashboard/MobileFiltersBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInfiniteQuery } from '@tanstack/react-query';
import { nouveauxSitesService } from '@/services/nouveauxSitesService';

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

  const activeFiltersCount = 
    (filters.nafSections?.length || 0) + 
    (filters.nafDivisions?.length || 0) +
    (filters.departments?.length || 0) +
    (filters.taillesEntreprise?.length || 0);

  return (
    <div className="h-full flex flex-col overflow-y-auto lg:overflow-hidden">
      {/* Compteur de résultats visible en haut */}
      <div className="px-4 py-2 bg-accent/5 border-b border-accent/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{totalCount.toLocaleString('fr-FR')}</span>
          <span className="text-sm text-muted-foreground">entreprise{totalCount > 1 ? 's' : ''}</span>
          {activeFiltersCount > 0 && (
            <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Mobile filters bar */}
      <MobileFiltersBar
        filters={filters}
        setFilters={setFilters}
        resultsCount={resultsCount}
        totalCount={totalCount}
      />
      
      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:overflow-hidden p-4">
        {/* Sidebar Filtres NAF - Desktop & Tablet */}
        <div className="w-64 lg:w-80 shrink-0 glass-card rounded-xl border border-accent/20 overflow-hidden hidden md:block">
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
        <div className="flex-1 lg:overflow-hidden">
          <NouveauxSitesListView
            filters={filters}
            onSiteSelect={onEntrepriseSelect}
          />
        </div>
      </div>
    </div>
  );
};