import { useState } from 'react';
import { NouveauxSitesListView } from '@/components/dashboard/NouveauxSitesListView';
import { NafFilters } from '@/components/dashboard/NafFilters';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [totalCount, setTotalCount] = useState(0);
  const [resultsCount, setResultsCount] = useState(0);

  return (
    <div className="h-full flex gap-4 overflow-hidden">
      {/* Sidebar Filtres NAF */}
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
  );
};
