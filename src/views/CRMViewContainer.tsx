import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Calendar, RotateCcw, Building2, FileText, Send, CheckCircle2, XCircle } from 'lucide-react';
import { ActivityDetailSheet } from '@/components/dashboard/ActivityDetailSheet';
import { toast } from 'sonner';

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
  { key: 'offre_a_faire', label: 'Offre à faire', color: 'bg-indigo-500' },
  { key: 'offre_delivree', label: 'Offre délivrée', color: 'bg-purple-500' },
  { key: 'offre_acceptee', label: 'Offre acceptée', color: 'bg-green-500' },
  { key: 'offre_refusee', label: 'Offre refusée', color: 'bg-red-500' },
];

const OFFER_STAGES = [
  { key: 'offre_a_faire', label: 'Offre à faire', icon: FileText, color: 'text-indigo-400', bgColor: 'bg-indigo-500/20', borderColor: 'border-indigo-500/20' },
  { key: 'offre_delivree', label: 'Offre délivrée', icon: Send, color: 'text-purple-400', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/20' },
  { key: 'offre_acceptee', label: 'Offre acceptée', icon: CheckCircle2, color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/20' },
  { key: 'offre_refusee', label: 'Offre refusée', icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/20' },
];

export const CRMViewContainer = ({ 
  userId, 
  onEntrepriseSelect 
}: { 
  userId: string; 
  onEntrepriseSelect?: (entrepriseId: string) => void 
}) => {
  const [selectedActivity, setSelectedActivity] = useState<'visite' | 'rdv' | 'a_revoir' | null>(null);
  const queryClient = useQueryClient();

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

  // Mutation to update lead status
  const updateLeadStatus = useMutation({
    mutationFn: async ({ leadId, newStatus }: { leadId: string; newStatus: string }) => {
      const { error } = await supabase
        .from('lead_statuts')
        .update({ statut: newStatus, updated_at: new Date().toISOString() })
        .eq('id', leadId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-leads-with-sites', userId] });
      toast.success('Statut mis à jour');
    },
    onError: (error) => {
      console.error('Error updating lead status:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });

  // Calculate activity stats from real data
  const visiteCount = interactions.filter(i => i.type === 'visite').length;
  const rdvCount = interactions.filter(i => i.type === 'rdv').length;
  const aRevoirCount = interactions.filter(i => i.type === 'a_revoir' || i.statut === 'a_rappeler').length;

  // Count offers by stage
  const getOfferCountByStage = (stageKey: string): number => {
    return leadsWithSites.filter(l => l.statut === stageKey).length;
  };

  // Handle offer stage toggle
  const handleOfferStageToggle = (lead: LeadWithSite, stageKey: string) => {
    // If already in this stage, move back to 'qualifie', otherwise set to new stage
    const newStatus = lead.statut === stageKey ? 'qualifie' : stageKey;
    updateLeadStatus.mutate({ leadId: lead.id, newStatus });
  };

  // Group leads by pipeline stage
  const getLeadsByStage = (stageKey: string): LeadWithSite[] => {
    return leadsWithSites.filter(l => l.statut === stageKey);
  };

  // Only show stages that have leads OR are core offer stages
  const coreStages = ['offre_a_faire', 'offre_delivree', 'offre_acceptee', 'offre_refusee'];
  const activeStages = PIPELINE_STAGES.filter(stage => 
    coreStages.includes(stage.key) || getLeadsByStage(stage.key).length > 0
  );

  return (
    <div className="h-full flex flex-col overflow-hidden p-4 space-y-6">
      {/* Activities Section */}
      <div>
        <h3 className="text-accent font-semibold mb-4">Activités</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {/* Visites */}
          <Card 
            className="glass-card border-accent/20 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/10"
            onClick={() => setSelectedActivity('visite')}
            role="button"
            tabIndex={0}
            aria-label={`Voir les ${visiteCount} visites`}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedActivity('visite')}
          >
            <CardContent className="p-4 md:p-6 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-2 md:mb-3">
                <MapPin className="w-5 h-5 md:w-6 md:h-6 text-accent" aria-hidden="true" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Visites</p>
              <p className="text-2xl md:text-4xl font-bold text-accent">{visiteCount}</p>
            </CardContent>
          </Card>

          {/* RDV */}
          <Card 
            className="glass-card border-purple-500/20 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10"
            onClick={() => setSelectedActivity('rdv')}
            role="button"
            tabIndex={0}
            aria-label={`Voir les ${rdvCount} rendez-vous`}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedActivity('rdv')}
          >
            <CardContent className="p-4 md:p-6 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-purple-400" aria-hidden="true" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">RDV</p>
              <p className="text-2xl md:text-4xl font-bold text-purple-400">{rdvCount}</p>
            </CardContent>
          </Card>

          {/* À revoir */}
          <Card 
            className="glass-card border-orange-500/20 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/10"
            onClick={() => setSelectedActivity('a_revoir')}
            role="button"
            tabIndex={0}
            aria-label={`Voir les ${aRevoirCount} entreprises à revoir`}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedActivity('a_revoir')}
          >
            <CardContent className="p-4 md:p-6 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-2 md:mb-3">
                <RotateCcw className="w-5 h-5 md:w-6 md:h-6 text-orange-400" aria-hidden="true" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">À revoir</p>
              <p className="text-2xl md:text-4xl font-bold text-orange-400">{aRevoirCount}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Detail Sheet */}
      <ActivityDetailSheet
        isOpen={selectedActivity !== null}
        onClose={() => setSelectedActivity(null)}
        activityType={selectedActivity}
        userId={userId}
        onEntrepriseSelect={onEntrepriseSelect}
      />

      {/* Offers Progress Section */}
      <div>
        <h3 className="text-accent font-semibold mb-4">Avancement des offres</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {OFFER_STAGES.map((stage) => {
            const Icon = stage.icon;
            const count = getOfferCountByStage(stage.key);
            const leadsInStage = getLeadsByStage(stage.key);
            
            return (
              <Card 
                key={stage.key}
                className={`glass-card ${stage.borderColor} transition-all duration-200`}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${stage.bgColor} flex items-center justify-center mx-auto mb-2 md:mb-3`}>
                    <Icon className={`w-5 h-5 md:w-6 md:h-6 ${stage.color}`} aria-hidden="true" />
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mb-1 line-clamp-1">{stage.label}</p>
                  <p className={`text-2xl md:text-3xl font-bold ${stage.color}`}>{count}</p>
                  
                  {/* Show leads in this stage with checkboxes */}
                  {leadsInStage.length > 0 && (
                    <div className="mt-3 space-y-2 text-left">
                      {leadsInStage.slice(0, 3).map((lead) => (
                        <div 
                          key={lead.id} 
                          className="flex items-center gap-2 p-2 rounded bg-card/50 border border-accent/10"
                        >
                          <Checkbox
                            checked={true}
                            onCheckedChange={() => handleOfferStageToggle(lead, stage.key)}
                            className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                          />
                          <span className="text-xs truncate flex-1">
                            {lead.site?.nom || 'Entreprise'}
                          </span>
                        </div>
                      ))}
                      {leadsInStage.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{leadsInStage.length - 3} autres
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 h-[calc(100%-32px)]">
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
