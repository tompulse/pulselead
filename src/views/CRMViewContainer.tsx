import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Calendar, RotateCcw, Building2 } from 'lucide-react';

interface LeadWithSite {
  id: string;
  entreprise_id: string;
  statut: string;
  score: number | null;
  notes: string | null;
  updated_at: string;
  site?: {
    id: string;
    nom: string;
    ville: string | null;
    code_naf: string | null;
  };
}

const PIPELINE_STAGES = [
  { key: 'nouveau', label: 'Nouveau', color: 'bg-blue-500' },
  { key: 'contacte', label: 'Contacté', color: 'bg-yellow-500' },
  { key: 'qualifie', label: 'Qualifié', color: 'bg-cyan-500' },
  { key: 'proposition', label: 'Proposition', color: 'bg-purple-500' },
  { key: 'negociation', label: 'Négociation', color: 'bg-orange-500' },
  { key: 'gagne', label: 'Signé', color: 'bg-green-500' },
  { key: 'perdu', label: 'Perdu', color: 'bg-red-500' },
];

export const CRMViewContainer = ({ 
  userId, 
  onEntrepriseSelect 
}: { 
  userId: string; 
  onEntrepriseSelect?: (entrepriseId: string) => void 
}) => {
  // Fetch interactions for activity stats
  const { data: interactions = [] } = useQuery({
    queryKey: ['crm-interactions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('date_interaction', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch lead statuts with company names from nouveaux_sites
  const { data: leadsWithSites = [], isLoading } = useQuery({
    queryKey: ['crm-leads-with-sites', userId],
    queryFn: async () => {
      // First get lead statuts
      const { data: leads, error: leadsError } = await supabase
        .from('lead_statuts')
        .select('*')
        .eq('user_id', userId);
      
      if (leadsError) throw leadsError;
      if (!leads || leads.length === 0) return [];

      // Get unique entreprise_ids
      const entrepriseIds = [...new Set(leads.map(l => l.entreprise_id))];
      
      // Fetch site info for these entreprises
      const { data: sites, error: sitesError } = await supabase
        .from('nouveaux_sites')
        .select('id, nom, ville, code_naf')
        .in('id', entrepriseIds);

      if (sitesError) {
        console.error('Error fetching sites:', sitesError);
      }

      // Merge leads with site info
      const leadsWithSiteInfo: LeadWithSite[] = leads.map(lead => ({
        ...lead,
        site: sites?.find(s => s.id === lead.entreprise_id)
      }));

      return leadsWithSiteInfo;
    },
  });

  // Calculate activity stats from real data
  const visiteCount = interactions.filter(i => i.type === 'visite').length;
  const rdvCount = interactions.filter(i => i.type === 'rdv').length;
  const aRevoirCount = interactions.filter(i => i.type === 'a_revoir' || i.statut === 'a_rappeler').length;

  // Group leads by pipeline stage
  const getLeadsByStage = (stageKey: string): LeadWithSite[] => {
    return leadsWithSites.filter(l => l.statut === stageKey);
  };

  // Only show stages that have leads OR are core stages
  const coreStages = ['proposition', 'negociation', 'gagne'];
  const activeStages = PIPELINE_STAGES.filter(stage => 
    coreStages.includes(stage.key) || getLeadsByStage(stage.key).length > 0
  );

  return (
    <div className="h-full flex flex-col overflow-hidden p-4 space-y-6">
      {/* Activities Section */}
      <div>
        <h3 className="text-accent font-semibold mb-4">Activités</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Visites */}
          <Card className="glass-card border-accent/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Visites</p>
              <p className="text-4xl font-bold text-accent">{visiteCount}</p>
            </CardContent>
          </Card>

          {/* RDV */}
          <Card className="glass-card border-purple-500/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">RDV</p>
              <p className="text-4xl font-bold text-purple-400">{rdvCount}</p>
            </CardContent>
          </Card>

          {/* À revoir */}
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
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
          </div>
        ) : leadsWithSites.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Aucun lead dans le pipeline</p>
            <p className="text-sm mt-1">Ajoutez des interactions depuis les fiches entreprises</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100%-32px)]">
            {activeStages.map((stage) => {
              const stageLeads = getLeadsByStage(stage.key);
              return (
                <Card key={stage.key} className="glass-card border-accent/20 flex flex-col">
                  <div className="p-4 border-b border-accent/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      <span className="font-semibold">{stage.label}</span>
                    </div>
                    <Badge variant="secondary" className="bg-accent/10">
                      {stageLeads.length}
                    </Badge>
                  </div>
                  <ScrollArea className="flex-1 p-3">
                    <div className="space-y-3">
                      {stageLeads.map((lead) => (
                        <div 
                          key={lead.id}
                          onClick={() => onEntrepriseSelect?.(lead.entreprise_id)}
                          className="p-3 rounded-lg bg-card/80 border border-accent/10 hover:border-accent/30 cursor-pointer transition-colors"
                        >
                          <p className="font-medium truncate">
                            {lead.site?.nom || 'Entreprise inconnue'}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {lead.site?.ville || '—'}
                          </p>
                          {lead.score !== null && lead.score > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-accent/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-accent rounded-full transition-all"
                                  style={{ width: `${lead.score}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">{lead.score}%</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {stageLeads.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Aucun lead
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
