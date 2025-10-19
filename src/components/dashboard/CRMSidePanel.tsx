import { useState, useEffect } from "react";
import { X, MessageSquare, Loader2, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="w-[400px] bg-background border-l border-accent/20 flex flex-col h-full shadow-2xl">
      {/* Header with gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent" />
        <div className="relative p-6 border-b border-accent/20">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 pr-2">
              <h3 className="font-bold text-xl gradient-text mb-1">{entreprise.nom}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {entreprise.ville || entreprise.code_postal}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0 hover:bg-accent/20 rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          {leadStatus && (
            <div className="flex items-center gap-2">
              <LeadStatusBadge 
                statut={leadStatus.statut_actuel} 
                probabilite={leadStatus.probabilite}
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Quick Actions Card */}
          <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <MessageSquare className="h-4 w-4 text-accent" />
                </div>
                <h4 className="font-semibold">Actions rapides</h4>
              </div>
              <QuickActionButtons 
                entrepriseId={entreprise.id} 
                onInteractionAdded={fetchCRMData}
              />
            </CardContent>
          </Card>

          <Separator className="bg-accent/20" />

          {/* Timeline Card */}
          <Card className="border-accent/20">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Calendar className="h-4 w-4 text-accent" />
                </div>
                <h4 className="font-semibold">Historique des interactions</h4>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              ) : (
                <InteractionTimeline interactions={interactions} />
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};
