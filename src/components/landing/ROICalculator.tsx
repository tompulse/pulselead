import { useState } from "react";
import { TrendingUp, Calculator } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export const ROICalculator = () => {
  const [visitsPerDay, setVisitsPerDay] = useState(8);
  const [avgCommission, setAvgCommission] = useState(200);
  
  // Calculs basés sur les stats moyennes PULSE
  const timeGainedPerWeek = 6; // heures économisées
  const extraVisitsPerWeek = 2.5; // visites supplémentaires possibles
  const conversionRate = 0.15; // 15% de conversion moyenne
  const extraDealsPerMonth = extraVisitsPerWeek * 4 * conversionRate;
  const monthlyGain = extraDealsPerMonth * avgCommission;
  const planCost = 99;
  const netGain = monthlyGain - planCost;
  const roi = ((monthlyGain - planCost) / planCost * 100).toFixed(0);
  
  return (
    <section className="py-16 sm:py-20 px-4 bg-gradient-to-b from-background to-primary/10">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-4">
            <Calculator className="w-4 h-4 text-accent" />
            <span className="text-sm font-bold text-accent">Calculateur ROI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Calculez votre <span className="gradient-text">retour sur investissement</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez combien PULSE peut vous rapporter chaque mois
          </p>
        </div>
        
        <div className="glass-card p-6 sm:p-8 space-y-8">
          {/* Slider 1 - Visites par jour */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Nombre de visites actuellement par jour
              </label>
              <span className="text-lg font-bold text-accent">{visitsPerDay}</span>
            </div>
            <Slider
              value={[visitsPerDay]}
              onValueChange={(value) => setVisitsPerDay(value[0])}
              min={4}
              max={15}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>4 visites</span>
              <span>15 visites</span>
            </div>
          </div>
          
          {/* Slider 2 - Commission moyenne */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Commission moyenne par vente
              </label>
              <span className="text-lg font-bold text-accent">{avgCommission}€</span>
            </div>
            <Slider
              value={[avgCommission]}
              onValueChange={(value) => setAvgCommission(value[0])}
              min={50}
              max={1000}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50€</span>
              <span>1000€</span>
            </div>
          </div>
          
          {/* Résultats */}
          <div className="mt-8 p-6 sm:p-8 bg-accent/10 rounded-xl border border-accent/30 space-y-4">
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">Gain mensuel estimé</div>
              <div className="text-4xl sm:text-5xl font-bold text-accent">+{monthlyGain.toFixed(0)}€</div>
              <div className="text-sm text-green-500 font-semibold">ROI de {roi}%</div>
            </div>
            
            <div className="pt-4 border-t border-accent/20 grid sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Ventes suppl./mois</div>
                <div className="text-xl font-bold text-foreground">{extraDealsPerMonth.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Temps économisé/semaine</div>
                <div className="text-xl font-bold text-foreground">{timeGainedPerWeek}h</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Gain net/mois</div>
                <div className="text-xl font-bold text-green-500">+{netGain.toFixed(0)}€</div>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Ces estimations sont basées sur les données moyennes de nos utilisateurs actuels
            </p>
            <button className="btn-hero inline-flex items-center gap-2 px-6 py-3">
              <TrendingUp className="w-5 h-5" />
              Démarrer mon essai gratuit
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
