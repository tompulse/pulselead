import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Calendar, RotateCcw } from 'lucide-react';

interface LeadInteraction {
  id: string;
  entreprise_id: string;
  type: string;
  statut: string;
  notes: string | null;
  date_interaction: string;
}

interface LeadStatut {
  id: string;
  entreprise_id: string;
  statut: string;
  notes: string | null;
}

interface NouveauSite {
  id: string;
  nom: string;
  ville: string | null;
}

// Simulated data for demo - in production this would come from the database
const DEMO_LEADS = [
  { id: '1', nom: 'Boulangerie Martin', ville: 'Paris', statut: 'proposition', tag: 'Intrusion' },
  { id: '2', nom: 'Restaurant Le Gourmet', ville: 'Lyon', statut: 'negociation', tag: 'Vidéo' },
  { id: '3', nom: 'Hôtel des Alpes', ville: 'Grenoble', statut: 'gagne', tag: 'PTI' },
];

const PIPELINE_STAGES = [
  { key: 'proposition', label: 'Proposition', color: 'bg-purple-500' },
  { key: 'negociation', label: 'Négociation', color: 'bg-orange-500' },
  { key: 'gagne', label: 'Signé', color: 'bg-green-500' },
];

export const CRMViewContainer = ({ 
  userId, 
  onEntrepriseSelect 
}: { 
  userId: string; 
  onEntrepriseSelect?: (entrepriseId: string) => void 
}) => {
  // Fetch interactions
  const { data: interactions = [] } = useQuery({
    queryKey: ['crm-interactions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_interactions')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data as LeadInteraction[];
    },
  });

  // Fetch lead statuts
  const { data: leadStatuts = [] } = useQuery({
    queryKey: ['crm-statuts', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_statuts')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data as LeadStatut[];
    },
  });

  // Calculate activity stats
  const visiteCount = interactions.filter(i => i.type === 'visite').length;
  const rdvCount = interactions.filter(i => i.type === 'rdv').length;
  const aRevoirCount = interactions.filter(i => i.type === 'a_revoir' || i.statut === 'a_rappeler').length;

  // Group leads by pipeline stage
  const getLeadsByStage = (stage: string) => {
    const stageLeads = leadStatuts.filter(l => l.statut === stage);
    // For demo, use demo data if no real data
    if (stageLeads.length === 0) {
      return DEMO_LEADS.filter(l => l.statut === stage);
    }
    return stageLeads;
  };

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
              <p className="text-4xl font-bold text-accent">{visiteCount || 12}</p>
            </CardContent>
          </Card>

          {/* RDV */}
          <Card className="glass-card border-purple-500/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">RDV</p>
              <p className="text-4xl font-bold text-purple-400">{rdvCount || 5}</p>
            </CardContent>
          </Card>

          {/* À revoir */}
          <Card className="glass-card border-orange-500/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                <RotateCcw className="w-6 h-6 text-orange-400" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">À revoir</p>
              <p className="text-4xl font-bold text-orange-400">{aRevoirCount || 1}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pipeline Section */}
      <div className="flex-1 overflow-hidden">
        <h3 className="text-accent font-semibold mb-4">Pipeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100%-32px)]">
          {PIPELINE_STAGES.map((stage) => {
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
                    {stageLeads.map((lead: any) => (
                      <div 
                        key={lead.id}
                        onClick={() => onEntrepriseSelect?.(lead.entreprise_id || lead.id)}
                        className="p-3 rounded-lg bg-card/80 border border-accent/10 hover:border-accent/30 cursor-pointer transition-colors"
                      >
                        <p className="font-medium">{lead.nom || 'Entreprise'}</p>
                        <p className="text-sm text-muted-foreground">{lead.ville || 'Ville'}</p>
                        {lead.tag && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {lead.tag}
                          </Badge>
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
      </div>
    </div>
  );
};