import { lazy, Suspense, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, BarChart3 } from 'lucide-react';

const SuiviView = lazy(() => import('@/components/dashboard/SuiviView').then(m => ({ default: m.SuiviView })));
const PipelineKanban = lazy(() => import('@/components/dashboard/PipelineKanban').then(m => ({ default: m.PipelineKanban })));

export const CRMViewContainer = ({ userId, onEntrepriseSelect }: { userId: string; onEntrepriseSelect?: (entrepriseId: string) => void }) => {
  const [activeTab, setActiveTab] = useState('suivi');

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="glass-card border-b border-accent/20 px-2 py-1.5 shrink-0">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-accent/5 h-8">
            <TabsTrigger value="suivi" className="flex items-center gap-2 text-xs">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Suivi</span>
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="flex items-center gap-2 text-xs">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="suivi" className="flex-1 overflow-hidden m-0">
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
        </TabsContent>

        <TabsContent value="pipeline" className="flex-1 overflow-hidden m-0">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <Skeleton className="h-12 w-64" />
            </div>
          }>
            <PipelineKanban onLeadSelect={onEntrepriseSelect} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
};
