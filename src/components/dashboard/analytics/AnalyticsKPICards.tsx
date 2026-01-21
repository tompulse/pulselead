import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Route, 
  Users, 
  Phone, 
  Calendar, 
  TrendingUp, 
  Clock,
  MapPin,
  Target
} from "lucide-react";
import { TourneeStats, CRMStats, ActivityStats } from "@/hooks/useAdminAnalytics";

interface AnalyticsKPICardsProps {
  tourneeStats?: TourneeStats;
  crmStats?: CRMStats;
  activityStats?: ActivityStats;
  isLoading: boolean;
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h${mins.toString().padStart(2, '0')}`;
};

export const AnalyticsKPICards = ({ 
  tourneeStats, 
  crmStats, 
  activityStats,
  isLoading 
}: AnalyticsKPICardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "Tournées créées",
      value: tourneeStats?.total || 0,
      icon: Route,
      color: "text-accent",
      bgColor: "bg-accent/10",
      subtitle: `${tourneeStats?.terminees || 0} terminées`,
    },
    {
      title: "Distance totale",
      value: `${tourneeStats?.totalKm || 0} km`,
      icon: MapPin,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      subtitle: `~${tourneeStats?.avgKmPerTournee || 0} km/tournée`,
    },
    {
      title: "Temps total",
      value: formatDuration(tourneeStats?.totalMinutes || 0),
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      subtitle: `~${tourneeStats?.avgMinutesPerTournee || 0} min/tournée`,
    },
    {
      title: "Arrêts total",
      value: tourneeStats?.totalStops || 0,
      icon: Target,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      subtitle: `~${tourneeStats?.avgStopsPerTournee || 0} arrêts/tournée`,
    },
    {
      title: "Leads CRM",
      value: crmStats?.totalLeads || 0,
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      subtitle: `${crmStats?.conversionRate || 0}% conversion`,
    },
    {
      title: "Interactions",
      value: crmStats?.totalInteractions || 0,
      icon: Phone,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      subtitle: `${activityStats?.callsMade || 0} appels`,
    },
    {
      title: "RDV programmés",
      value: crmStats?.rdvScheduled || 0,
      icon: Calendar,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      subtitle: `${activityStats?.visitsCompleted || 0} visites`,
    },
    {
      title: "Relances en cours",
      value: activityStats?.pendingFollowups || 0,
      icon: TrendingUp,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      subtitle: `${crmStats?.toCall || 0} à appeler`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
