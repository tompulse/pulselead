import { useState, useEffect } from "react";
import { Target, MapPin, Building2, Navigation, Map, ArrowRight, Linkedin, Phone, Mail, TrendingUp, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DashboardPreview = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const navigate = useNavigate();

  // Animation loop: change scene every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % 8);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Simulate region selection in scene 2
  useEffect(() => {
    if (currentScene === 2) {
      setTimeout(() => setSelectedRegion("Île-de-France"), 800);
    } else {
      setSelectedRegion(null);
    }
  }, [currentScene]);

  const overlayTexts = [
    "Découvrez en un clin d'œil les opportunités autour de vous",
    "Visualisez vos prospects sur la carte de France",
    "Cliquez sur une région pour zoomer et filtrer",
    "Analysez les leads par département",
    "Accédez instantanément aux fiches complètes",
    "Contactez vos prospects directement",
    "Naviguez vers vos rendez-vous en un clic",
    "Tout votre potentiel client, en un seul tableau de bord"
  ];

  // Sample companies data
  const companies = [
    { name: "VICAMAR Technologies", sector: "Technologie", city: "Saint-Germain-en-Laye", manager: "Sophie Durand", score: 92 },
    { name: "InnovateSoft", sector: "Services numériques", city: "Versailles", manager: "Marc Lefebvre", score: 88 },
    { name: "GreenEnergy Solutions", sector: "Énergies renouvelables", city: "Nanterre", manager: "Claire Moreau", score: 85 },
    { name: "FinTech Partners", sector: "Finance", city: "Boulogne-Billancourt", manager: "Thomas Bernard", score: 90 }
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

      {/* Scene 1: France Map Overview */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${currentScene === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-4 sm:p-8">
          <div className="relative w-full max-w-3xl aspect-video bg-card/60 backdrop-blur-xl border border-accent/30 rounded-xl p-4 sm:p-6 overflow-hidden">
            {/* France map simulation */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Simplified France outline with regions */}
              <svg viewBox="0 0 400 400" className="w-full h-full">
                {/* Background */}
                <rect width="400" height="400" fill="transparent" />
                
                {/* France outline (simplified) */}
                <path
                  d="M200,50 L280,80 L320,150 L310,220 L280,280 L230,320 L170,320 L120,280 L90,220 L80,150 L120,80 Z"
                  fill="hsl(var(--accent) / 0.1)"
                  stroke="hsl(var(--accent) / 0.3)"
                  strokeWidth="2"
                  className="animate-fade-in"
                />
                
                {/* Regions as points with animated appearance */}
                {[
                  { cx: 200, cy: 120, label: "Île-de-France", delay: 0 },
                  { cx: 150, cy: 100, label: "Normandie", delay: 0.1 },
                  { cx: 120, cy: 160, label: "Bretagne", delay: 0.2 },
                  { cx: 160, cy: 200, label: "Pays de la Loire", delay: 0.3 },
                  { cx: 200, cy: 240, label: "Nouvelle-Aquitaine", delay: 0.4 },
                  { cx: 260, cy: 260, label: "Occitanie", delay: 0.5 },
                  { cx: 280, cy: 200, label: "Auvergne-Rhône-Alpes", delay: 0.6 },
                  { cx: 250, cy: 150, label: "Bourgogne-Franche-Comté", delay: 0.7 },
                  { cx: 280, cy: 120, label: "Grand Est", delay: 0.8 },
                  { cx: 220, cy: 180, label: "Centre-Val de Loire", delay: 0.9 }
                ].map((region, i) => (
                  <g key={i} className="animate-fade-in" style={{ animationDelay: `${region.delay}s` }}>
                    <circle
                      cx={region.cx}
                      cy={region.cy}
                      r="8"
                      fill="hsl(var(--accent))"
                      className="opacity-80 cursor-pointer hover:opacity-100 transition-all"
                    >
                      <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle
                      cx={region.cx}
                      cy={region.cy}
                      r="12"
                      fill="none"
                      stroke="hsl(var(--accent))"
                      strokeWidth="2"
                      opacity="0.5"
                    >
                      <animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                    </circle>
                  </g>
                ))}
              </svg>

              {/* Stats overlay */}
              <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-xl border border-accent/20 rounded-lg p-3 space-y-1 animate-fade-in" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2 text-xs">
                  <Building2 className="w-3 h-3 text-accent" />
                  <span className="text-foreground font-semibold">2,847 prospects</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <TrendingUp className="w-3 h-3 text-accent" />
                  <span className="text-muted-foreground">+156 cette semaine</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scene 2: Region selection and zoom */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${currentScene === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-4 sm:p-8">
          <div className="relative w-full max-w-3xl aspect-video bg-card/60 backdrop-blur-xl border border-accent/30 rounded-xl p-4 sm:p-6">
            <div className="relative w-full h-full">
              {/* Zoomed region */}
              <div className="w-full h-full bg-gradient-to-br from-accent/10 to-transparent rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4 animate-scale-in">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-accent/30 blur-2xl"></div>
                    <MapPin className="w-20 h-20 text-accent relative" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Île-de-France</h3>
                  <div className="flex gap-4 justify-center text-sm">
                    <div className="bg-card/60 border border-accent/20 rounded-lg px-4 py-2">
                      <span className="text-accent font-semibold">847</span>
                      <span className="text-muted-foreground ml-1">leads</span>
                    </div>
                    <div className="bg-card/60 border border-accent/20 rounded-lg px-4 py-2">
                      <span className="text-accent font-semibold">8</span>
                      <span className="text-muted-foreground ml-1">départements</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Departments list */}
              <div className="absolute right-4 top-4 bottom-4 w-48 bg-card/90 backdrop-blur-xl border border-accent/20 rounded-lg p-3 overflow-hidden animate-slide-in-right">
                <h4 className="text-xs font-semibold text-foreground mb-2">Départements</h4>
                <div className="space-y-1.5">
                  {['75 - Paris', '92 - Hauts-de-Seine', '78 - Yvelines', '91 - Essonne', '93 - Seine-St-Denis'].map((dept, i) => (
                    <div
                      key={i}
                      className="text-xs bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded px-2 py-1.5 cursor-pointer transition-all animate-fade-in"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <span className="text-foreground">{dept}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scene 3: Department detail with pins */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${currentScene === 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-4 sm:p-8">
          <div className="relative w-full max-w-3xl aspect-video bg-card/60 backdrop-blur-xl border border-accent/30 rounded-xl p-4 sm:p-6">
            <div className="relative w-full h-full bg-gradient-to-br from-accent/5 to-transparent rounded-lg">
              {/* Leads on map */}
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-fade-in cursor-pointer group/marker"
                  style={{
                    top: `${15 + Math.random() * 70}%`,
                    left: `${10 + Math.random() * 80}%`,
                    animationDelay: `${i * 0.08}s`
                  }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent/40 blur-md group-hover/marker:blur-xl transition-all"></div>
                    <MapPin className="w-5 h-5 text-accent relative group-hover/marker:scale-125 transition-transform" />
                  </div>
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-card/95 backdrop-blur-xl border border-accent/30 rounded-lg px-2 py-1 opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    <p className="text-xs text-foreground font-semibold">{companies[i % companies.length].name}</p>
                    <p className="text-xs text-muted-foreground">{companies[i % companies.length].city}</p>
                  </div>
                </div>
              ))}

              {/* Filter sidebar */}
              <div className="absolute left-4 top-4 bottom-4 w-44 bg-card/90 backdrop-blur-xl border border-accent/20 rounded-lg p-3 animate-slide-in-right">
                <h4 className="text-xs font-semibold text-foreground mb-3">Filtres</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Secteur</p>
                    {['Technologie', 'Finance', 'Énergie'].map((s, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="w-3 h-3 rounded border-2 border-accent bg-accent/20"></div>
                        <span className="text-xs text-foreground">{s}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Score</p>
                    <div className="h-1.5 bg-accent/20 rounded-full overflow-hidden">
                      <div className="h-full bg-accent w-3/4 animate-[slideInLeft_1s_ease-out]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scene 4: List view with detailed cards */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${currentScene === 4 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-4 sm:p-8 overflow-auto">
          <div className="w-full max-w-4xl space-y-2.5">
            {companies.map((company, i) => (
              <div
                key={i}
                className="bg-card/70 backdrop-blur-xl border border-accent/30 rounded-lg p-3 sm:p-4 animate-fade-in hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20 transition-all duration-300 group/card cursor-pointer"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-accent/20 blur-md group-hover/card:blur-lg transition-all"></div>
                    <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-accent relative" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-foreground truncate">{company.name}</h4>
                      <div className="flex items-center gap-1 bg-accent/20 rounded-full px-2 py-0.5 flex-shrink-0">
                        <TrendingUp className="w-3 h-3 text-accent" />
                        <span className="text-xs font-semibold text-accent">{company.score}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 bg-accent/10 rounded-full text-accent">{company.sector}</span>
                      <span className="text-muted-foreground">{company.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>{company.manager}</span>
                      <span className="text-accent/50">•</span>
                      <Calendar className="w-3 h-3" />
                      <span>Actif il y a 2j</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-accent opacity-0 group-hover/card:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scene 5: Ultra-detailed company card with contact info */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${currentScene === 5 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-4 sm:p-8 overflow-auto">
          <div className="w-full max-w-2xl bg-card/85 backdrop-blur-xl border border-accent/40 rounded-xl p-4 sm:p-8 animate-scale-in">
            <div className="space-y-4 sm:space-y-6">
              {/* Company header */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-accent/30 blur-xl animate-pulse"></div>
                  <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-accent relative" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">VICAMAR Technologies</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <span className="px-2 py-1 bg-accent/20 rounded-full text-accent font-semibold">Technologie</span>
                    <span>Saint-Germain-en-Laye (78)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-accent/20 rounded-full px-2 sm:px-3 py-1">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                      <span className="text-xs sm:text-sm font-semibold text-accent">Score: 92/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manager info */}
              <div className="border border-accent/20 rounded-lg p-3 sm:p-4 bg-accent/5 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Dirigeant</p>
                    <p className="text-sm sm:text-base font-bold text-foreground">Sophie Durand</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Directrice Générale</p>
                  </div>
                  <button className="flex-shrink-0 bg-[#0077B5] hover:bg-[#006399] text-white rounded-lg px-3 py-2 flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-[#0077B5]/30 group/btn">
                    <Linkedin className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-xs font-semibold hidden sm:inline">LinkedIn</span>
                  </button>
                </div>
              </div>

              {/* Contact details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="border border-accent/20 rounded-lg p-3 bg-card/60 hover:bg-accent/5 transition-all cursor-pointer group">
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-muted-foreground">Téléphone</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">01 39 21 45 67</p>
                </div>
                <div className="border border-accent/20 rounded-lg p-3 bg-card/60 hover:bg-accent/5 transition-all cursor-pointer group">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-muted-foreground">Email</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-foreground truncate">contact@vicamar.fr</p>
                </div>
              </div>

              {/* Activity details */}
              <div className="space-y-2 border-t border-accent/20 pt-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Activité récente</span>
                  <span className="text-accent font-semibold">Il y a 2 jours</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Effectifs</span>
                  <span className="text-foreground font-semibold">25-50 employés</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Chiffre d'affaires</span>
                  <span className="text-foreground font-semibold">2.5M €</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scene 6: Navigation actions */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${currentScene === 6 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-2xl space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Passez à l'action</h3>
              <p className="text-sm text-muted-foreground">Naviguez vers vos prospects en un clic</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Google Maps */}
              <button className="bg-card/80 backdrop-blur-xl border-2 border-accent/40 hover:border-accent/60 rounded-xl p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-1 group/nav animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-accent/20 blur-xl group-hover/nav:blur-2xl transition-all"></div>
                  <Map className="w-12 h-12 sm:w-16 sm:h-16 text-accent relative mx-auto group-hover/nav:scale-110 transition-transform" />
                </div>
                <h4 className="text-base sm:text-lg font-bold text-foreground mb-1">Google Maps</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Itinéraire optimisé</p>
              </button>

              {/* Waze */}
              <button className="bg-card/80 backdrop-blur-xl border-2 border-accent/40 hover:border-accent/60 rounded-xl p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-1 group/nav animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-accent/20 blur-xl group-hover/nav:blur-2xl transition-all"></div>
                  <Navigation className="w-12 h-12 sm:w-16 sm:h-16 text-accent relative mx-auto group-hover/nav:scale-110 transition-transform" />
                </div>
                <h4 className="text-base sm:text-lg font-bold text-foreground mb-1">Waze</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Navigation temps réel</p>
              </button>
            </div>

            {/* Additional actions */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <button className="bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent rounded-lg px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-center gap-2 transition-all text-xs sm:text-sm">
                <Phone className="w-4 h-4" />
                <span className="font-semibold">Appeler</span>
              </button>
              <button className="bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent rounded-lg px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-center gap-2 transition-all text-xs sm:text-sm">
                <Mail className="w-4 h-4" />
                <span className="font-semibold">Email</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scene 7: Final CTA */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${currentScene === 7 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 text-center">
          <div className="relative mb-6 sm:mb-8">
            <div className="absolute inset-0 bg-accent/30 blur-3xl animate-pulse"></div>
            <Target className="w-16 h-16 sm:w-24 sm:h-24 text-accent relative animate-[spin_20s_linear_infinite]" />
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4 animate-fade-in px-4">
            Tout votre potentiel client,<br />en un seul tableau de bord
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md animate-fade-in px-4" style={{ animationDelay: '0.2s' }}>
            Prospection intelligente • Navigation intégrée • Contacts directs
          </p>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="btn-hero min-w-[200px] sm:min-w-[240px] animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            Accéder à mon Dashboard
          </Button>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 animate-fade-in px-4" style={{ animationDelay: '0.5s' }}>
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
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <button
            key={i}
            onClick={() => setCurrentScene(i)}
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
              i === currentScene ? 'bg-accent w-6 sm:w-8' : 'bg-accent/30 hover:bg-accent/50 w-1.5 sm:w-2'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardPreview;
