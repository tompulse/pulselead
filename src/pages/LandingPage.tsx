import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import React from "react";
import { ArrowRight, Shield, CheckCircle, Star, AlertCircle, Clock, Target, Zap, TrendingUp, Check, Sparkles, Quote, X, Map } from "lucide-react";
import DashboardPreview from "@/components/landing/DashboardPreview";
import { trackCTAClick } from "@/utils/analytics";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { BookingSection } from "@/components/landing/BookingSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Index = () => {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = React.useState<'1' | 'plusieurs' | 'france'>('plusieurs');
  const [billingPeriod, setBillingPeriod] = React.useState<'monthly' | 'quarterly' | 'yearly'>('yearly');
  
  // Animations au scroll - effets plus percutants
  const socialProof = useScrollAnimation({ threshold: 0.1 });
  const problemSection = useScrollAnimation({ threshold: 0.1 });
  const solutionSection = useScrollAnimation({ threshold: 0.1 });
  const pricingSection = useScrollAnimation({ threshold: 0.1 });
  const testimonialsSection = useScrollAnimation({ threshold: 0.1 });
  const faqSection = useScrollAnimation({ threshold: 0.1 });
  const finalCTA = useScrollAnimation({ threshold: 0.2 });

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
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/80 to-background relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
      </div>

      {/* Header fixe */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/60 border-b border-accent/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <span className="text-xl sm:text-2xl font-bold gradient-text">LUMA</span>
            </div>
            
            {/* Boutons d'action */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                onClick={handleConnexionClick}
                variant="outline"
                className="border-accent/30 text-foreground hover:bg-accent/10 hover:border-accent transition-all duration-300 px-4 sm:px-6 h-9 sm:h-10 text-sm sm:text-base rounded-full"
              >
                Connexion
              </Button>
              <Button 
                onClick={handleCreerCompteClick}
                className="btn-hero px-4 sm:px-8 h-9 sm:h-10 text-sm sm:text-base"
              >
                Essai gratuit
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/10 border border-accent/30 backdrop-blur-sm shadow-lg shadow-accent/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span className="text-sm text-accent font-bold">Tout-en-un pour commerciaux terrain</span>
            </div>
            
            {/* Titre principal - focus développement commercial */}
            <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-7xl font-bold leading-tight md:leading-tight lg:leading-[1.08] tracking-tight">
              <span className="text-foreground">L'outil ultime pour</span>
              <br />
              <span className="gradient-text">développer votre activité</span>
              <br />
              <span className="text-foreground">commerciale terrain</span>
            </h1>
            
            {/* Sous-titre clair et orienté bénéfice */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium px-4">
              Optimisez vos tournées, gérez votre pipeline et <span className="text-accent font-semibold">prospectez efficacement</span>.
              <br className="hidden sm:block" />
              <span className="text-foreground/90 text-sm sm:text-base md:text-lg mt-2 block">Tout centralisé dans une seule plateforme.</span>
            </p>
            
            {/* CTA principal unique et puissant */}
            <div className="flex flex-col items-center gap-5 pt-6">
              <Button 
                onClick={handleExplorerClick}
                size="lg"
                className="btn-hero w-full sm:w-auto min-w-[280px] h-16 text-xl font-bold group"
              >
                Démarrer gratuitement
                <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              {/* Trust indicators réels et crédibles */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span className="font-medium">Sans carte bancaire</span>
                </div>
                <span className="text-accent/30 hidden sm:inline">•</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span className="font-medium">Prêt en 2 minutes</span>
                </div>
              </div>
            </div>

            {/* Visuel */}
            <div className="pt-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="glass-card p-4 sm:p-6 max-w-5xl mx-auto relative group border-accent/30">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                <div className="relative aspect-video rounded-lg overflow-hidden ring-1 ring-accent/20">
                  <DashboardPreview />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section 
        ref={socialProof.ref}
        className={`relative py-16 px-4 border-y border-accent/10 bg-gradient-to-r from-primary/50 to-primary/30 backdrop-blur-sm transition-all duration-1000 ${
          socialProof.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'
        }`}
        style={{
          transitionDelay: socialProof.isVisible ? '100ms' : '0ms'
        }}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-16 max-w-5xl mx-auto">
            {/* Trust indicators - focus outil commercial */}
            <div className={`flex items-center gap-3 md:gap-4 group transition-all duration-700 ${
              socialProof.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`} style={{ transitionDelay: '200ms' }}>
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-accent/20 blur-lg group-hover:blur-xl transition-all"></div>
                <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center shadow-lg shadow-accent/10">
                  <Target className="w-6 h-6 md:w-7 md:h-7 text-accent" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-base md:text-lg lg:text-xl font-bold text-foreground">Tournées optimisées</div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium">GPS & itinéraires intelligents</div>
              </div>
            </div>

            <div className={`flex items-center gap-3 md:gap-4 group transition-all duration-700 ${
              socialProof.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: '400ms' }}>
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-accent/20 blur-lg group-hover:blur-xl transition-all"></div>
                <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center shadow-lg shadow-accent/10">
                  <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-accent" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-base md:text-lg lg:text-xl font-bold text-foreground">CRM complet</div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium">Pipeline & suivi client</div>
              </div>
            </div>

            <div className={`flex items-center gap-3 md:gap-4 group transition-all duration-700 ${
              socialProof.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`} style={{ transitionDelay: '600ms' }}>
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-accent/20 blur-lg group-hover:blur-xl transition-all"></div>
                <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center shadow-lg shadow-accent/10">
                  <Zap className="w-6 h-6 md:w-7 md:h-7 text-accent" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-base md:text-lg lg:text-xl font-bold text-foreground">Données temps réel</div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium">Nouvelles entreprises</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Problème/Solution */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Problème */}
          <div 
            ref={problemSection.ref}
            className={`text-center mb-16 space-y-4 transition-all duration-1000 ${
              problemSection.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/30 mb-4">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-bold text-destructive uppercase tracking-wide">Le constat</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-foreground leading-tight px-4">
              Le problème des <span className="text-destructive">commerciaux terrain</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto font-medium px-4">
              Outils dispersés, prospects qui échappent, tournées non optimisées. Vous perdez du temps et des opportunités.
            </p>
          </div>

          <div className={`grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20 transition-all duration-1000 ${
            problemSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}>
            <div className={`glass-card p-7 space-y-4 border-destructive/30 hover:border-destructive/50 hover:bg-destructive/5 transition-all duration-500 group ${
              problemSection.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`} style={{ transitionDelay: problemSection.isVisible ? '200ms' : '0ms' }}>
              <div className="w-16 h-16 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-destructive/10">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Outils dispersés</h3>
              <p className="text-muted-foreground leading-relaxed">
                CRM, cartographie, fichiers Excel... Jongler entre 5 outils ralentit votre prospection.
              </p>
            </div>

            <div className={`glass-card p-7 space-y-4 border-destructive/30 hover:border-destructive/50 hover:bg-destructive/5 transition-all duration-500 group ${
              problemSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: problemSection.isVisible ? '400ms' : '0ms' }}>
              <div className="w-16 h-16 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-destructive/10">
                <Clock className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Prospects perdus</h3>
              <p className="text-muted-foreground leading-relaxed">
                Vos concurrents contactent les nouvelles entreprises avant vous. Vous arrivez trop tard.
              </p>
            </div>

            <div className={`glass-card p-7 space-y-4 border-destructive/30 hover:border-destructive/50 hover:bg-destructive/5 transition-all duration-500 group ${
              problemSection.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`} style={{ transitionDelay: problemSection.isVisible ? '600ms' : '0ms' }}>
              <div className="w-16 h-16 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-destructive/10">
                <Target className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Tournées inefficaces</h3>
              <p className="text-muted-foreground leading-relaxed">
                Des heures perdues sur la route. Pas de vision claire de votre territoire commercial.
              </p>
            </div>
          </div>

          {/* Solution */}
          <div 
            ref={solutionSection.ref}
            className={`text-center mb-12 space-y-4 transition-all duration-1000 ${
              solutionSection.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-electric/10 border border-cyan-electric/30 mb-4">
              <Sparkles className="w-4 h-4 text-cyan-electric" />
              <span className="text-sm font-bold text-cyan-electric uppercase tracking-wide">La solution</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold px-4">
              LUMA <span className="gradient-text">booste</span> votre efficacité commerciale
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto font-medium px-4">
              Toutes les fonctionnalités dont vous avez besoin : tournées, CRM, prospection et données terrain.
            </p>
          </div>

          <div className={`grid md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto transition-all duration-1000 ${
            solutionSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}>
            <div className={`glass-card p-7 text-center space-y-4 border-accent/30 hover:border-accent hover:bg-accent/5 transition-all duration-500 group ${
              solutionSection.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`} style={{ transitionDelay: solutionSection.isVisible ? '200ms' : '0ms' }}>
              <div className="inline-flex w-18 h-18 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-accent/20">
                <Map className="w-9 h-9 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Tournées optimisées</h3>
              <p className="text-muted-foreground leading-relaxed">
                Planifiez vos visites en quelques clics. Itinéraire optimal, GPS intégré. Économisez des heures chaque semaine.
              </p>
            </div>

            <div className={`glass-card p-7 text-center space-y-4 border-accent/30 hover:border-accent hover:bg-accent/5 transition-all duration-500 group ${
              solutionSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: solutionSection.isVisible ? '400ms' : '0ms' }}>
              <div className="inline-flex w-18 h-18 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-accent/20">
                <TrendingUp className="w-9 h-9 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground">CRM intelligent</h3>
              <p className="text-muted-foreground leading-relaxed">
                Suivez vos prospects, historiques des contacts, relances programmées. Rien ne vous échappe.
              </p>
            </div>

            <div className={`glass-card p-7 text-center space-y-4 border-accent/30 hover:border-accent hover:bg-accent/5 transition-all duration-500 group ${
              solutionSection.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`} style={{ transitionDelay: solutionSection.isVisible ? '600ms' : '0ms' }}>
              <div className="inline-flex w-18 h-18 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-accent/20">
                <Sparkles className="w-9 h-9 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Prospection intelligente</h3>
              <p className="text-muted-foreground leading-relaxed">
                Accédez aux nouvelles entreprises de votre secteur + filtres avancés pour cibler vos prospects idéaux.
              </p>
            </div>
          </div>

          {/* Résultats mesurables - En vert avec tailles réduites */}
          <div className="glass-card p-6 sm:p-8 md:p-10 lg:p-12 max-w-5xl mx-auto border-green-500/50 bg-gradient-to-br from-green-500/15 via-green-500/5 to-transparent shadow-2xl shadow-green-500/20">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 md:mb-10 text-green-400">Ce que nos utilisateurs réalisent avec LUMA</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center">
              <div className="space-y-2 md:space-y-3">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-400">6h/semaine</div>
                <div className="text-base sm:text-lg md:text-xl text-foreground font-bold">Temps économisé</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Moins d'administratif, plus de temps pour vendre</div>
              </div>
              <div className="space-y-2 md:space-y-3">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-400">×2.5</div>
                <div className="text-base sm:text-lg md:text-xl text-foreground font-bold">Rendez-vous décrochés</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Grâce à une organisation optimisée</div>
              </div>
              <div className="space-y-2 md:space-y-3">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-400">+40%</div>
                <div className="text-base sm:text-lg md:text-xl text-foreground font-bold">Croissance du CA</div>
                <div className="text-xs sm:text-sm text-muted-foreground">En moyenne après 6 mois d'utilisation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Prix */}
      <section 
        ref={pricingSection.ref}
        className={`relative py-16 md:py-28 px-4 bg-gradient-to-b from-background via-primary/30 to-background transition-all duration-1000 ${
          pricingSection.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'
        }`}
      >
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12 md:mb-20 space-y-4 md:space-y-5 animate-fade-in px-4">
            <h2 className="text-2xl md:text-3xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
              Choisissez le plan qui
              <br />
              <span className="gradient-text">accélère votre croissance</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
              Gagnez en efficacité et augmentez vos performances commerciales dès aujourd'hui.
            </p>
          </div>

          {/* Toggle de période */}
          <div className="flex justify-center mb-12 md:mb-20">
            <div className="glass-card p-1.5 md:p-2 inline-flex flex-wrap gap-1 md:gap-1.5 border-accent/30 justify-center">
              <Button
                variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
                onClick={() => setBillingPeriod('monthly')}
                className={billingPeriod === 'monthly' ? 'btn-hero text-sm md:text-base px-4 md:px-6' : 'hover:bg-accent/10 text-sm md:text-base px-4 md:px-6'}
              >
                Mensuel
              </Button>
              <Button
                variant={billingPeriod === 'quarterly' ? 'default' : 'ghost'}
                onClick={() => setBillingPeriod('quarterly')}
                className={billingPeriod === 'quarterly' ? 'btn-hero text-sm md:text-base px-4 md:px-6' : 'hover:bg-accent/10 text-sm md:text-base px-4 md:px-6'}
              >
                Trimestriel
                <span className="ml-1 md:ml-2 text-xs bg-accent/30 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full font-bold">-15%</span>
              </Button>
              <Button
                variant={billingPeriod === 'yearly' ? 'default' : 'ghost'}
                onClick={() => setBillingPeriod('yearly')}
                className={billingPeriod === 'yearly' ? 'btn-hero text-sm md:text-base px-4 md:px-6' : 'hover:bg-accent/10 text-sm md:text-base px-4 md:px-6'}
              >
                Annuel
                <span className="ml-1 md:ml-2 text-xs bg-accent/30 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full font-bold">-25%</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mb-12 md:mb-20">
            {/* Plan Starter */}
            <div className="glass-card p-6 md:p-8 space-y-4 md:space-y-6 hover:border-accent/60 transition-all duration-300 border-accent/30">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Starter</h3>
                <p className="text-muted-foreground font-medium">Pour tester la prospection ciblée</p>
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold gradient-text">
                    {billingPeriod === 'monthly' ? '129' : billingPeriod === 'quarterly' ? '109' : '99'}€
                  </span>
                  <span className="text-muted-foreground font-medium">/mois</span>
                </div>
                <div className="text-sm text-accent font-bold">1 secteur géographique</div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium"><strong>10 créations/mois</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">Carte interactive + filtres</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">Suivi commercial intégré</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">Données officielles</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-muted-foreground/30 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground/60">Contact dirigeant</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-muted-foreground/30 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground/60">Filtres avancés IA</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">Support email</span>
                </li>
              </ul>
              <Button onClick={() => navigate("/auth")} className="w-full bg-card hover:bg-accent/10 text-foreground border-2 border-accent/40 hover:border-accent font-bold" size="lg">
                Essai gratuit 7 jours
              </Button>
            </div>

            {/* Plan Pro - Recommandé */}
            <div className="relative glass-card p-8 md:p-10 space-y-5 md:space-y-7 border-accent shadow-2xl shadow-accent/40 md:scale-100 lg:scale-105 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent ring-2 ring-accent/50">
              <div className="absolute -top-2 md:-top-3 left-1/2 -translate-x-1/2 px-4 md:px-8 py-2 md:py-3 bg-gradient-to-r from-accent via-accent to-accent/90 text-primary text-sm md:text-base font-bold rounded-full flex items-center gap-2 shadow-xl shadow-accent/50">
                <Sparkles className="w-5 h-5" />
                Le plus populaire
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-bold gradient-text">Pro</h3>
                <p className="text-sm md:text-base text-foreground font-semibold">Pour développer rapidement</p>
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-2 md:mb-3">
                  <span className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text drop-shadow-lg">
                    {billingPeriod === 'monthly' ? '199' : billingPeriod === 'quarterly' ? '169' : '149'}€
                  </span>
                  <span className="text-foreground font-semibold text-base md:text-lg">/mois</span>
                </div>
                <div className="text-sm md:text-base text-accent font-bold">Multi-secteurs illimité</div>
              </div>
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-5 h-5 md:w-6 md:h-6 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-semibold text-base md:text-lg">✨ <strong>50 créations/mois</strong></span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-5 h-5 md:w-6 md:h-6 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-semibold text-base md:text-lg">🎯 <strong>Tous les secteurs</strong></span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-5 h-5 md:w-6 md:h-6 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-semibold text-base md:text-lg">💎 <strong>Contacts dirigeants</strong></span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-5 h-5 md:w-6 md:h-6 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-semibold text-base md:text-lg">🤖 <strong>Filtres IA avancés</strong></span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-5 h-5 md:w-6 md:h-6 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-semibold text-sm md:text-base">📊 Analytics & prévisions</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-5 h-5 md:w-6 md:h-6 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-semibold text-base md:text-lg">⚡ <strong>Support prioritaire 24h</strong></span>
                </li>
              </ul>
              <Button onClick={() => navigate("/auth")} className="w-full btn-hero shadow-2xl shadow-accent/60 font-bold text-base md:text-lg py-6 md:py-7 hover:scale-105 transition-transform" size="lg">
                Essai gratuit 7 jours
              </Button>
            </div>

            {/* Plan Entreprise */}
            <div className="glass-card p-6 md:p-8 space-y-4 md:space-y-6 hover:border-accent/60 transition-all duration-300 border-accent/30">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Entreprise</h3>
                <p className="text-muted-foreground font-medium">Pour les équipes commerciales</p>
              </div>
              <div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold gradient-text">Sur mesure</span>
                </div>
                <div className="text-sm text-accent font-bold">Solution complète équipe</div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium"><strong>Tout du plan Pro</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium"><strong>Couverture nationale</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium"><strong>Utilisateurs illimités</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">Dashboard équipe avancé</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">Gestion des territoires</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">Formation dédiée</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium"><strong>Account Manager dédié</strong></span>
                </li>
              </ul>
              <Button onClick={() => {
                const contactSection = document.querySelector('#contact');
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }} className="w-full bg-card hover:bg-accent/10 text-foreground border-2 border-accent/40 hover:border-accent font-bold" size="lg">
                Nous contacter
              </Button>
            </div>
          </div>

        </div>
      </section>

      {/* Section Témoignages */}
      <section 
        ref={testimonialsSection.ref}
        className={`relative py-20 px-4 bg-gradient-to-b from-background via-navy-deep/20 to-background transition-all duration-1000 ${
          testimonialsSection.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'
        }`}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 md:mb-12 space-y-2 md:space-y-3 animate-fade-in px-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-cyan-electric text-cyan-electric" />
                ))}
              </div>
              <span className="text-lg md:text-xl font-bold text-foreground">4.8/5</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-foreground">
              Ils accélèrent leur <span className="gradient-text">croissance</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">Résultats réels et mesurables</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className={`glass-card p-6 space-y-4 hover:border-cyan-electric/40 transition-all duration-500 ${
              testimonialsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: testimonialsSection.isVisible ? '200ms' : '0ms' }}>
              <Quote className="w-8 h-8 text-cyan-electric/30" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-cyan-electric text-cyan-electric" />
                ))}
              </div>
              <p className="text-base text-foreground leading-relaxed">
                "Enfin un outil pensé pour les commerciaux terrain ! Tournées optimisées, suivi commercial simple. J'ai doublé mes RDV."
              </p>
              <div className="inline-flex px-3 py-1.5 rounded-full bg-cyan-electric/10 border border-cyan-electric/30">
                <span className="text-sm font-semibold text-cyan-electric">+100% de RDV</span>
              </div>
              <div className="pt-3 border-t border-accent/10">
                <div className="font-semibold text-foreground">Sophie Martin</div>
                <div className="text-sm text-muted-foreground">Commerciale BtoB</div>
              </div>
            </div>

            <div className={`glass-card p-6 space-y-4 hover:border-cyan-electric/40 transition-all duration-500 ${
              testimonialsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: testimonialsSection.isVisible ? '400ms' : '0ms' }}>
              <Quote className="w-8 h-8 text-cyan-electric/30" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-cyan-electric text-cyan-electric" />
                ))}
              </div>
              <p className="text-base text-foreground leading-relaxed">
                "Plus besoin de jongler entre 5 outils. Tout est centralisé, je gagne 2h par jour et je vois tout mon secteur."
              </p>
              <div className="inline-flex px-3 py-1.5 rounded-full bg-cyan-electric/10 border border-cyan-electric/30">
                <span className="text-sm font-semibold text-cyan-electric">2h/jour économisées</span>
              </div>
              <div className="pt-3 border-t border-accent/10">
                <div className="font-semibold text-foreground">Thomas Dubois</div>
                <div className="text-sm text-muted-foreground">Responsable commercial</div>
              </div>
            </div>

            <div className={`glass-card p-6 space-y-4 hover:border-cyan-electric/40 transition-all duration-500 ${
              testimonialsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`} style={{ transitionDelay: testimonialsSection.isVisible ? '600ms' : '0ms' }}>
              <Quote className="w-8 h-8 text-cyan-electric/30" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-cyan-electric text-cyan-electric" />
                ))}
              </div>
              <p className="text-base text-foreground leading-relaxed">
                "L'outil parfait pour les indépendants. Simple, complet, avec le bonus des créations d'entreprises."
              </p>
              <div className="inline-flex px-3 py-1.5 rounded-full bg-cyan-electric/10 border border-cyan-electric/30">
                <span className="text-sm font-semibold text-cyan-electric">+15 clients</span>
              </div>
              <div className="pt-3 border-t border-accent/10">
                <div className="font-semibold text-foreground">Marie Leroux</div>
                <div className="text-sm text-muted-foreground">Indépendante</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Réservation - Avant FAQ */}
      <BookingSection />

      {/* Section FAQ + CTA */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div 
            ref={faqSection.ref}
            className={`text-center mb-8 md:mb-12 space-y-2 md:space-y-3 transition-all duration-1000 px-4 ${
              faqSection.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'
            }`}
          >
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-foreground">
              Questions <span className="gradient-text">fréquentes</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Tout ce que vous devez savoir sur LUMA
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3 mb-12">
            <AccordionItem value="item-1" className="glass-card px-6 py-1 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-cyan-electric">
                D'où viennent les données entreprises ?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-2 space-y-2">
                <p>Les données proviennent exclusivement de sources officielles françaises : l'INPI (Institut National de la Propriété Industrielle) et l'INSEE (Institut National de la Statistique et des Études Économiques).</p>
                <p>Ces données sont synchronisées automatiquement chaque jour pour vous garantir un accès aux créations d'entreprises les plus récentes. Vous êtes toujours informé en temps réel des nouvelles opportunités sur votre territoire.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="glass-card px-6 py-1 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-cyan-electric">
                Comment fonctionne l'essai gratuit ?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-2 space-y-2">
                <p>L'essai gratuit de 7 jours vous donne accès à toutes les fonctionnalités de LUMA sans aucune limitation.</p>
                <p>Vous pouvez créer vos tournées, gérer vos prospects, accéder aux données entreprises en temps réel et utiliser les outils de suivi intégrés. À la fin de l'essai, vous choisissez si vous souhaitez continuer avec un abonnement payant ou non.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="glass-card px-6 py-1 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-cyan-electric">
                Puis-je utiliser LUMA sur mobile ?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-2 space-y-2">
                <p>Absolument ! LUMA est 100% responsive et s'adapte parfaitement à tous les écrans : ordinateur, tablette et smartphone.</p>
                <p>L'application mobile vous permet de gérer vos tournées en déplacement, d'ajouter des interactions avec vos prospects directement sur le terrain, et de consulter les informations entreprises où que vous soyez. Le GPS intégré vous guide vers vos rendez-vous.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="glass-card px-6 py-1 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-cyan-electric">
                Puis-je annuler mon abonnement à tout moment ?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-2 space-y-2">
                <p>Oui, sans aucun engagement. Vous pouvez annuler votre abonnement en 1 clic depuis votre espace personnel à tout moment.</p>
                <p>Vos données restent accessibles jusqu'à la fin de la période payée, et vous pouvez exporter toutes vos informations avant de partir. Aucune question posée, aucun frais caché.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="glass-card px-6 py-1 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-cyan-electric">
                Comment sont calculées les tournées optimisées ?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-2 space-y-2">
                <p>LUMA utilise des algorithmes d'optimisation avancés pour calculer le meilleur itinéraire en fonction de vos contraintes : localisation des prospects, priorités commerciales, horaires de disponibilité et trafic en temps réel.</p>
                <p>Vous gagnez du temps sur la route et maximisez le nombre de visites par jour. L'outil s'adapte automatiquement aux changements et vous propose des alternatives en cas d'imprévus.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="glass-card px-6 py-1 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-cyan-electric">
                Mes données sont-elles sécurisées ?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-2 space-y-2">
                <p>La sécurité de vos données est notre priorité absolue. Toutes les informations sont chiffrées et hébergées sur des serveurs sécurisés en Europe, conformes au RGPD.</p>
                <p>Vos données clients, historiques d'interactions et informations commerciales restent 100% privées et ne sont jamais partagées avec des tiers. Vous gardez le contrôle total de vos informations.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="glass-card px-6 py-1 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-cyan-electric">
                Puis-je importer mes données existantes ?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-2 space-y-2">
                <p>Oui, vous pouvez importer facilement vos données depuis un fichier Excel ou CSV. LUMA prend en charge les formats standards et vous guide dans le processus d'import.</p>
                <p>Vous pouvez également exporter vos données à tout moment pour les utiliser dans d'autres outils ou pour conserver une sauvegarde. Import et export illimités sur tous les forfaits.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </div>
      </section>
      </main>

      {/* Footer complet */}
      <footer className="relative py-12 px-4 bg-primary/50 border-t border-accent/10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo et description */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-bold gradient-text">LUMA</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                L'outil tout-en-un des commerciaux terrain pour optimiser leurs tournées et développer leur portefeuille.
              </p>
            </div>

            {/* Produit */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Produit</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-accent transition-colors">
                    Fonctionnalités
                  </button>
                </li>
                <li>
                  <button onClick={() => {
                    const pricingSection = document.querySelector('section:has(h2:contains("investissement"))');
                    pricingSection?.scrollIntoView({ behavior: 'smooth' });
                  }} className="hover:text-accent transition-colors">
                    Tarifs
                  </button>
                </li>
                <li>
                  <button onClick={handleExplorerClick} className="hover:text-accent transition-colors">
                    Démo gratuite
                  </button>
                </li>
              </ul>
            </div>

            {/* Entreprise */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Entreprise</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-accent transition-colors">À propos</a>
                </li>
                <li>
                  <a href="#contact" onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }} className="hover:text-accent transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Légal */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Légal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/mentions-legales" className="hover:text-accent transition-colors">Mentions légales</a>
                </li>
                <li>
                  <a href="/confidentialite" className="hover:text-accent transition-colors">Politique de confidentialité</a>
                </li>
                <li>
                  <a href="/cgv" className="hover:text-accent transition-colors">CGV</a>
                </li>
                <li>
                  <a href="/cgu" className="hover:text-accent transition-colors">CGU</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-accent/10">
            <div className="flex justify-center items-center text-sm text-muted-foreground">
              <p>© 2025 LUMA. Tous droits réservés.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
