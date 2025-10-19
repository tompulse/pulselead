import { useState, useEffect } from "react";
import { X, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { InteractionTimeline } from "./InteractionTimeline";
import { QuickActionButtons } from "./QuickActionButtons";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CRMSidePanelProps {
  entreprise: {
    id: string;
    nom: string;
    ville?: string;
    code_postal?: string;
  } | null;
  onClose: () => void;
}

export const CRMSidePanel = ({ entreprise, onClose }: CRMSidePanelProps) => {
  const [interactions, setInteractions] = useState<any[]>([]);
  const [leadStatus, setLeadStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entreprise) return;
    fetchCRMData();
  }, [entreprise]);

  const fetchCRMData = async () => {
    if (!entreprise) return;
    
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: interactionsData } = await supabase
      .from('lead_interactions')
      .select('*')
      .eq('entreprise_id', entreprise.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setInteractions(interactionsData || []);

    const { data: statusData } = await supabase
      .from('lead_statuts')
      .select('*')
      .eq('entreprise_id', entreprise.id)
      .eq('user_id', user.id)
      .single();

    setLeadStatus(statusData);
    setLoading(false);
  };

  if (!entreprise) return null;

  return (
    <div className="w-80 glass-card border-l border-accent/20 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-accent/20">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 pr-2">
            <h3 className="font-bold text-lg truncate">{entreprise.nom}</h3>
            <p className="text-sm text-muted-foreground">
              {entreprise.ville || entreprise.code_postal}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {leadStatus && (
          <LeadStatusBadge 
            statut={leadStatus.statut_actuel} 
            probabilite={leadStatus.probabilite}
          />
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Quick Actions */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-accent" />
              Actions rapides
            </h4>
            <QuickActionButtons 
              entrepriseId={entreprise.id} 
              onInteractionAdded={fetchCRMData}
            />
          </div>

          <Separator className="bg-accent/20" />

          {/* Timeline */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Historique</h4>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : (
              <InteractionTimeline interactions={interactions} />
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
