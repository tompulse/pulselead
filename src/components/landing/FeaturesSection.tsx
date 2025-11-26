import { MapPin, Target, TrendingUp, Zap, Shield, Clock, BarChart } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: MapPin,
      title: "Cartographie de votre territoire",
      description: "Visualisez tous vos prospects et clients sur une carte. Filtrez par secteur, statut, ou type d'activité."
    },
    {
      icon: Target,
      title: "Tournées optimisées automatiquement",
      description: "L'IA calcule le meilleur itinéraire en 3 secondes. GPS intégré. Gagnez 2h par jour et visitez 2-3 entreprises de plus."
    },
    {
      icon: Zap,
      title: "CRM simple et mobile",
      description: "Enregistrez visites, appels et relances depuis votre mobile. Pipeline visuel pour suivre vos opportunités."
    },
    {
      icon: TrendingUp,
      title: "Détection des nouvelles opportunités",
      description: "Créations d'entreprises et nouveaux établissements dans votre zone (données officielles publiques)."
    },
    {
      icon: Clock,
      title: "Import de vos fichiers",
      description: "Importez vos Excel, CSV ou bases existantes. PULSE enrichit automatiquement les données manquantes."
    },
    {
      icon: Shield,
      title: "Conforme RGPD",
      description: "Toutes les données publiques proviennent de sources officielles. Sécurité et conformité garanties."
    },
    {
      icon: BarChart,
      title: "Suivi de votre activité",
      description: "Tableaux de bord clairs : nombre de visites, taux de conversion, évolution de votre pipeline."
    }
  ];

  return (
    <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold">
          Les 3 piliers de <span className="gradient-text">PULSE</span>
        </h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
          Cartographie + Tournées optimisées + CRM terrain = Plus de temps pour vendre
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
