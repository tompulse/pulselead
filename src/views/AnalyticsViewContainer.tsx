import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const AnalyticsView = lazy(() => import('@/components/dashboard/AnalyticsView').then(m => ({ default: m.AnalyticsView })));

export const AnalyticsViewContainer = ({ userId }: { userId: string }) => {
  return (
    <Suspense fallback={
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    }>
      <AnalyticsView userId={userId} />
    </Suspense>
  );
};
