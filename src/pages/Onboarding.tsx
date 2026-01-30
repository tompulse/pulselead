import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Check, Sparkles, ArrowRight, Unlock, Zap } from 'lucide-react';
import { STRIPE_CONFIG } from '@/config/stripe';

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.log('[ONBOARDING] No session, redirecting to auth');
          navigate('/auth');
          return;
        }

        setUserId(session.user.id);
        setUserEmail(session.user.email || '');

        // Vérifier si l'onboarding a déjà été complété
        const { data: quotas } = await supabase
          .from('user_quotas')
          .select('plan_type, is_first_login')
          .eq('user_id', session.user.id)
          .single();

        console.log('[ONBOARDING] Quotas check:', quotas);

        // Si l'utilisateur a déjà un plan actif, rediriger vers dashboard
        if (quotas && quotas.is_first_login === false) {
          console.log('[ONBOARDING] User already has active plan, redirecting to dashboard');
          navigate('/dashboard');
          return;
        }

        // Sinon, afficher la sélection de plan
        setChecking(false);
      } catch (error) {
        console.error('[ONBOARDING] Error:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger votre profil'
        });
        navigate('/auth');
      }
    };

    checkUser();
  }, [navigate, toast]);

  const handleFreePlan = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      console.log('[ONBOARDING] Activating FREE plan for user:', userId);
      
      const { error } = await supabase.rpc('activate_free_plan', {
        p_user_id: userId
      });

      if (error) throw error;

      toast({
        title: '🎉 Bienvenue sur PULSE FREE !',
        description: '30 prospects et 2 tournées par mois',
        duration: 3000,
      });

      // Petit délai pour que l'utilisateur voie le toast
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error: any) {
      console.error('[ONBOARDING] Error activating FREE plan:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || "Impossible d'activer le plan gratuit",
      });
      setLoading(false);
    }
  };

  const handleProPlan = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      console.log('[ONBOARDING] Redirecting to Stripe for PRO plan');
      
      toast({
        title: '🚀 Redirection vers le paiement...',
        description: '7 jours gratuits puis 49€/mois',
        duration: 3000,
      });

      // Petit délai pour que l'utilisateur voie le toast
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to Stripe Payment Link avec metadata
      const paymentUrl = `${STRIPE_CONFIG.PAYMENT_LINK_PRO}?client_reference_id=${userId}&prefilled_email=${encodeURIComponent(userEmail)}`;
      window.location.href = paymentUrl;
    } catch (error: any) {
      console.error('[ONBOARDING] Error redirecting to Stripe:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible de rediriger vers le paiement',
      });
      setLoading(false);
    }
  };

  // Loading state
  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-navy-deep to-black-deep flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-white/70">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-navy-deep to-black-deep flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Bienvenue sur PULSE</span> 🎉
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-3">
            Démarrez votre essai gratuit de 7 jours maintenant
          </p>
          <p className="text-white/50 text-sm">
            ✨ <strong>New entreprises 3 derniers mois</strong> • Tournées GPS optimisées • CRM complet
          </p>
        </div>

        {/* Plans Grid */}
        <div className="flex justify-center max-w-2xl mx-auto">
          
          {/* ═══════════════════════════════════════════════════════════════════
              🔒 PLAN GRATUIT - MASQUÉ (Code conservé pour réactivation future)
              
              Pour réactiver :
              1. Changer "flex justify-center" en "grid md:grid-cols-2 gap-8"
              2. Changer max-w-2xl en max-w-5xl
              3. Décommenter la Card ci-dessous
          ═══════════════════════════════════════════════════════════════════
          <Card className="relative glass-card border-white/20 p-8 hover:border-white/30 transition-all duration-300 animate-slide-up">
            <div className="absolute top-6 right-6">
              <Unlock className="w-8 h-8 text-white/10" />
            </div>
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white/90 mb-2">Plan Découverte</h3>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-bold text-white/90">Gratuit</span>
                <span className="text-white/40">/mois</span>
              </div>
              <p className="text-white/50 text-sm">Idéal pour découvrir PULSE et ses fonctionnalités de base</p>
            </div>

            <Button
              onClick={handleFreePlan}
              disabled={loading}
              variant="outline"
              className="w-full mb-6 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/20 font-medium py-6 text-base"
            >
              {loading ? 'Activation...' : 'Commencer gratuitement'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-white/50 mt-0.5 flex-shrink-0" />
                <span className="text-white/70 text-sm"><strong>30 prospects</strong> débloqués max/mois</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-white/50 mt-0.5 flex-shrink-0" />
                <span className="text-white/70 text-sm"><strong>2 tournées</strong> par mois</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-white/50 mt-0.5 flex-shrink-0" />
                <span className="text-white/70 text-sm">Nouveaux prospects par tournée</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-white/50 mt-0.5 flex-shrink-0" />
                <span className="text-white/70 text-sm">Filtres de base</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-white/50 mt-0.5 flex-shrink-0" />
                <span className="text-white/70 text-sm">CRM basique (notes)</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-white/40 text-center">
                Sans carte bancaire • Accès immédiat
              </p>
            </div>
          </Card>
          ═══════════════════════════════════════════════════════════════════ */}

          {/* Plan PRO - Seule option disponible */}
          <Card className="relative glass-card border-accent/50 p-8 shadow-2xl shadow-accent/30 hover:border-accent/70 hover:shadow-accent/40 transition-all duration-300 animate-slide-up w-full max-w-md">
            {/* Badge Popular */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl flex items-center gap-2 animate-pulse">
                <Sparkles className="w-5 h-5" />
                ⭐ Recommandé
              </div>
            </div>

            <div className="absolute top-6 right-6">
              <Zap className="w-8 h-8 text-accent" />
            </div>
            
            <div className="mb-6 mt-2">
              <h3 className="text-2xl font-bold text-white mb-2">Plan PRO</h3>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-bold gradient-text">49€</span>
                <span className="text-white/50">/mois</span>
              </div>
              <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/40 rounded-lg p-4 mb-3 shadow-lg">
                <p className="text-green-400 font-bold text-base flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  7 jours d'essai GRATUIT
                </p>
                <p className="text-white/70 text-sm mt-1">
                  Aucun paiement pendant 7 jours • Annulez à tout moment
                </p>
              </div>
              <p className="text-white/50 text-xs mb-3">
                💰 <strong className="text-white/70">ROI moyen de 380%</strong> sur le premier mois d'utilisation
              </p>
            </div>

            <Button
              onClick={handleProPlan}
              disabled={loading}
              className="w-full mb-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-7 text-lg shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-105"
            >
              {loading ? 'Redirection...' : '🚀 Essayer 7 jours GRATUITEMENT'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white font-bold text-base">🎯 <strong>New entreprises 3 derniers mois</strong> · MAJ hebdo</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white font-bold text-base">🔥 <strong>Tournées illimitées</strong></span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/90 text-sm">Nouveaux prospects par tournée</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/90 text-sm">CRM complet (rappels, pipeline, historique)</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/90 text-sm">Notifications & rappels automatiques</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/80 text-sm">Export CSV</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/80 text-sm">Support prioritaire 7j/7</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-accent/20">
              <p className="text-xs text-white/70 text-center">
                🔒 Paiement sécurisé • Annulation en 1 clic • Sans engagement
              </p>
            </div>
          </Card>

        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-white/50 text-sm">
            🔒 Vos données sont sécurisées • Conforme RGPD • Paiement Stripe
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
