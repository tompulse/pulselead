import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const PipelineKanban = lazy(() => import('@/components/dashboard/PipelineKanban').then(m => ({ default: m.PipelineKanban })));

export const PipelineViewContainer = ({ userId }: { userId: string }) => {
  return (
    <Suspense fallback={
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    }>
      <PipelineKanban />
    </Suspense>
  );
};
