import { useEffect, useState } from "react";
import { TrendingUp, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CompactStatsProps {
  userId: string;
}

export const CompactStats = ({ userId }: CompactStatsProps) => {
  const [stats, setStats] = useState<any>(null);

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
    <div className="glass-card border-b border-accent/20 px-4 md:px-6 py-3">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          <span className="text-base font-semibold">Activité aujourd'hui: <span className="text-accent">{stats.total_interactions}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-accent" />
          <span className="text-base font-semibold">
            Pipeline actif: <span className="text-accent">{stats.leads_by_status.qualifie + stats.leads_by_status.proposition + stats.leads_by_status.negociation}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
