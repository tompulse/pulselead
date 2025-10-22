import { MapPin, Target, TrendingUp, Zap, Shield, Clock, Users, BarChart } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: MapPin,
      title: "Tournées optimisées",
      description: "Planifiez vos visites terrain avec des itinéraires intelligents. GPS intégré et optimisation automatique pour gagner du temps."
    },
    {
      icon: Target,
      title: "CRM intégré",
      description: "Gérez vos prospects et clients. Historique complet, relances automatiques, pipeline commercial clair et actionable."
    },
    {
      icon: TrendingUp,
      title: "Suivi d'activité",
      description: "Suivez vos performances : appels, visites, RDV, conversions. Tableaux de bord et statistiques en temps réel."
    },
    {
      icon: Zap,
      title: "Nouvelles entreprises",
      description: "Accédez aux créations d'entreprises de votre secteur. Données INPI & INSEE, filtres avancés par zone et activité."
    },
    {
      icon: Clock,
      title: "Gestion du temps",
      description: "Organisez votre agenda, programmez vos relances et ne manquez plus aucune opportunité commerciale."
    },
    {
      icon: Shield,
      title: "Données sécurisées",
      description: "Vos données commerciales protégées avec un chiffrement de niveau bancaire. Hébergement en France."
    },
    {
      icon: Users,
      title: "Mode équipe",
      description: "Gérez votre équipe commerciale avec des accès différenciés et un suivi des performances de chacun."
    },
    {
      icon: BarChart,
      title: "Reporting complet",
      description: "Analysez votre activité avec des statistiques détaillées et des graphiques interactifs pour piloter vos résultats."
    }
  ];

  return (
    <section className="container mx-auto px-6 py-32">
      <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold">
          Toutes les fonctionnalités
          <br />
          <span className="gradient-text">pour développer votre activité</span>
        </h2>
        <p className="text-xl text-muted-foreground">
          Un outil complet pensé pour les commerciaux terrain qui veulent être plus efficaces
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div 
              key={index}
              className="glass-card p-6 space-y-4 border-accent/30 hover:border-accent/60 transition-colors duration-300 group cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center transition-colors shadow-md shadow-accent/10">
                <Icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold gradient-text">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
