import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Play, CheckCircle, Shield, Zap, Target } from "lucide-react";

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
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/10 border border-accent/30 backdrop-blur-sm mb-6 shadow-lg shadow-accent/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <span className="text-sm text-accent font-bold tracking-wide">Données en temps réel • Sources officielles</span>
        </div>
        
        {/* Main Headline - Focus sur le bénéfice unique */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight">
          Prospectez les nouvelles
          <br />
          <span className="gradient-text inline-block">entreprises</span> avant vos
          <br />
          concurrents
        </h1>
        
        {/* Subheadline - Plus spécifique et orienté bénéfice */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Accédez aux créations d'entreprises en <span className="text-accent font-semibold">temps réel</span>, 
          organisez vos tournées et gérez votre pipeline commercial. 
          <span className="block mt-2 text-accent/90">Tout en un seul outil.</span>
        </p>

        {/* CTA Principal unique et fort */}
        <div className="flex flex-col items-center gap-5 pt-6">
          <button 
            onClick={() => navigate("/auth")}
            className="group relative btn-hero inline-flex items-center gap-3 px-10 py-5 shadow-2xl shadow-accent/40 hover:shadow-accent/50 text-xl"
          >
            Démarrer gratuitement
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
          
          {/* Trust indicators réels */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span className="font-medium">Aucune carte bancaire</span>
            </div>
            <span className="text-accent/30">•</span>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span className="font-medium">Configuration en 2 min</span>
            </div>
          </div>
          
          {/* Secondary CTA subtil */}
          <button
            onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-accent hover:text-accent/80 text-sm font-medium flex items-center gap-2 group transition-all mt-2"
          >
            <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Voir comment ça marche
          </button>
        </div>

        {/* Trust badges avec sources officielles */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-16 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card/60 border border-accent/20">
            <Shield className="w-5 h-5 text-accent" />
            <div className="text-left">
              <div className="text-xs text-muted-foreground">Sources</div>
              <div className="text-sm font-bold text-foreground">INPI • INSEE</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card/60 border border-accent/20">
            <Zap className="w-5 h-5 text-accent" />
            <div className="text-left">
              <div className="text-xs text-muted-foreground">Mise à jour</div>
              <div className="text-sm font-bold text-foreground">Temps réel</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card/60 border border-accent/20">
            <Target className="w-5 h-5 text-accent" />
            <div className="text-left">
              <div className="text-xs text-muted-foreground">Couverture</div>
              <div className="text-sm font-bold text-foreground">France entière</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
