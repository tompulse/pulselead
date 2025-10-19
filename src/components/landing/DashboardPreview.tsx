import { useState, useEffect } from "react";
import { Target, MapPin, Building2, Navigation, Map, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DashboardPreview = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const navigate = useNavigate();

  // Animation loop: change scene every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const overlayTexts = [
    "Découvrez en un clin d'œil les opportunités autour de vous",
    "Visualisez vos prospects sur la carte",
    "Filtrez par région, secteur ou date d'activité",
    "Accédez instantanément aux fiches complètes",
    "Tout votre potentiel client, en un seul tableau de bord"
  ];

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gradient-to-br from-navy-deep via-card to-background rounded-lg border border-accent/20 overflow-hidden group">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-electric/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
      </div>

      {/* Live Preview Badge */}
      <div className="absolute top-4 left-4 z-20 bg-accent/20 backdrop-blur-xl border border-accent/30 rounded-full px-4 py-1.5 flex items-center gap-2">
        <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
        <span className="text-xs text-accent font-semibold">Live Preview</span>
      </div>

      {/* Scene 0: Logo with animated halo */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${currentScene === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="relative">
          <div className="absolute inset-0 bg-accent/30 blur-3xl animate-pulse" style={{ animationDuration: '3s' }}></div>
          <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
          <Target className="w-32 h-32 text-accent relative animate-[spin_20s_linear_infinite]" />
        </div>
        <h2 className="text-3xl font-bold gradient-text mt-8 animate-fade-in">LeadMagnet</h2>
      </div>

      {/* Scene 1: Map with points appearing */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${currentScene === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-8">
          <div className="relative w-full max-w-2xl aspect-video bg-card/60 backdrop-blur-xl border border-accent/30 rounded-xl p-6">
            {/* Simulated map with animated pins */}
            <div className="relative w-full h-full bg-gradient-to-br from-accent/5 to-transparent rounded-lg">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-fade-in"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${15 + Math.random() * 70}%`,
                    animationDelay: `${i * 0.2}s`
                  }}
                >
                  <div className="relative group/pin">
                    <div className="absolute inset-0 bg-accent/40 blur-md group-hover/pin:blur-lg transition-all"></div>
                    <MapPin className="w-6 h-6 text-accent relative animate-bounce" style={{ animationDuration: `${2 + Math.random()}s` }} />
                  </div>
                </div>
              ))}
              
              {/* Filter panel simulation */}
              <div className="absolute left-4 top-4 bg-card/90 backdrop-blur-xl border border-accent/20 rounded-lg p-4 w-48 animate-slide-in-right">
                <div className="space-y-2">
                  <div className="h-3 bg-accent/20 rounded w-24"></div>
                  <div className="h-2 bg-accent/10 rounded w-full"></div>
                  <div className="h-2 bg-accent/10 rounded w-3/4"></div>
                  <div className="h-2 bg-accent/10 rounded w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scene 2: List view with cards */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${currentScene === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-8">
          <div className="w-full max-w-3xl space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-card/60 backdrop-blur-xl border border-accent/30 rounded-lg p-4 animate-fade-in hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20 transition-all duration-300 group/card"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent/20 blur-md group-hover/card:blur-lg transition-all"></div>
                    <Building2 className="w-10 h-10 text-accent relative" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-accent/20 rounded w-48"></div>
                    <div className="h-3 bg-accent/10 rounded w-32"></div>
                    <div className="h-2 bg-accent/5 rounded w-full"></div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-accent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scene 3: Detailed company card */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${currentScene === 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-8">
          <div className="w-full max-w-xl bg-card/80 backdrop-blur-xl border border-accent/40 rounded-xl p-8 animate-scale-in">
            <div className="space-y-6">
              {/* Company header */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/30 blur-xl animate-pulse"></div>
                  <Building2 className="w-16 h-16 text-accent relative" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">VICAMAR</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="px-2 py-1 bg-accent/20 rounded-full text-accent">Technologie</span>
                    <span>Saint-Germain-en-Laye</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 border-t border-accent/20 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Activité récente</span>
                  <span className="text-accent font-semibold">Il y a 2 jours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Score de pertinence</span>
                  <span className="text-accent font-semibold">92/100</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4">
                <button className="flex-1 bg-accent/20 hover:bg-accent/30 border border-accent/40 text-accent rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 group/btn">
                  <Map className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  <span className="font-semibold">Maps</span>
                </button>
                <button className="flex-1 bg-accent/20 hover:bg-accent/30 border border-accent/40 text-accent rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 group/btn">
                  <Navigation className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  <span className="font-semibold">Waze</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scene 4: Final CTA */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${currentScene === 4 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-accent/30 blur-3xl animate-pulse"></div>
            <Target className="w-24 h-24 text-accent relative" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 animate-fade-in">
            Tout votre potentiel client,<br />en un seul tableau de bord
          </h3>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="btn-hero min-w-[240px] animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            Accéder à mon Dashboard
          </Button>
          <p className="text-sm text-muted-foreground mt-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            Aucune configuration requise. Démo instantanée.
          </p>
        </div>
      </div>

      {/* Text overlay */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10 px-4">
        <div className="bg-card/90 backdrop-blur-xl border border-accent/30 rounded-full px-6 py-3 max-w-2xl">
          <p className="text-sm sm:text-base text-center text-foreground font-medium animate-fade-in" key={currentScene}>
            {overlayTexts[currentScene]}
          </p>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {[0, 1, 2, 3, 4].map((i) => (
          <button
            key={i}
            onClick={() => setCurrentScene(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === currentScene ? 'bg-accent w-8' : 'bg-accent/30 hover:bg-accent/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardPreview;
