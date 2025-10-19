import { useEffect, useState } from "react";
import { Phone, Mail, MapPin, TrendingUp, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface CompactStatsProps {
  userId: string;
}

export const CompactStats = ({ userId }: CompactStatsProps) => {
  const [stats, setStats] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: interactions } = await supabase
        .from('lead_interactions')
        .select('type')
        .eq('user_id', userId)
        .gte('created_at', today.toISOString());

      const { data: statuts } = await supabase
        .from('lead_statuts')
        .select('statut_actuel')
        .eq('user_id', userId);

      const interactions_today = {
        appels: interactions?.filter(i => i.type === 'appel').length || 0,
        emails: interactions?.filter(i => i.type === 'email').length || 0,
        visites: interactions?.filter(i => i.type === 'visite').length || 0,
      };

      const leads_by_status = {
        qualifie: statuts?.filter(s => s.statut_actuel === 'qualifie').length || 0,
        proposition: statuts?.filter(s => s.statut_actuel === 'proposition').length || 0,
        negociation: statuts?.filter(s => s.statut_actuel === 'negociation').length || 0,
      };

      setStats({ 
        total_interactions: interactions?.length || 0,
        interactions_today,
        leads_by_status 
      });
    };

    fetchStats();
  }, [userId]);

  if (!stats) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="glass-card border-b border-accent/20 px-3 py-2">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Activité: {stats.total_interactions}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">
                  Pipeline: {stats.leads_by_status.qualifie + stats.leads_by_status.proposition + stats.leads_by_status.negociation}
                </span>
              </div>
            </div>
            <ChevronDown className={`h-4 w-4 text-accent transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-accent/5 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Phone className="h-3 w-3" />
                <span className="text-xs text-muted-foreground">Appels</span>
              </div>
              <p className="text-lg font-bold">{stats.interactions_today.appels}</p>
            </div>
            <div className="text-center p-2 bg-accent/5 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Mail className="h-3 w-3" />
                <span className="text-xs text-muted-foreground">Emails</span>
              </div>
              <p className="text-lg font-bold">{stats.interactions_today.emails}</p>
            </div>
            <div className="text-center p-2 bg-accent/5 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MapPin className="h-3 w-3" />
                <span className="text-xs text-muted-foreground">Visites</span>
              </div>
              <p className="text-lg font-bold">{stats.interactions_today.visites}</p>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
