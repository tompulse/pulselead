import { useState, useEffect } from "react";
import { Target, Building2, Phone, Mail, MapPin, TrendingUp, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DashboardPreview = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const navigate = useNavigate();

  // Animation loop: 4 scenes, 4 seconds each
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % 4);
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
    <div className="relative w-full h-full min-h-[250px] bg-gradient-to-br from-navy-deep via-card to-navy-deep rounded-xl border border-cyan-electric/40 overflow-hidden shadow-2xl shadow-cyan-electric/20">
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

      {/* Scene 0: Liste d'entreprises */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${currentScene === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-2 sm:p-3">
          <div className="w-full max-w-3xl space-y-2 sm:space-y-2">
            {companies.map((company, i) => (
              <div 
                key={i} 
                className="bg-navy-deep/80 backdrop-blur-xl border border-cyan-electric/40 rounded-lg p-2 sm:p-3 animate-fade-in shadow-lg shadow-cyan-electric/10"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-electric flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-foreground truncate">{company.name}</h4>
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 bg-cyan-electric/20 text-cyan-electric rounded-full font-semibold">{company.sector}</span>
                        <span className="text-[10px] text-muted-foreground">SIRET: {company.siret}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                        <MapPin className="w-2.5 h-2.5 text-cyan-electric" />
                        <span>{company.city}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        👤 {company.manager}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" aria-label="Appeler">
                      <Phone className="w-2.5 h-2.5 text-cyan-electric" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" aria-label="Envoyer un email">
                      <Mail className="w-2.5 h-2.5 text-cyan-electric" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" aria-label="Planifier un rendez-vous">
                      <Calendar className="w-2.5 h-2.5 text-cyan-electric" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scene 1: Carte avec pins */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${currentScene === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-2 sm:p-3">
          <div className="w-full max-w-2xl bg-navy-deep/80 backdrop-blur-xl border border-cyan-electric/40 rounded-xl p-3 sm:p-4 animate-scale-in shadow-2xl shadow-cyan-electric/20">
            <h3 className="text-base sm:text-lg font-bold text-center mb-3 text-cyan-electric">Visualisez votre territoire</h3>
            {/* Map with realistic background */}
            <div className="relative h-32 sm:h-40 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden border border-cyan-electric/20">
              {/* Realistic map background */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: `
                  linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
                backgroundColor: '#1a2332'
              }}>
                {/* Simulated roads */}
                <svg className="w-full h-full opacity-20">
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#4a5568" strokeWidth="2"/>
                  <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#4a5568" strokeWidth="2"/>
                  <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#4a5568" strokeWidth="2"/>
                  <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#4a5568" strokeWidth="1.5"/>
                  <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#4a5568" strokeWidth="1.5"/>
                </svg>
              </div>
              
              {/* Map pins */}
              <div className="absolute top-1/4 left-1/3 animate-pulse">
                <MapPin className="w-4 h-4 text-cyan-electric fill-cyan-electric/50" />
              </div>
              <div className="absolute top-1/2 right-1/3 animate-pulse" style={{ animationDelay: '0.5s' }}>
                <MapPin className="w-4 h-4 text-cyan-electric fill-cyan-electric/50" />
              </div>
              <div className="absolute bottom-1/4 left-1/2 animate-pulse" style={{ animationDelay: '1s' }}>
                <MapPin className="w-4 h-4 text-cyan-electric fill-cyan-electric/50" />
              </div>
              <div className="absolute top-center text-center p-2 bg-navy-deep/90 backdrop-blur-sm border border-cyan-electric/40 rounded-lg">
                <p className="text-xs font-semibold text-cyan-electric">Aix-en-Provence & alentours</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Vitrolles • Marseille • Gardanne</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scene 2: Statistiques d'activités */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${currentScene === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-2 sm:p-3">
          <div className="w-full max-w-2xl space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-center mb-3 text-cyan-electric">Mes Activités</h3>
            <p className="text-xs text-center text-muted-foreground mb-3">Suivez vos actions commerciales</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { icon: Phone, label: "Appels cette semaine", value: "12", color: "blue" },
                { icon: MapPin, label: "Visites cette semaine", value: "8", color: "green" },
                { icon: Calendar, label: "RDV cette semaine", value: "5", color: "purple" },
                { icon: Clock, label: "Relances prévues", value: "7", color: "orange" }
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="bg-navy-deep/80 backdrop-blur-xl border border-cyan-electric/40 rounded-lg p-2 sm:p-3 text-center animate-fade-in shadow-lg shadow-cyan-electric/10"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 rounded-full bg-${stat.color}-500/20 flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${stat.color}-400`} />
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-cyan-electric">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scene 3: Tournée optimisée */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${currentScene === 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-2 sm:p-3">
          <div className="w-full max-w-3xl grid lg:grid-cols-[1fr,180px] gap-2">
            {/* Map */}
            <div className="bg-navy-deep/80 backdrop-blur-xl border border-cyan-electric/40 rounded-xl p-2 sm:p-3 animate-scale-in shadow-2xl shadow-cyan-electric/20">
              <h3 className="text-sm sm:text-base font-bold mb-2 text-cyan-electric">Tournée optimisée</h3>
              <div className="relative h-32 sm:h-40 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden border border-cyan-electric/20">
                {/* Realistic map background */}
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: `
                    linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
                  backgroundColor: '#1a2332'
                }}>
                  {/* Simulated roads */}
                  <svg className="w-full h-full opacity-20">
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#4a5568" strokeWidth="2"/>
                    <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#4a5568" strokeWidth="2"/>
                    <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#4a5568" strokeWidth="2"/>
                    <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#4a5568" strokeWidth="1.5"/>
                    <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#4a5568" strokeWidth="1.5"/>
                  </svg>
                </div>
                
                {/* Route line connecting all points */}
                <svg className="absolute inset-0 w-full h-full">
                  <path
                    d="M 30 30 L 65 40 L 100 55 L 140 80"
                    stroke="rgba(34, 211, 238, 0.6)"
                    strokeWidth="2"
                    fill="none"
                    className="animate-pulse"
                    strokeLinecap="round"
                  />
                </svg>
                
                {/* Pins with better positioning */}
                <div className="absolute" style={{ top: '30px', left: '30px' }}>
                  <div className="w-5 h-5 bg-cyan-electric rounded-full flex items-center justify-center text-navy-deep font-bold text-[10px] shadow-lg shadow-cyan-electric/50">1</div>
                </div>
                <div className="absolute" style={{ top: '40px', left: '65px' }}>
                  <div className="w-5 h-5 bg-cyan-electric rounded-full flex items-center justify-center text-navy-deep font-bold text-[10px] shadow-lg shadow-cyan-electric/50">2</div>
                </div>
                <div className="absolute" style={{ top: '55px', left: '100px' }}>
                  <div className="w-5 h-5 bg-cyan-electric rounded-full flex items-center justify-center text-navy-deep font-bold text-[10px] shadow-lg shadow-cyan-electric/50">3</div>
                </div>
                <div className="absolute" style={{ top: '80px', left: '140px' }}>
                  <div className="w-5 h-5 bg-cyan-electric rounded-full flex items-center justify-center text-navy-deep font-bold text-[10px] shadow-lg shadow-cyan-electric/50">4</div>
                </div>
              </div>
            </div>
            
            {/* Route details */}
            <div className="bg-navy-deep/80 backdrop-blur-xl border border-cyan-electric/40 rounded-xl p-2 animate-fade-in shadow-lg shadow-cyan-electric/10">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-cyan-electric font-bold text-xs">4 arrêts</p>
                  <p className="text-[10px] text-muted-foreground">En cours</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">⚡ 42 km</p>
                  <p className="text-[10px] text-muted-foreground">⏱ 1h15</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 p-1 rounded bg-cyan-electric/10 border border-cyan-electric/20">
                  <div className="w-4 h-4 bg-cyan-electric rounded-full flex items-center justify-center text-navy-deep font-bold text-[8px] flex-shrink-0">1</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-foreground truncate">TechnoSud</p>
                    <p className="text-[8px] text-muted-foreground truncate">Aix-en-Provence</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-1 rounded bg-cyan-electric/10 border border-cyan-electric/20">
                  <div className="w-4 h-4 bg-cyan-electric rounded-full flex items-center justify-center text-navy-deep font-bold text-[8px] flex-shrink-0">2</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-foreground truncate">Industrie Plus</p>
                    <p className="text-[8px] text-muted-foreground truncate">Aix-en-Provence</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-1 rounded bg-cyan-electric/10 border border-cyan-electric/20">
                  <div className="w-4 h-4 bg-cyan-electric rounded-full flex items-center justify-center text-navy-deep font-bold text-[8px] flex-shrink-0">3</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-foreground truncate">Green Solutions</p>
                    <p className="text-[8px] text-muted-foreground truncate">Marseille</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-1 rounded bg-cyan-electric/10 border border-cyan-electric/20">
                  <div className="w-4 h-4 bg-cyan-electric rounded-full flex items-center justify-center text-navy-deep font-bold text-[8px] flex-shrink-0">4</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-foreground truncate">Innovation Lab</p>
                    <p className="text-[8px] text-muted-foreground truncate">Marseille</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10 px-4">
        {[0, 1, 2, 3].map((i) => (
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
          className="gap-2 shadow-xl shadow-cyan-electric/30 transition-colors duration-300 bg-gradient-to-r from-cyan-electric to-cyan-glow text-navy-deep font-bold"
        >
          <span className="text-xs sm:text-sm">Commencer</span>
          <Target className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>
    </div>
  );
};

export default DashboardPreview;
