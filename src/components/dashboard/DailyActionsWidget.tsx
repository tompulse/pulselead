import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone, MapPin, Calendar, StickyNote, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";

interface DailyAction {
  id: string;
  entreprise_id: string;
  type: 'appel' | 'email' | 'visite' | 'rdv' | 'autre' | 'a_revoir';
  prochaine_action: string;
  date_prochaine_action: string;
  entreprise_nom: string;
  telephone?: string;
}

interface DailyActionsWidgetProps {
  userId: string;
  onEntrepriseClick?: (entrepriseId: string) => void;
}

export const DailyActionsWidget = ({ userId, onEntrepriseClick }: DailyActionsWidgetProps) => {
  const [actions, setActions] = useState<DailyAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDailyActions = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from('lead_interactions')
        .select(`
          id,
          entreprise_id,
          type,
          prochaine_action,
          date_prochaine_action,
          entreprises (
            nom,
            telephone
          )
        `)
        .eq('user_id', userId)
        .not('date_prochaine_action', 'is', null)
        .gte('date_prochaine_action', today.toISOString())
        .order('date_prochaine_action', { ascending: true });

      if (!error && data) {
        const formattedActions = data
          .filter(action => action.date_prochaine_action && action.entreprises)
          .map(action => ({
            id: action.id,
            entreprise_id: action.entreprise_id,
            type: action.type,
            prochaine_action: action.prochaine_action || 'Action à effectuer',
            date_prochaine_action: action.date_prochaine_action!,
            entreprise_nom: (action.entreprises as any)?.nom || 'Entreprise',
            telephone: (action.entreprises as any)?.telephone,
          }));
        setActions(formattedActions);
      }
      setLoading(false);
    };

    fetchDailyActions();

    // Refresh every 5 minutes
    const interval = setInterval(fetchDailyActions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appel':
        return <Phone className="h-4 w-4" />;
      case 'visite':
        return <MapPin className="h-4 w-4" />;
      case 'rdv':
        return <Calendar className="h-4 w-4" />;
      case 'a_revoir':
        return <Clock className="h-4 w-4" />;
      default:
        return <StickyNote className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      appel: 'Appel',
      visite: 'Visite',
      rdv: 'Rendez-vous',
      autre: 'Note',
      email: 'Email',
      a_revoir: 'À revoir',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const todayActions = actions.filter(action => 
    isToday(new Date(action.date_prochaine_action))
  );

  const upcomingActions = actions.filter(action => 
    !isToday(new Date(action.date_prochaine_action))
  );

  const overdueActions = actions.filter(action =>
    isPast(new Date(action.date_prochaine_action)) && !isToday(new Date(action.date_prochaine_action))
  );

  const totalToday = todayActions.length;
  const totalUpcoming = upcomingActions.length;

  if (loading) {
    return (
      <Card className="glass-card border-accent/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Mes actions du jour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Mes actions du jour
          </CardTitle>
          <div className="flex gap-2">
            {totalToday > 0 && (
              <Badge variant="default" className="bg-accent text-primary">
                {totalToday} aujourd'hui
              </Badge>
            )}
            {totalUpcoming > 0 && (
              <Badge variant="secondary">
                {totalUpcoming} à venir
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Aucune action planifiée</p>
            <p className="text-sm mt-1">Planifiez vos prochaines actions depuis le CRM</p>
          </div>
        ) : (
          <ScrollArea className="h-[280px]">
            <div className="space-y-3 pr-4">
              {/* Today's actions */}
              {todayActions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-accent uppercase tracking-wider">
                    Aujourd'hui
                  </p>
                  {todayActions.map((action) => (
                    <div
                      key={action.id}
                      className="group p-3 rounded-lg border border-accent/30 bg-accent/5 hover:bg-accent/10 hover:border-accent/50 transition-all cursor-pointer"
                      onClick={() => onEntrepriseClick?.(action.entreprise_id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-accent/20 rounded-lg shrink-0">
                          {getTypeIcon(action.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(action.type)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(action.date_prochaine_action), 'HH:mm')}
                            </span>
                          </div>
                          <p className="font-semibold text-sm truncate" title={action.entreprise_nom}>
                            {action.entreprise_nom}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {action.prochaine_action}
                          </p>
                          {action.type === 'appel' && action.telephone && (
                            <Button
                              asChild
                              variant="ghost"
                              size="sm"
                              className="mt-2 h-7 px-2 text-xs hover:bg-accent/20"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <a href={`tel:${action.telephone}`}>
                                <Phone className="h-3 w-3 mr-1" />
                                {action.telephone}
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upcoming actions */}
              {upcomingActions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Prochainement
                  </p>
                  {upcomingActions.slice(0, 3).map((action) => (
                    <div
                      key={action.id}
                      className="group p-3 rounded-lg border border-muted/30 bg-muted/5 hover:bg-muted/10 hover:border-muted transition-all cursor-pointer"
                      onClick={() => onEntrepriseClick?.(action.entreprise_id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted/20 rounded-lg shrink-0">
                          {getTypeIcon(action.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(action.type)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(action.date_prochaine_action), 'dd MMM', { locale: fr })}
                            </span>
                          </div>
                          <p className="font-semibold text-sm truncate" title={action.entreprise_nom}>
                            {action.entreprise_nom}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {action.prochaine_action}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
