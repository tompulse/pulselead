import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const PricingSection = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Gratuit",
      price: "0€",
      period: "/mois",
      description: "Pour découvrir LUMA",
      features: [
        "Accès à la carte interactive",
        "50 entreprises consultables/mois",
        "Filtres basiques (département)",
        "Données officielles INPI"
      ],
      cta: "Commencer gratuitement",
      popular: false
    },
    {
      name: "Pro",
      price: "49€",
      period: "/mois",
      description: "Pour les commerciaux actifs",
      features: [
        "Entreprises illimitées",
        "Tous les filtres avancés",
        "Suivi des interactions (appels, visites, RDV)",
        "Export des données",
        "Alertes en temps réel",
        "Support prioritaire"
      ],
      cta: "Démarrer l'essai gratuit",
      popular: true,
      badge: "Le plus populaire"
    },
    {
      name: "Équipe",
      price: "129€",
      period: "/mois",
      description: "Pour les équipes commerciales",
      features: [
        "Tout du plan Pro",
        "Jusqu'à 5 utilisateurs",
        "Tableau de bord équipe",
        "Statistiques avancées",
        "Gestion des territoires",
        "Formation personnalisée"
      ],
      cta: "Contacter l'équipe",
      popular: false
    }
  ];

  return (
    <section className="relative py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            Un investissement qui <span className="gradient-text">se rembourse</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Combien coûte un client perdu face à un concurrent plus rapide ?
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative glass-card p-8 space-y-6 transition-all duration-300 ${
                plan.popular 
                  ? 'border-cyan-electric/50 shadow-2xl shadow-cyan-electric/20 scale-105' 
                  : 'hover:border-accent/50'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-cyan-electric to-cyan-electric/80 text-black-deep text-sm font-semibold rounded-full flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {plan.badge}
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold gradient-text">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                onClick={() => navigate("/auth")}
                className={`w-full ${
                  plan.popular 
                    ? 'btn-hero' 
                    : 'bg-card hover:bg-accent/10 text-foreground border border-accent/30'
                }`}
                size="lg"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Comparaison coût */}
        <div className="glass-card p-8 max-w-2xl mx-auto text-center border-cyan-electric/20">
          <p className="text-lg text-muted-foreground mb-2">
            Comparé aux méthodes traditionnelles :
          </p>
          <p className="text-2xl font-semibold text-foreground">
            <span className="line-through text-destructive">200h de recherche manuelle</span>
            {" → "}
            <span className="gradient-text">5 minutes avec LUMA</span>
          </p>
        </div>
      </div>
    </section>
  );
};