import { useState, useEffect } from 'react';
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

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Mobile filters bar */}
      <MobileFiltersBar
        filters={filters}
        setFilters={setFilters}
        resultsCount={resultsCount}
        totalCount={totalCount}
      />
      
      <div className="flex-1 flex gap-4 overflow-hidden">
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
          />
        </div>
      </div>
    </div>
  );
};