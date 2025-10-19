import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="container mx-auto px-6 py-32">
      <div className="relative glass-card p-12 md:p-16 text-center space-y-8 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5 pointer-events-none"></div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 backdrop-blur-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
            </span>
            <span className="text-sm text-accent font-medium">Offre de lancement</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Ne laissez plus vos concurrents
            <br />
            <span className="gradient-text">prospecter avant vous</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Structurez votre prospection et soyez le premier à contacter les nouvelles entreprises de votre secteur
          </p>

          {/* Benefits */}
          <div className="grid sm:grid-cols-3 gap-6 pt-8 max-w-3xl mx-auto">
            {[
              "Gratuit pendant 14 jours",
              "Sans carte bancaire",
              "Annulation à tout moment"
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-left">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <button 
              onClick={() => navigate("/auth")}
              className="group btn-hero inline-flex items-center gap-3 text-xl px-10 py-5"
            >
              Démarrer gratuitement
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground pt-4">
            Toutes les <span className="text-accent font-semibold">créations d'entreprises</span> en France accessibles
          </p>
        </div>
      </div>
    </section>
  );
};
