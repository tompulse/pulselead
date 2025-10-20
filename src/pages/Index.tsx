import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Lightbulb, ArrowRight, Shield, CheckCircle, Star, AlertCircle, Clock, Target, Zap, TrendingUp, Check, Sparkles, Quote, Calendar } from "lucide-react";
import DashboardPreview from "@/components/landing/DashboardPreview";
import { trackCTAClick } from "@/utils/analytics";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Index = () => {
  const navigate = useNavigate();

  const handleExplorerClick = () => {
    trackCTAClick('Explorer LUMA', 'hero');
    navigate("/auth");
  };

  const handleConnexionClick = () => {
    trackCTAClick('Connexion', 'header');
    navigate("/auth");
  };

  const handleCreerCompteClick = () => {
    trackCTAClick('Créer un compte', 'header');
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-deep via-black-deep to-background relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-electric/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
      </div>

      {/* Header fixe */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/40 border-b border-accent/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="relative">
                <div className="absolute inset-0 bg-accent/30 blur-lg group-hover:blur-xl transition-all duration-300"></div>
                <Lightbulb className="w-7 h-7 sm:w-8 sm:h-8 text-accent relative" />
              </div>
              <span className="text-xl sm:text-2xl font-bold gradient-text">LUMA</span>
            </div>
            
            {/* Boutons d'action */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                onClick={handleConnexionClick}
                variant="outline"
                className="border-accent/30 text-foreground hover:bg-accent/10 hover:border-accent/50 transition-all duration-300 px-4 sm:px-6 h-9 sm:h-10 text-sm sm:text-base"
              >
                Connexion
              </Button>
              <Button 
                onClick={handleCreerCompteClick}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-4 sm:px-8 h-9 sm:h-10 text-sm sm:text-base rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-accent/50 hover:-translate-y-0.5"
              >
                Créer un compte
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8 animate-fade-in">
            {/* Badge de lancement */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-electric/10 border border-cyan-electric/30 backdrop-blur-sm hover:border-cyan-electric/50 transition-all">
              <Lightbulb className="w-4 h-4 text-cyan-electric animate-pulse" />
              <span className="text-sm text-cyan-electric font-semibold tracking-wide">Données officielles en temps réel</span>
            </div>
            
            {/* Promesse de vente claire */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-foreground">Contacte les nouvelles entreprises</span>
              <br />
              <span className="gradient-text">avant tes concurrents</span>
            </h1>
            
            {/* Sous-promesse claire */}
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              LUMA te permet de visualiser en temps réel toutes les créations d'entreprises sur ton territoire. 
              Fini les opportunités manquées. À toi les premiers contacts.
            </p>
            
            {/* CTA au-dessus de la ligne de flottaison */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Button 
                onClick={handleExplorerClick}
                size="lg"
                className="btn-hero w-full sm:w-auto min-w-[240px] h-14 text-lg group"
              >
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Aucune carte bancaire requise • Accès immédiat
            </p>

            {/* Visuel impactant - Dashboard Preview */}
            <div className="pt-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="glass-card p-4 sm:p-8 max-w-5xl mx-auto relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-electric/0 via-cyan-electric/10 to-cyan-electric/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                <div className="relative aspect-video">
                  <DashboardPreview />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative py-12 px-4 border-y border-cyan-electric/10 bg-gradient-to-r from-navy-deep/30 to-black-deep/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-electric/30 blur-xl group-hover:blur-2xl transition-all"></div>
                <Shield className="w-10 h-10 text-cyan-electric relative" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-foreground">Données officielles INPI</div>
                <div className="text-sm text-muted-foreground">Source certifiée • Mise à jour quotidienne</div>
              </div>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-electric/30 blur-xl group-hover:blur-2xl transition-all"></div>
                <CheckCircle className="w-10 h-10 text-cyan-electric relative" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-foreground">+500 commerciaux</div>
                <div className="text-sm text-muted-foreground">Gagnent du temps chaque jour</div>
              </div>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-electric/30 blur-xl group-hover:blur-2xl transition-all"></div>
                <Star className="w-10 h-10 text-cyan-electric relative fill-cyan-electric" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-foreground">4.8/5 de satisfaction</div>
                <div className="text-sm text-muted-foreground">+200 avis vérifiés</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Problèmes */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 space-y-4 animate-fade-in">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground">
              Tu perds des <span className="text-destructive">opportunités</span> chaque jour
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Sans outil adapté, tu passes à côté de ton vrai potentiel commercial
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="glass-card p-8 space-y-4 border-destructive/20 hover:border-destructive/40 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Tes concurrents sont plus rapides</h3>
              <p className="text-muted-foreground leading-relaxed">
                Pendant que tu cherches manuellement, ils contactent déjà les nouvelles entreprises et signent des contrats.
              </p>
            </div>

            <div className="glass-card p-8 space-y-4 border-destructive/20 hover:border-destructive/40 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <Clock className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Tu perds un temps précieux</h3>
              <p className="text-muted-foreground leading-relaxed">
                Des heures sur Excel, des données périmées, des recherches fastidieuses... Ce temps devrait être consacré à vendre.
              </p>
            </div>

            <div className="glass-card p-8 space-y-4 border-destructive/20 hover:border-destructive/40 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <Target className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Tu manques de vision stratégique</h3>
              <p className="text-muted-foreground leading-relaxed">
                Impossible de savoir où se trouvent les vraies opportunités : quel secteur ? Quelle zone privilégier ?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Solution avec résultats concrets */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-background via-navy-deep/20 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 space-y-4 animate-fade-in">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold">
              LUMA transforme ta <span className="gradient-text">prospection</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Sois le premier à contacter les nouvelles entreprises. Visualise ton territoire. Développe ton portefeuille.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="inline-flex w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-electric/20 to-cyan-electric/5 items-center justify-center">
                <Zap className="w-10 h-10 text-cyan-electric" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Réactivité maximale</h3>
              <p className="text-muted-foreground text-lg">
                Notifications en temps réel des nouvelles créations. Contact immédiat avant la concurrence.
              </p>
            </div>

            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="inline-flex w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-electric/20 to-cyan-electric/5 items-center justify-center">
                <TrendingUp className="w-10 h-10 text-cyan-electric" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Vision stratégique</h3>
              <p className="text-muted-foreground text-lg">
                Identifie les secteurs porteurs et les zones dynamiques. Priorise tes actions commerciales.
              </p>
            </div>

            <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="inline-flex w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-electric/20 to-cyan-electric/5 items-center justify-center">
                <Shield className="w-10 h-10 text-cyan-electric" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Données fiables</h3>
              <p className="text-muted-foreground text-lg">
                Informations officielles vérifiées : SIRET, adresse, activité, dirigeant, capital.
              </p>
            </div>
          </div>

          {/* Résultats concrets */}
          <div className="glass-card p-12 max-w-4xl mx-auto border-cyan-electric/30 bg-gradient-to-br from-cyan-electric/5 to-transparent">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-5xl font-bold gradient-text">3x</div>
                <div className="text-foreground font-semibold">Plus de RDV</div>
                <div className="text-sm text-muted-foreground">En moyenne</div>
              </div>
              <div className="space-y-2">
                <div className="text-5xl font-bold gradient-text">3h</div>
                <div className="text-foreground font-semibold">Gagnées par jour</div>
                <div className="text-sm text-muted-foreground">En recherche</div>
              </div>
              <div className="space-y-2">
                <div className="text-5xl font-bold gradient-text">+45%</div>
                <div className="text-foreground font-semibold">Nouveaux clients</div>
                <div className="text-sm text-muted-foreground">En 6 mois</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Prix */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4 animate-fade-in">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground">
              Un investissement <span className="gradient-text">rentable</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Combien coûte un client perdu face à un concurrent plus rapide ?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {/* Plan Gratuit */}
            <div className="glass-card p-8 space-y-6 hover:border-accent/50 transition-all duration-300">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Découverte</h3>
                <p className="text-muted-foreground">Pour tester LUMA</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold gradient-text">0€</span>
                <span className="text-muted-foreground">/mois</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Accès carte interactive</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">50 entreprises/mois</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Filtres par département</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Données INPI officielles</span>
                </li>
              </ul>
              <Button onClick={() => navigate("/auth")} className="w-full bg-card hover:bg-accent/10 text-foreground border border-accent/30" size="lg">
                Commencer gratuitement
              </Button>
            </div>

            {/* Plan Pro - Populaire */}
            <div className="relative glass-card p-8 space-y-6 border-cyan-electric/50 shadow-2xl shadow-cyan-electric/20 scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-cyan-electric to-cyan-electric/80 text-black-deep text-sm font-semibold rounded-full flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Le plus populaire
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Pro</h3>
                <p className="text-muted-foreground">Pour les commerciaux actifs</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold gradient-text">49€</span>
                <span className="text-muted-foreground">/mois</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Entreprises illimitées</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Tous filtres avancés</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Suivi interactions (appels, RDV)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Export données Excel</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Alertes temps réel</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Support prioritaire</span>
                </li>
              </ul>
              <Button onClick={() => navigate("/auth")} className="w-full btn-hero" size="lg">
                Démarrer l'essai gratuit
              </Button>
            </div>

            {/* Plan Équipe */}
            <div className="glass-card p-8 space-y-6 hover:border-accent/50 transition-all duration-300">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Équipe</h3>
                <p className="text-muted-foreground">Pour les équipes commerciales</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold gradient-text">129€</span>
                <span className="text-muted-foreground">/mois</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Tout du plan Pro</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Jusqu'à 5 utilisateurs</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Tableau de bord équipe</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Statistiques avancées</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Gestion territoires</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Formation personnalisée</span>
                </li>
              </ul>
              <Button onClick={() => navigate("/auth")} className="w-full bg-card hover:bg-accent/10 text-foreground border border-accent/30" size="lg">
                Contacter l'équipe
              </Button>
            </div>
          </div>

          <div className="glass-card p-8 max-w-3xl mx-auto text-center border-cyan-electric/20">
            <p className="text-xl text-muted-foreground mb-2">ROI moyen constaté :</p>
            <p className="text-3xl font-bold">
              <span className="line-through text-destructive/70">200h de recherche manuelle</span>
              {" → "}
              <span className="gradient-text">5 minutes avec LUMA</span>
            </p>
          </div>
        </div>
      </section>

      {/* Section Témoignages */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-background via-navy-deep/20 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 space-y-4 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-cyan-electric text-cyan-electric" />
                ))}
              </div>
              <span className="text-2xl font-bold text-foreground">4.8/5</span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground">
              Ils ont accéléré leur <span className="gradient-text">croissance</span>
            </h2>
            <p className="text-xl text-muted-foreground">Des résultats concrets dès les premières semaines</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 space-y-6 hover:border-cyan-electric/40 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Quote className="w-10 h-10 text-cyan-electric/30" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-cyan-electric text-cyan-electric" />
                ))}
              </div>
              <p className="text-foreground text-lg leading-relaxed">
                "En 30 jours, j'ai multiplié mes RDV par 3. LUMA me permet d'être la première à contacter les nouvelles entreprises."
              </p>
              <div className="inline-flex px-4 py-2 rounded-full bg-cyan-electric/10 border border-cyan-electric/30">
                <span className="text-sm font-semibold text-cyan-electric">+200% de RDV</span>
              </div>
              <div className="pt-4 border-t border-accent/10 space-y-1">
                <div className="font-semibold text-foreground">Sophie Martin</div>
                <div className="text-sm text-muted-foreground">Commerciale BtoB</div>
              </div>
            </div>

            <div className="glass-card p-8 space-y-6 hover:border-cyan-electric/40 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Quote className="w-10 h-10 text-cyan-electric/30" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-cyan-electric text-cyan-electric" />
                ))}
              </div>
              <p className="text-foreground text-lg leading-relaxed">
                "Fini les fichiers Excel. Je visualise tout mon territoire en un coup d'œil et je priorise mes actions."
              </p>
              <div className="inline-flex px-4 py-2 rounded-full bg-cyan-electric/10 border border-cyan-electric/30">
                <span className="text-sm font-semibold text-cyan-electric">3h gagnées/jour</span>
              </div>
              <div className="pt-4 border-t border-accent/10 space-y-1">
                <div className="font-semibold text-foreground">Thomas Dubois</div>
                <div className="text-sm text-muted-foreground">Responsable commercial</div>
              </div>
            </div>

            <div className="glass-card p-8 space-y-6 hover:border-cyan-electric/40 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Quote className="w-10 h-10 text-cyan-electric/30" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-cyan-electric text-cyan-electric" />
                ))}
              </div>
              <p className="text-foreground text-lg leading-relaxed">
                "L'outil que j'aurais voulu avoir dès le début. Simple, efficace, et toujours à jour. Un vrai gain de temps."
              </p>
              <div className="inline-flex px-4 py-2 rounded-full bg-cyan-electric/10 border border-cyan-electric/30">
                <span className="text-sm font-semibold text-cyan-electric">+45 nouveaux clients</span>
              </div>
              <div className="pt-4 border-t border-accent/10 space-y-1">
                <div className="font-semibold text-foreground">Marie Leroux</div>
                <div className="text-sm text-muted-foreground">Indépendante</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section FAQ + CTA Final */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16 space-y-4 animate-fade-in">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground">
              Questions <span className="gradient-text">fréquentes</span>
            </h2>
            <p className="text-xl text-muted-foreground">Tout ce que tu dois savoir sur LUMA</p>
          </div>

          <Accordion type="single" collapsible className="space-y-4 mb-16">
            <AccordionItem value="item-1" className="glass-card px-6 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-lg font-semibold text-foreground hover:text-cyan-electric">
                D'où viennent les données ?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                Toutes nos données proviennent de l'INPI (Institut National de la Propriété Industrielle) et sont mises à jour quotidiennement. Tu as accès aux informations légales vérifiées : SIRET, adresse, activité NAF, forme juridique, etc.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="glass-card px-6 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-lg font-semibold text-foreground hover:text-cyan-electric">
                Puis-je essayer gratuitement ?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                Oui ! Le plan gratuit te permet de consulter jusqu'à 50 entreprises par mois. Aucune carte bancaire requise pour commencer.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="glass-card px-6 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-lg font-semibold text-foreground hover:text-cyan-electric">
                Comment sont mises à jour les données ?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                Synchronisation automatique chaque jour avec les bases officielles. Tu es toujours informé des dernières créations d'entreprises dans ton secteur.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="glass-card px-6 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-lg font-semibold text-foreground hover:text-cyan-electric">
                Puis-je annuler mon abonnement à tout moment ?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                Absolument. Ton abonnement peut être annulé à tout moment depuis ton espace personnel, sans frais ni engagement.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="glass-card px-6 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-lg font-semibold text-foreground hover:text-cyan-electric">
                LUMA fonctionne sur mobile ?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                Oui, LUMA est entièrement responsive. Tu peux suivre tes prospects où que tu sois : ordinateur, tablette ou smartphone.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* CTA Final puissant */}
          <div className="glass-card p-12 text-center space-y-8 border-cyan-electric/30 bg-gradient-to-br from-cyan-electric/5 via-navy-deep/10 to-transparent">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Prêt à transformer ta prospection ?
            </h3>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Rejoins les centaines de commerciaux qui développent leur portefeuille avec LUMA
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button onClick={() => navigate("/auth")} size="lg" className="btn-hero min-w-[240px] h-14 text-lg">
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                size="lg"
                variant="outline"
                className="border-2 border-cyan-electric/50 text-foreground hover:bg-cyan-electric/10 hover:border-cyan-electric min-w-[240px] h-14 text-lg"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Voir la démo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground pt-4">
              Aucune carte bancaire • Mis en place en 5 minutes • Garantie satisfait ou remboursé
            </p>
          </div>
        </div>
      </section>

      {/* Footer minimaliste */}
      <footer className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-navy-deep/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col space-y-6">
            {/* Logo et liens */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 blur-md"></div>
                  <Lightbulb className="w-6 h-6 text-accent relative" />
                </div>
                <span className="text-lg font-bold gradient-text">LUMA</span>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground">
                <a href="#" className="hover:text-accent transition-colors duration-300">Mentions légales</a>
                <span className="hidden sm:inline text-accent/30">|</span>
                <a href="#" className="hover:text-accent transition-colors duration-300">Confidentialité</a>
                <span className="hidden sm:inline text-accent/30">|</span>
                <a href="#contact" className="hover:text-accent transition-colors duration-300" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}>Contact</a>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="text-center text-sm text-muted-foreground border-t border-accent/10 pt-6">
              <p>© 2025 LUMA. Tous droits réservés.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
