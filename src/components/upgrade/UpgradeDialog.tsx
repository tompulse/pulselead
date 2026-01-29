import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_CONFIG } from "@/config/stripe";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
  reason?: string;
}

export const UpgradeDialog = ({ 
  open, 
  onOpenChange, 
  feature = "cette fonctionnalité",
  reason = "Débloquez toutes les fonctionnalités pour booster votre prospection terrain."
}: UpgradeDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: 'destructive',
          title: 'Session expirée',
          description: 'Reconnectez-vous pour continuer'
        });
        return;
      }

      toast({
        title: '🚀 Redirection vers le paiement...',
        description: '7 jours gratuits puis 49€/mois',
        duration: 3000,
      });

      // Petit délai pour que l'utilisateur voie le toast
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stripe Payment Link with metadata
      const paymentUrl = `${STRIPE_CONFIG.PAYMENT_LINK_PRO}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.email || '')}`;
      
      // Redirect to Stripe
      window.location.href = paymentUrl;
    } catch (error: any) {
      console.error('[UPGRADE] Error:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible de rediriger vers le paiement'
      });
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card/95 backdrop-blur-xl border-accent/30 shadow-2xl shadow-accent/20">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold gradient-text flex items-center gap-2 justify-center">
            <Sparkles className="w-7 h-7" />
            Passez à PULSE PRO !
          </DialogTitle>
          <DialogDescription className="text-white/70 text-center text-base mt-2">
            {reason}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          {feature && (
            <div className="text-center">
              <p className="text-lg font-semibold text-white mb-1">
                Fonctionnalité : <span className="text-accent">{feature}</span>
              </p>
              <p className="text-sm text-white/50">
                Disponible uniquement avec le plan PRO
              </p>
            </div>
          )}
          
          {/* Prix */}
          <div className="bg-gradient-to-br from-accent/20 via-accent/10 to-transparent border-2 border-accent/40 rounded-2xl p-6 text-center shadow-xl">
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-5xl font-bold gradient-text">49€</span>
              <span className="text-xl text-white/60">/mois</span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-green-400" />
              <p className="text-green-400 font-bold text-lg">7 jours d'essai GRATUIT</p>
            </div>
            <p className="text-xs text-white/50">
              Sans engagement • Annulez quand vous voulez
            </p>
          </div>

          {/* Fonctionnalités */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-center mb-4">✨ Tout ce que vous débloquez :</h4>
            
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:border-accent/30 transition-colors">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-white font-medium">🎯 4,5M+ entreprises illimitées</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:border-accent/30 transition-colors">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-white font-medium">🔥 Tournées GPS illimitées</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:border-accent/30 transition-colors">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-white">CRM complet avec rappels automatiques</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:border-accent/30 transition-colors">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-white">Export CSV de vos données</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:border-accent/30 transition-colors">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-white">Support prioritaire 7j/7</span>
              </div>
            </div>
          </div>

          {/* ROI */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
            <p className="text-green-400 font-bold">
              💰 ROI moyen de 380% sur le premier mois
            </p>
            <p className="text-white/60 text-sm mt-1">
              Nos utilisateurs PRO génèrent en moyenne +4 500€ de CA mensuel
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="space-y-3">
          <Button 
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-6 text-lg shadow-2xl hover:shadow-green-500/50 transition-all"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Redirection...
              </>
            ) : (
              <>
                🚀 Essayer 7 jours GRATUITEMENT
              </>
            )}
          </Button>
          
          <Button 
            onClick={() => onOpenChange(false)}
            disabled={loading}
            variant="ghost" 
            className="w-full text-white/70 hover:text-white hover:bg-white/5"
          >
            Plus tard
          </Button>
        </div>

        <p className="text-center text-xs text-white/40 mt-2">
          <Lock className="w-3 h-3 inline mr-1" />
          Paiement 100% sécurisé par Stripe
        </p>
      </DialogContent>
    </Dialog>
  );
};
