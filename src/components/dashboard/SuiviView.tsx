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
  interactionsThisWeek: number;
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
    interactionsThisWeek: 0,
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

      const interactionsThisWeek = weekInteractions?.length || 0;

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
        interactionsThisWeek,
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
      <div className="p-6 space-y-8 overflow-y-auto h-full custom-scrollbar">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
        <Skeleton className="h-8 w-48 mt-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
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
      color: "text-blue-500"
    },
    {
      title: "Leads qualifiés",
      value: analytics.qualifiedLeads,
      icon: Target,
      color: "text-accent"
    },
    {
      title: "Deals gagnés",
      value: analytics.wonDeals,
      icon: DollarSign,
      color: "text-green-500"
    },
    {
      title: "Interactions totales",
      value: analytics.totalInteractions,
      icon: Phone,
      color: "text-purple-500"
    },
    {
      title: "Cette semaine",
      value: analytics.interactionsThisWeek,
      icon: Calendar,
      color: "text-orange-500"
    },
    {
      title: "Taux de conversion",
      value: `${analytics.conversionRate}%`,
      icon: TrendingUp,
      color: "text-pink-500"
    }
  ];

  return (
    <div className="p-4 md:p-6 space-y-8 overflow-y-auto h-full custom-scrollbar">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold gradient-text mb-2">Suivi & Performance</h2>
        <p className="text-muted-foreground">Suivez vos actions et résultats commerciaux</p>
      </div>

      {/* Section 1: Mes Activités */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold gradient-text">📊 Mes Activités cette semaine</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            className="glass-card p-6 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all cursor-pointer transform hover:scale-105"
            onClick={() => handleCardClick('appel')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-blue-500/10 rounded-full mb-4">
                <Phone className="h-8 w-8 text-blue-500" />
              </div>
              <span className="text-sm text-muted-foreground mb-2">Appels</span>
              <div className="text-4xl font-bold text-blue-500 mb-2">
                {activityStats.weekCalls}
              </div>
              <p className="text-xs text-muted-foreground">Cliquer pour voir le détail</p>
            </div>
          </div>

          <div 
            className="glass-card p-6 rounded-xl border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 hover:border-green-500/40 transition-all cursor-pointer transform hover:scale-105"
            onClick={() => handleCardClick('visite')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-green-500/10 rounded-full mb-4">
                <MapPin className="h-8 w-8 text-green-500" />
              </div>
              <span className="text-sm text-muted-foreground mb-2">Visites</span>
              <div className="text-4xl font-bold text-green-500 mb-2">
                {activityStats.weekVisits}
              </div>
              <p className="text-xs text-muted-foreground">Cliquer pour voir le détail</p>
            </div>
          </div>

          <div 
            className="glass-card p-6 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/40 transition-all cursor-pointer transform hover:scale-105"
            onClick={() => handleCardClick('rdv')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-purple-500/10 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
              <span className="text-sm text-muted-foreground mb-2">RDV</span>
              <div className="text-4xl font-bold text-purple-500 mb-2">
                {activityStats.weekMeetings}
              </div>
              <p className="text-xs text-muted-foreground">Cliquer pour voir le détail</p>
            </div>
          </div>

          <div 
            className="glass-card p-6 rounded-xl border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 hover:border-orange-500/40 transition-all cursor-pointer transform hover:scale-105"
            onClick={() => handleCardClick('a_revoir')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-orange-500/10 rounded-full mb-4">
                <CheckCircle2 className="h-8 w-8 text-orange-500" />
              </div>
              <span className="text-sm text-muted-foreground mb-2">À revoir</span>
              <div className="text-4xl font-bold text-orange-500 mb-2">
                {activityStats.weekARevoir}
              </div>
              <p className="text-xs text-muted-foreground">Cliquer pour voir le détail</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Performance & Analytics */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold gradient-text">📈 Performance & Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyticsStats.map((stat, index) => (
            <Card key={index} className="glass-card border-accent/30 hover:border-accent/50 transition-all hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Average Score */}
        <Card className="glass-card border-accent/30">
          <CardHeader>
            <CardTitle className="gradient-text">Score moyen des leads</CardTitle>
            <CardDescription>Qualité globale de votre pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold gradient-text">
                {analytics.averageScore}
              </div>
              <div className="flex-1">
                <div className="h-4 bg-accent/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-cyan-glow transition-all duration-500"
                    style={{ width: `${analytics.averageScore}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {analytics.averageScore >= 80 ? "Excellent" : analytics.averageScore >= 50 ? "Bon" : "À améliorer"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
