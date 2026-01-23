import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FreemiumBannerProps {
  quotas?: {
    prospects_viewed: number;
    prospects_limit: number;
    tournees_created: number;
    tournees_limit: number;
  };
}

export const FreemiumBanner = ({ quotas }: FreemiumBannerProps) => {
  const navigate = useNavigate();

  if (!quotas) return null;

  const prospectsPercent = (quotas.prospects_viewed / quotas.prospects_limit) * 100;
  const tourneesPercent = (quotas.tournees_created / quotas.tournees_limit) * 100;

  return (
    <Card className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border-accent/30 p-4 mb-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              Plan Gratuit
              <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">Limité</span>
            </h3>
            <p className="text-sm text-white/60">
              Département: {quotas.prospects_limit - quotas.prospects_viewed} prospects restants • 
              Tournées: {quotas.tournees_limit - quotas.tournees_created}/{quotas.tournees_limit} ce mois
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
            <span>Prospects visibles (1 département)</span>
            <span>{quotas.prospects_viewed}/{quotas.prospects_limit}</span>
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
            <span>{quotas.tournees_created}/{quotas.tournees_limit}</span>
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
    </Card>
  );
};
