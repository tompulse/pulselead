import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, Zap, ArrowRight, Lock, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
        
        // Wait a moment for trigger to complete (user_quotas creation)
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Check if user already has a plan (and it's not the auto-assigned free plan on first signup)
        console.log("[PLAN SELECTION] Fetching user quotas...");
        const { data: quotas, error: quotasError } = await supabase
          .from('user_quotas')
          .select('plan_type, is_first_login')
          .eq('user_id', session.user.id)
          .single();
        
        if (quotasError) {
          console.error("[PLAN SELECTION] Quotas fetch error:", quotasError);
          
          // If quotas don't exist yet, create them (fallback)
          if (quotasError.code === 'PGRST116') {
            console.log("[PLAN SELECTION] Quotas not found, creating fallback...");
            const { error: insertError } = await supabase
              .from('user_quotas')
              .insert({ user_id: session.user.id, plan_type: 'free', is_first_login: true });
            
            if (insertError) {
              console.error("[PLAN SELECTION] Failed to create quotas:", insertError);
              throw insertError;
            }
            
            console.log("[PLAN SELECTION] Quotas created successfully");
            setChecking(false);
            return;
          }
          
          throw quotasError;
        }
        
        console.log("[PLAN SELECTION] Quotas found:", quotas);
        
        // If user has chosen a plan before (is_first_login = false), redirect to dashboard
        if (quotas && !quotas.is_first_login) {
          console.log("[PLAN SELECTION] User already chose plan, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }
        
        console.log("[PLAN SELECTION] User needs to choose plan, showing selection");
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
        title: "Erreur",
        description: "Session expirée. Veuillez vous reconnecter.",
      });
      navigate("/auth");
      return;
    }
    
    setLoading(true);
    try {
      console.log("[FREE PLAN] Starting activation for user:", userId);
      
      // Mark that user has made their plan choice (set is_first_login to false)
      const { data: updateData, error: updateError } = await supabase
        .from('user_quotas')
        .update({ is_first_login: false })
        .eq('user_id', userId)
        .select();
      
      if (updateError) {
        console.error("[FREE PLAN] Update error:", updateError);
        throw updateError;
      }
      
      console.log("[FREE PLAN] Update successful:", updateData);
      
      toast({
        title: "🎉 Bienvenue sur PULSE !",
        description: "Votre plan gratuit est activé. Profitez de 30 prospects et 2 tournées par mois.",
        duration: 5000,
      });
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error: any) {
      console.error("[FREE PLAN] Error activating free plan:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'activation",
        description: error.message || "Impossible d'activer le plan gratuit. Réessayez ou contactez le support.",
      });
      setLoading(false);
    }
  };

  const handleProPlan = async () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Session expirée. Veuillez vous reconnecter.",
      });
      navigate("/auth");
      return;
    }
    
    setLoading(true);
    try {
      console.log("[PRO PLAN] Starting activation for user:", userId);
      
      // Mark user as having made a choice before redirecting to Stripe
      const { data: updateData, error: updateError } = await supabase
        .from('user_quotas')
        .update({ is_first_login: false })
        .eq('user_id', userId)
        .select();
      
      if (updateError) {
        console.error("[PRO PLAN] Update error:", updateError);
        throw updateError;
      }
      
      console.log("[PRO PLAN] Update successful:", updateData);

      // Appeler Stripe checkout avec trial de 7 jours
      // ⚠️ IMPORTANT: Ce price ID doit correspondre à 49€/mois sur Stripe
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId: 'price_1SqxKmHjyidZ5i9L8tCztpFU', // Price ID pour 49€/mois avec trial 7 jours
          trialDays: 7 // Essai gratuit de 7 jours
        },
      });

      if (error) {
        console.error("[PRO PLAN] Stripe checkout error:", error);
        throw error;
      }

      if (!data?.url) {
        throw new Error('Aucune URL de paiement reçue de Stripe');
      }

      console.log("[PRO PLAN] Redirecting to Stripe:", data.url);

      // Rediriger vers Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error("[PRO PLAN] Error creating checkout:", error);
      toast({
        variant: "destructive",
        title: "Erreur de paiement",
        description: error.message || "Impossible de démarrer le paiement. Veuillez réessayer ou contactez le support.",
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
