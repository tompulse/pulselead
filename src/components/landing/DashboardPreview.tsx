import { useState, useEffect } from "react";
import { Target, Building2, Phone, Mail, MapPin, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DashboardPreview = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const navigate = useNavigate();

  // Animation loop: 5 scenes, 4 seconds each
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % 5);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Sample companies data
  const companies = [
    { name: "NEW GETASOUND", sector: "Immobilier", siret: "991851452", city: "Fleury-Les Aubrais", manager: "ART TECHNIQUES SCIENCES" },
    { name: "IMMO GDP", sector: "Immobilier", siret: "991657784", city: "Chartres", manager: "VIGINIER Mathilde" },
    { name: "L'INFORMATIQUE&VOUS", sector: "Technologie", siret: "991809039", city: "Lormaye", manager: "LEMAIRE Aurélien" },
  ];

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gradient-to-br from-navy-deep via-card to-navy-deep rounded-xl border border-cyan-electric/40 overflow-hidden shadow-2xl shadow-cyan-electric/20">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-electric/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-electric/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
      </div>

      {/* Live Preview Badge */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 bg-gradient-to-r from-cyan-electric/30 to-cyan-electric/20 backdrop-blur-xl border border-cyan-electric/40 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-cyan-electric/30">
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-electric rounded-full animate-pulse shadow-md shadow-cyan-electric/50"></div>
        <span className="text-[10px] sm:text-xs text-cyan-electric font-bold">Live Preview</span>
      </div>

      {/* Scene 0: Résultats constatés */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${currentScene === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-3xl bg-navy-deep/80 backdrop-blur-xl border border-cyan-electric/40 rounded-2xl p-6 sm:p-8 animate-scale-in shadow-2xl shadow-cyan-electric/20">
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-8 text-cyan-electric">Résultats constatés</h3>
            <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
              <div className="space-y-2">
                <div className="text-3xl sm:text-5xl font-bold text-cyan-electric">6h/semaine</div>
                <div className="text-xs sm:text-sm text-foreground font-bold">Temps économisé</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Moins d'admin, plus de vente</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl sm:text-5xl font-bold text-cyan-electric">×2.5</div>
                <div className="text-xs sm:text-sm text-foreground font-bold">Rendez-vous obtenus</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Meilleure organisation</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl sm:text-5xl font-bold text-cyan-electric">+40%</div>
                <div className="text-xs sm:text-sm text-foreground font-bold">Croissance CA</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">En 6 mois</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scene 1: Liste d'entreprises */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${currentScene === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-5xl space-y-3 sm:space-y-4">
            {companies.map((company, i) => (
              <div 
                key={i} 
                className="bg-navy-deep/80 backdrop-blur-xl border border-cyan-electric/40 rounded-xl p-4 sm:p-5 animate-fade-in shadow-lg shadow-cyan-electric/10"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-electric flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm sm:text-base text-foreground truncate">{company.name}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="text-xs px-2 py-0.5 bg-cyan-electric/20 text-cyan-electric rounded-full font-semibold">{company.sector}</span>
                        <span className="text-xs text-muted-foreground">SIRET: {company.siret}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 text-cyan-electric" />
                        <span>{company.city}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        👤 {company.manager}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Phone className="w-3 h-3 text-cyan-electric" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Mail className="w-3 h-3 text-cyan-electric" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Calendar className="w-3 h-3 text-cyan-electric" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scene 2: Carte avec pins */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${currentScene === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-4xl bg-navy-deep/80 backdrop-blur-xl border border-cyan-electric/40 rounded-2xl p-6 sm:p-8 animate-scale-in shadow-2xl shadow-cyan-electric/20">
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 text-cyan-electric">Visualisez votre territoire</h3>
            {/* Simplified map representation */}
            <div className="relative h-64 sm:h-80 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden border border-cyan-electric/20">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full" style={{ 
                  backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(34, 211, 238, 0.1) 35px, rgba(34, 211, 238, 0.1) 36px),
                                   repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(34, 211, 238, 0.1) 35px, rgba(34, 211, 238, 0.1) 36px)` 
                }}></div>
              </div>
              {/* Map pins */}
              <div className="absolute top-1/4 left-1/3 animate-pulse">
                <MapPin className="w-8 h-8 text-cyan-electric fill-cyan-electric/50" />
              </div>
              <div className="absolute top-1/2 right-1/3 animate-pulse" style={{ animationDelay: '0.5s' }}>
                <MapPin className="w-8 h-8 text-cyan-electric fill-cyan-electric/50" />
              </div>
              <div className="absolute bottom-1/4 left-1/2 animate-pulse" style={{ animationDelay: '1s' }}>
                <MapPin className="w-8 h-8 text-cyan-electric fill-cyan-electric/50" />
              </div>
              <div className="absolute top-center text-center p-4 bg-navy-deep/90 backdrop-blur-sm border border-cyan-electric/40 rounded-lg">
                <p className="text-sm font-semibold text-cyan-electric">3 prospects à proximité</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scene 3: Statistiques d'activités */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${currentScene === 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-4xl space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 text-cyan-electric">Mes Activités</h3>
            <p className="text-sm text-center text-muted-foreground mb-6">Suivez vos actions commerciales</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                { icon: Phone, label: "Appels cette semaine", value: "0", color: "blue" },
                { icon: MapPin, label: "Visites cette semaine", value: "0", color: "green" },
                { icon: Calendar, label: "RDV cette semaine", value: "0", color: "purple" },
                { icon: CheckCircle, label: "À revoir cette semaine", value: "0", color: "orange" }
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="bg-navy-deep/80 backdrop-blur-xl border border-cyan-electric/40 rounded-xl p-4 sm:p-5 text-center animate-fade-in shadow-lg shadow-cyan-electric/10"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-full bg-${stat.color}-500/20 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 sm:w-7 sm:h-7 text-${stat.color}-400`} />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">{stat.label}</p>
                  <p className="text-3xl sm:text-4xl font-bold text-cyan-electric">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scene 4: Tournée optimisée */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${currentScene === 4 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-5xl grid lg:grid-cols-[1fr,300px] gap-4">
            {/* Map */}
            <div className="bg-navy-deep/80 backdrop-blur-xl border border-cyan-electric/40 rounded-2xl p-4 sm:p-6 animate-scale-in shadow-2xl shadow-cyan-electric/20">
              <h3 className="text-lg sm:text-xl font-bold mb-4 text-cyan-electric">Tournée optimisée</h3>
              <div className="relative h-64 sm:h-80 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden border border-cyan-electric/20">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-full h-full" style={{ 
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(34, 211, 238, 0.1) 35px, rgba(34, 211, 238, 0.1) 36px),
                                     repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(34, 211, 238, 0.1) 35px, rgba(34, 211, 238, 0.1) 36px)` 
                  }}></div>
                </div>
                {/* Route line */}
                <svg className="absolute inset-0 w-full h-full">
                  <path
                    d="M 100 80 Q 150 120, 200 100 T 300 150 T 250 250"
                    stroke="rgba(34, 211, 238, 0.6)"
                    strokeWidth="3"
                    fill="none"
                    className="animate-pulse"
                  />
                </svg>
                {/* Pins */}
                <div className="absolute top-20 left-24">
                  <div className="w-8 h-8 bg-cyan-electric rounded-full flex items-center justify-center text-navy-deep font-bold text-sm shadow-lg shadow-cyan-electric/50">1</div>
                </div>
                <div className="absolute top-32 right-32">
                  <div className="w-8 h-8 bg-cyan-electric rounded-full flex items-center justify-center text-navy-deep font-bold text-sm shadow-lg shadow-cyan-electric/50">2</div>
                </div>
              </div>
            </div>
            
            {/* Route details */}
            <div className="bg-navy-deep/80 backdrop-blur-xl border border-cyan-electric/40 rounded-2xl p-4 animate-fade-in shadow-lg shadow-cyan-electric/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-cyan-electric font-bold">2 arrêts</p>
                  <p className="text-xs text-muted-foreground">Terminée</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">⚡ 94 km</p>
                  <p className="text-sm text-muted-foreground">⏱ 2h19</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-cyan-electric/10 border border-cyan-electric/20">
                  <div className="w-6 h-6 bg-cyan-electric rounded-full flex items-center justify-center text-navy-deep font-bold text-xs flex-shrink-0">1</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">CAMILLE Ô BAUX</p>
                    <p className="text-[10px] text-muted-foreground truncate">Les Baux-de-Provence</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-cyan-electric/10 border border-cyan-electric/20">
                  <div className="w-6 h-6 bg-cyan-electric rounded-full flex items-center justify-center text-navy-deep font-bold text-xs flex-shrink-0">2</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">JUMISTINE</p>
                    <p className="text-[10px] text-muted-foreground truncate">Eyguières</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10 px-4">
        {[0, 1, 2, 3, 4].map((i) => (
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
