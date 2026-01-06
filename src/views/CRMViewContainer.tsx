import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, RotateCcw, FileText, CheckCircle2, XCircle, Phone } from 'lucide-react';
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

const OFFER_STAGES = [
  { key: 'devis_a_faire', label: 'Devis à faire', icon: FileText, color: 'text-indigo-400', bgColor: 'bg-indigo-500/20', borderColor: 'border-indigo-500/20' },
  { key: 'devis_refuse', label: 'Devis refusé', icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/20' },
  { key: 'devis_accepte', label: 'Devis accepté', icon: CheckCircle2, color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/20' },
];

export const CRMViewContainer = ({ 
  userId, 
  onEntrepriseSelect 
}: { 
  userId: string; 
  onEntrepriseSelect?: (entrepriseId: string) => void 
}) => {
  const [selectedActivity, setSelectedActivity] = useState<'rdv' | 'a_revoir' | 'a_rappeler' | null>(null);
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
  const { data: leadsWithSites = [] } = useQuery({
    queryKey: ['crm-leads-with-sites', userId],
    queryFn: async () => {
      const { data: leads, error: leadsError } = await supabase
        .from('lead_statuts')
        .select('*')
        .eq('user_id', userId);
      
      if (leadsError) throw leadsError;
      if (!leads || leads.length === 0) return [];

      const entrepriseIds = [...new Set(leads.map(l => l.entreprise_id))];
      
      const { data: sites, error: sitesError } = await supabase
        .from('nouveaux_sites')
        .select('id, nom, ville, code_naf')
        .in('id', entrepriseIds);

      if (sitesError) {
        console.error('Error fetching sites:', sitesError);
      }

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
  const aRappelerCount = interactions.filter(i => i.statut === 'a_rappeler').length;
  const rdvCount = interactions.filter(i => i.type === 'rdv').length;
  const aRevoirCount = interactions.filter(i => i.type === 'a_revoir').length;

  // Count offers by stage
  const getOfferCountByStage = (stageKey: string): number => {
    return leadsWithSites.filter(l => l.statut === stageKey).length;
  };

  // Handle offer stage toggle
  const handleOfferStageToggle = (lead: LeadWithSite, stageKey: string) => {
    const newStatus = lead.statut === stageKey ? 'qualifie' : stageKey;
    updateLeadStatus.mutate({ leadId: lead.id, newStatus });
  };

  // Group leads by stage
  const getLeadsByStage = (stageKey: string): LeadWithSite[] => {
    return leadsWithSites.filter(l => l.statut === stageKey);
  };

  return (
    <div className="h-full flex flex-col overflow-auto p-4 space-y-6">
      {/* Activities Section */}
      <div>
        <h3 className="text-accent font-semibold mb-4">Activités</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {/* A rappeler - Left */}
          <Card 
            className="glass-card border-blue-500/20 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10"
            onClick={() => setSelectedActivity('a_rappeler')}
            role="button"
            tabIndex={0}
            aria-label={`Voir les ${aRappelerCount} entreprises à rappeler`}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedActivity('a_rappeler')}
          >
            <CardContent className="p-4 md:p-6 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Phone className="w-5 h-5 md:w-6 md:h-6 text-blue-400" aria-hidden="true" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">A rappeler</p>
              <p className="text-2xl md:text-4xl font-bold text-blue-400">{aRappelerCount}</p>
            </CardContent>
          </Card>

          {/* À revoir - Center */}
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

          {/* RDV - Right */}
          <Card 
            className="glass-card border-green-500/20 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/10"
            onClick={() => setSelectedActivity('rdv')}
            role="button"
            tabIndex={0}
            aria-label={`Voir les ${rdvCount} rendez-vous`}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedActivity('rdv')}
          >
            <CardContent className="p-4 md:p-6 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-green-400" aria-hidden="true" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">RDV</p>
              <p className="text-2xl md:text-4xl font-bold text-green-400">{rdvCount}</p>
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

      {/* Pipeline Section */}
      <div className="flex-1">
        <h3 className="text-accent font-semibold mb-4">Pipeline</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {OFFER_STAGES.map((stage) => {
            const Icon = stage.icon;
            const count = getOfferCountByStage(stage.key);
            const leadsInStage = getLeadsByStage(stage.key);
            
            return (
              <Card 
                key={stage.key}
                className={`glass-card ${stage.borderColor} transition-all duration-200`}
              >
                <CardContent className="p-4 md:p-6 min-h-[280px] flex flex-col">
                  <div className="text-center mb-4">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full ${stage.bgColor} flex items-center justify-center mx-auto mb-3`}>
                      <Icon className={`w-6 h-6 md:w-7 md:h-7 ${stage.color}`} aria-hidden="true" />
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground mb-1">{stage.label}</p>
                    <p className={`text-3xl md:text-4xl font-bold ${stage.color}`}>{count}</p>
                  </div>
                  
                  {/* Show leads in this stage with checkboxes */}
                  <div className="flex-1 space-y-2">
                    {leadsInStage.slice(0, 5).map((lead) => (
                      <div 
                        key={lead.id} 
                        className={`flex items-center gap-2 p-2.5 rounded-lg bg-card/50 border ${stage.borderColor} hover:border-accent/30 transition-colors`}
                      >
                        <Checkbox
                          checked={true}
                          onCheckedChange={() => handleOfferStageToggle(lead, stage.key)}
                          className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                        />
                        <span className="text-sm truncate flex-1">
                          {lead.site?.nom || 'Entreprise'}
                        </span>
                      </div>
                    ))}
                    {leadsInStage.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        +{leadsInStage.length - 5} autres
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};