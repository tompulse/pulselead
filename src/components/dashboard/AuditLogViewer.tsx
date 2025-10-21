import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Shield, Eye, Edit, Trash2, Plus, LogIn, LogOut } from "lucide-react";

/**
 * Composant pour visualiser les logs d'audit de l'utilisateur
 * 
 * UTILITÉ: Permet aux utilisateurs de voir leur historique d'actions
 * - Transparence sur les activités
 * - Détection d'activités suspectes
 * - Conformité RGPD (droit d'accès aux données)
 */

interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  created_at: string;
  ip_address: unknown;
  user_agent: string;
}

const ACTION_ICONS = {
  login: LogIn,
  logout: LogOut,
  create: Plus,
  update: Edit,
  delete: Trash2,
  view: Eye,
  sync: Shield,
};

const ACTION_COLORS = {
  login: "bg-blue-500",
  logout: "bg-gray-500",
  create: "bg-green-500",
  update: "bg-orange-500",
  delete: "bg-red-500",
  view: "bg-purple-500",
  sync: "bg-cyan-500",
};

const ACTION_LABELS = {
  login: "Connexion",
  logout: "Déconnexion",
  create: "Création",
  update: "Modification",
  delete: "Suppression",
  view: "Consultation",
  sync: "Synchronisation",
};

const RESOURCE_LABELS = {
  entreprise: "Entreprise",
  interaction: "Interaction",
  tournee: "Tournée",
  lead_status: "Statut Lead",
  user: "Utilisateur",
};

export const AuditLogViewer = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            Journal d'audit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent" />
          Journal d'audit
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Historique de vos 50 dernières actions
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune action enregistrée
              </p>
            ) : (
              logs.map((log) => {
                const Icon = ACTION_ICONS[log.action as keyof typeof ACTION_ICONS] || Shield;
                const color = ACTION_COLORS[log.action as keyof typeof ACTION_COLORS] || "bg-gray-500";
                const actionLabel = ACTION_LABELS[log.action as keyof typeof ACTION_LABELS] || log.action;
                const resourceLabel = RESOURCE_LABELS[log.resource_type as keyof typeof RESOURCE_LABELS] || log.resource_type;

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-accent/20 hover:bg-accent/5 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${color} text-white shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{actionLabel}</span>
                        <Badge variant="outline" className="text-xs">
                          {resourceLabel}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                      </p>
                      {log.ip_address && log.ip_address !== 'unknown' && typeof log.ip_address === 'string' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          IP: {log.ip_address}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
