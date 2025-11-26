import { ArrowRight, AlertCircle, CheckCircle, Clock, MapPin, FileText, Target, Zap, TrendingUp } from "lucide-react";

export const ProblemSolutionMapping = () => {
  const mappings = [
    {
      problem: {
        icon: Clock,
        title: "40% du temps perdu sur la route",
        description: "Vous passez plus de temps à rouler qu'à vendre"
      },
      solution: {
        icon: Target,
        title: "Tournées optimisées automatiquement",
        description: "Itinéraires calculés en 3s, GPS intégré, +2-3 visites/jour"
      }
    },
    {
      problem: {
        icon: FileText,
        title: "Excel, carnets, post-its...",
        description: "Votre suivi client est un cauchemar à gérer"
      },
      solution: {
        icon: Zap,
        title: "CRM terrain simple et mobile",
        description: "Visites, appels, relances : tout centralisé sur votre téléphone"
      }
    },
    {
      problem: {
        icon: AlertCircle,
        title: "Opportunités manquées",
        description: "Vous passez à côté de prospects sans le savoir"
      },
      solution: {
        icon: TrendingUp,
        title: "Cartographie territoriale complète",
        description: "Tous vos prospects sur une carte + détection des nouvelles entreprises"
      }
    },
    {
      problem: {
        icon: MapPin,
        title: "Les CRM classiques sont trop lourds",
        description: "Trop complexes pour un usage terrain quotidien"
      },
      solution: {
        icon: CheckCircle,
        title: "Pensé pour les commerciaux TPE/PME",
        description: "Simple, rapide, efficace : juste ce qu'il faut"
      }
    }
  ];

  return (
    <section className="relative py-16 sm:py-20 px-4 bg-gradient-to-b from-background to-primary/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-destructive">Vos problèmes</span> → <span className="text-accent">Nos solutions</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            PULSE vous aide à gagner du temps et vendre plus efficacement
          </p>
        </div>
        
        <div className="space-y-6">
          {mappings.map((mapping, index) => (
            <div 
              key={index}
              className="glass-card p-4 sm:p-6 grid md:grid-cols-[1fr,auto,1fr] gap-4 sm:gap-6 items-center hover:border-accent/40 transition-all duration-300"
            >
              {/* Problème */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <mapping.problem.icon className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-bold text-destructive mb-1 text-sm sm:text-base">{mapping.problem.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{mapping.problem.description}</p>
                </div>
              </div>
              
              {/* Flèche */}
              <div className="flex justify-center">
                <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 text-accent rotate-90 md:rotate-0" />
              </div>
              
              {/* Solution */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <mapping.solution.icon className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-accent mb-1 text-sm sm:text-base">{mapping.solution.title}</h3>
                  <p className="text-xs sm:text-sm text-foreground">{mapping.solution.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-base sm:text-lg text-muted-foreground mb-6">
            Prêt à transformer vos défis en opportunités ?
          </p>
          <button className="btn-hero inline-flex items-center gap-2 px-6 sm:px-8 py-3">
            Démarrer gratuitement
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
