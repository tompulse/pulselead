import { lazy, Suspense, Dispatch, SetStateAction } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const ProspectsView = lazy(() => import('@/components/dashboard/ProspectsView').then(m => ({ default: m.ProspectsView })));

interface ProspectsViewContainerProps {
  filters: any;
  setFilters: Dispatch<SetStateAction<any>>;
  userId: string;
  onEntrepriseSelect: (entreprise: any) => void;
  selectionMode?: boolean;
  selectedEntreprises?: any[];
  onToggleSelection?: (entreprise: any) => void;
}

export const ProspectsViewContainer = (props: ProspectsViewContainerProps) => {
  return (
    <Suspense fallback={
      <div className="h-full p-6 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[calc(100vh-180px)] w-full" />
      </div>
    }>
      <ProspectsView {...props} />
    </Suspense>
  );
};
