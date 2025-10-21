import { useState, useEffect } from "react";
import { Target, Building2, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DashboardPreview = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const navigate = useNavigate();

  // Animation loop: change scene every 4 seconds (2 scenes)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % 2);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gradient-to-br from-navy-deep via-card to-background rounded-xl border border-cyan-electric/40 overflow-hidden group shadow-2xl shadow-cyan-electric/20">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-electric/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-electric/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
      </div>

      {/* Live Preview Badge */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 bg-gradient-to-r from-cyan-electric/30 to-cyan-electric/20 backdrop-blur-xl border border-cyan-electric/40 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-cyan-electric/30">
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-electric rounded-full animate-pulse shadow-md shadow-cyan-electric/50"></div>
        <span className="text-[10px] sm:text-xs text-cyan-electric font-bold">Live Preview</span>
      </div>

      {/* Scene 0: Company detail with CRM panel */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${currentScene === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-lg bg-navy-deep/80 backdrop-blur-xl border border-cyan-electric/40 rounded-2xl p-4 sm:p-6 animate-scale-in shadow-2xl shadow-cyan-electric/20">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-electric/30 blur-lg"></div>
                    <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-electric relative" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-foreground">VICAMAR Technologies</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-lg font-semibold text-amber-600 dark:text-amber-400">En cours</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 gap-2 bg-cyan-electric hover:bg-cyan-glow text-navy-deep font-semibold">
                  <Phone className="w-3 h-3" />
                  <span className="text-xs sm:text-sm">Appeler</span>
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-2 border-cyan-electric/50 hover:bg-cyan-electric/10 text-foreground font-semibold">
                  <Mail className="w-3 h-3" />
                  <span className="text-xs sm:text-sm">Email</span>
                </Button>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-cyan-electric uppercase tracking-wide">Interactions récentes</p>
                {[
                  { icon: Phone, text: "Appel téléphonique", date: "Il y a 2 jours" },
                  { icon: Mail, text: "Email envoyé", date: "Il y a 5 jours" }
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className="flex items-start gap-2 bg-cyan-electric/5 rounded-lg p-2.5 border border-cyan-electric/20 animate-fade-in"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  >
                    <item.icon className="w-3 h-3 text-cyan-electric mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground font-medium">{item.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="pt-2">
                <Button className="w-full btn-hero gap-2 shadow-lg shadow-cyan-electric/30">
                  <span className="text-xs sm:text-sm font-bold">Agis rapidement</span>
                  <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scene 1: Stats overview */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${currentScene === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-2xl bg-navy-deep/80 backdrop-blur-xl border border-cyan-electric/40 rounded-2xl p-6 sm:p-8 animate-scale-in shadow-2xl shadow-cyan-electric/20">
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 text-cyan-electric">Résultats constatés</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-4xl sm:text-5xl font-bold text-cyan-electric">6h/semaine</div>
                <div className="text-sm text-foreground font-bold">Temps économisé</div>
                <div className="text-xs text-muted-foreground">Moins d'admin, plus de vente</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl sm:text-5xl font-bold text-cyan-electric">×2.5</div>
                <div className="text-sm text-foreground font-bold">Rendez-vous obtenus</div>
                <div className="text-xs text-muted-foreground">Meilleure organisation</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl sm:text-5xl font-bold text-cyan-electric">+40%</div>
                <div className="text-sm text-foreground font-bold">Croissance CA</div>
                <div className="text-xs text-muted-foreground">En 6 mois</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10 px-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className={`h-1 sm:h-1.5 w-6 sm:w-8 rounded-full transition-all duration-300 ${
              i === currentScene ? 'bg-gradient-to-r from-cyan-electric to-cyan-glow scale-125 shadow-lg shadow-cyan-electric/50' : 'bg-cyan-electric/30'
            }`}
          />
        ))}
      </div>

      {/* CTA Button */}
      <div className="absolute top-4 right-4 z-20 animate-fade-in">
        <Button
          onClick={() => navigate('/auth')}
          size="sm"
          className="gap-2 shadow-xl shadow-cyan-electric/30 hover:shadow-2xl hover:shadow-cyan-electric/40 transition-all duration-300 hover:scale-105 bg-gradient-to-r from-cyan-electric to-cyan-glow text-navy-deep font-bold"
        >
          <span className="text-xs sm:text-sm">Commencer</span>
          <Target className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>
    </div>
  );
};

export default DashboardPreview;
