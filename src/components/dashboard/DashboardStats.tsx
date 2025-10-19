import { useEffect, useState } from "react";
import { Phone, Mail, MapPin, TrendingUp, Bell, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DashboardStatsProps {
  userId: string;
}

interface Stats {
  total_interactions: number;
  interactions_today: {
    appels: number;
    emails: number;
    visites: number;
  };
  leads_by_status: {
    nouveau: number;
    contacte: number;
    qualifie: number;
    proposition: number;
    negociation: number;
    gagne: number;
    perdu: number;
  };
  upcoming_actions: Array<{
    entreprise_nom: string;
    prochaine_action: string;
    date_prochaine_action: string;
  }>;
}

export const DashboardStats = ({ userId }: DashboardStatsProps) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get today's interactions
      const { data: interactions, error: interactionsError } = await supabase
        .from('lead_interactions')
        .select('type')
        .eq('user_id', userId)
        .gte('created_at', today.toISOString());

      if (interactionsError) throw interactionsError;

      // Get leads by status
      const { data: statuts, error: statutsError } = await supabase
        .from('lead_statuts')
        .select('statut_actuel')
        .eq('user_id', userId);

      if (statutsError) throw statutsError;

      // Get upcoming actions
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('lead_interactions')
        .select(`
          prochaine_action,
          date_prochaine_action,
          entreprises(nom)
        `)
        .eq('user_id', userId)
        .not('date_prochaine_action', 'is', null)
        .gte('date_prochaine_action', new Date().toISOString())
        .order('date_prochaine_action', { ascending: true })
        .limit(5);

      if (upcomingError) throw upcomingError;

      // Process stats
      const interactions_today = {
        appels: interactions?.filter(i => i.type === 'appel').length || 0,
        emails: interactions?.filter(i => i.type === 'email').length || 0,
        visites: interactions?.filter(i => i.type === 'visite').length || 0,
      };

      const leads_by_status = {
        nouveau: statuts?.filter(s => s.statut_actuel === 'nouveau').length || 0,
        contacte: statuts?.filter(s => s.statut_actuel === 'contacte').length || 0,
        qualifie: statuts?.filter(s => s.statut_actuel === 'qualifie').length || 0,
        proposition: statuts?.filter(s => s.statut_actuel === 'proposition').length || 0,
        negociation: statuts?.filter(s => s.statut_actuel === 'negociation').length || 0,
        gagne: statuts?.filter(s => s.statut_actuel === 'gagne').length || 0,
        perdu: statuts?.filter(s => s.statut_actuel === 'perdu').length || 0,
      };

      const upcoming_actions = upcomingData?.map((item: any) => ({
        entreprise_nom: item.entreprises?.nom || 'Entreprise inconnue',
        prochaine_action: item.prochaine_action,
        date_prochaine_action: item.date_prochaine_action,
      })) || [];

      setStats({
        total_interactions: interactions?.length || 0,
        interactions_today,
        leads_by_status,
        upcoming_actions,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-muted" />
            <CardContent className="h-32 bg-muted/50" />
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activité du jour</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_interactions}</div>
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-3 w-3" />
                <span>{stats.interactions_today.appels} appels</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-3 w-3" />
                <span>{stats.interactions_today.emails} emails</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-3 w-3" />
                <span>{stats.interactions_today.visites} visites</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.leads_by_status.qualifie + stats.leads_by_status.proposition + stats.leads_by_status.negociation}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Leads actifs</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {stats.leads_by_status.qualifie > 0 && (
                <Badge variant="secondary">{stats.leads_by_status.qualifie} qualifiés</Badge>
              )}
              {stats.leads_by_status.proposition > 0 && (
                <Badge variant="default">{stats.leads_by_status.proposition} propositions</Badge>
              )}
              {stats.leads_by_status.negociation > 0 && (
                <Badge variant="default">{stats.leads_by_status.negociation} négociations</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.leads_by_status.gagne}</div>
            <p className="text-xs text-muted-foreground mt-1">Deals gagnés</p>
            <div className="mt-3 text-sm">
              <span className="text-muted-foreground">{stats.leads_by_status.perdu} perdus</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.upcoming_actions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Prochaines actions</CardTitle>
            </div>
            <CardDescription>Actions planifiées à venir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.upcoming_actions.map((action, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{action.entreprise_nom}</p>
                    <p className="text-sm text-muted-foreground">{action.prochaine_action}</p>
                  </div>
                  <Badge variant="outline" className="whitespace-nowrap">
                    {format(new Date(action.date_prochaine_action), 'dd MMM', { locale: fr })}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
