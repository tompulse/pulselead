import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, Zap, ArrowRight, Lock, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { STRIPE_CONFIG } from "@/config/stripe";

const PlanSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if user is logged in and if they already selected a plan
    const checkUserAndPlan = async () => {
      try {
        console.log("[PLAN SELECTION] Checking user session...");
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("[PLAN SELECTION] Session error:", sessionError);
          throw sessionError;
        }
        
        if (!session) {
          console.log("[PLAN SELECTION] No session found, redirecting to auth");
          navigate("/auth");
          return;
        }
        
        console.log("[PLAN SELECTION] User session found:", session.user.id);
        setUserId(session.user.id);
        
        // Reduced wait time since trigger is now disabled
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Check if user already has chosen a plan
        console.log("[PLAN SELECTION] Fetching user quotas and subscription...");
        const { data: quotas, error: quotasError } = await supabase
          .from('user_quotas')
          .select('plan_type, is_first_login')
          .eq('user_id', session.user.id)
          .single();
        
        const { data: subscription, error: subError } = await supabase
          .from('user_subscriptions')
          .select('subscription_status, plan_type')
          .eq('user_id', session.user.id)
          .single();
        
        console.log("[PLAN SELECTION] Quotas:", quotas, "Error:", quotasError);
        console.log("[PLAN SELECTION] Subscription:", subscription, "Error:", subError);
        
        // 🔥 SI AUCUN PLAN → AFFICHER SÉLECTION
        if (!quotas || quotasError) {
          console.log("[PLAN SELECTION] No quotas found, showing selection");
          setChecking(false);
          return;
        }
        
        // Si plan FREE actif → rediriger vers dashboard
        if (quotas.plan_type === 'free' && quotas.is_first_login === false) {
          console.log("[PLAN SELECTION] FREE plan active, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }
        
        // Si plan PRO avec subscription active/trialing → rediriger vers dashboard
        if (quotas.plan_type === 'pro' && subscription && ['active', 'trialing'].includes(subscription.subscription_status)) {
          console.log("[PLAN SELECTION] PRO plan with active subscription, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }
        
        // Plan PRO sans paiement OU is_first_login=true → montrer sélection
        console.log("[PLAN SELECTION] Showing plan selection");
        setChecking(false);
      } catch (error: any) {
        console.error("[PLAN SELECTION] Fatal error:", error);
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: error.message || "Impossible de charger votre profil. Rechargez la page ou contactez le support.",
        });
        // Still show plan selection even on error
        setChecking(false);
      }
    };
    
    checkUserAndPlan();
  }, [navigate, toast]);

  // Show loading while checking
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

  const handleFreePlan = async () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "❌ Session expirée",
        description: "Reconnecte-toi pour continuer !",
      });
      navigate("/auth");
      return;
    }
    
    setLoading(true);
    try {
      console.log("[FREE PLAN] Activating FREE plan immediately");
      
      const { error } = await supabase.rpc('activate_free_plan', {
        p_user_id: userId
      });

      if (error) throw error;

      toast({
        title: "🎉 Bienvenue sur PULSE FREE !",
        description: "30 prospects et 2 tournées/mois",
        duration: 3000,
      });

      setTimeout(() => navigate("/dashboard"), 500);
    } catch (error: any) {
      console.error("[FREE PLAN] Error:", error);
      toast({
        variant: "destructive",
        title: "❌ Erreur",
        description: error.message || "Impossible d'activer le plan gratuit",
      });
      setLoading(false);
    }
  };

  const handleProPlan = async () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "❌ Session expirée",
        description: "Reconnecte-toi pour continuer !",
      });
      navigate("/auth");
      return;
    }
    
    setLoading(true);
    try {
      console.log("[PRO PLAN] Redirecting to Stripe (no plan created yet)");

      // 🔥 NE PAS créer le plan PRO avant le paiement
      // Le webhook Stripe créera le plan après paiement réussi
      
      toast({
        title: "🚀 Redirection vers le paiement...",
        description: "Paiement sécurisé par Stripe. 7 jours d'essai gratuits !",
        duration: 3000,
      });

      // Small delay to show the toast
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to Stripe Payment Link avec client_reference_id = userId
      const paymentUrl = `${STRIPE_CONFIG.PAYMENT_LINK_PRO}?client_reference_id=${userId}`;
      window.location.href = paymentUrl;
    } catch (error: any) {
      console.error("[PRO PLAN] Error redirecting to Stripe:", error);
      toast({
        variant: "destructive",
        title: "❌ Oups !",
        description: error.message || "Impossible d'accéder au paiement. Réessaye dans quelques secondes !",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-navy-deep to-black-deep flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Bienvenue sur PULSE</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-3">
            Choisissez votre plan pour commencer à optimiser vos tournées
          </p>
          <p className="text-white/50 text-sm">
            💡 <strong>93% de nos commerciaux</strong> choisissent le plan PRO pour accéder aux 4,5M+ entreprises
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Plan Gratuit */}
          <Card className="relative glass-card border-white/20 p-8 hover:border-white/30 transition-all duration-300">
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
              {loading ? "Chargement..." : "Commencer gratuitement"}
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
                <span className="text-white/70 text-sm">Entreprises illimitées par tournée</span>
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

          {/* Plan PRO */}
          <Card className="relative glass-card border-accent/50 p-8 shadow-2xl shadow-accent/30 hover:border-accent/70 hover:shadow-accent/40 transition-all duration-300 scale-105">
            {/* Badge Popular */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl flex items-center gap-2 animate-pulse">
                <Sparkles className="w-5 h-5" />
                ⭐ Choix n°1
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
              {loading ? "Redirection vers le paiement..." : "🚀 Essayer 7 jours GRATUITEMENT"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white font-bold text-base">🎯 <strong>4,5M+ entreprises</strong> illimitées</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white font-bold text-base">🔥 <strong>Tournées illimitées</strong></span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/90 text-sm">Entreprises illimitées par tournée</span>
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
                <Lock className="w-3 h-3 inline mr-1" />
                Paiement sécurisé • Annulation en 1 clic
              </p>
            </div>
          </Card>

        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-white/50 text-sm">
            🔒 Vos données sont sécurisées • Conforme RGPD • Sans engagement
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanSelection;
