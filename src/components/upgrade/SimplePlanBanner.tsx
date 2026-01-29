import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { PlanBadge } from "./PlanBadge";
import { useState } from "react";
import { UpgradeDialog } from "./UpgradeDialog";

interface SimplePlanBannerProps {
  userPlan?: {
    plan_type: 'free' | 'pro';
    prospects_unlocked_count?: number;
    prospects_limit?: number;
    tournees_created_count?: number;
    tournees_limit?: number;
  };
}

export const SimplePlanBanner = ({ userPlan }: SimplePlanBannerProps) => {
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (!userPlan) return null;

  const isFree = userPlan.plan_type === 'free';
  
  if (!isFree) {
    // PRO user - Simple badge banner
    return (
      <Card className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border-accent/30 p-4 mb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <PlanBadge plan="pro" showIcon={true} />
            <div>
              <h3 className="font-bold text-white">Accès PRO illimité</h3>
              <p className="text-sm text-white/60">
                Profitez de toutes les fonctionnalités sans limite
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // FREE user - Show upgrade CTA
  const prospectsPercent = userPlan.prospects_limit 
    ? ((userPlan.prospects_unlocked_count || 0) / userPlan.prospects_limit) * 100
    : 0;
  
  const tourneesPercent = userPlan.tournees_limit
    ? ((userPlan.tournees_created_count || 0) / userPlan.tournees_limit) * 100
    : 0;

  return (
    <>
      <Card className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border-accent/30 p-4 mb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1">
            <PlanBadge plan="free" showIcon={true} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-white">Plan Découverte</h3>
                <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                  {userPlan.prospects_unlocked_count || 0}/{userPlan.prospects_limit || 30} prospects
                </span>
              </div>
              <p className="text-sm text-white/60">
                Passez à PRO pour un accès illimité à 4,5M+ entreprises
              </p>
            </div>
          </div>

          <Button 
            onClick={() => setShowUpgrade(true)}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold shadow-lg hover:shadow-green-500/50 transition-all"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Passer à PRO
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Progress bars */}
        {isFree && (
          <div className="mt-4 space-y-2">
            <div>
              <div className="flex justify-between text-xs text-white/60 mb-1">
                <span>Prospects débloqués</span>
                <span className={prospectsPercent >= 100 ? 'text-red-400 font-bold' : ''}>
                  {userPlan.prospects_unlocked_count || 0}/{userPlan.prospects_limit || 30}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    prospectsPercent >= 100 ? 'bg-red-500' : 
                    prospectsPercent >= 75 ? 'bg-orange-500' : 
                    'bg-accent'
                  }`}
                  style={{ width: `${Math.min(prospectsPercent, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-white/60 mb-1">
                <span>Tournées créées ce mois</span>
                <span className={tourneesPercent >= 100 ? 'text-red-400 font-bold' : ''}>
                  {userPlan.tournees_created_count || 0}/{userPlan.tournees_limit || 2}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    tourneesPercent >= 100 ? 'bg-red-500' : 
                    tourneesPercent >= 75 ? 'bg-orange-500' : 
                    'bg-accent'
                  }`}
                  style={{ width: `${Math.min(tourneesPercent, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      <UpgradeDialog
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        feature="Accès illimité"
        reason="Passez à PRO pour débloquer un accès illimité à toutes les fonctionnalités."
      />
    </>
  );
};
