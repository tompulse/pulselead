import { lazy, Suspense } from 'react';
import { ListViewSkeleton } from '@/components/dashboard/LoadingSkeleton';

const ListView = lazy(() => import('@/components/dashboard/ListView').then(m => ({ default: m.ListView })));

interface ListViewContainerProps {
  filters: any;
  userId: string;
  onEntrepriseSelect: (entreprise: any) => void;
  tourneeMode?: boolean;
  selectedEntreprises?: any[];
  onToggleSelection?: (entreprise: any) => void;
}

export const ListViewContainer = (props: ListViewContainerProps) => {
  return (
    <Suspense fallback={<ListViewSkeleton />}>
      <ListView {...props} />
    </Suspense>
  );
};
