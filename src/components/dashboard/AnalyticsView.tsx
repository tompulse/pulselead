import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Target, Phone, Calendar, Users, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsData {
  totalLeads: number;
  qualifiedLeads: number;
  wonDeals: number;
  totalInteractions: number;
  interactionsThisWeek: number;
  averageScore: number;
  conversionRate: number;
}

export const AnalyticsView = ({ userId }: { userId: string }) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalLeads: 0,
    qualifiedLeads: 0,
    wonDeals: 0,
    totalInteractions: 0,
    interactionsThisWeek: 0,
    averageScore: 0,
    conversionRate: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  const fetchAnalytics = async () => {
    try {
      // Fetch lead statuses
      const { data: statuses } = await supabase
        .from('lead_statuts')
        .select('statut_actuel')
        .eq('user_id', userId);

      // Fetch interactions
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: interactions } = await supabase
        .from('lead_interactions')
        .select('created_at')
        .eq('user_id', userId);

      const interactionsThisWeek = interactions?.filter(
        i => new Date(i.created_at) >= weekAgo
      ).length || 0;

      // Fetch scores
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
        totalInteractions: interactions?.length || 0,
        interactionsThisWeek,
        averageScore: Math.round(averageScore),
        conversionRate: Math.round(conversionRate)
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
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
    <div className="p-6 space-y-6 overflow-y-auto h-full custom-scrollbar">
      <div>
        <h2 className="text-3xl font-bold gradient-text mb-2">Analytics & Performance</h2>
        <p className="text-muted-foreground">Vue d'ensemble de votre activité commerciale</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
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
  );
};
