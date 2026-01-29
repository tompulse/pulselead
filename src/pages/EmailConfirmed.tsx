import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EmailConfirmed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'checking' | 'redirecting'>('checking');

  useEffect(() => {
    let redirectTimeout: NodeJS.Timeout;

    // Fonction pour gérer la redirection après confirmation email
    const handleRedirection = async (session: any) => {
      try {
        console.log('[EMAIL CONFIRMED] Session found:', session.user.id);

        // Vérifier les quotas (plan actif ou non)
        const { data: quotas, error: quotasError } = await supabase
          .from('user_quotas')
          .select('plan_type, is_first_login, subscription_status')
          .eq('user_id', session.user.id)
          .single();

        console.log('[EMAIL CONFIRMED] Quotas:', quotas, 'Error:', quotasError);

        // Si plan actif (is_first_login = false et plan_type existe) → Dashboard
        if (quotas && quotas.is_first_login === false && quotas.plan_type) {
          console.log('[EMAIL CONFIRMED] Active plan found, redirecting to dashboard');
          toast({
            title: "🎉 Bienvenue !",
            description: "Accédez à votre dashboard PRO",
          });
          navigate('/dashboard');
          return;
        }

        // Sinon → Redirection Stripe (avec toast + délai pour UX)
        console.log('[EMAIL CONFIRMED] No active plan, redirecting to Stripe');
        setStatus('redirecting');
        
        toast({
          title: "✅ Email confirmé !",
          description: "Démarrez votre essai gratuit de 7 jours maintenant",
          duration: 3000,
        });

        // Redirection vers Stripe après 2 secondes
        redirectTimeout = setTimeout(() => {
          const paymentUrl = `${import.meta.env.VITE_STRIPE_PAYMENT_LINK_PRO || 'https://buy.stripe.com/00w6oH0PRckQ6IHcro2ZO00'}?client_reference_id=${session.user.id}&prefilled_email=${encodeURIComponent(session.user.email || '')}`;
          
          console.log('[EMAIL CONFIRMED] Redirecting to Stripe:', paymentUrl);
          window.location.href = paymentUrl;
        }, 2000);

      } catch (error) {
        console.error('[EMAIL CONFIRMED] Error:', error);
        toast({
          title: "❌ Erreur",
          description: "Une erreur est survenue. Veuillez vous reconnecter.",
          variant: "destructive",
        });
        navigate('/auth?mode=login');
      }
    };

    // Écouter les événements d'authentification (CRITIQUE pour les liens email)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[EMAIL CONFIRMED] Auth event:', event, 'Session:', !!session);

      // Quand l'email est confirmé, Supabase émet un événement SIGNED_IN
      if (event === 'SIGNED_IN' && session) {
        console.log('[EMAIL CONFIRMED] SIGNED_IN event detected');
        await handleRedirection(session);
        return;
      }

      // Si l'utilisateur a déjà une session active (refresh de page)
      if (event === 'INITIAL_SESSION' && session) {
        console.log('[EMAIL CONFIRMED] Existing session detected');
        await handleRedirection(session);
        return;
      }

      // Si pas de session après un délai, rediriger vers login
      if (!session && event === 'INITIAL_SESSION') {
        console.log('[EMAIL CONFIRMED] No session, redirecting to auth');
        toast({
          title: "⚠️ Session expirée",
          description: "Connectez-vous pour continuer",
          variant: "destructive",
        });
        navigate('/auth?mode=login');
      }
    });

    // Cleanup
    return () => {
      subscription.unsubscribe();
      if (redirectTimeout) clearTimeout(redirectTimeout);
    };
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-navy-deep to-black-deep flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        
        {/* Success Icon */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-3">
            ✅ Email confirmé !
          </h1>
          <p className="text-muted-foreground text-lg">
            Votre compte est prêt à être activé
          </p>
        </div>

        {/* Status Card */}
        <div className="glass-card p-8 space-y-6 animate-slide-up">
          
          {/* Checking Status */}
          {status === 'checking' && (
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto" />
              <h3 className="text-xl font-bold text-foreground">
                Vérification de votre compte...
              </h3>
              <p className="text-muted-foreground text-sm">
                Un instant, nous préparons tout pour vous
              </p>
            </div>
          )}

          {/* Redirecting Status */}
          {status === 'redirecting' && (
            <div className="text-center space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-accent/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-accent animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground">
                🚀 Direction votre essai gratuit !
              </h3>
              <p className="text-muted-foreground text-sm">
                Redirection vers Stripe pour commencer votre essai de 7 jours...
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                <span>Chargement du paiement sécurisé</span>
              </div>
            </div>
          )}
        </div>

        {/* Benefits Reminder */}
        <div className="mt-6 p-6 bg-gradient-to-r from-green-500/5 via-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl">
          <p className="text-sm text-center text-foreground space-y-2">
            <span className="block font-semibold text-base mb-3">✨ Ce qui vous attend :</span>
            <span className="block">🗺️ 4,5M+ entreprises illimitées</span>
            <span className="block">🚀 Tournées GPS optimisées</span>
            <span className="block">📊 CRM complet + Analytics</span>
            <span className="block mt-3 text-green-500 font-bold text-base">
              7 jours gratuits • Sans engagement
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmed;
