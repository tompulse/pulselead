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
      <section className="relative pt-32 sm:pt-40 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-10 animate-fade-in">
            {/* Badge de lancement */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-electric/10 border border-cyan-electric/30 backdrop-blur-sm hover:border-cyan-electric/50 transition-all">
              <Lightbulb className="w-5 h-5 text-cyan-electric animate-pulse" />
              <span className="text-base text-cyan-electric font-bold tracking-wide">🔥 Données officielles • Temps réel</span>
            </div>
            
            {/* Promesse de vente ultra claire */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight">
              <span className="text-foreground">Sois le premier</span>
              <br />
              <span className="gradient-text">à contacter</span>
              <br />
              <span className="text-foreground">les nouvelles entreprises</span>
            </h1>
            
            {/* Sous-promesse ultra directe */}
            <p className="text-xl sm:text-2xl md:text-3xl text-foreground/80 max-w-4xl mx-auto leading-relaxed font-medium">
              Visualise en temps réel <span className="text-cyan-electric font-bold">toutes les créations d'entreprises</span> sur ton territoire.
              <br className="hidden sm:block" />
              Fini les opportunités manquées.
            </p>
            
            {/* CTA ultra visible */}
            <div className="flex flex-col items-center gap-6 pt-8">
              <Button 
                onClick={handleExplorerClick}
                size="lg"
                className="btn-hero w-full sm:w-auto min-w-[280px] h-16 text-xl font-bold group shadow-2xl shadow-cyan-electric/30"
              >
                Démarrer maintenant
                <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
              <div className="flex items-center gap-2 text-base text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-cyan-electric" />
                <span className="font-semibold">Gratuit • Sans carte bancaire • Accès immédiat</span>
              </div>
            </div>

            {/* Visuel impactant */}
            <div className="pt-20 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="glass-card p-6 sm:p-10 max-w-5xl mx-auto relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-electric/0 via-cyan-electric/20 to-cyan-electric/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <DashboardPreview />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative py-16 px-4 border-y border-cyan-electric/10 bg-gradient-to-r from-navy-deep/40 to-black-deep/40">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20">
            <div className="flex items-center gap-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-electric/40 blur-2xl group-hover:blur-3xl transition-all"></div>
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-electric/20 to-cyan-electric/5 flex items-center justify-center">
                  <Shield className="w-9 h-9 text-cyan-electric" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-foreground">100% Officiel</div>
                <div className="text-base text-muted-foreground font-medium">Données certifiées INPI</div>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-electric/40 blur-2xl group-hover:blur-3xl transition-all"></div>
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-electric/20 to-cyan-electric/5 flex items-center justify-center">
                  <CheckCircle className="w-9 h-9 text-cyan-electric" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-foreground">+500 Utilisateurs</div>
                <div className="text-base text-muted-foreground font-medium">Gagnent du temps quotidiennement</div>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-electric/40 blur-2xl group-hover:blur-3xl transition-all"></div>
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-electric/20 to-cyan-electric/5 flex items-center justify-center">
                  <Star className="w-9 h-9 text-cyan-electric fill-cyan-electric" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-foreground">4.8/5 ★★★★★</div>
                <div className="text-base text-muted-foreground font-medium">+200 avis vérifiés</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Problèmes */}
      <section className="relative py-28 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20 space-y-6 animate-fade-in">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground leading-tight">
              Tu perds des <span className="text-destructive">milliers d'euros</span>
              <br />
              chaque mois
            </h2>
            <p className="text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto font-medium">
              Sans outil de prospection moderne, tu passes à côté de ton potentiel
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            <div className="glass-card p-10 space-y-6 border-destructive/30 hover:border-destructive/50 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
              <h3 className="text-2xl font-black text-foreground">Trop lent</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Tes concurrents sont <span className="text-foreground font-bold">3x plus rapides</span>. Ils signent pendant que tu cherches encore.
              </p>
            </div>

            <div className="glass-card p-10 space-y-6 border-destructive/30 hover:border-destructive/50 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center">
                <Clock className="w-10 h-10 text-destructive" />
              </div>
              <h3 className="text-2xl font-black text-foreground">Temps perdu</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                <span className="text-foreground font-bold">200h par mois</span> sur Excel et recherches manuelles. Ce temps devrait servir à vendre.
              </p>
            </div>

            <div className="glass-card p-10 space-y-6 border-destructive/30 hover:border-destructive/50 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center">
                <Target className="w-10 h-10 text-destructive" />
              </div>
              <h3 className="text-2xl font-black text-foreground">Zéro visibilité</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Impossible de savoir <span className="text-foreground font-bold">où sont les opportunités</span>. Tu prospectées à l'aveugle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Solution avec résultats concrets */}
      <section className="relative py-28 px-4 bg-gradient-to-b from-background via-navy-deep/20 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20 space-y-6 animate-fade-in">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
              LUMA multiplie tes <span className="gradient-text">résultats</span>
            </h2>
            <p className="text-2xl md:text-3xl text-foreground/80 max-w-4xl mx-auto font-medium">
              Deviens le commercial le plus réactif de ton secteur
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 mb-20 max-w-5xl mx-auto">
            <div className="text-center space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="inline-flex w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-electric/20 to-cyan-electric/5 items-center justify-center">
                <Zap className="w-12 h-12 text-cyan-electric" />
              </div>
              <h3 className="text-3xl font-black text-foreground">Premier sur le terrain</h3>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Notifications <span className="text-cyan-electric font-bold">instantanées</span>. Tu contactes avant tout le monde.
              </p>
            </div>

            <div className="text-center space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="inline-flex w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-electric/20 to-cyan-electric/5 items-center justify-center">
                <TrendingUp className="w-12 h-12 text-cyan-electric" />
              </div>
              <h3 className="text-3xl font-black text-foreground">Vision stratégique</h3>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Identifie les <span className="text-cyan-electric font-bold">zones à fort potentiel</span>. Priorise intelligemment.
              </p>
            </div>

            <div className="text-center space-y-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="inline-flex w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-electric/20 to-cyan-electric/5 items-center justify-center">
                <Shield className="w-12 h-12 text-cyan-electric" />
              </div>
              <h3 className="text-3xl font-black text-foreground">100% fiable</h3>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Données <span className="text-cyan-electric font-bold">officielles vérifiées</span>. Zéro erreur, zéro perte de temps.
              </p>
            </div>
          </div>

          {/* Résultats concrets */}
          <div className="glass-card p-12 md:p-16 max-w-5xl mx-auto border-cyan-electric/30 bg-gradient-to-br from-cyan-electric/5 to-transparent">
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div className="space-y-3">
                <div className="text-6xl md:text-7xl font-black gradient-text">×3</div>
                <div className="text-2xl text-foreground font-bold">Plus de RDV</div>
                <div className="text-lg text-muted-foreground">Dès le 1er mois</div>
              </div>
              <div className="space-y-3">
                <div className="text-6xl md:text-7xl font-black gradient-text">3h</div>
                <div className="text-2xl text-foreground font-bold">Gagnées/jour</div>
                <div className="text-lg text-muted-foreground">En recherche manuelle</div>
              </div>
              <div className="space-y-3">
                <div className="text-6xl md:text-7xl font-black gradient-text">+45%</div>
                <div className="text-2xl text-foreground font-bold">De clients</div>
                <div className="text-lg text-muted-foreground">En 6 mois</div>
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

          {/* Segmentation par région */}
          <div className="glass-card p-6 max-w-2xl mx-auto mb-12 border-cyan-electric/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <div className="text-lg font-semibold text-foreground">Choisissez votre région</div>
                <div className="text-sm text-muted-foreground">Le prix varie selon le nombre de créations d'entreprises</div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="border-cyan-electric/30 hover:bg-cyan-electric/10 hover:border-cyan-electric">
                  1 Région
                </Button>
                <Button variant="outline" className="border-cyan-electric/30 hover:bg-cyan-electric/10 hover:border-cyan-electric">
                  Plusieurs Régions
                </Button>
                <Button variant="outline" className="border-cyan-electric/30 hover:bg-cyan-electric/10 hover:border-cyan-electric">
                  France entière
                </Button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {/* Plan Starter */}
            <div className="glass-card p-8 space-y-6 hover:border-accent/50 transition-all duration-300">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Starter</h3>
                <p className="text-muted-foreground">Pour démarrer efficacement</p>
              </div>
              <div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold gradient-text">99€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <div className="text-sm text-cyan-electric font-semibold">1 région incluse</div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">200 entreprises/mois</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Carte interactive</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Tous filtres avancés</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Suivi des interactions</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Export Excel</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Support email</span>
                </li>
              </ul>
              <Button onClick={() => navigate("/auth")} className="w-full bg-card hover:bg-accent/10 text-foreground border border-accent/30" size="lg">
                Commencer
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
                <p className="text-muted-foreground">Pour les pros de la prospection</p>
              </div>
              <div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold gradient-text">199€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <div className="text-sm text-cyan-electric font-semibold">Jusqu'à 3 régions</div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Entreprises illimitées</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Multi-régions (jusqu'à 3)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Alertes temps réel par SMS</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">API pour intégrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Statistiques avancées</span>
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

            {/* Plan Équipe - Sur devis */}
            <div className="glass-card p-8 space-y-6 hover:border-accent/50 transition-all duration-300">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Équipe</h3>
                <p className="text-muted-foreground">Solution sur-mesure</p>
              </div>
              <div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold gradient-text">Sur devis</span>
                </div>
                <div className="text-sm text-cyan-electric font-semibold">France entière • Multi-utilisateurs</div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Tout du plan Pro</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">France entière incluse</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Utilisateurs illimités</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Tableau de bord équipe</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Gestion des territoires</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Formation & accompagnement</span>
                </li>
              </ul>
              <Button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="w-full bg-card hover:bg-accent/10 text-foreground border border-accent/30" size="lg">
                Nous contacter
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
      <section className="relative py-28 px-4 bg-gradient-to-b from-background via-navy-deep/20 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20 space-y-6 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-8 h-8 fill-cyan-electric text-cyan-electric" />
                ))}
              </div>
              <span className="text-3xl font-black text-foreground">4.8/5</span>
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground leading-tight">
              Ils explosent leur <span className="gradient-text">chiffre d'affaires</span>
            </h2>
            <p className="text-2xl md:text-3xl text-muted-foreground font-medium">Résultats réels, mesurables, rapides</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="glass-card p-10 space-y-6 hover:border-cyan-electric/40 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Quote className="w-12 h-12 text-cyan-electric/30" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-cyan-electric text-cyan-electric" />
                ))}
              </div>
              <p className="text-xl text-foreground leading-relaxed font-medium">
                "J'ai <span className="text-cyan-electric font-bold">triplé mes RDV en 30 jours</span>. Fini de rater les bonnes opportunités."
              </p>
              <div className="inline-flex px-5 py-2.5 rounded-full bg-cyan-electric/10 border border-cyan-electric/30">
                <span className="text-base font-bold text-cyan-electric">+200% de RDV</span>
              </div>
              <div className="pt-6 border-t border-accent/10 space-y-1">
                <div className="font-bold text-lg text-foreground">Sophie Martin</div>
                <div className="text-base text-muted-foreground">Commerciale BtoB</div>
              </div>
            </div>

            <div className="glass-card p-10 space-y-6 hover:border-cyan-electric/40 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Quote className="w-12 h-12 text-cyan-electric/30" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-cyan-electric text-cyan-electric" />
                ))}
              </div>
              <p className="text-xl text-foreground leading-relaxed font-medium">
                "<span className="text-cyan-electric font-bold">3h gagnées chaque jour</span>. Je vois tout mon territoire en un coup d'œil."
              </p>
              <div className="inline-flex px-5 py-2.5 rounded-full bg-cyan-electric/10 border border-cyan-electric/30">
                <span className="text-base font-bold text-cyan-electric">3h économisées/jour</span>
              </div>
              <div className="pt-6 border-t border-accent/10 space-y-1">
                <div className="font-bold text-lg text-foreground">Thomas Dubois</div>
                <div className="text-base text-muted-foreground">Responsable commercial</div>
              </div>
            </div>

            <div className="glass-card p-10 space-y-6 hover:border-cyan-electric/40 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Quote className="w-12 h-12 text-cyan-electric/30" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-cyan-electric text-cyan-electric" />
                ))}
              </div>
              <p className="text-xl text-foreground leading-relaxed font-medium">
                "Simple, efficace, toujours à jour. <span className="text-cyan-electric font-bold">45 nouveaux clients en 6 mois</span>."
              </p>
              <div className="inline-flex px-5 py-2.5 rounded-full bg-cyan-electric/10 border border-cyan-electric/30">
                <span className="text-base font-bold text-cyan-electric">+45 clients</span>
              </div>
              <div className="pt-6 border-t border-accent/10 space-y-1">
                <div className="font-bold text-lg text-foreground">Marie Leroux</div>
                <div className="text-base text-muted-foreground">Indépendante</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section FAQ + CTA Final */}
      <section className="relative py-28 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-20 space-y-6 animate-fade-in">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground leading-tight">
              Tes <span className="gradient-text">questions</span>
            </h2>
            <p className="text-2xl text-muted-foreground font-medium">Les réponses que tu cherches</p>
          </div>

          <Accordion type="single" collapsible className="space-y-5 mb-20">
            <AccordionItem value="item-1" className="glass-card px-8 py-2 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-xl font-bold text-foreground hover:text-cyan-electric">
                D'où viennent les données ?
              </AccordionTrigger>
              <AccordionContent className="text-lg text-muted-foreground leading-relaxed pt-3">
                <span className="text-foreground font-semibold">100% officielles</span>. Directement de l'INPI. Mise à jour quotidienne. SIRET, adresse, activité NAF, forme juridique... Tout y est.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="glass-card px-8 py-2 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-xl font-bold text-foreground hover:text-cyan-electric">
                C'est vraiment gratuit pour tester ?
              </AccordionTrigger>
              <AccordionContent className="text-lg text-muted-foreground leading-relaxed pt-3">
                <span className="text-foreground font-semibold">Oui, 100% gratuit</span>. Aucune carte bancaire. Accès immédiat à la plateforme.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="glass-card px-8 py-2 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-xl font-bold text-foreground hover:text-cyan-electric">
                Les données sont fraîches ?
              </AccordionTrigger>
              <AccordionContent className="text-lg text-muted-foreground leading-relaxed pt-3">
                <span className="text-foreground font-semibold">Synchronisation automatique chaque jour</span>. Tu es toujours informé des dernières créations.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="glass-card px-8 py-2 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-xl font-bold text-foreground hover:text-cyan-electric">
                Je peux annuler quand je veux ?
              </AccordionTrigger>
              <AccordionContent className="text-lg text-muted-foreground leading-relaxed pt-3">
                <span className="text-foreground font-semibold">Oui, sans engagement</span>. Annulation en 1 clic depuis ton espace. Aucun frais.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="glass-card px-8 py-2 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-xl font-bold text-foreground hover:text-cyan-electric">
                Ça marche sur mobile ?
              </AccordionTrigger>
              <AccordionContent className="text-lg text-muted-foreground leading-relaxed pt-3">
                <span className="text-foreground font-semibold">100% responsive</span>. Ordinateur, tablette, smartphone. Prospecte où tu veux, quand tu veux.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* CTA Final ultra puissant */}
          <div className="glass-card p-16 text-center space-y-10 border-cyan-electric/40 bg-gradient-to-br from-cyan-electric/10 via-navy-deep/20 to-transparent shadow-2xl shadow-cyan-electric/20">
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-tight">
              Prêt à <span className="gradient-text">dominer</span> ton territoire ?
            </h3>
            <p className="text-2xl md:text-3xl text-foreground/80 max-w-2xl mx-auto font-medium">
              Rejoins les centaines de commerciaux qui cartonnent avec LUMA
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Button onClick={() => navigate("/auth")} size="lg" className="btn-hero min-w-[280px] h-16 text-xl font-bold shadow-2xl shadow-cyan-electric/30">
                Démarrer maintenant
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
              <Button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                size="lg"
                variant="outline"
                className="border-2 border-cyan-electric/50 text-foreground hover:bg-cyan-electric/10 hover:border-cyan-electric min-w-[280px] h-16 text-xl font-bold"
              >
                <Calendar className="w-6 h-6 mr-2" />
                Voir la démo
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 text-base text-muted-foreground font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-cyan-electric" />
                <span>Sans carte bancaire</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-cyan-electric" />
                <span>Mis en place en 5 min</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-cyan-electric" />
                <span>Support 7j/7</span>
              </div>
            </div>
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
