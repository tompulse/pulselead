import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Building2, MapPin, Phone, Mail, ChevronRight } from 'lucide-react';
import { LeadStatusBadge, LeadStatut, allStatuts, getStatusLabel } from './LeadStatusBadge';
import { useCRMActions } from '@/hooks/useCRMActions';
import { cn } from '@/lib/utils';

interface Entreprise {
  id: string;
  nom: string;
  ville: string | null;
  code_postal: string | null;
  code_naf: string | null;
}

interface LeadWithEntreprise {
  id: string;
  entreprise_id: string;
  statut: LeadStatut;
  score: number;
  notes: string | null;
  entreprise?: Entreprise;
}

interface PipelineKanbanProps {
  userId: string;
  onEntrepriseSelect: (entrepriseId: string) => void;
}

const columnColors: Record<LeadStatut, string> = {
  nouveau: 'border-slate-500/30',
  contacte: 'border-blue-500/30',
  qualifie: 'border-purple-500/30',
  proposition: 'border-orange-500/30',
  negociation: 'border-yellow-500/30',
  gagne: 'border-green-500/30',
  perdu: 'border-red-500/30'
};

export const PipelineKanban = ({ userId, onEntrepriseSelect }: PipelineKanbanProps) => {
  const [leads, setLeads] = useState<LeadWithEntreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const { updateLeadStatus } = useCRMActions(userId);

  useEffect(() => {
    fetchLeads();
  }, [userId]);

  const fetchLeads = async () => {
    try {
      // Fetch all lead statuts for this user
      const { data: leadData, error: leadError } = await supabase
        .from('lead_statuts')
        .select('*')
        .eq('user_id', userId);

      if (leadError) throw leadError;

      if (!leadData || leadData.length === 0) {
        setLeads([]);
        setLoading(false);
        return;
      }

      // Fetch entreprise details for each lead
      const entrepriseIds = leadData.map(l => l.entreprise_id);
      const { data: entreprisesData, error: entError } = await supabase
        .from('nouveaux_sites')
        .select('id, nom, ville, code_postal, code_naf')
        .in('id', entrepriseIds);

      if (entError) throw entError;

      // Merge data
      const merged = leadData.map(lead => ({
        ...lead,
        statut: lead.statut as LeadStatut,
        entreprise: entreprisesData?.find(e => e.id === lead.entreprise_id)
      }));

      setLeads(merged);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatut: LeadStatut) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    const lead = leads.find(l => l.id === leadId);
    
    if (!lead || lead.statut === newStatut) return;

    // Optimistic update
    setLeads(prev => prev.map(l => 
      l.id === leadId ? { ...l, statut: newStatut } : l
    ));

    // Update in database
    await updateLeadStatus(lead.entreprise_id, newStatut);
  };

  const getLeadsByStatus = (statut: LeadStatut) => {
    return leads.filter(l => l.statut === statut);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Building2 className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucun prospect dans le pipeline</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Commencez par ajouter des entreprises depuis l'onglet Prospects. 
          Cliquez sur une entreprise et modifiez son statut pour l'ajouter au pipeline.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-lg font-semibold">Pipeline Commercial</h2>
        <Badge variant="outline" className="border-accent/30">
          {leads.length} prospect{leads.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-3 h-full min-w-max pb-4">
          {allStatuts.map(statut => {
            const columnLeads = getLeadsByStatus(statut);
            return (
              <div
                key={statut}
                className={cn(
                  'w-64 flex-shrink-0 rounded-lg border-2 bg-card/50',
                  columnColors[statut]
                )}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, statut)}
              >
                <div className="p-3 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <LeadStatusBadge statut={statut} />
                    <span className="text-xs text-muted-foreground">
                      {columnLeads.length}
                    </span>
                  </div>
                </div>
                
                <ScrollArea className="h-[calc(100%-48px)]">
                  <div className="p-2 space-y-2">
                    {columnLeads.map(lead => (
                      <Card
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => onEntrepriseSelect(lead.entreprise_id)}
                        className="cursor-grab active:cursor-grabbing hover:border-accent/50 transition-colors glass-card"
                      >
                        <CardContent className="p-3">
                          <h4 className="font-medium text-sm truncate mb-1">
                            {lead.entreprise?.nom || 'Entreprise inconnue'}
                          </h4>
                          {lead.entreprise?.ville && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">
                                {lead.entreprise.code_postal} {lead.entreprise.ville}
                              </span>
                            </div>
                          )}
                          {lead.notes && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {lead.notes}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
