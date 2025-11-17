import { MapPin, Target, TrendingUp, Zap, Shield, Clock, BarChart } from "lucide-react";

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
      icon: BarChart,
      title: "Reporting complet",
      description: "Analysez votre activité avec des statistiques détaillées et des graphiques interactifs pour piloter vos résultats."
    }
  ];

  return (
    <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold">
          Tout ce dont vous avez besoin pour <span className="gradient-text">performer</span>
        </h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
          Une plateforme complète pensée pour les commerciaux terrain
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="glass-card p-3 md:p-4 space-y-2 hover:scale-105 transition-all duration-300 group"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-accent/10">
              <feature.icon className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-base md:text-lg font-bold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
