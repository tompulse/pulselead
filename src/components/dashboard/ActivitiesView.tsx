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
    <div className="h-full flex flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Mes Activités</h2>
          <p className="text-muted-foreground">Vue d'ensemble de vos actions commerciales</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-accent/20 bg-gradient-to-br from-blue-500/5 to-transparent hover:border-blue-500/40 transition-all cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-500" />
              Appels cette semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">
              {loading ? "..." : stats.weekCalls}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent/20 bg-gradient-to-br from-green-500/5 to-transparent hover:border-green-500/40 transition-all cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-500" />
              Visites cette semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {loading ? "..." : stats.weekVisits}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent/20 bg-gradient-to-br from-purple-500/5 to-transparent hover:border-purple-500/40 transition-all cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              RDV cette semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">
              {loading ? "..." : stats.weekMeetings}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent/20 bg-gradient-to-br from-accent/10 to-transparent hover:border-accent/40 transition-all cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              Interactions ce mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              {loading ? "..." : stats.monthTotal}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Actions Widget - Full Width */}
      <DailyActionsWidget userId={userId} onEntrepriseClick={onEntrepriseClick} />

      {/* Tips Section */}
      <Card className="glass-card border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Conseils du jour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
              <span className="text-accent text-lg mt-0.5">→</span>
              <span className="text-foreground/80">Les appels avant 10h ont 40% plus de chances d'aboutir</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
              <span className="text-accent text-lg mt-0.5">→</span>
              <span className="text-foreground/80">Planifiez vos visites par zone géographique pour optimiser votre temps</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
              <span className="text-accent text-lg mt-0.5">→</span>
              <span className="text-foreground/80">Relancez les leads "qualifiés" tous les 3-5 jours</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
