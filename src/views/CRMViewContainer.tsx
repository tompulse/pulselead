import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Calendar, RotateCcw, Users } from 'lucide-react';

interface CRMViewContainerProps {
  userId: string;
  onEntrepriseSelect?: (entrepriseId: string) => void;
}

const PIPELINE_STAGES = [
  { key: 'nouveau', label: 'Nouveau', color: 'bg-gray-500' },
  { key: 'contacte', label: 'Contacté', color: 'bg-blue-500' },
  { key: 'qualifie', label: 'Qualifié', color: 'bg-cyan-500' },
  { key: 'proposition', label: 'Proposition', color: 'bg-purple-500' },
  { key: 'negociation', label: 'Négociation', color: 'bg-orange-500' },
  { key: 'gagne', label: 'Signé', color: 'bg-green-500' },
];

export const CRMViewContainer = ({ userId, onEntrepriseSelect }: CRMViewContainerProps) => {
  // Fetch lead statuts with entreprise info
  const { data: leadsWithInfo = [] } = useQuery({
    queryKey: ['crm-leads', userId],
    queryFn: async () => {
      const { data: statuts, error } = await supabase
        .from('lead_statuts')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      if (!statuts?.length) return [];

      // Fetch entreprise names
      const ids = statuts.map(s => s.entreprise_id);
      const { data: sites } = await supabase
        .from('nouveaux_sites')
        .select('id, nom, ville')
        .in('id', ids);

      const siteMap = new Map(sites?.map(s => [s.id, s]) || []);
      return statuts.map(s => ({
        ...s,
        nom: siteMap.get(s.entreprise_id)?.nom || 'Entreprise',
        ville: siteMap.get(s.entreprise_id)?.ville || '',
      }));
    },
  });

  // Fetch interaction counts
  const { data: interactions = [] } = useQuery({
    queryKey: ['crm-interactions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_interactions')
        .select('type')
        .eq('user_id', userId);
      if (error) throw error;
      return data || [];
    },
  });

  const visiteCount = interactions.filter(i => i.type === 'visite').length;
  const rdvCount = interactions.filter(i => i.type === 'rdv').length;
  const aRevoirCount = interactions.filter(i => i.type === 'a_revoir' || i.type === 'autre').length;

  const getLeadsByStage = (stageKey: string) => leadsWithInfo.filter(l => l.statut === stageKey);

  return (
    <div className="h-full flex flex-col overflow-hidden p-4 space-y-6">
      {/* Activities Section */}
      <div>
        <h3 className="text-accent font-semibold mb-4">Activités</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card border-accent/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Visites</p>
              <p className="text-4xl font-bold text-accent">{visiteCount}</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-purple-500/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">RDV</p>
              <p className="text-4xl font-bold text-purple-400">{rdvCount}</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-orange-500/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                <RotateCcw className="w-6 h-6 text-orange-400" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">À revoir</p>
              <p className="text-4xl font-bold text-orange-400">{aRevoirCount}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pipeline Section */}
      <div className="flex-1 overflow-hidden">
        <h3 className="text-accent font-semibold mb-4">Pipeline</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 h-[calc(100%-32px)]">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = getLeadsByStage(stage.key);
            return (
              <Card key={stage.key} className="glass-card border-accent/20 flex flex-col">
                <div className="p-3 border-b border-accent/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                    <span className="font-medium text-sm">{stage.label}</span>
                  </div>
                  <Badge variant="secondary" className="bg-accent/10 text-xs">
                    {stageLeads.length}
                  </Badge>
                </div>
                <ScrollArea className="flex-1 p-2">
                  <div className="space-y-2">
                    {stageLeads.map((lead) => (
                      <div 
                        key={lead.id}
                        onClick={() => onEntrepriseSelect?.(lead.entreprise_id)}
                        className="p-2 rounded-lg bg-card/80 border border-accent/10 hover:border-accent/30 cursor-pointer transition-colors"
                      >
                        <p className="font-medium text-sm truncate">{lead.nom}</p>
                        <p className="text-xs text-muted-foreground truncate">{lead.ville}</p>
                      </div>
                    ))}
                    {stageLeads.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">—</p>
                    )}
                  </div>
                </ScrollArea>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
