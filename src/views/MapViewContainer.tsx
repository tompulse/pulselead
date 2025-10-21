import { lazy, Suspense } from 'react';
import { MapViewSkeleton } from '@/components/dashboard/LoadingSkeleton';

const MapView = lazy(() => import('@/components/dashboard/MapView').then(m => ({ default: m.MapView })));

interface MapViewContainerProps {
  filters: any;
  userId: string;
  onEntrepriseSelect: (entreprise: any) => void;
  tourneeMode?: boolean;
  selectedEntreprises?: any[];
  onToggleSelection?: (entreprise: any) => void;
}

export const MapViewContainer = (props: MapViewContainerProps) => {
  return (
    <Suspense fallback={<MapViewSkeleton />}>
      <MapView {...props} />
    </Suspense>
  );
};
