import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
  currentQuota?: string;
  proFeature?: string;
}

export const UpgradeModal = ({ open, onOpenChange, feature, currentQuota, proFeature }: UpgradeModalProps) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/#pricing');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-card via-card/95 to-accent/5 border-accent/20">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-accent" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Passez à <span className="gradient-text">PRO</span>
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Débloquez toutes les fonctionnalités pour booster votre prospection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-sm text-red-400 font-semibold mb-1">Plan Gratuit - Limite atteinte</p>
            <p className="text-sm text-white/70">{currentQuota || feature}</p>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
            <p className="text-sm text-emerald-400 font-semibold mb-3">Plan PRO à 49€/mois</p>
            <ul className="space-y-2">
              {[
                "4,5M+ entreprises en France",
                "Tournées illimitées optimisées",
                "CRM complet avec rappels",
                "Tous les filtres et exports",
                proFeature || "Accès illimité"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 text-center">
            <p className="text-sm text-white/70">
              💰 <strong className="text-emerald-400">ROI garanti :</strong> Économisez 200€/mois en essence + temps
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-6 text-lg shadow-xl hover:shadow-green-500/50 transition-all"
          >
            Passer à PRO maintenant
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            onClick={() => onOpenChange(false)}
            variant="ghost"
            className="w-full text-white/60 hover:text-white"
          >
            Plus tard
          </Button>
        </div>

        <p className="text-center text-xs text-white/40 mt-4">
          ✅ 7 jours d'essai gratuit • Garantie 30j satisfait ou remboursé
        </p>
      </DialogContent>
    </Dialog>
  );
};
