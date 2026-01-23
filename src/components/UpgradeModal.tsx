import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
  currentQuota?: string;
  proFeature?: string;
}

export const UpgradeModal = ({ 
  open, 
  onOpenChange, 
  feature, 
  currentQuota, 
  proFeature 
}: UpgradeModalProps) => {
  const navigate = useNavigate();

  const handleUpgradeClick = () => {
    onOpenChange(false);
    navigate('/#pricing');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card text-white border-accent/20 shadow-xl shadow-accent/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Passez à PULSE PRO !
          </DialogTitle>
          <DialogDescription className="text-white/70 mt-2">
            Débloquez toutes les fonctionnalités pour booster votre prospection terrain.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <p className="text-lg font-semibold text-white">
            Fonctionnalité : <span className="text-accent">{feature}</span>
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-2">
                <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-white/80 text-sm">Plan Gratuit</span>
              </div>
              <span className="text-red-400 font-medium text-sm text-right">
                {currentQuota || "Accès limité"}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <span className="text-white/80 text-sm">Plan PRO</span>
              </div>
              <span className="text-emerald-400 font-medium text-sm text-right">
                {proFeature || "Accès illimité"}
              </span>
            </div>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 space-y-2">
            <h4 className="font-bold text-white text-sm">✨ Avec PRO, vous débloquez :</h4>
            <ul className="text-xs text-white/70 space-y-1 ml-4">
              <li>• 4,5M+ entreprises sans limite</li>
              <li>• Tournées illimitées</li>
              <li>• CRM complet avec rappels automatiques</li>
              <li>• Export CSV de vos prospects</li>
              <li>• Support prioritaire 7j/7</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
          >
            Rester en Gratuit
          </Button>
          <Button 
            onClick={handleUpgradeClick} 
            className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 font-bold w-full sm:w-auto"
          >
            Passer à PRO (49€/mois)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
