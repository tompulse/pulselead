import { NouveauxSitesListView } from '@/components/dashboard/NouveauxSitesListView';

interface ProspectsViewContainerProps {
  filters: any;
  setFilters: any;
  userId: string;
  onEntrepriseSelect?: (entreprise: any) => void;
  onAIFiltersReady?: (fn: any) => void;
}

export const ProspectsViewContainer = ({ 
  filters, 
  userId, 
  onEntrepriseSelect 
}: ProspectsViewContainerProps) => {
  return (
    <div className="h-full overflow-hidden">
      <NouveauxSitesListView
        filters={filters}
        userId={userId}
        onEntrepriseSelect={onEntrepriseSelect}
      />
    </div>
  );
};
