import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Play, CheckCircle, Shield, Zap, Target, Users, TrendingUp, Clock } from "lucide-react";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative container mx-auto px-4 sm:px-6 pt-24 sm:pt-32 md:pt-40 pb-16 sm:pb-20 md:pb-24 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 sm:w-96 md:w-[500px] h-72 sm:h-96 md:h-[500px] bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-72 sm:w-96 md:w-[500px] h-72 sm:h-96 md:h-[500px] bg-primary/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative text-center max-w-6xl mx-auto space-y-8 sm:space-y-10 animate-fade-in">
        {/* Badge */}
        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2.5 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-accent/15 border border-accent/40 backdrop-blur-md shadow-xl shadow-accent/20 hover:shadow-accent/30 transition-all duration-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
            </span>
            <span className="text-sm sm:text-base text-accent font-bold tracking-wide">L'outil tout-en-un des commerciaux terrain</span>
          </div>
          
          {/* Stat sociale */}
          <div className="inline-flex items-center gap-2.5 text-sm sm:text-base text-muted-foreground/80">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            <span><strong className="text-accent font-bold">65 commerciaux</strong> utilisent LUMA quotidiennement</span>
          </div>
        </div>
        
        {/* Main Headline - Focus sur le développement commercial */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight px-2">
          Prospectez <span className="gradient-text inline-block">plus malin</span>,
          <br />
          <span className="sm:inline block">vendez plus vite.</span>
        </h1>
        
        {/* Subheadline - Focus sur les bénéfices avec chiffre clé */}
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground/90 max-w-3xl mx-auto leading-relaxed px-4">
          L'outil tout-en-un qui transforme vos prospections terrain en succès avec 
          <span className="text-accent font-bold"> +30% de commissions en moyenne</span> : 
          <span className="text-accent font-semibold"> tournées optimisées, CRM intégré et accès direct aux nouvelles entreprises</span> de votre zone.
          <span className="block mt-2 text-foreground font-medium">Découvrez comment en 2 minutes. ⬇</span>
        </p>
        
        {/* Badge résultat */}
        <div className="inline-flex items-center gap-2.5 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-green-500/15 border border-green-500/40 shadow-lg shadow-green-500/20">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <span className="text-sm sm:text-base font-bold text-green-500">+30% de commissions en moyenne</span>
        </div>

        {/* CTA Principal unique et fort */}
        <div className="flex flex-col items-center gap-4 pt-6 px-4">
          <button 
            onClick={() => navigate("/auth")}
            className="group relative btn-hero inline-flex items-center justify-center gap-3 w-full sm:w-auto min-w-[280px] px-8 sm:px-10 py-4 sm:py-5 shadow-2xl shadow-accent/50 hover:shadow-accent/60 text-base sm:text-lg md:text-xl font-bold hover:scale-105 transition-all duration-300"
          >
            Démarrer gratuitement
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          {/* Trust indicators réels */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm sm:text-base text-muted-foreground/80">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-accent" />
              <span className="text-foreground font-medium">Aucune carte bancaire</span>
            </div>
            <span className="hidden sm:inline text-muted-foreground/40">•</span>
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-foreground font-medium">Configuration en 2 min</span>
            </div>
          </div>
          
          {/* Navigation secondaire */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm sm:text-base text-muted-foreground/80">
            <button 
              onClick={() => {
                const demoSection = document.getElementById('demo-section');
                demoSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 hover:text-accent transition-colors font-medium"
            >
              <Play className="w-5 h-5" />
              <span>Voir comment ça marche</span>
            </button>
            <span className="hidden sm:inline text-muted-foreground/40">•</span>
            <button 
              onClick={() => navigate("/auth")}
              className="hover:text-accent transition-colors font-medium"
            >
              Connexion
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 pt-12 sm:pt-16 px-4 sm:px-0">
          <div className="flex flex-col items-center justify-center gap-3 p-5 sm:p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-md hover:border-accent/60 hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1">
            <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-accent" />
            <div className="text-center">
              <div className="text-base sm:text-lg font-bold text-foreground">100%</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">RGPD</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-3 p-5 sm:p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-md hover:border-accent/60 hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1">
            <Users className="w-7 h-7 sm:w-8 sm:h-8 text-accent" />
            <div className="text-center">
              <div className="text-base sm:text-lg font-bold text-foreground">65+</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">Commerciaux</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-3 p-5 sm:p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-md hover:border-accent/60 hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1">
            <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-accent" />
            <div className="text-center">
              <div className="text-base sm:text-lg font-bold text-foreground">2 min</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">Setup</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-3 p-5 sm:p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-md hover:border-accent/60 hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1">
            <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-accent" />
            <div className="text-center">
              <div className="text-base sm:text-lg font-bold text-foreground">Sans</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">Engagement</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-3 p-5 sm:p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-md hover:border-accent/60 hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1">
            <Target className="w-7 h-7 sm:w-8 sm:h-8 text-accent" />
            <div className="text-center">
              <div className="text-base sm:text-lg font-bold text-foreground">Tournées</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">Optimisées</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-3 p-5 sm:p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-md hover:border-accent/60 hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1">
            <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-accent" />
            <div className="text-center">
              <div className="text-base sm:text-lg font-bold text-foreground">CRM</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">Intégré</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
