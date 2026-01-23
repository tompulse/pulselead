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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUserId(session.user.id);
      
      // Check if user already has a plan (and it's not the auto-assigned free plan on first signup)
      const { data: quotas } = await supabase
        .from('user_quotas')
        .select('plan_type, is_first_login')
        .eq('user_id', session.user.id)
        .single();
      
      // If user has chosen a plan before (is_first_login = false), redirect to dashboard
      if (quotas && !quotas.is_first_login) {
        navigate("/dashboard");
        return;
      }
      
      setChecking(false);
    };
    
    checkUserAndPlan();
  }, [navigate]);

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
    if (!userId) return;
    
    setLoading(true);
    try {
      // Mark that user has made their plan choice (set is_first_login to false)
      await supabase
        .from('user_quotas')
        .update({ is_first_login: false })
        .eq('user_id', userId);
      
      toast({
        title: "🎉 Bienvenue sur PULSE !",
        description: "Votre plan gratuit est activé. Profitez de 30 prospects et 2 tournées par mois.",
        duration: 5000,
      });
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error: any) {
      console.error("Error activating free plan:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'activer le plan gratuit. Réessayez.",
      });
      setLoading(false);
    }
  };

  const handleProPlan = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Appeler Stripe checkout avec trial de 7 jours
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId: 'price_1SqxKmHjyidZ5i9L8tCztpFU', // Ton price ID Stripe
          trialDays: 7 // Essai de 7 jours
        },
      });

      if (error) throw error;

      if (!data?.url) {
        throw new Error('No checkout URL received');
      }

      // Rediriger vers Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de démarrer le paiement. Réessayez.",
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
            <span className="gradient-text">Choisissez votre plan</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Commencez gratuitement ou profitez de l'essai PRO sans engagement
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Plan Gratuit */}
          <Card className="relative glass-card border-white/20 p-8 hover:border-accent/40 transition-all duration-300">
            <div className="absolute top-6 right-6">
              <Unlock className="w-8 h-8 text-accent opacity-20" />
            </div>
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Plan Découverte</h3>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-bold text-white">Gratuit</span>
                <span className="text-white/50">/mois</span>
              </div>
              <p className="text-white/60">Pour tester PULSE sans engagement</p>
            </div>

            <Button
              onClick={handleFreePlan}
              disabled={loading}
              className="w-full mb-6 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold py-6 text-lg"
            >
              {loading ? "Chargement..." : "Commencer gratuitement"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-white/80 text-sm"><strong>30 prospects</strong> débloqués max</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-white/80 text-sm"><strong>2 tournées</strong> par mois</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-white/80 text-sm">Illimité d'entreprises par tournée</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-white/80 text-sm">Filtres complets (NAF, dept, effectif)</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-white/80 text-sm">CRM basique (notes)</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-white/80 text-sm">GPS intégré</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-white/50 text-center">
                Sans carte bancaire • Accès immédiat
              </p>
            </div>
          </Card>

          {/* Plan PRO */}
          <Card className="relative glass-card border-accent/50 p-8 shadow-xl shadow-accent/20 hover:border-accent/70 transition-all duration-300">
            {/* Badge Popular */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Recommandé
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
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-3">
                <p className="text-green-400 font-semibold text-sm">
                  ✨ 7 jours d'essai gratuit
                </p>
                <p className="text-white/60 text-xs mt-1">
                  Annulez avant le 7ème jour pour ne rien payer
                </p>
              </div>
            </div>

            <Button
              onClick={handleProPlan}
              disabled={loading}
              className="w-full mb-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-6 text-lg shadow-lg"
            >
              {loading ? "Redirection..." : "Essayer 7 jours gratuitement"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white font-semibold text-sm"><strong>4,5M+ entreprises</strong> illimitées</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white font-semibold text-sm"><strong>Tournées illimitées</strong></span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/80 text-sm">Illimité d'entreprises par tournée</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/80 text-sm">CRM complet (rappels, pipeline)</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/80 text-sm">Notifications automatiques</span>
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
