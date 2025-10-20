import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Phone, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, startOfMonth } from "date-fns";
import { InteractionsDialog } from "./InteractionsDialog";

interface ActivitiesViewProps {
  userId: string;
  onEntrepriseClick?: (entrepriseId: string) => void;
}

export const ActivitiesView = ({ userId, onEntrepriseClick }: ActivitiesViewProps) => {
  const [stats, setStats] = useState({
    weekCalls: 0,
    weekVisits: 0,
    weekMeetings: 0,
    weekARevoir: 0,
    monthTotal: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'appel' | 'visite' | 'rdv' | 'a_revoir' | null>(null);

  const handleCardClick = (type: 'appel' | 'visite' | 'rdv' | 'a_revoir') => {
    setSelectedType(type);
    setDialogOpen(true);
  };

  const handleInteractionDeleted = () => {
    // Reload stats after deletion
    fetchStats();
  };

  const fetchStats = async () => {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const monthStart = startOfMonth(now);

      // Week stats by type from lead_interactions
      const { data: weekInteractions } = await supabase
        .from('lead_interactions')
        .select('type')
        .eq('user_id', userId)
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString());

      // Week stats from tournee_visites
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
        weekARevoir,
        monthTotal: monthTotal || 0,
        conversionRate,
      });

      setLoading(false);
    };

  useEffect(() => {
    fetchStats();

    // Realtime subscription pour rafraîchir quand une visite est ajoutée
    const channel = supabase
      .channel('tournee_visites_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournee_visites',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <div className="h-full flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold gradient-text mb-2">Mes Activités</h2>
          <p className="text-muted-foreground">Suivez vos actions commerciales</p>
        </div>

        {/* Quick Stats Bar - Clickable & Centered */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            className="glass-card p-6 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all cursor-pointer transform hover:scale-105"
            onClick={() => handleCardClick('appel')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-blue-500/10 rounded-full mb-4">
                <Phone className="h-8 w-8 text-blue-500" />
              </div>
              <span className="text-sm text-muted-foreground mb-2">Appels cette semaine</span>
              <div className="text-4xl font-bold text-blue-500 mb-2">
                {loading ? "..." : stats.weekCalls}
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
              <span className="text-sm text-muted-foreground mb-2">Visites cette semaine</span>
              <div className="text-4xl font-bold text-green-500 mb-2">
                {loading ? "..." : stats.weekVisits}
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
              <span className="text-sm text-muted-foreground mb-2">RDV cette semaine</span>
              <div className="text-4xl font-bold text-purple-500 mb-2">
                {loading ? "..." : stats.weekMeetings}
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
              <span className="text-sm text-muted-foreground mb-2">À revoir cette semaine</span>
              <div className="text-4xl font-bold text-orange-500 mb-2">
                {loading ? "..." : stats.weekARevoir}
              </div>
              <p className="text-xs text-muted-foreground">Cliquer pour voir le détail</p>
            </div>
          </div>
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
