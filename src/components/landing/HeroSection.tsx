import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Play, CheckCircle, Shield, Zap, Target, Users, TrendingUp, Clock } from "lucide-react";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative container mx-auto px-4 sm:px-6 pt-8 sm:pt-12 md:pt-16 pb-8 sm:pb-10 md:pb-12 overflow-hidden min-h-screen flex items-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 sm:w-96 md:w-[500px] h-72 sm:h-96 md:h-[500px] bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-72 sm:w-96 md:w-[500px] h-72 sm:h-96 md:h-[500px] bg-primary/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative text-center max-w-6xl mx-auto space-y-5 sm:space-y-6 animate-fade-in w-full">
        {/* Badge */}
        <div className="flex flex-col items-center gap-2.5">
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-accent/15 border border-accent/40 backdrop-blur-md shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all duration-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-xs sm:text-sm text-accent font-bold tracking-wide">L'outil tout-en-un des commerciaux terrain</span>
          </div>
          
          {/* Stat sociale */}
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground/80">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
            <span><strong className="text-accent font-bold">65 commerciaux</strong> utilisent LUMA quotidiennement</span>
          </div>
        </div>
        
        {/* Main Headline - Focus sur le développement commercial */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight px-2">
          L'outil que les <span className="text-cyan-500">meilleurs commerciaux</span> utilisent pour <span className="text-cyan-500">dominer</span> leur secteur.
        </h1>
        
        {/* Subheadline - Focus sur les bénéfices avec chiffre clé */}
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground/90 max-w-2xl mx-auto leading-relaxed px-4">
          Accédez aux nouvelles entreprises de votre zone avant vos concurrents, optimisez chaque kilomètre, générez plus de rendez-vous.
        </p>
        
        {/* Badge résultat */}
        <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-green-500/15 border border-green-500/40 shadow-lg shadow-green-500/20">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-xs sm:text-sm font-bold text-green-500">+30% de commissions en moyenne</span>
        </div>

        {/* CTA Principal unique et fort */}
        <div className="flex flex-col items-center gap-3 pt-3 px-4">
          <button 
            onClick={() => navigate("/auth")}
            className="group relative btn-hero inline-flex items-center justify-center gap-2.5 w-full sm:w-auto min-w-[240px] px-6 sm:px-8 py-3 sm:py-4 shadow-2xl shadow-accent/50 hover:shadow-accent/60 text-sm sm:text-base md:text-lg font-bold hover:scale-105 transition-all duration-300"
          >
            Démarrer gratuitement
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          {/* Trust indicators réels */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground/80">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span className="text-foreground font-medium">Aucune carte bancaire</span>
            </div>
            <span className="hidden sm:inline text-muted-foreground/40">•</span>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-foreground font-medium">Configuration en 2 min</span>
            </div>
          </div>
          
          {/* Navigation secondaire */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground/80">
            <button 
              onClick={() => {
                const demoSection = document.getElementById('demo-section');
                demoSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 hover:text-accent transition-colors font-medium"
            >
              <Play className="w-4 h-4" />
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 pt-6 sm:pt-8 px-4 sm:px-0">
          <div className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border border-border/60 bg-card/50 backdrop-blur-md hover:border-accent/60 hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <div className="text-center">
              <div className="text-sm sm:text-base font-bold text-foreground">100%</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">RGPD</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border border-border/60 bg-card/50 backdrop-blur-md hover:border-accent/60 hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <div className="text-center">
              <div className="text-sm sm:text-base font-bold text-foreground">65+</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">Commerciaux</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border border-border/60 bg-card/50 backdrop-blur-md hover:border-accent/60 hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <div className="text-center">
              <div className="text-sm sm:text-base font-bold text-foreground">2 min</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">Setup</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border border-border/60 bg-card/50 backdrop-blur-md hover:border-accent/60 hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <div className="text-center">
              <div className="text-sm sm:text-base font-bold text-foreground">Sans</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">Engagement</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border border-border/60 bg-card/50 backdrop-blur-md hover:border-accent/60 hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <div className="text-center">
              <div className="text-sm sm:text-base font-bold text-foreground">Tournées</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">Optimisées</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border border-border/60 bg-card/50 backdrop-blur-md hover:border-accent/60 hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <div className="text-center">
              <div className="text-sm sm:text-base font-bold text-foreground">CRM</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">Intégré</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
