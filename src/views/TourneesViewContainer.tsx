import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const TourneesView = lazy(() => import('@/components/dashboard/TourneesView').then(m => ({ default: m.TourneesView })));

export const TourneesViewContainer = ({ userId }: { userId: string }) => {
  return (
    <Suspense fallback={
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    }>
      <TourneesView />
    </Suspense>
  );
};
