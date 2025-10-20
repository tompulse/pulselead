import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Lightbulb, ArrowRight, Play } from "lucide-react";

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
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/40 backdrop-blur-sm mb-4 hover:border-accent/60 hover:shadow-lg hover:shadow-accent/20 transition-all shadow-md shadow-accent/10">
          <Lightbulb className="w-4 h-4 text-accent animate-pulse" />
          <span className="text-sm text-accent font-bold tracking-wide">Propulsé par l'Intelligence Artificielle</span>
        </div>
        
        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight">
          Structurez votre
          <br />
          <span className="gradient-text inline-block animate-gradient">prospection commerciale</span>
          <br />
          sur les créations d'entreprises
        </h1>
        
        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Repérez les <span className="text-accent font-semibold">nouvelles créations</span> dans votre secteur. 
          Contactez-les en premier et développez votre portefeuille client.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <button 
            onClick={() => navigate("/auth")}
            className="group relative btn-hero inline-flex items-center gap-2 shadow-xl shadow-accent/30 hover:shadow-2xl hover:shadow-accent/40"
          >
            Commencer gratuitement
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            className="group rounded-full border-2 border-accent/50 text-foreground hover:bg-gradient-to-r hover:from-accent/15 hover:to-accent/5 hover:border-accent text-lg px-8 py-6 transition-all shadow-lg hover:shadow-xl"
          >
            <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Voir la démo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 pt-16 max-w-3xl mx-auto">
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-bold gradient-text">Temps réel</div>
            <div className="text-sm text-muted-foreground">Nouvelles créations</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-bold gradient-text">Données officielles</div>
            <div className="text-sm text-muted-foreground">Sources vérifiées</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-bold gradient-text">Ciblage précis</div>
            <div className="text-sm text-muted-foreground">Par secteur et zone</div>
          </div>
        </div>
      </div>
    </section>
  );
};
