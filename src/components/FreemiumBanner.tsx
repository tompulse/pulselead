import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Lock, Unlock, Route as RouteIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FreemiumBannerProps {
  quotas?: {
    prospects_unlocked: number;
    prospects_limit: number;
    tournees_created: number;
    tournees_limit: number;
  };
}

export const FreemiumBanner = ({ quotas }: FreemiumBannerProps) => {
  const navigate = useNavigate();

  if (!quotas) return null;

  const prospectsPercent = (quotas.prospects_unlocked / quotas.prospects_limit) * 100;
  const tourneesPercent = (quotas.tournees_created / quotas.tournees_limit) * 100;

  const isProspectLimitClose = prospectsPercent >= 75;
  const isTourneeLimitClose = tourneesPercent >= 75;

  return (
    <Card className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border-accent/30 p-4 mb-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/30 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
            {isProspectLimitClose || isTourneeLimitClose ? (
              <Lock className="w-5 h-5 text-orange-400" />
            ) : (
              <Unlock className="w-5 h-5 text-accent" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              Plan Gratuit
              <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                {quotas.prospects_unlocked}/30 débloqués
              </span>
            </h3>
            <p className="text-sm text-white/60">
              Cliquez sur <Unlock className="w-3 h-3 inline" /> pour débloquer vos prospects • 
              Tournées : {quotas.tournees_created}/{quotas.tournees_limit} ce mois
            </p>
          </div>
        </div>

        <Button 
          onClick={() => navigate('/#pricing')}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold shadow-lg hover:shadow-green-500/50 transition-all"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Passer à PRO (49€/mois)
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Progress bars */}
      <div className="mt-4 space-y-2">
        <div>
          <div className="flex justify-between text-xs text-white/60 mb-1">
            <span className="flex items-center gap-1">
              <Unlock className="w-3 h-3" />
              Prospects débloqués
            </span>
            <span className={prospectsPercent >= 100 ? 'text-red-400 font-bold' : ''}>
              {quotas.prospects_unlocked}/{quotas.prospects_limit}
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
          {prospectsPercent >= 100 && (
            <p className="text-xs text-red-400 mt-1 font-semibold">
              ⚠️ Limite atteinte ! Passez à PRO pour 4,5M+ entreprises
            </p>
          )}
        </div>

        <div>
          <div className="flex justify-between text-xs text-white/60 mb-1">
            <span className="flex items-center gap-1">
              <RouteIcon className="w-3 h-3" />
              Tournées créées ce mois
            </span>
            <span className={tourneesPercent >= 100 ? 'text-red-400 font-bold' : ''}>
              {quotas.tournees_created}/{quotas.tournees_limit}
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
          {tourneesPercent >= 100 && (
            <p className="text-xs text-red-400 mt-1 font-semibold">
              ⚠️ Limite atteinte ! Passez à PRO pour tournées illimitées
            </p>
          )}
        </div>
      </div>

      {/* Benefits teaser */}
      {(isProspectLimitClose || isTourneeLimitClose) && (
        <div className="mt-4 pt-4 border-t border-accent/20">
          <p className="text-xs text-center text-white/80">
            💎 <strong className="text-emerald-400">Avec PRO :</strong> 4,5M+ entreprises illimitées • 
            Tournées illimitées • CRM complet • Rappels automatiques • Export CSV
          </p>
        </div>
      )}
    </Card>
  );
};
