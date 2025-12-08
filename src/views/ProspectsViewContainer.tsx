import { NouveauxSitesListView } from '@/components/dashboard/NouveauxSitesListView';
import { NafFilters } from '@/components/dashboard/NafFilters';
import { MobileFiltersBar } from '@/components/dashboard/MobileFiltersBar';
import { ProspectSearchBar } from '@/components/dashboard/ProspectSearchBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInfiniteQuery } from '@tanstack/react-query';
import { nouveauxSitesService } from '@/services/nouveauxSitesService';
import { useCallback } from 'react';

interface ProspectsViewContainerProps {
  filters: any;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  userId: string;
  onEntrepriseSelect?: (entreprise: any) => void;
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

  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev: any) => ({ ...prev, searchQuery: value }));
  }, [setFilters]);

  return (
    <div className="h-full flex flex-col overflow-y-auto lg:overflow-hidden">
      {/* Barre de recherche proéminente */}
      <div className="px-4 pt-4 pb-2">
        <ProspectSearchBar
          value={filters.searchQuery || ''}
          onChange={handleSearchChange}
          placeholder="🔍 Rechercher une entreprise par nom, ville, SIRET..."
        />
      </div>

      {/* Mobile filters bar */}
      <MobileFiltersBar
        filters={filters}
        setFilters={setFilters}
        resultsCount={resultsCount}
        totalCount={totalCount}
      />
      
      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:overflow-hidden p-4 pt-2">
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
            userId={userId}
          />
        </div>
      </div>
    </div>
  );
};
