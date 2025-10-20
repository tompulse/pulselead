import { Shield, CheckCircle, Star } from "lucide-react";

export const SocialProofSection = () => {
  return (
    <section className="relative py-12 px-4 border-y border-accent/10 bg-gradient-to-r from-navy-deep/30 to-black-deep/30">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          {/* Certification officielle */}
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-electric/20 blur-xl group-hover:blur-2xl transition-all"></div>
              <Shield className="w-8 h-8 text-cyan-electric relative" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-foreground">Données officielles</div>
              <div className="text-sm text-muted-foreground">Source INPI certifiée</div>
            </div>
          </div>

          {/* Utilisateurs actifs */}
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-electric/20 blur-xl group-hover:blur-2xl transition-all"></div>
              <CheckCircle className="w-8 h-8 text-cyan-electric relative" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-foreground">+500 commerciaux</div>
              <div className="text-sm text-muted-foreground">utilisent LUMA</div>
            </div>
          </div>

          {/* Note satisfaction */}
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-electric/20 blur-xl group-hover:blur-2xl transition-all"></div>
              <Star className="w-8 h-8 text-cyan-electric relative fill-cyan-electric" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-foreground">4.8/5 de satisfaction</div>
              <div className="text-sm text-muted-foreground">+200 avis clients</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};