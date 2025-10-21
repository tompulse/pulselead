import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const SuiviView = lazy(() => import('@/components/dashboard/SuiviView').then(m => ({ default: m.SuiviView })));

export const SuiviViewContainer = ({ userId }: { userId: string }) => {
  return (
    <Suspense fallback={
      <div className="p-6 space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    }>
      <SuiviView userId={userId} />
    </Suspense>
  );
};
