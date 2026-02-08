import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, RotateCcw, FileText, CheckCircle2, XCircle, Phone, MessageSquare } from 'lucide-react';
import { ActivityDetailSheet } from '@/components/dashboard/ActivityDetailSheet';
import { PipelineDetailSheet } from '@/components/dashboard/PipelineDetailSheet';
import { NotesDetailSheet } from '@/components/dashboard/NotesDetailSheet';
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
] as const;

type PipelineStageKey = typeof OFFER_STAGES[number]['key'];

export const CRMViewContainer = ({ 
  userId, 
  onEntrepriseSelect 
}: { 
  userId: string; 
  onEntrepriseSelect?: (entrepriseId: string) => void 
}) => {
  const [selectedActivity, setSelectedActivity] = useState<'rdv' | 'a_revoir' | 'a_rappeler' | null>(null);
  const [selectedPipelineStage, setSelectedPipelineStage] = useState<PipelineStageKey | null>(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
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
  const aRappelerCount = interactions.filter(i => i.type === 'appel' && i.statut === 'a_rappeler').length;
  const rdvCount = interactions.filter(i => i.type === 'rdv').length;
  const aRevoirCount = interactions.filter(i => i.type === 'a_revoir').length;
  const notesCount = interactions.filter(i => i.notes && i.notes.trim() !== '').length;

  // Map stage keys to database statuts
  const stageToStatutMap: Record<string, string> = {
    'devis_a_faire': 'proposition',
    'devis_accepte': 'gagne',
    'devis_refuse': 'perdu',
  };

  // Count offers by stage
  const getOfferCountByStage = (stageKey: string): number => {
    const dbStatut = stageToStatutMap[stageKey] || stageKey;
    return leadsWithSites.filter(l => l.statut === dbStatut).length;
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
    <div className="h-full flex flex-col p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Activities Section */}
      <div className="flex-1 flex flex-col mb-4 md:mb-6">
        <h3 className="text-accent font-semibold mb-3 md:mb-4 text-sm md:text-base">Activités</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {/* A rappeler */}
          <Card 
            className="glass-card border-blue-500/20 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98]"
            onClick={() => setSelectedActivity('a_rappeler')}
            role="button"
            tabIndex={0}
            aria-label={`Voir les ${aRappelerCount} entreprises à rappeler`}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedActivity('a_rappeler')}
          >
            <CardContent className="p-3 sm:p-4 md:p-6 text-center flex flex-col justify-center items-center">
              <div className="w-10 h-10 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                <Phone className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-400" aria-hidden="true" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1 whitespace-nowrap">A rappeler</p>
              <p className="text-2xl sm:text-2xl md:text-3xl font-bold text-blue-400">{aRappelerCount}</p>
            </CardContent>
          </Card>

          {/* À revoir */}
          <Card 
            className="glass-card border-orange-500/20 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/10 active:scale-[0.98]"
            onClick={() => setSelectedActivity('a_revoir')}
            role="button"
            tabIndex={0}
            aria-label={`Voir les ${aRevoirCount} entreprises à revoir`}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedActivity('a_revoir')}
          >
            <CardContent className="p-3 sm:p-4 md:p-6 text-center flex flex-col justify-center items-center">
              <div className="w-10 h-10 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-2">
                <RotateCcw className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-orange-400" aria-hidden="true" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1 whitespace-nowrap">À revoir</p>
              <p className="text-2xl sm:text-2xl md:text-3xl font-bold text-orange-400">{aRevoirCount}</p>
            </CardContent>
          </Card>

          {/* RDV */}
          <Card 
            className="glass-card border-green-500/20 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/10 active:scale-[0.98]"
            onClick={() => setSelectedActivity('rdv')}
            role="button"
            tabIndex={0}
            aria-label={`Voir les ${rdvCount} rendez-vous`}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedActivity('rdv')}
          >
            <CardContent className="p-3 sm:p-4 md:p-6 text-center flex flex-col justify-center items-center">
              <div className="w-10 h-10 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                <Calendar className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-400" aria-hidden="true" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">RDV</p>
              <p className="text-2xl sm:text-2xl md:text-3xl font-bold text-green-400">{rdvCount}</p>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card 
            className="glass-card border-yellow-500/20 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-500/10 active:scale-[0.98]"
            onClick={() => setIsNotesOpen(true)}
            role="button"
            tabIndex={0}
            aria-label={`Voir les ${notesCount} notes`}
            onKeyDown={(e) => e.key === 'Enter' && setIsNotesOpen(true)}
          >
            <CardContent className="p-3 sm:p-4 md:p-6 text-center flex flex-col justify-center items-center">
              <div className="w-10 h-10 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-2">
                <MessageSquare className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-400" aria-hidden="true" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Notes</p>
              <p className="text-2xl sm:text-2xl md:text-3xl font-bold text-yellow-400">{notesCount}</p>
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

      {/* Notes Detail Sheet */}
      <NotesDetailSheet
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        userId={userId}
        onEntrepriseSelect={onEntrepriseSelect}
      />

      {/* Pipeline Section */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-accent font-semibold mb-3 md:mb-4 text-sm md:text-base">Pipeline</h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          {OFFER_STAGES.map((stage) => {
            const Icon = stage.icon;
            const count = getOfferCountByStage(stage.key);
            
            return (
              <Card 
                key={stage.key}
                className={`glass-card ${stage.borderColor} cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]`}
                onClick={() => setSelectedPipelineStage(stage.key)}
                role="button"
                tabIndex={0}
                aria-label={`Voir les ${count} leads ${stage.label}`}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedPipelineStage(stage.key)}
              >
                <CardContent className="p-3 sm:p-4 md:p-6 text-center flex flex-col justify-center items-center">
                  <div className={`w-10 h-10 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full ${stage.bgColor} flex items-center justify-center mb-2`}>
                    <Icon className={`w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 ${stage.color}`} aria-hidden="true" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 leading-tight">{stage.label}</p>
                  <p className={`text-2xl sm:text-2xl md:text-3xl font-bold ${stage.color}`}>{count}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Pipeline Detail Sheet */}
      <PipelineDetailSheet
        isOpen={selectedPipelineStage !== null}
        onClose={() => setSelectedPipelineStage(null)}
        stageKey={selectedPipelineStage}
        userId={userId}
        onEntrepriseSelect={onEntrepriseSelect}
      />
    </div>
  );
};