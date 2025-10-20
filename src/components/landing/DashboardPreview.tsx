import { useState, useEffect } from "react";
import { Target, MapPin, Building2, Map, Linkedin, Phone, Mail, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DashboardPreview = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const navigate = useNavigate();

  // Animation loop: change scene every 4 seconds (5 scenes)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % 5);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const overlayTexts = [
    "Ta croissance, éclairée",
    "Explore ton marché",
    "Trouve tes prospects",
    "Détails en un coup d'œil",
    "Agis rapidement"
  ];

  // Sample companies data
  const companies = [
    { name: "VICAMAR Technologies", sector: "Technologie", city: "Saint-Germain-en-Laye", manager: "Sophie Durand", score: 92 },
    { name: "InnovateSoft", sector: "Services numériques", city: "Versailles", manager: "Marc Lefebvre", score: 88 },
    { name: "GreenEnergy Solutions", sector: "Énergies renouvelables", city: "Nanterre", manager: "Claire Moreau", score: 85 }
  ];

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gradient-to-br from-navy-deep via-card to-background rounded-xl border border-accent/40 overflow-hidden group shadow-2xl shadow-accent/20">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-electric/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
      </div>

      {/* Live Preview Badge */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 bg-gradient-to-r from-accent/30 to-accent/20 backdrop-blur-xl border border-accent/40 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-accent/30">
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent rounded-full animate-pulse shadow-md shadow-accent/50"></div>
        <span className="text-[10px] sm:text-xs text-accent font-bold">Live Preview</span>
      </div>

      {/* Scene 0: Logo with animated halo */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${currentScene === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="relative">
          <div className="absolute inset-0 bg-accent/40 blur-3xl animate-pulse" style={{ animationDuration: '3s' }}></div>
          <div className="absolute inset-0 bg-accent/30 blur-2xl rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
          <Target className="w-20 h-20 sm:w-32 sm:h-32 text-accent relative animate-[spin_20s_linear_infinite] drop-shadow-2xl drop-shadow-accent" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold gradient-text mt-4 sm:mt-8 animate-fade-in">LUMA</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 animate-fade-in px-4 text-center font-medium">éclaire les leviers de ta croissance</p>
      </div>

      {/* Scene 1: France Map Overview */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${currentScene === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-2xl bg-card/70 backdrop-blur-xl border border-accent/30 rounded-2xl p-4 sm:p-8">
            <div className="flex flex-col items-center gap-4 sm:gap-6">
              {/* Map icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-accent/30 blur-2xl"></div>
                <Map className="w-16 h-16 sm:w-20 sm:h-20 text-accent relative" />
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-sm">
                <div className="bg-accent/10 rounded-xl p-3 sm:p-4 text-center border border-accent/20">
                  <div className="text-2xl sm:text-3xl font-bold text-accent">2,847</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">prospects</div>
                </div>
                <div className="bg-accent/10 rounded-xl p-3 sm:p-4 text-center border border-accent/20">
                  <div className="text-2xl sm:text-3xl font-bold text-accent">13</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">régions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scene 2: List of prospects */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${currentScene === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-2xl bg-card/70 backdrop-blur-xl border border-accent/30 rounded-2xl p-4 sm:p-6">
            <div className="space-y-3">
              {companies.map((company, i) => (
                <div 
                  key={i} 
                  className="bg-card/80 border border-accent/20 rounded-xl p-3 sm:p-4 animate-fade-in hover:border-accent/40 transition-all"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-accent flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base text-foreground truncate">{company.name}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{company.city}</span>
                        <span className="text-xs px-2 py-0.5 bg-accent/20 text-accent rounded-full">{company.sector}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-accent/20 rounded-lg px-2 py-1 flex-shrink-0">
                      <TrendingUp className="w-3 h-3 text-accent" />
                      <span className="text-xs font-semibold text-accent">{company.score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scene 3: Company detail */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${currentScene === 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-lg bg-card/70 backdrop-blur-xl border border-accent/40 rounded-2xl p-4 sm:p-6 animate-scale-in">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/30 blur-lg"></div>
                  <Building2 className="w-12 h-12 sm:w-14 sm:h-14 text-accent relative" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">VICAMAR Technologies</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs sm:text-sm px-2 py-1 bg-accent/20 rounded-full text-accent">Technologie</span>
                    <span className="text-xs sm:text-sm text-muted-foreground">Saint-Germain (78)</span>
                  </div>
                </div>
              </div>

              {/* Manager */}
              <div className="bg-accent/5 rounded-xl p-3 border border-accent/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Dirigeant</p>
                    <p className="text-sm sm:text-base font-semibold text-foreground mt-0.5">Sophie Durand</p>
                  </div>
                  <Button size="sm" variant="ghost" className="gap-2">
                    <Linkedin className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-card/50 rounded-lg p-2 border border-accent/10">
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 text-accent" />
                    <span className="text-xs text-muted-foreground">50-99 salariés</span>
                  </div>
                </div>
                <div className="bg-card/50 rounded-lg p-2 border border-accent/10">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-accent" />
                    <span className="text-xs text-muted-foreground">Score: 92/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scene 4: CRM Panel */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${currentScene === 4 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-lg bg-card/70 backdrop-blur-xl border border-accent/40 rounded-2xl p-4 sm:p-6 animate-scale-in">
            <div className="space-y-4">
              {/* Header */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">VICAMAR Technologies</h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">En cours</span>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 gap-2">
                  <Phone className="w-3 h-3" />
                  <span className="text-xs sm:text-sm">Appeler</span>
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-2">
                  <Mail className="w-3 h-3" />
                  <span className="text-xs sm:text-sm">Email</span>
                </Button>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Interactions récentes</p>
                {[
                  { icon: Phone, text: "Appel téléphonique", date: "Il y a 2 jours" },
                  { icon: Mail, text: "Email envoyé", date: "Il y a 5 jours" }
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className="flex items-start gap-2 bg-accent/5 rounded-lg p-2 border border-accent/10 animate-fade-in"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  >
                    <item.icon className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground">{item.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Text overlay */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10 px-4">
        <div className="bg-gradient-to-r from-card/95 to-card/90 backdrop-blur-xl border border-accent/40 rounded-full px-4 py-2 sm:px-6 sm:py-3 animate-fade-in shadow-lg shadow-accent/20">
          <p className="text-xs sm:text-sm font-bold text-foreground text-center gradient-text">
            {overlayTexts[currentScene]}
          </p>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="absolute bottom-16 sm:bottom-20 left-0 right-0 flex justify-center gap-2 z-10 px-4">
        {overlayTexts.map((_, i) => (
          <div
            key={i}
            className={`h-1 sm:h-1.5 w-6 sm:w-8 rounded-full transition-all duration-300 ${
              i === currentScene ? 'bg-gradient-to-r from-accent to-accent/80 scale-125 shadow-lg shadow-accent/50' : 'bg-accent/30'
            }`}
          />
        ))}
      </div>

      {/* CTA Button */}
      <div className="absolute top-4 right-4 z-20 animate-fade-in">
        <Button
          onClick={() => navigate('/auth')}
          size="sm"
          className="gap-2 shadow-xl shadow-accent/30 hover:shadow-2xl hover:shadow-accent/40 transition-all duration-300 hover:scale-105 bg-gradient-to-r from-accent via-accent to-accent/80"
        >
          <span className="text-xs sm:text-sm font-bold">Commencer</span>
          <Target className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>
    </div>
  );
};

export default DashboardPreview;
