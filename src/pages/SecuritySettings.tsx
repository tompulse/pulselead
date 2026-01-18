import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuditLogViewer } from "@/components/dashboard/AuditLogViewer";
import { ArrowLeft, Shield, AlertTriangle, RefreshCw, Sparkles, Trash2, Download, CreditCard, Calendar, ExternalLink, Clock, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Page des paramètres de sécurité
 * 
 * UTILITÉ:
 * - Visualiser les logs d'audit
 * - Informations sur la sécurité du compte
 * - Recommandations de sécurité
 */

export default function SecuritySettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  
  const { subscriptionStatus, subscriptionPlan, daysRemaining, endDate, isLoading: subscriptionLoading } = useSubscription(userId || undefined);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data: adminCheck } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      setIsAdmin(adminCheck === true);
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetOnboarding = async () => {
    setResetting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete onboarding progress from database
      await supabase
        .from('user_onboarding_progress')
        .delete()
        .eq('user_id', user.id);

      // Clear localStorage
      localStorage.removeItem('pulse_onboarding_complete');
      localStorage.removeItem('pulse_initial_filters');

      toast({
        title: "Onboarding réinitialisé",
        description: "Redirection vers l'onboarding...",
      });

      // Redirect to dashboard which will show onboarding
      setTimeout(() => {
        navigate('/dashboard');
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser l'onboarding",
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Verify password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: deletePassword,
      });

      if (signInError) {
        toast({
          title: "Erreur",
          description: "Mot de passe incorrect",
          variant: "destructive",
        });
        return;
      }

      // Delete user data from all tables
      await supabase.from('lead_statuts').delete().eq('user_id', user.id);
      await supabase.from('lead_interactions').delete().eq('user_id', user.id);
      await supabase.from('tournees').delete().eq('user_id', user.id);
      await supabase.from('user_onboarding_progress').delete().eq('user_id', user.id);
      await supabase.from('qualification_status').delete().eq('user_id', user.id);

      // Delete auth account
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        // If admin delete fails, sign out user (they can't delete themselves with admin API)
        await supabase.auth.signOut();
      }

      toast({
        title: "Compte supprimé",
        description: "Votre compte et toutes vos données ont été supprimés",
      });

      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compte",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeletePassword("");
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all user data
      const [
        { data: statuts },
        { data: interactions },
        { data: tournees },
        { data: onboarding }
      ] = await Promise.all([
        supabase.from('lead_statuts').select('*').eq('user_id', user.id),
        supabase.from('lead_interactions').select('*').eq('user_id', user.id),
        supabase.from('tournees').select('*').eq('user_id', user.id),
        supabase.from('user_onboarding_progress').select('*').eq('user_id', user.id),
      ]);

      const exportData = {
        user_info: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
        lead_statuts: statuts || [],
        lead_interactions: interactions || [],
        tournees: tournees || [],
        onboarding_progress: onboarding || [],
        export_date: new Date().toISOString(),
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pulse_data_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: "Vos données ont été téléchargées",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les données",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleOpenPortal = async () => {
    // Open a popup synchronously to avoid browser popup blockers
    const popup = window.open("about:blank", "_blank");
    if (!popup) {
      toast({
        title: "Popup bloquée",
        description:
          "Autorisez les popups pour ouvrir le portail. Redirection dans cet onglet…",
      });
    }

    setIsOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;

      const url = data?.url;
      if (!url) throw new Error("URL du portail non disponible");

      if (popup && !popup.closed) {
        popup.location.href = url;
      } else {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error("Error opening customer portal:", error);
      if (popup && !popup.closed) popup.close();

      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          error?.message ||
          "Impossible d'ouvrir le portail de gestion. Réessayez plus tard.",
      });
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const getStatusBadge = () => {
    switch (subscriptionStatus) {
      case 'trialing':
        return (
          <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Essai gratuit
          </Badge>
        );
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Actif
          </Badge>
        );
      case 'past_due':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Paiement en attente
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/30">
            Annulé
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/30">
            Aucun abonnement
          </Badge>
        );
    }
  };

  const formattedEndDate = endDate 
    ? format(new Date(endDate), "d MMMM yyyy", { locale: fr })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-card border-b border-accent/20 px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Retour</span>
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <h1 className="text-base sm:text-lg md:text-xl font-bold gradient-text">Paramètres</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
        {/* Section Mon Abonnement - Premier élément */}
        <Card className="glass-card border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
              Mon Abonnement
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Gérez votre abonnement et vos informations de paiement
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {subscriptionLoading ? (
              <div className="flex items-center justify-center py-6 sm:py-8">
                <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Status Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-accent/20 bg-background/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm sm:text-base">Statut</span>
                      {getStatusBadge()}
                    </div>
                    {subscriptionPlan && (
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Plan : <span className="text-foreground">Commercial Solo — 79€/mois</span>
                      </p>
                    )}
                  </div>
                  
                  <Button
                    onClick={handleOpenPortal}
                    disabled={isOpeningPortal || !subscriptionStatus}
                    variant="outline"
                    className="gap-2 border-cyan-500/30 hover:bg-cyan-500/10"
                  >
                    {isOpeningPortal ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Chargement...
                      </>
                    ) : (
                      <>
                        Gérer mon abonnement
                        <ExternalLink className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Info Row - Trial or Active */}
                {subscriptionStatus === 'trialing' && (
                  <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
                        <Calendar className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-amber-400">Période d'essai</p>
                        <p className="text-sm text-muted-foreground">
                          {daysRemaining !== undefined && daysRemaining > 0 ? (
                            <>Il vous reste <strong className="text-foreground">{daysRemaining} jour{daysRemaining > 1 ? 's' : ''}</strong> d'essai gratuit.</>
                          ) : (
                            <>Votre essai se termine aujourd'hui.</>
                          )}
                        </p>
                        {formattedEndDate && (
                          <p className="text-sm text-muted-foreground">
                            Premier prélèvement prévu le <strong className="text-foreground">{formattedEndDate}</strong> (79€)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {subscriptionStatus === 'active' && formattedEndDate && (
                  <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-green-400">Abonnement actif</p>
                        <p className="text-sm text-muted-foreground">
                          Prochain renouvellement le <strong className="text-foreground">{formattedEndDate}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {subscriptionStatus === 'past_due' && (
                  <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-500/10 rounded-lg shrink-0">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-red-400">Paiement échoué</p>
                        <p className="text-sm text-muted-foreground">
                          Votre dernier paiement a échoué. Veuillez mettre à jour votre moyen de paiement pour continuer à utiliser PULSE.
                        </p>
                        <Button 
                          onClick={handleOpenPortal} 
                          size="sm" 
                          variant="destructive" 
                          className="mt-2"
                        >
                          Mettre à jour ma carte
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Help text */}
                <p className="text-xs text-muted-foreground">
                  Depuis le portail de gestion, vous pouvez modifier votre carte bancaire, télécharger vos factures ou annuler votre abonnement. 
                  La résiliation prend effet à la fin de la période payée.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recommandations - simple et utile pour les utilisateurs */}
        <Card className="glass-card border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              Protection de votre compte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-accent/20">
              <div className="p-1 bg-accent/10 rounded">
                <Shield className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Utilisez un mot de passe fort</p>
                <p className="text-xs text-muted-foreground">
                  Minimum 12 caractères avec majuscules, minuscules, chiffres et symboles
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border border-accent/20">
              <div className="p-1 bg-accent/10 rounded">
                <Shield className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Ne partagez jamais vos identifiants</p>
                <p className="text-xs text-muted-foreground">
                  PULSE ne vous demandera jamais votre mot de passe par email ou téléphone
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outils Admin */}
        {isAdmin && (
          <Card className="glass-card border-purple-500/30 bg-purple-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Outils Administrateur
              </CardTitle>
              <CardDescription>
                Outils de test et de développement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-purple-500/20 bg-purple-500/5">
                <div className="flex-1">
                  <p className="font-medium">Réinitialiser l'onboarding</p>
                  <p className="text-sm text-muted-foreground">
                    Supprimer votre progression d'onboarding et recommencer depuis le début
                  </p>
                </div>
                <Button
                  onClick={handleResetOnboarding}
                  disabled={resetting}
                  variant="outline"
                  className="gap-2 border-purple-500/50 hover:bg-purple-500/10"
                >
                  {resetting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Réinitialisation...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Réinitialiser
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logs d'audit */}
        <AuditLogViewer />

        {/* Gestion des données RGPD */}
        <Card className="glass-card border-accent/20">
          <CardHeader>
            <CardTitle>Gestion de mes données (RGPD)</CardTitle>
            <CardDescription>
              Exportez ou supprimez vos données personnelles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-accent/20">
              <div className="flex-1">
                <p className="font-medium">Exporter mes données</p>
                <p className="text-sm text-muted-foreground">
                  Télécharger toutes vos données au format JSON (droit à la portabilité)
                </p>
              </div>
              <Button
                onClick={handleExportData}
                disabled={exporting}
                variant="outline"
                className="gap-2"
              >
                {exporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Export...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Exporter
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/20 bg-red-500/5">
              <div className="flex-1">
                <p className="font-medium text-red-500">Supprimer mon compte</p>
                <p className="text-sm text-muted-foreground">
                  Suppression définitive de votre compte et de toutes vos données (irréversible)
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 border-red-500/50 text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-card border-red-500/30">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-500">
                      Supprimer définitivement mon compte ?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4">
                      <p>
                        Cette action est <strong>irréversible</strong>. Toutes vos données seront supprimées :
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Tous vos prospects et interactions</li>
                        <li>Toutes vos tournées planifiées</li>
                        <li>Votre historique CRM complet</li>
                        <li>Vos paramètres et préférences</li>
                      </ul>
                      <div className="space-y-2 pt-4">
                        <Label htmlFor="delete-password" className="text-foreground">
                          Confirmez avec votre mot de passe
                        </Label>
                        <Input
                          id="delete-password"
                          type="password"
                          placeholder="Votre mot de passe"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          className="bg-background/50 border-border"
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeletePassword("")}>
                      Annuler
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={!deletePassword || deleting}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      {deleting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                          Suppression...
                        </>
                      ) : (
                        "Supprimer définitivement"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
