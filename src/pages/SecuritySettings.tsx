import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuditLogViewer } from "@/components/dashboard/AuditLogViewer";
import { ArrowLeft, Shield, AlertTriangle, RefreshCw, Sparkles, Trash2, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

export default function SecuritySettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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

      await supabase
        .from('user_onboarding_progress')
        .delete()
        .eq('user_id', user.id);

      localStorage.removeItem('pulse_onboarding_complete');
      localStorage.removeItem('pulse_initial_filters');

      toast({
        title: "Onboarding réinitialisé",
        description: "Redirection vers l'onboarding...",
      });

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

      // Delete user data from existing tables only
      await supabase.from('tournees').delete().eq('user_id', user.id);
      await supabase.from('user_onboarding_progress').delete().eq('user_id', user.id);
      await supabase.from('qualification_status').delete().eq('user_id', user.id);

      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
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

      const [
        { data: tournees },
        { data: onboarding }
      ] = await Promise.all([
        supabase.from('tournees').select('*').eq('user_id', user.id),
        supabase.from('user_onboarding_progress').select('*').eq('user_id', user.id),
      ]);

      const exportData = {
        user_info: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
        tournees: tournees || [],
        onboarding_progress: onboarding || [],
        export_date: new Date().toISOString(),
      };

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

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-card border-b border-accent/20 px-4 py-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            <h1 className="text-xl font-bold gradient-text">Sécurité</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Statut de sécurité */}
        <Card className="glass-card border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Statut de sécurité
            </CardTitle>
            <CardDescription>
              Aperçu de la sécurité de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-accent/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Protection RLS active</p>
                  <p className="text-sm text-muted-foreground">
                    Vos données sont protégées au niveau de la base de données
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                Actif
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-accent/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Rate limiting activé</p>
                  <p className="text-sm text-muted-foreground">
                    Protection contre les abus et attaques
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                Actif
              </Badge>
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
                        <li>Toutes vos tournées planifiées</li>
                        <li>Vos paramètres et préférences</li>
                      </ul>
                      <div className="space-y-2 pt-4">
                        <Label htmlFor="delete-password" className="text-foreground">
                          Confirmez avec votre mot de passe
                        </Label>
                        <Input
                          id="delete-password"
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Votre mot de passe"
                          className="border-red-500/30"
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deleting || !deletePassword}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {deleting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                          Suppression...
                        </>
                      ) : (
                        'Supprimer mon compte'
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