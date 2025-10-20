import { MapPin, Target, TrendingUp, Zap, Shield, Clock, Users, BarChart } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: MapPin,
      title: "Cartographie interactive",
      description: "Visualisez toutes les nouvelles entreprises sur une carte intuitive avec zoom et filtres géographiques par département."
    },
    {
      icon: Target,
      title: "Filtres intelligents",
      description: "Affinez vos recherches par secteur d'activité, localisation, date de création et forme juridique."
    },
    {
      icon: TrendingUp,
      title: "Données officielles",
      description: "Accédez aux informations vérifiées : SIRET, adresse complète, activité NAF, capital social."
    },
    {
      icon: Zap,
      title: "IA de formatage",
      description: "Les données brutes sont automatiquement formatées et enrichies par notre intelligence artificielle."
    },
    {
      icon: Clock,
      title: "Mise à jour continue",
      description: "Synchronisation automatique avec les bases de données officielles pour des informations toujours à jour."
    },
    {
      icon: Shield,
      title: "Sécurité maximale",
      description: "Vos données et recherches sont protégées avec un chiffrement de niveau bancaire."
    },
    {
      icon: Users,
      title: "Multi-utilisateurs",
      description: "Gérez votre équipe commerciale avec des accès différenciés et un suivi des performances."
    },
    {
      icon: BarChart,
      title: "Tableaux de bord",
      description: "Analysez vos données avec des statistiques détaillées et des graphiques interactifs."
    }
  ];

  return (
    <section className="container mx-auto px-6 py-32">
      <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold">
          Maîtrisez votre territoire
          <br />
          <span className="gradient-text">et développez votre portefeuille</span>
        </h2>
        <p className="text-xl text-muted-foreground">
          Des outils conçus pour les commerciaux qui veulent structurer leur prospection et connaître leur secteur
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div 
              key={index}
              className="glass-card p-6 space-y-4 border-accent/30 hover:border-accent/60 hover:shadow-2xl hover:shadow-accent/20 hover:bg-gradient-to-br hover:from-accent/10 hover:to-accent/5 transition-all duration-300 group cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-accent/30 transition-all shadow-md shadow-accent/10">
                <Icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold gradient-text group-hover:scale-105 transition-transform">
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
