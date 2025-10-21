import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const ActivitiesView = lazy(() => import('@/components/dashboard/ActivitiesView').then(m => ({ default: m.ActivitiesView })));

export const ActivitiesViewContainer = ({ userId }: { userId: string }) => {
  return (
    <Suspense fallback={
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    }>
      <ActivitiesView userId={userId} />
    </Suspense>
  );
};
