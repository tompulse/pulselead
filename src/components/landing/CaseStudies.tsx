import { AlertCircle, CheckCircle, X, Check, Quote, TrendingUp, Clock, Target } from "lucide-react";

export const CaseStudies = () => {
  return (
    <section className="py-16 sm:py-20 px-4 bg-gradient-to-b from-background to-primary/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-4">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-sm font-bold text-accent">Témoignage client</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Avant / Après <span className="gradient-text">PULSE</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            L'impact concret sur l'organisation et les résultats
          </p>
        </div>
        
        {/* Cas 1 - Commercial BtoB */}
        <div className="glass-card p-6 sm:p-8 mb-8 space-y-8">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* Avant */}
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-destructive flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Avant PULSE
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">2-3h perdues par jour en trajets non optimisés</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Suivi client dispersé : Excel, carnets, mémoire...</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Relances oubliées, prospects perdus</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Pas de visibilité sur le territoire et les opportunités</span>
                </li>
              </ul>
              
              <div className="p-4 sm:p-6 bg-destructive/10 rounded-lg border border-destructive/30">
                <div className="text-3xl sm:text-4xl font-bold text-destructive">Désorganisé</div>
                <div className="text-sm text-muted-foreground mt-1">Pas de vue d'ensemble</div>
              </div>
            </div>
            
            {/* Après */}
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-accent flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Après PULSE
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Tournées calculées en 3s : <strong>2h gagnées</strong> chaque jour</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Tout centralisé sur mobile : visites, appels, relances</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Rappels automatiques : plus aucune relance manquée</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Vision claire du territoire + nouvelles opportunités</span>
                </li>
              </ul>
              
              <div className="p-4 sm:p-6 bg-accent/10 rounded-lg border border-accent/30">
                <div className="text-3xl sm:text-4xl font-bold text-accent">Organisé</div>
                <div className="text-sm text-green-500 mt-1 font-semibold">Suivi clair et centralisé</div>
              </div>
            </div>
          </div>
          
          {/* Citation client */}
          <div className="p-6 sm:p-8 border-l-4 border-accent bg-accent/5 rounded-r-lg">
            <Quote className="w-8 h-8 text-accent/30 mb-3" />
            <p className="text-base sm:text-lg text-foreground italic mb-4">
              "Avant PULSE, je passais plus de temps sur la route et à gérer mes Excel qu'à vendre. Maintenant, mes tournées sont optimisées, 
              mon suivi est clair, et je ne perds plus de temps. Je fais 3 visites de plus par jour et mon taux de conversion a explosé."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center">
                <span className="text-accent font-bold text-lg">TC</span>
              </div>
              <div>
                <div className="font-bold text-foreground">Thomas C.</div>
                <div className="text-sm text-muted-foreground">Commercial terrain TPE, fournitures de bureau</div>
              </div>
            </div>
          </div>
        </div>
        
        
        {/* Stats globales */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card p-6 text-center">
            <Clock className="w-8 h-8 text-accent mx-auto mb-3" />
            <div className="text-3xl font-bold text-accent mb-1">2h/jour</div>
            <div className="text-sm text-muted-foreground">gagnées en moyenne</div>
          </div>
          <div className="glass-card p-6 text-center">
            <Target className="w-8 h-8 text-accent mx-auto mb-3" />
            <div className="text-3xl font-bold text-accent mb-1">+3 visites</div>
            <div className="text-sm text-muted-foreground">par jour en moyenne</div>
          </div>
          <div className="glass-card p-6 text-center">
            <TrendingUp className="w-8 h-8 text-accent mx-auto mb-3" />
            <div className="text-3xl font-bold text-accent mb-1">Organisé</div>
            <div className="text-sm text-muted-foreground">suivi clair et centralisé</div>
          </div>
        </div>
      </div>
    </section>
  );
};
