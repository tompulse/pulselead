import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Play, CheckCircle, Shield, Zap, Target, Users, TrendingUp, Clock } from "lucide-react";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative container mx-auto px-4 sm:px-6 pt-20 sm:pt-28 md:pt-36 pb-12 sm:pb-16 md:pb-20 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative text-center max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
        {/* Badge */}
        <div className="flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-accent/10 border border-accent/30 backdrop-blur-sm shadow-lg shadow-accent/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-xs sm:text-sm text-accent font-bold tracking-wide">L'outil tout-en-un des commerciaux terrain</span>
          </div>
          
          {/* Stat sociale */}
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
            <span><strong className="text-accent">65 commerciaux</strong> utilisent LUMA quotidiennement</span>
          </div>
        </div>
        
        {/* Main Headline - Focus sur le développement commercial */}
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-[1.1] tracking-tight px-2">
          Prospectez <span className="gradient-text inline-block">plus malin</span>,
          <br />
          <span className="sm:inline block">vendez plus vite.</span>
        </h1>
        
        {/* Subheadline - Focus sur les bénéfices avec chiffre clé */}
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
          L'outil tout-en-un qui transforme vos prospections terrain en succès avec 
          <span className="text-accent font-bold"> +30% de commissions en moyenne</span> : 
          <span className="text-accent font-semibold"> tournées optimisées, CRM intégré et accès direct aux nouvelles entreprises</span> de votre zone.
          <span className="block mt-1 text-foreground/90">Découvrez comment en 2 minutes. ⬇</span>
        </p>
        
        {/* Badge résultat */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-xs sm:text-sm font-bold text-green-500">+30% de commissions en moyenne</span>
        </div>

        {/* CTA Principal unique et fort */}
        <div className="flex flex-col items-center gap-3 pt-4 px-4">
          <button 
            onClick={() => navigate("/auth")}
            className="group relative btn-hero inline-flex items-center justify-center gap-2 w-full sm:w-auto min-w-[240px] px-6 sm:px-8 py-2.5 sm:py-3 shadow-2xl shadow-accent/40 hover:shadow-accent/50 text-xs sm:text-sm md:text-base"
          >
            Démarrer gratuitement
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          {/* Trust indicators réels */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span className="font-medium">Aucune carte bancaire</span>
            </div>
            <span className="hidden sm:inline text-accent/30">•</span>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span className="font-medium">Configuration en 2 min</span>
            </div>
          </div>
          
          {/* Secondary CTA - Connexion */}
          <div className="flex items-center gap-4 mt-1 sm:mt-2">
            <button
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-accent hover:text-accent/80 text-xs sm:text-sm font-medium flex items-center gap-2 group transition-all"
            >
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
              Voir comment ça marche
            </button>
            <span className="text-accent/30">•</span>
            <button
              onClick={() => navigate("/auth")}
              className="text-muted-foreground hover:text-foreground text-xs sm:text-sm font-medium transition-colors"
            >
              Connexion
            </button>
          </div>
        </div>

        {/* Trust badges - confiance et résultats */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 pt-12 sm:pt-16 max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl bg-card/60 border border-accent/20">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
            <div className="text-left">
              <div className="text-[10px] sm:text-xs text-muted-foreground">100%</div>
              <div className="text-xs sm:text-sm font-bold text-foreground">RGPD</div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl bg-card/60 border border-accent/20">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
            <div className="text-left">
              <div className="text-[10px] sm:text-xs text-muted-foreground">65+</div>
              <div className="text-xs sm:text-sm font-bold text-foreground">Commerciaux</div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl bg-card/60 border border-accent/20">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
            <div className="text-left">
              <div className="text-[10px] sm:text-xs text-muted-foreground">2 min</div>
              <div className="text-xs sm:text-sm font-bold text-foreground">Setup</div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl bg-card/60 border border-accent/20">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
            <div className="text-left">
              <div className="text-[10px] sm:text-xs text-muted-foreground">Sans</div>
              <div className="text-xs sm:text-sm font-bold text-foreground">Engagement</div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl bg-card/60 border border-accent/20">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
            <div className="text-left">
              <div className="text-[10px] sm:text-xs text-muted-foreground">Tournées</div>
              <div className="text-xs sm:text-sm font-bold text-foreground">Optimisées</div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl bg-card/60 border border-accent/20">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
            <div className="text-left">
              <div className="text-[10px] sm:text-xs text-muted-foreground">CRM</div>
              <div className="text-xs sm:text-sm font-bold text-foreground">Intégré</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
