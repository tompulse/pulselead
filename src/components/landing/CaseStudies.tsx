import { AlertCircle, CheckCircle, X, Check, Quote, TrendingUp, Clock, Target } from "lucide-react";

export const CaseStudies = () => {
  return (
    <section className="py-16 sm:py-20 px-4 bg-gradient-to-b from-background to-primary/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-4">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-sm font-bold text-accent">Résultats Clients</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Cas clients : <span className="gradient-text">Résultats mesurables</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez comment nos utilisateurs ont transformé leur activité avec LUMA
          </p>
        </div>
        
        {/* Cas 1 - Commercial BtoB */}
        <div className="glass-card p-6 sm:p-8 mb-8 space-y-8">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* Avant */}
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-destructive flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Avant LUMA
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Tournées de 3h de prospection non optimisées</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Taux de conversion RDV : <strong>7%</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">CRM Excel difficile à maintenir</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Prospection réactive, pas de ciblage</span>
                </li>
              </ul>
              
              <div className="p-4 sm:p-6 bg-destructive/10 rounded-lg border border-destructive/30">
                <div className="text-3xl sm:text-4xl font-bold text-destructive">3 200€/mois</div>
                <div className="text-sm text-muted-foreground mt-1">Commission moyenne</div>
              </div>
            </div>
            
            {/* Après */}
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-accent flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Après LUMA (3 mois)
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Tournées optimisées : <strong>45 min économisées</strong> sur 3h</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Taux de conversion RDV : <strong>18%</strong> (+11 points)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Pipeline CRM clair et à jour en temps réel</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Accès direct aux nouvelles entreprises</span>
                </li>
              </ul>
              
              <div className="p-4 sm:p-6 bg-accent/10 rounded-lg border border-accent/30">
                <div className="text-3xl sm:text-4xl font-bold text-accent">4 800€/mois</div>
                <div className="text-sm text-green-500 mt-1 font-semibold">+50% de commissions</div>
              </div>
            </div>
          </div>
          
          {/* Citation client */}
          <div className="p-6 sm:p-8 border-l-4 border-accent bg-accent/5 rounded-r-lg">
            <Quote className="w-8 h-8 text-accent/30 mb-3" />
            <p className="text-base sm:text-lg text-foreground italic mb-4">
              "LUMA m'a permis de doubler mes RDV et de gagner 2h par jour. Le ROI s'est fait sentir dès le 2ème mois. 
              J'ai surtout apprécié l'accès aux nouveaux sites, ça m'a permis de cibler des prospects avant mes concurrents."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center">
                <span className="text-accent font-bold text-lg">TD</span>
              </div>
              <div>
                <div className="font-bold text-foreground">Thomas D.</div>
                <div className="text-sm text-muted-foreground">Commercial BtoB, Lyon</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Cas 2 - Équipe commerciale */}
        <div className="glass-card p-6 sm:p-8 space-y-8">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* Avant */}
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-destructive flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Avant LUMA
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">5 commerciaux, coordination difficile</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Doublon de visites sur les mêmes prospects</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Reporting manuel, visibilité limitée</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Taux de conversion : 12%</span>
                </li>
              </ul>
              
              <div className="p-4 sm:p-6 bg-destructive/10 rounded-lg border border-destructive/30">
                <div className="text-3xl sm:text-4xl font-bold text-destructive">18 500€/mois</div>
                <div className="text-sm text-muted-foreground mt-1">CA équipe (5 commerciaux)</div>
              </div>
            </div>
            
            {/* Après */}
            <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-accent flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Après LUMA (3 mois)
            </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Vision d'équipe centralisée</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Territoires optimisés, zéro doublon</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Dashboard temps réel pour le manager</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Taux de conversion : 18%</span>
                </li>
              </ul>
              
              <div className="p-4 sm:p-6 bg-accent/10 rounded-lg border border-accent/30">
                <div className="text-3xl sm:text-4xl font-bold text-accent">27 800€/mois</div>
                <div className="text-sm text-green-500 mt-1 font-semibold">+50% de CA équipe</div>
              </div>
            </div>
          </div>
          
          {/* Citation client */}
          <div className="p-6 sm:p-8 border-l-4 border-accent bg-accent/5 rounded-r-lg">
            <Quote className="w-8 h-8 text-accent/30 mb-3" />
            <p className="text-base sm:text-lg text-foreground italic mb-4">
              "En tant que manager, LUMA m'a donné une vision claire de l'activité de mon équipe. 
              Plus de doublons, meilleure coordination, et surtout : des résultats qui parlent d'eux-mêmes."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center">
                <span className="text-accent font-bold text-lg">ML</span>
              </div>
              <div>
                <div className="font-bold text-foreground">Marie L.</div>
                <div className="text-sm text-muted-foreground">Directrice Commerciale, Bordeaux</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats globales */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card p-6 text-center">
            <Clock className="w-8 h-8 text-accent mx-auto mb-3" />
            <div className="text-3xl font-bold text-accent mb-1">6h</div>
            <div className="text-sm text-muted-foreground">économisées par semaine en moyenne</div>
          </div>
          <div className="glass-card p-6 text-center">
            <Target className="w-8 h-8 text-accent mx-auto mb-3" />
            <div className="text-3xl font-bold text-accent mb-1">+35%</div>
            <div className="text-sm text-muted-foreground">de visites par jour en moyenne</div>
          </div>
          <div className="glass-card p-6 text-center">
            <TrendingUp className="w-8 h-8 text-accent mx-auto mb-3" />
            <div className="text-3xl font-bold text-accent mb-1">+30%</div>
            <div className="text-sm text-muted-foreground">de commissions en moyenne</div>
          </div>
        </div>
      </div>
    </section>
  );
};
