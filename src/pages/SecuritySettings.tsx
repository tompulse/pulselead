import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuditLogViewer } from "@/components/dashboard/AuditLogViewer";
import { ArrowLeft, Shield, AlertTriangle, RefreshCw, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

      // Delete onboarding progress from database
      await supabase
        .from('user_onboarding_progress')
        .delete()
        .eq('user_id', user.id);

      // Clear localStorage
      localStorage.removeItem('luma_onboarding_complete');
      localStorage.removeItem('luma_initial_filters');

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

            <div className="flex items-center justify-between p-4 rounded-lg border border-orange-500/20 bg-orange-500/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium">Protection mots de passe compromis</p>
                  <p className="text-sm text-muted-foreground">
                    Recommandé: Activer la protection contre les mots de passe connus
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                À configurer
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recommandations */}
        <Card className="glass-card border-accent/20">
          <CardHeader>
            <CardTitle>Recommandations de sécurité</CardTitle>
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
                <p className="font-medium text-sm">Vérifiez régulièrement vos logs</p>
                <p className="text-xs text-muted-foreground">
                  Consultez votre journal d'audit pour détecter toute activité suspecte
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
                  LUMA ne vous demandera jamais votre mot de passe par email ou téléphone
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
      </main>
    </div>
  );
}
