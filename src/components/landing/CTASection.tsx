import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="container mx-auto px-6 py-12 md:py-16">
      <div className="relative glass-card p-6 md:p-8 text-center space-y-4 overflow-hidden border-accent/40 shadow-2xl shadow-accent/20">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-accent/10 pointer-events-none"></div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-accent/30 to-accent/20 border border-accent/50 backdrop-blur-sm shadow-lg shadow-accent/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent shadow-md shadow-accent/50"></span>
            </span>
            <span className="text-xs text-accent font-bold">Offre de lancement</span>
          </div>

          <h2 className="text-2xl lg:text-3xl font-bold leading-tight">
            Transformez votre façon
            <br />
            <span className="gradient-text">de vendre sur le terrain</span>
          </h2>
          
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Gagnez du temps, optimisez vos déplacements et développez votre chiffre d'affaires
          </p>

          {/* Benefits */}
          <div className="grid sm:grid-cols-2 gap-3 pt-4 max-w-2xl mx-auto">
            {[
              "Essai gratuit 7 jours",
              "Annulation à tout moment"
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-left">
                <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="pt-3">
            <button 
              onClick={() => navigate("/auth")}
              className="group btn-hero inline-flex items-center gap-2 text-base md:text-lg px-6 md:px-8 py-3 md:py-3.5 shadow-2xl shadow-accent/40 hover:shadow-accent/50"
            >
              Démarrer gratuitement
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground pt-4">
            L'outil <span className="text-accent font-semibold">tout-en-un</span> des commerciaux qui performent
          </p>
        </div>
      </div>
    </section>
  );
};
