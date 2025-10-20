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
    <div className="h-full flex flex-col gap-4 overflow-y-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Mes Activités</h2>
          <p className="text-sm text-muted-foreground">Vue d'ensemble de vos actions commerciales</p>
        </div>
      </div>

      {/* Stats Cards - More compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="glass-card border-accent/20 bg-gradient-to-br from-blue-500/5 to-transparent hover:border-blue-500/40 transition-all cursor-pointer">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs text-muted-foreground">Appels semaine</span>
            </div>
            <div className="text-2xl font-bold text-blue-500">
              {loading ? "..." : stats.weekCalls}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent/20 bg-gradient-to-br from-green-500/5 to-transparent hover:border-green-500/40 transition-all cursor-pointer">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-3.5 w-3.5 text-green-500" />
              <span className="text-xs text-muted-foreground">Visites semaine</span>
            </div>
            <div className="text-2xl font-bold text-green-500">
              {loading ? "..." : stats.weekVisits}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent/20 bg-gradient-to-br from-purple-500/5 to-transparent hover:border-purple-500/40 transition-all cursor-pointer">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-3.5 w-3.5 text-purple-500" />
              <span className="text-xs text-muted-foreground">RDV semaine</span>
            </div>
            <div className="text-2xl font-bold text-purple-500">
              {loading ? "..." : stats.weekMeetings}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent/20 bg-gradient-to-br from-accent/10 to-transparent hover:border-accent/40 transition-all cursor-pointer">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs text-muted-foreground">Total mois</span>
            </div>
            <div className="text-2xl font-bold text-accent">
              {loading ? "..." : stats.monthTotal}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Daily Actions Widget */}
        <DailyActionsWidget userId={userId} onEntrepriseClick={onEntrepriseClick} />

        {/* Quick Summary */}
        <Card className="glass-card border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" />
              Résumé de la semaine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Total actions */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-accent/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Total actions</span>
              </div>
              <span className="text-lg font-bold text-accent">
                {stats.weekCalls + stats.weekVisits + stats.weekMeetings}
              </span>
            </div>

            {/* Conversion rate */}
            {stats.conversionRate > 0 && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground/80">Taux de conversion</span>
                  <span className="text-lg font-bold text-green-500">{stats.conversionRate}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                    style={{ width: `${stats.conversionRate}%` }}
                  />
                </div>
              </div>
            )}

            {/* Tips compact */}
            <div className="pt-2 space-y-2">
              <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <span>💡</span>
                Conseil du jour
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed p-2 rounded-lg bg-accent/5">
                Les appels avant 10h ont 40% plus de chances d'aboutir. Planifiez vos visites par zone pour optimiser votre temps.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
