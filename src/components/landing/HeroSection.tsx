import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Zap, ArrowRight, Play } from "lucide-react";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative container mx-auto px-6 pt-32 pb-20 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative text-center max-w-5xl mx-auto space-y-8 animate-fade-in">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/10 border border-accent/30 backdrop-blur-sm mb-4 hover:border-accent/50 transition-all">
          <Zap className="w-4 h-4 text-accent animate-pulse" />
          <span className="text-sm text-accent font-semibold tracking-wide">Propulsé par l'Intelligence Artificielle</span>
        </div>
        
        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight">
          Identifiez vos
          <br />
          <span className="gradient-text inline-block animate-gradient">prochains leads</span>
          <br />
          avant la concurrence
        </h1>
        
        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Visualisez en temps réel les <span className="text-accent font-semibold">nouvelles entreprises</span> créées en France. 
          Cartographie interactive, filtres intelligents, données officielles.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <button 
            onClick={() => navigate("/auth")}
            className="group relative btn-hero inline-flex items-center gap-2"
          >
            Commencer gratuitement
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            className="group rounded-full border-2 border-accent/50 text-foreground hover:bg-accent/10 hover:border-accent text-lg px-8 py-6 transition-all"
          >
            <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Voir la démo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 pt-16 max-w-3xl mx-auto">
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-bold gradient-text">500K+</div>
            <div className="text-sm text-muted-foreground">Entreprises référencées</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-bold gradient-text">98%</div>
            <div className="text-sm text-muted-foreground">Précision des données</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-bold gradient-text">24/7</div>
            <div className="text-sm text-muted-foreground">Mise à jour continue</div>
          </div>
        </div>
      </div>
    </section>
  );
};
