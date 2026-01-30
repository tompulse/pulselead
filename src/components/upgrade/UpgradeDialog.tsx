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
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-accent/30 shadow-2xl shadow-accent/20">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-bold gradient-text flex items-center gap-2 justify-center">
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
            Passez à PRO !
          </DialogTitle>
          {reason && (
            <DialogDescription className="text-white/70 text-center text-sm mt-2">
              {reason}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Prix */}
          <div className="bg-gradient-to-br from-accent/20 via-accent/10 to-transparent border-2 border-accent/40 rounded-xl p-4 text-center">
            <div className="flex items-baseline justify-center gap-2 mb-1">
              <span className="text-4xl sm:text-5xl font-bold gradient-text">49€</span>
              <span className="text-lg text-white/60">/mois</span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-green-400" />
              <p className="text-green-400 font-bold text-sm sm:text-base">7 jours GRATUITS</p>
            </div>
            <p className="text-xs text-white/50">
              Sans engagement
            </p>
          </div>

          {/* Fonctionnalités - Version compacte */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10">
              <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
              <span className="text-white text-sm font-medium">🎯 Nouvelles entreprises, chaque semaine</span>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10">
              <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
              <span className="text-white text-sm font-medium">🔥 Tournées GPS illimitées</span>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10">
              <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
              <span className="text-white text-sm">CRM complet</span>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10">
              <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
              <span className="text-white text-sm">Export CSV</span>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10">
              <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
              <span className="text-white text-sm">Support prioritaire</span>
            </div>
          </div>

          {/* ROI - Version compacte */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
            <p className="text-green-400 font-bold text-sm">
              💰 ROI moyen +380%
            </p>
            <p className="text-white/60 text-xs mt-1">
              +4 500€ de CA/mois en moyenne
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="space-y-2">
          <Button 
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-5 sm:py-6 text-base sm:text-lg shadow-2xl hover:shadow-green-500/50 transition-all"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Redirection...
              </>
            ) : (
              <>
                🚀 Essayer 7j GRATUIT
              </>
            )}
          </Button>
          
          <Button 
            onClick={() => onOpenChange(false)}
            disabled={loading}
            variant="ghost" 
            className="w-full text-white/70 hover:text-white hover:bg-white/5 py-2"
          >
            Plus tard
          </Button>
        </div>

        <p className="text-center text-xs text-white/40">
          <Lock className="w-3 h-3 inline mr-1" />
          Paiement sécurisé Stripe
        </p>
      </DialogContent>
    </Dialog>
  );
};
