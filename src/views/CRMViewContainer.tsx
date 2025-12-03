import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PipelineKanban } from '@/components/dashboard/PipelineKanban';
import { LayoutGrid, List } from 'lucide-react';

interface CRMViewContainerProps {
  userId: string;
  onEntrepriseSelect?: (entrepriseId: string) => void;
}

export const CRMViewContainer = ({ userId, onEntrepriseSelect }: CRMViewContainerProps) => {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  const handleEntrepriseSelect = (entrepriseId: string) => {
    onEntrepriseSelect?.(entrepriseId);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-2">
        <Tabs value={view} onValueChange={(v) => setView(v as 'kanban' | 'list')}>
          <TabsList className="grid grid-cols-2 w-[180px]">
            <TabsTrigger value="kanban" className="flex items-center gap-1.5">
              <LayoutGrid className="w-4 h-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-1.5">
              <List className="w-4 h-4" />
              Liste
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden">
        {view === 'kanban' ? (
          <PipelineKanban 
            userId={userId} 
            onEntrepriseSelect={handleEntrepriseSelect}
          />
        ) : (
          <PipelineKanban 
            userId={userId} 
            onEntrepriseSelect={handleEntrepriseSelect}
          />
        )}
      </div>
    </div>
  );
};
