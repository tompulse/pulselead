import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const SuiviView = lazy(() => import('@/components/dashboard/SuiviView').then(m => ({ default: m.SuiviView })));

export const CRMViewContainer = ({ userId, onEntrepriseSelect }: { userId: string; onEntrepriseSelect?: (entrepriseId: string) => void }) => {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Suspense fallback={
        <div className="p-2 space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      }>
        <SuiviView userId={userId} onEntrepriseClick={onEntrepriseSelect} />
      </Suspense>
    </div>
  );
};
