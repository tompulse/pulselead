import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const SuiviView = lazy(() => import('@/components/dashboard/SuiviView').then(m => ({ default: m.SuiviView })));

export const SuiviViewContainer = ({ userId }: { userId: string }) => {
  return (
    <Suspense fallback={
      <div className="p-2 md:p-6 space-y-3 md:space-y-8">
        <Skeleton className="h-8 md:h-12 w-48 md:w-64 mx-auto" />
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          <Skeleton className="h-32 md:h-48 w-full" />
          <Skeleton className="h-32 md:h-48 w-full" />
          <Skeleton className="h-32 md:h-48 w-full" />
          <Skeleton className="h-32 md:h-48 w-full" />
        </div>
        <Skeleton className="h-6 md:h-8 w-32 md:w-48" />
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
          <Skeleton className="h-24 md:h-32 w-full" />
          <Skeleton className="h-24 md:h-32 w-full" />
          <Skeleton className="h-24 md:h-32 w-full" />
        </div>
      </div>
    }>
      <SuiviView userId={userId} />
    </Suspense>
  );
};
