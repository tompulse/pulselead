import { DailyActionsWidget } from "./DailyActionsWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Phone, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, startOfMonth } from "date-fns";

interface ActivitiesViewProps {
  userId: string;
  onEntrepriseClick?: (entrepriseId: string) => void;
}

export const ActivitiesView = ({ userId, onEntrepriseClick }: ActivitiesViewProps) => {
  const [stats, setStats] = useState({
    weekCalls: 0,
    weekVisits: 0,
    weekMeetings: 0,
    monthTotal: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const monthStart = startOfMonth(now);

      // Week stats by type
      const { data: weekInteractions } = await supabase
        .from('lead_interactions')
        .select('type')
        .eq('user_id', userId)
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString());

      const weekCalls = weekInteractions?.filter(i => i.type === 'appel').length || 0;
      const weekVisits = weekInteractions?.filter(i => i.type === 'visite').length || 0;
      const weekMeetings = weekInteractions?.filter(i => i.type === 'rdv').length || 0;

      // Month total
      const { count: monthTotal } = await supabase
        .from('lead_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', monthStart.toISOString());

      // Conversion rate (leads won this month / total leads contacted)
      const { count: totalLeads } = await supabase
        .from('lead_statuts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { count: wonLeads } = await supabase
        .from('lead_statuts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('statut_actuel', 'gagne');

      const conversionRate = totalLeads && wonLeads 
        ? Math.round((wonLeads / totalLeads) * 100) 
        : 0;

      setStats({
        weekCalls,
        weekVisits,
        weekMeetings,
        monthTotal: monthTotal || 0,
        conversionRate,
      });

      setLoading(false);
    };

    fetchStats();
  }, [userId]);

  return (
    <div className="h-full flex flex-col gap-4 p-4 md:p-6 overflow-y-auto">
      {/* Quick Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 rounded-lg border border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-2 mb-1">
            <Phone className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Appels</span>
          </div>
          <div className="text-2xl font-bold text-blue-500">{loading ? "..." : stats.weekCalls}</div>
        </div>

        <div className="glass-card p-3 rounded-lg border border-green-500/20 bg-green-500/5">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Visites</span>
          </div>
          <div className="text-2xl font-bold text-green-500">{loading ? "..." : stats.weekVisits}</div>
        </div>

        <div className="glass-card p-3 rounded-lg border border-purple-500/20 bg-purple-500/5">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-muted-foreground">RDV</span>
          </div>
          <div className="text-2xl font-bold text-purple-500">{loading ? "..." : stats.weekMeetings}</div>
        </div>
      </div>

      {/* Actions Today - Full Width, Priority */}
      <DailyActionsWidget userId={userId} onEntrepriseClick={onEntrepriseClick} />
    </div>
  );
};
