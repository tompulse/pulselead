import { useState, useEffect } from "react";
import { Target, Building2, Phone, Mail, MapPin, TrendingUp, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DashboardPreview = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const navigate = useNavigate();

  // Animation loop: 3 scenes, 4 seconds each
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % 3);
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
    <div className="relative w-full h-full min-h-[90px] bg-gradient-to-br from-navy-deep via-card to-navy-deep rounded-xl border border-cyan-electric/40 overflow-hidden shadow-2xl shadow-cyan-electric/20">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-electric/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-electric/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
      </div>

      {/* Live Preview Badge */}
      <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-20 bg-gradient-to-r from-cyan-electric/30 to-cyan-electric/20 backdrop-blur-xl border border-cyan-electric/40 rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 flex items-center gap-1 shadow-lg shadow-cyan-electric/30">
        <div className="w-1 h-1 bg-cyan-electric rounded-full animate-pulse shadow-md shadow-cyan-electric/50"></div>
        <span className="text-[8px] text-cyan-electric font-bold">Live Preview</span>
      </div>

      {/* Scene 0: Liste d'entreprises */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${currentScene === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-1">
          <div className="w-full max-w-3xl space-y-1">
            {companies.map((company, i) => (
              <div 
                key={i} 
                className="bg-navy-deep/80 backdrop-blur-xl border border-cyan-electric/40 rounded p-1 animate-fade-in shadow-lg shadow-cyan-electric/10"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-start gap-1 flex-1 min-w-0">
                    <Building2 className="w-2.5 h-2.5 text-cyan-electric flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[8px] text-foreground truncate">{company.name}</h4>
                      <div className="flex flex-wrap items-center gap-0.5">
                        <span className="text-[6px] px-1 py-0.5 bg-cyan-electric/20 text-cyan-electric rounded-full font-semibold">{company.sector}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0">
                    <Button size="sm" variant="ghost" className="h-3 w-3 p-0" aria-label="Appeler">
                      <Phone className="w-1.5 h-1.5 text-cyan-electric" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-3 w-3 p-0" aria-label="Envoyer un email">
                      <Mail className="w-1.5 h-1.5 text-cyan-electric" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scene 1: Statistiques d'activités */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${currentScene === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-1">
          <div className="w-full max-w-2xl">
            <h3 className="text-[10px] font-bold text-center mb-1 text-cyan-electric">Mes Activités</h3>
            <div className="grid grid-cols-4 gap-1">
              {[
                { icon: Phone, value: "12" },
                { icon: MapPin, value: "8" },
                { icon: Calendar, value: "5" },
                { icon: Clock, value: "7" }
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="bg-navy-deep/80 backdrop-blur-xl border border-cyan-electric/40 rounded p-1 text-center animate-fade-in shadow-lg shadow-cyan-electric/10"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className="w-4 h-4 mx-auto mb-0.5 rounded-full bg-cyan-electric/20 flex items-center justify-center">
                    <stat.icon className="w-2 h-2 text-cyan-electric" />
                  </div>
                  <p className="text-[10px] font-bold text-cyan-electric">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scene 2: Tournée optimisée */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${currentScene === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-1">
          <div className="w-full max-w-3xl grid grid-cols-[1fr,90px] gap-1">
            {/* Map */}
            <div className="bg-navy-deep/80 backdrop-blur-xl border border-cyan-electric/40 rounded-lg p-1 animate-scale-in shadow-2xl shadow-cyan-electric/20">
              <h3 className="text-[8px] font-bold mb-1 text-cyan-electric">Tournée optimisée</h3>
              <div className="relative h-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded overflow-hidden border border-cyan-electric/20">
                {/* Realistic map background */}
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: `
                    linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px)
                  `,
                  backgroundSize: '10px 10px',
                  backgroundColor: '#1a2332'
                }}></div>
                
                {/* Route line */}
                <svg className="absolute inset-0 w-full h-full">
                  <path
                    d="M 15 15 L 32 20 L 50 27 L 70 40"
                    stroke="rgba(34, 211, 238, 0.6)"
                    strokeWidth="1"
                    fill="none"
                    className="animate-pulse"
                  />
                </svg>
                
                {/* Pins */}
                <div className="absolute" style={{ top: '15px', left: '15px' }}>
                  <div className="w-2.5 h-2.5 bg-cyan-electric rounded-full flex items-center justify-center text-navy-deep font-bold text-[6px]">1</div>
                </div>
                <div className="absolute" style={{ top: '20px', left: '32px' }}>
                  <div className="w-2.5 h-2.5 bg-cyan-electric rounded-full flex items-center justify-center text-navy-deep font-bold text-[6px]">2</div>
                </div>
                <div className="absolute" style={{ top: '27px', left: '50px' }}>
                  <div className="w-2.5 h-2.5 bg-cyan-electric rounded-full flex items-center justify-center text-navy-deep font-bold text-[6px]">3</div>
                </div>
                <div className="absolute" style={{ top: '40px', left: '70px' }}>
                  <div className="w-2.5 h-2.5 bg-cyan-electric rounded-full flex items-center justify-center text-navy-deep font-bold text-[6px]">4</div>
                </div>
              </div>
            </div>
            
            {/* Route details */}
            <div className="bg-navy-deep/80 backdrop-blur-xl border border-cyan-electric/40 rounded-lg p-1 animate-fade-in shadow-lg shadow-cyan-electric/10">
              <div className="mb-1">
                <p className="text-cyan-electric font-bold text-[8px]">4 arrêts</p>
                <p className="text-[6px] text-muted-foreground">42km • 1h15</p>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-0.5 p-0.5 rounded bg-cyan-electric/10">
                  <div className="w-2 h-2 bg-cyan-electric rounded-full flex items-center justify-center text-navy-deep font-bold text-[6px]">1</div>
                  <p className="text-[6px] font-semibold text-foreground truncate">TechnoSud</p>
                </div>
                <div className="flex items-center gap-0.5 p-0.5 rounded bg-cyan-electric/10">
                  <div className="w-2 h-2 bg-cyan-electric rounded-full flex items-center justify-center text-navy-deep font-bold text-[6px]">2</div>
                  <p className="text-[6px] font-semibold text-foreground truncate">Industrie+</p>
                </div>
                <div className="flex items-center gap-0.5 p-0.5 rounded bg-cyan-electric/10">
                  <div className="w-2 h-2 bg-cyan-electric rounded-full flex items-center justify-center text-navy-deep font-bold text-[6px]">3</div>
                  <p className="text-[6px] font-semibold text-foreground truncate">Green Sol.</p>
                </div>
                <div className="flex items-center gap-0.5 p-0.5 rounded bg-cyan-electric/10">
                  <div className="w-2 h-2 bg-cyan-electric rounded-full flex items-center justify-center text-navy-deep font-bold text-[6px]">4</div>
                  <p className="text-[6px] font-semibold text-foreground truncate">Innov Lab</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1 z-10">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-0.5 w-3 rounded-full transition-all duration-300 ${
              i === currentScene ? 'bg-gradient-to-r from-cyan-electric to-cyan-glow scale-125 shadow-lg shadow-cyan-electric/50' : 'bg-cyan-electric/30'
            }`}
          />
        ))}
      </div>

      {/* CTA Button */}
      <div className="absolute top-1 right-1 z-20 animate-fade-in">
        <Button
          onClick={() => navigate('/auth')}
          size="sm"
          className="h-5 px-2 gap-1 shadow-xl shadow-cyan-electric/30 transition-colors duration-300 bg-gradient-to-r from-cyan-electric to-cyan-glow text-navy-deep font-bold"
        >
          <span className="text-[8px]">Commencer</span>
          <Target className="w-2 h-2" />
        </Button>
      </div>
    </div>
  );
};

export default DashboardPreview;
