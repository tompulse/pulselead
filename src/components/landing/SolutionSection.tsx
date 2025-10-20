import { CheckCircle, Zap, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import DashboardPreview from "./DashboardPreview";

export const SolutionSection = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Zap,
      title: "Réactivité maximale",
      description: "Sois le premier à contacter les nouvelles entreprises. Notifications en temps réel."
    },
    {
      icon: TrendingUp,
      title: "Vision stratégique",
      description: "Identifie les secteurs porteurs et les zones les plus dynamiques de ton territoire."
    },
    {
      icon: Shield,
      title: "Données fiables",
      description: "Informations officielles vérifiées : SIRET, adresse, activité, dirigeant."
    }
  ];

  return (
    <section className="relative py-20 px-4 bg-gradient-to-b from-background to-navy-deep/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold">
            LUMA transforme ta <span className="gradient-text">prospection</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Gagne en clarté, en rapidité et en efficacité. Concentre-toi sur ce qui compte : vendre.
          </p>
        </div>

        {/* Avant / Après visuel */}
        <div className="mb-16">
          <div className="glass-card p-8 max-w-4xl mx-auto">
            <div className="relative aspect-video">
              <DashboardPreview />
            </div>
            <div className="mt-6 text-center">
              <p className="text-lg text-muted-foreground">
                <span className="line-through text-destructive">Fichiers Excel désorganisés</span>
                {" → "}
                <span className="text-cyan-electric font-semibold">Carte interactive en temps réel</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bénéfices */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div 
                key={index}
                className="text-center space-y-4 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex w-16 h-16 rounded-2xl bg-cyan-electric/10 items-center justify-center">
                  <Icon className="w-8 h-8 text-cyan-electric" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Garanties */}
        <div className="glass-card p-8 max-w-3xl mx-auto border-cyan-electric/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cyan-electric mt-1 flex-shrink-0" />
                <span className="text-foreground">Essai gratuit sans engagement</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cyan-electric mt-1 flex-shrink-0" />
                <span className="text-foreground">Mis en place en moins de 5 minutes</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cyan-electric mt-1 flex-shrink-0" />
                <span className="text-foreground">Support réactif 7j/7</span>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/auth")}
              size="lg"
              className="btn-hero whitespace-nowrap"
            >
              Commencer maintenant
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};