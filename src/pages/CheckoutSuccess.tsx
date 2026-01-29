import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Sparkles, Loader2 } from "lucide-react";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'checking' | 'activating' | 'ready' | 'error'>('checking');
  const [countdown, setCountdown] = useState(30); // 30 secondes max d'attente
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAndActivate = async () => {
      try {
        // 1. Vérifier la session utilisateur
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error('[CHECKOUT SUCCESS] No session found');
          setStatus('error');
          return;
        }

        console.log('[CHECKOUT SUCCESS] User session found:', session.user.id);
        setUserId(session.user.id);
        setStatus('activating');

        // 2. Poll la base de données pour vérifier l'activation
        const pollInterval = setInterval(async () => {
          try {
            const { data: quotas, error } = await supabase
              .from('user_quotas')
              .select('plan_type, is_first_login, subscription_status')
              .eq('user_id', session.user.id)
              .single();

            console.log('[CHECKOUT SUCCESS] Poll quotas:', quotas, error);

            // Si le compte est activé par le webhook
            if (quotas && quotas.is_first_login === false && quotas.plan_type) {
              console.log('[CHECKOUT SUCCESS] ✅ Account activated! Redirecting to dashboard...');
              clearInterval(pollInterval);
              setStatus('ready');
              
              // Redirection après 2 secondes
              setTimeout(() => {
                navigate('/dashboard');
              }, 2000);
            }
          } catch (pollError) {
            console.error('[CHECKOUT SUCCESS] Poll error:', pollError);
          }
        }, 2000); // Poll toutes les 2 secondes

        // Timeout après 30 secondes
        const timeout = setTimeout(() => {
          clearInterval(pollInterval);
          console.log('[CHECKOUT SUCCESS] ⏱️ Timeout reached, redirecting anyway...');
          setStatus('ready');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        }, 30000);

        // Cleanup
        return () => {
          clearInterval(pollInterval);
          clearTimeout(timeout);
        };
      } catch (error) {
        console.error('[CHECKOUT SUCCESS] Error:', error);
        setStatus('error');
      }
    };

    checkAndActivate();
  }, [navigate]);

  // Countdown timer
  useEffect(() => {
    if (status === 'activating' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, status]);

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

        {/* Status Card */}
        <div className="glass-card p-8 space-y-6 animate-slide-up">
          
          {/* Checking Status */}
          {status === 'checking' && (
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto" />
              <h3 className="text-xl font-bold text-foreground">
                Vérification du paiement...
              </h3>
              <p className="text-muted-foreground text-sm">
                Connexion à votre compte
              </p>
            </div>
          )}

          {/* Activating Status */}
          {status === 'activating' && (
            <div className="text-center space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-accent/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-accent animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Activation de votre compte PRO...
              </h3>
              <p className="text-muted-foreground text-sm">
                Notre système prépare votre dashboard avec 4,5M+ entreprises
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                <span>Encore quelques secondes...</span>
              </div>
            </div>
          )}

          {/* Ready Status */}
          {status === 'ready' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-green-500">
                ✅ Compte activé !
              </h3>
              <p className="text-muted-foreground text-sm">
                Redirection vers votre dashboard...
              </p>
              <Loader2 className="w-6 h-6 animate-spin text-accent mx-auto" />
            </div>
          )}

          {/* Error Status */}
          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-red-400">
                Oups, un problème est survenu
              </h3>
              <p className="text-muted-foreground text-sm">
                Connectez-vous pour accéder à votre dashboard
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="w-full bg-gradient-to-r from-accent to-cyan-500 hover:from-accent/90 hover:to-cyan-500/90 text-black font-bold py-3 rounded-lg"
              >
                Se connecter
              </button>
            </div>
          )}
        </div>

        {/* Benefits Reminder */}
        <div className="mt-6 p-6 bg-gradient-to-r from-green-500/5 via-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl">
          <p className="text-sm text-center text-foreground space-y-2">
            <span className="block font-semibold text-base mb-3">✨ Votre plan PRO inclut :</span>
            <span className="block">🗺️ 4,5M+ entreprises illimitées</span>
            <span className="block">🚀 Tournées GPS optimisées (-40% km)</span>
            <span className="block">📊 CRM complet + Analytics</span>
            <span className="block">💬 Support prioritaire 7j/7</span>
            <span className="block mt-3 text-green-500 font-bold text-base">
              7 jours gratuits • Sans engagement
            </span>
          </p>
        </div>

        {/* Debug Info (only in dev) */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-4 bg-muted/20 border border-border rounded-lg text-xs font-mono">
            <p>Status: {status}</p>
            <p>User ID: {userId || 'N/A'}</p>
            <p>Countdown: {countdown}s</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutSuccess;
