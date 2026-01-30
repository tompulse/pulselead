import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Page de retour après paiement Stripe
 * Redirige immédiatement vers le dashboard
 * Le webhook activera le compte en arrière-plan
 */
const StripeReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    // Récupérer le session_id de Stripe (si présent)
    const sessionId = searchParams.get('session_id');
    
    console.log('[STRIPE RETURN] Payment completed', { sessionId });

    // 🔥 Marquer que le paiement est complété (pour le Dashboard)
    localStorage.setItem('stripe_payment_completed', 'true');
    localStorage.setItem('stripe_payment_time', Date.now().toString());

    // Toast de confirmation
    toast({
      title: "🎉 Paiement réussi !",
      description: "Accès à votre dashboard PRO en cours d'activation...",
      duration: 3000,
    });

    // Redirection immédiate vers le dashboard (2 secondes pour lire le toast)
    setTimeout(() => {
      console.log('[STRIPE RETURN] Redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }, 2000);
  }, [navigate, searchParams, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-navy-deep to-black-deep flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        
        {/* Success Icon */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-3">
            🎉 Paiement réussi !
          </h1>
          <p className="text-muted-foreground text-lg mb-4">
            Votre essai gratuit de <span className="text-green-500 font-bold">7 jours</span> a commencé
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-500/10 border-2 border-green-500/30 shadow-lg">
            <Sparkles className="w-5 h-5 text-green-500" />
            <span className="text-base text-green-500 font-bold">
              Plan PRO activé
            </span>
          </div>
        </div>

        {/* Redirecting Card */}
        <div className="glass-card p-8 space-y-6 animate-slide-up">
          <div className="text-center space-y-4">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-accent/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-accent animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground">
              🚀 Redirection vers votre dashboard...
            </h3>
            <p className="text-muted-foreground text-sm">
              Votre compte PRO est en cours d'activation
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
              <span>Quelques secondes...</span>
            </div>
          </div>
        </div>

        {/* Benefits Reminder */}
        <div className="mt-6 p-6 bg-gradient-to-r from-green-500/5 via-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl">
          <p className="text-sm text-center text-foreground space-y-2">
            <span className="block font-semibold text-base mb-3">✨ Votre plan PRO inclut :</span>
            <span className="block">🗺️ Nouvelles entreprises, chaque semaine</span>
            <span className="block">🚀 Tournées GPS optimisées (-40% km)</span>
            <span className="block">📊 CRM complet + Analytics</span>
            <span className="block">💬 Support prioritaire 7j/7</span>
            <span className="block mt-3 text-green-500 font-bold text-base">
              7 jours gratuits • Sans engagement
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StripeReturn;
