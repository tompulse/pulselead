import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TourneeStats, UserActivity } from "@/hooks/useAdminAnalytics";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AnalyticsTablesProps {
  usersActivity?: UserActivity[];
  isLoading: boolean;
}

interface Tournee {
  id: string;
  nom: string;
  date_planifiee: string;
  statut: string;
  distance_totale_km: number | null;
  temps_estime_minutes: number | null;
  entreprises_ids: string[];
  user_id: string;
  created_at: string;
}

const formatDuration = (minutes: number | null): string => {
  if (!minutes) return "-";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h${mins.toString().padStart(2, '0')}`;
};

const getStatusBadge = (statut: string) => {
  const variants: Record<string, { className: string; label: string }> = {
    planifiee: { className: "bg-blue-500/10 text-blue-500", label: "Planifiée" },
    en_cours: { className: "bg-orange-500/10 text-orange-500", label: "En cours" },
    terminee: { className: "bg-green-500/10 text-green-500", label: "Terminée" },
  };
  const config = variants[statut] || { className: "bg-muted", label: statut };
  return <Badge className={config.className}>{config.label}</Badge>;
};

export const AnalyticsTables = ({ 
  usersActivity,
  isLoading 
}: AnalyticsTablesProps) => {
  // Fetch recent tournees for detailed table
  const { data: recentTournees, isLoading: tourneesLoading } = useQuery({
    queryKey: ['admin-recent-tournees'],
    queryFn: async (): Promise<Tournee[]> => {
      const { data, error } = await supabase
        .from('tournees')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading || tourneesLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-muted rounded w-40"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Dernières tournées */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dernières tournées créées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Km</TableHead>
                  <TableHead className="text-right">Durée</TableHead>
                  <TableHead className="text-right">Arrêts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(recentTournees || []).map((tournee) => (
                  <TableRow key={tournee.id}>
                    <TableCell className="font-medium max-w-32 truncate">
                      {tournee.nom}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(tournee.date_planifiee), 'dd/MM/yy', { locale: fr })}
                    </TableCell>
                    <TableCell>{getStatusBadge(tournee.statut)}</TableCell>
                    <TableCell className="text-right">
                      {tournee.distance_totale_km ? `${Math.round(Number(tournee.distance_totale_km))}` : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatDuration(tournee.temps_estime_minutes)}
                    </TableCell>
                    <TableCell className="text-right">
                      {tournee.entreprises_ids?.length || 0}
                    </TableCell>
                  </TableRow>
                ))}
                {(!recentTournees || recentTournees.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Aucune tournée créée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Activité par utilisateur */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activité par utilisateur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead className="text-right">Tournées</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Interactions</TableHead>
                  <TableHead>Dernière activité</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(usersActivity || []).slice(0, 15).map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell className="font-mono text-xs max-w-24 truncate">
                      {user.userId.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{user.tourneesCount}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{user.leadsCount}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{user.interactionsCount}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {user.lastActivity 
                        ? format(new Date(user.lastActivity), 'dd/MM HH:mm', { locale: fr })
                        : "-"
                      }
                    </TableCell>
                  </TableRow>
                ))}
                {(!usersActivity || usersActivity.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Aucune activité utilisateur
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
