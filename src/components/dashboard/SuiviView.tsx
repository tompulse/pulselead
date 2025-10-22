import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Phone, MapPin, Calendar, CheckCircle2, Users, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, startOfMonth } from "date-fns";
import { InteractionsDialog } from "./InteractionsDialog";
import { Skeleton } from "@/components/ui/skeleton";

interface SuiviViewProps {
  userId: string;
  onEntrepriseClick?: (entrepriseId: string) => void;
}

interface ActivityStats {
  weekCalls: number;
  weekVisits: number;
  weekMeetings: number;
  weekARevoir: number;
}

interface AnalyticsData {
  totalLeads: number;
  qualifiedLeads: number;
  wonDeals: number;
  totalInteractions: number;
  averageScore: number;
  conversionRate: number;
}

export const SuiviView = ({ userId, onEntrepriseClick }: SuiviViewProps) => {
  const [activityStats, setActivityStats] = useState<ActivityStats>({
    weekCalls: 0,
    weekVisits: 0,
    weekMeetings: 0,
    weekARevoir: 0,
  });
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalLeads: 0,
    qualifiedLeads: 0,
    wonDeals: 0,
    totalInteractions: 0,
    averageScore: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'appel' | 'visite' | 'rdv' | 'a_revoir' | null>(null);

  const handleCardClick = (type: 'appel' | 'visite' | 'rdv' | 'a_revoir') => {
    setSelectedType(type);
    setDialogOpen(true);
  };

  const handleInteractionDeleted = () => {
    fetchAllData();
  };

  const fetchAllData = async () => {
    try {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const monthStart = startOfMonth(now);

      // Fetch activity stats
      const { data: weekInteractions } = await supabase
        .from('lead_interactions')
        .select('type, created_at')
        .eq('user_id', userId)
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString());

      const { data: weekVisites } = await supabase
        .from('tournee_visites')
        .select('rdv_pris, a_revoir')
        .eq('user_id', userId)
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString());

      const weekCalls = (weekInteractions?.filter(i => i.type === 'appel').length || 0) + 
                        (weekVisites?.filter(v => v.rdv_pris).length || 0);
      const weekVisits = weekInteractions?.filter(i => i.type === 'visite').length || 0;
      const weekMeetings = weekInteractions?.filter(i => i.type === 'rdv').length || 0;
      const weekARevoir = (weekInteractions?.filter(i => i.type === 'a_revoir').length || 0) +
                          (weekVisites?.filter(v => v.a_revoir).length || 0);

      setActivityStats({
        weekCalls,
        weekVisits,
        weekMeetings,
        weekARevoir,
      });

      // Fetch analytics data
      const { data: statuses } = await supabase
        .from('lead_statuts')
        .select('statut_actuel')
        .eq('user_id', userId);

      const { data: allInteractions } = await supabase
        .from('lead_interactions')
        .select('created_at')
        .eq('user_id', userId);

      const { data: scores } = await supabase
        .from('entreprises')
        .select('score_lead')
        .not('score_lead', 'is', null);

      const totalLeads = statuses?.length || 0;
      const qualifiedLeads = statuses?.filter(s => 
        ['qualifie', 'proposition', 'negociation'].includes(s.statut_actuel)
      ).length || 0;
      const wonDeals = statuses?.filter(s => s.statut_actuel === 'gagne').length || 0;
      const averageScore = scores && scores.length > 0
        ? scores.reduce((sum, s) => sum + (s.score_lead || 0), 0) / scores.length
        : 0;
      const conversionRate = totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0;

      setAnalytics({
        totalLeads,
        qualifiedLeads,
        wonDeals,
        totalInteractions: allInteractions?.length || 0,
        averageScore: Math.round(averageScore),
        conversionRate: Math.round(conversionRate)
      });

    } catch (error) {
      console.error('Error fetching suivi data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    // Realtime subscription
    const channel = supabase
      .channel('suivi_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournee_visites',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchAllData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="p-2 md:p-6 space-y-3 md:space-y-8 overflow-y-auto h-full custom-scrollbar">
        <Skeleton className="h-8 md:h-12 w-48 md:w-64 mx-auto" />
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 md:h-48 w-full" />
          ))}
        </div>
        <Skeleton className="h-6 md:h-8 w-32 md:w-48" />
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 md:h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const analyticsStats = [
    {
      title: "Leads totaux",
      value: analytics.totalLeads,
      icon: Users,
      color: "text-blue-500",
      gradient: "from-blue-500/20 to-blue-600/5"
    },
    {
      title: "Leads qualifiés",
      value: analytics.qualifiedLeads,
      icon: Target,
      color: "text-accent",
      gradient: "from-accent/20 to-cyan-glow/5"
    },
    {
      title: "Deals gagnés",
      value: analytics.wonDeals,
      icon: DollarSign,
      color: "text-green-500",
      gradient: "from-green-500/20 to-green-600/5"
    },
    {
      title: "Score moyen",
      value: analytics.averageScore,
      icon: TrendingUp,
      color: "text-yellow-500",
      gradient: "from-yellow-500/20 to-yellow-600/5"
    },
    {
      title: "Interactions totales",
      value: analytics.totalInteractions,
      icon: Phone,
      color: "text-purple-500",
      gradient: "from-purple-500/20 to-purple-600/5"
    },
    {
      title: "Taux de conversion",
      value: `${analytics.conversionRate}%`,
      icon: TrendingUp,
      color: "text-pink-500",
      gradient: "from-pink-500/20 to-pink-600/5"
    }
  ];

  return (
    <div className="p-2 md:p-4 space-y-2 md:space-y-4 overflow-hidden h-full flex flex-col">
      {/* Section 1: Mes Activités */}
      <div className="space-y-2 shrink-0">
        <h3 className="text-xs md:text-sm font-semibold gradient-text">Activités</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div 
            className="glass-card p-2 md:p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all cursor-pointer"
            onClick={() => handleCardClick('appel')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-1.5 md:p-3 bg-blue-500/10 rounded-full mb-1 md:mb-2">
                <Phone className="h-4 w-4 md:h-6 md:w-6 text-blue-500" />
              </div>
              <span className="text-xs text-muted-foreground mb-0.5 md:mb-1">Appels</span>
              <div className="text-xl md:text-3xl font-bold text-blue-500">
                {activityStats.weekCalls}
              </div>
            </div>
          </div>

          <div 
            className="glass-card p-2 md:p-4 rounded-lg border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 hover:border-green-500/40 transition-all cursor-pointer"
            onClick={() => handleCardClick('visite')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-1.5 md:p-3 bg-green-500/10 rounded-full mb-1 md:mb-2">
                <MapPin className="h-4 w-4 md:h-6 md:w-6 text-green-500" />
              </div>
              <span className="text-xs text-muted-foreground mb-0.5 md:mb-1">Visites</span>
              <div className="text-xl md:text-3xl font-bold text-green-500">
                {activityStats.weekVisits}
              </div>
            </div>
          </div>

          <div 
            className="glass-card p-2 md:p-4 rounded-lg border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/40 transition-all cursor-pointer"
            onClick={() => handleCardClick('rdv')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-1.5 md:p-3 bg-purple-500/10 rounded-full mb-1 md:mb-2">
                <Calendar className="h-4 w-4 md:h-6 md:w-6 text-purple-500" />
              </div>
              <span className="text-xs text-muted-foreground mb-0.5 md:mb-1">RDV</span>
              <div className="text-xl md:text-3xl font-bold text-purple-500">
                {activityStats.weekMeetings}
              </div>
            </div>
          </div>

          <div 
            className="glass-card p-2 md:p-4 rounded-lg border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 hover:border-orange-500/40 transition-all cursor-pointer"
            onClick={() => handleCardClick('a_revoir')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-1.5 md:p-3 bg-orange-500/10 rounded-full mb-1 md:mb-2">
                <CheckCircle2 className="h-4 w-4 md:h-6 md:w-6 text-orange-500" />
              </div>
              <span className="text-xs text-muted-foreground mb-0.5 md:mb-1">À revoir</span>
              <div className="text-xl md:text-3xl font-bold text-orange-500">
                {activityStats.weekARevoir}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Performance & Analytics */}
      <div className="space-y-2 flex-1 min-h-0">
        <h3 className="text-xs md:text-sm font-semibold gradient-text">Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {analyticsStats.map((stat, index) => (
            <Card key={index} className="glass-card border-accent/30 hover:border-accent/50 transition-all duration-300 hover-scale group">
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-2 md:p-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-1 rounded-lg bg-gradient-to-br ${stat.gradient} transition-colors duration-300`}>
                  <stat.icon className={`h-3 w-3 md:h-4 md:w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="p-2 md:p-3 pt-0">
                <div className={`text-lg md:text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Interactions Dialog */}
      <InteractionsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={selectedType}
        userId={userId}
        onEntrepriseClick={onEntrepriseClick}
        onInteractionDeleted={handleInteractionDeleted}
      />
    </div>
  );
};
