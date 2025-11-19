import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { ArrowRight, Shield, CheckCircle, Star, AlertCircle, Clock, Target, Zap, TrendingUp, Check, Sparkles, Quote, Map, User } from "lucide-react";

import { trackCTAClick } from "@/utils/analytics";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { BookingSection } from "@/components/landing/BookingSection";
import { ProblemCard } from "@/components/landing/ProblemCard";
import { HeroSection } from "@/components/landing/HeroSection";
import { CaseStudies } from "@/components/landing/CaseStudies";
import { ProblemSolutionMapping } from "@/components/landing/ProblemSolutionMapping";
import { Navbar } from "@/components/landing/Navbar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
const Index = () => {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('annual');
  const [payOnceStarter, setPayOnceStarter] = useState(false);
  const [payOncePro, setPayOncePro] = useState(false);

  // Structure de prix
  const pricing = {
    starter: {
      monthly: { price: 39, yearlyTotal: 468 },
      quarterly: { price: 29, yearlyTotal: 348 },
      annual: { price: 19, yearlyTotal: 228 }
    },
    pro: {
      monthly: { price: 59, yearlyTotal: 708 },
      quarterly: { price: 49, yearlyTotal: 588 },
      annual: { price: 39, yearlyTotal: 468 }
    }
  };

  // Calculer le prix avec réduction de 25% si paiement en une fois
  const getStarterPrice = () => {
    if (payOnceStarter) {
      return Math.round(pricing.starter[billingPeriod].yearlyTotal * 0.75);
    }
    return pricing.starter[billingPeriod].price;
  };

  const getProPrice = () => {
    if (payOncePro) {
      return Math.round(pricing.pro[billingPeriod].yearlyTotal * 0.75);
    }
    return pricing.pro[billingPeriod].price;
  };
  
  const enterprisePrice = "Sur mesure";

  // Animations au scroll - effets plus percutants
  const socialProof = useScrollAnimation({
    threshold: 0.1
  });
  const problemSection = useScrollAnimation({
    threshold: 0.1
  });
  const solutionSection = useScrollAnimation({
    threshold: 0.1
  });
  const testimonialsSection = useScrollAnimation({
    threshold: 0.1
  });
  const faqSection = useScrollAnimation({
    threshold: 0.1
  });
  const finalCTA = useScrollAnimation({
    threshold: 0.2
  });
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
  return <div className="min-h-screen bg-gradient-to-b from-primary via-primary/80 to-background relative overflow-hidden">
      {/* Navbar fixe */}
      <Navbar />

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{
        animationDuration: '4s'
      }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{
        animationDuration: '6s',
        animationDelay: '2s'
      }}></div>
      </div>


      <main className="pt-16">

      {/* Hero Section */}
      <HeroSection />

      {/* Section Problème/Solution */}
      <section id="features-section" className="relative py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Problème */}
          <div ref={problemSection.ref} className={`text-center mb-16 space-y-4 transition-all duration-1000 ${problemSection.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/30 mb-4">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-bold text-destructive uppercase tracking-wide">Le constat</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-display font-extrabold text-foreground leading-tight px-4">
              Le problème des <span className="text-destructive">commerciaux terrain.</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto font-medium px-4">
              Outils dispersés, prospects qui vous échappent, tournées non optimisées... Vous perdez du temps et des opportunités commerciales.
            </p>
          </div>

          <div className={`grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20 transition-all duration-1000 ${problemSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <ProblemCard icon={AlertCircle} title="Outils dispersés" description="CRM, cartographie, fichiers Excel... Jongler entre 5 outils ralentit votre prospection." isVisible={problemSection.isVisible} delay="200ms" animationClass="-translate-x-10" />
            
            <ProblemCard icon={Clock} title="Prospects perdus" description="Vos concurrents contactent les nouvelles entreprises avant vous. Vous arrivez trop tard." isVisible={problemSection.isVisible} delay="400ms" animationClass="translate-y-10" />
            
            <ProblemCard icon={Target} title="Tournées inefficaces" description="Des heures perdues sur la route. Pas de vision claire de votre territoire commercial." isVisible={problemSection.isVisible} delay="600ms" animationClass="translate-x-10" />
          </div>

          {/* Solution */}
          <div ref={solutionSection.ref} className={`text-center mb-12 space-y-4 transition-all duration-1000 ${solutionSection.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-electric/10 border border-cyan-electric/30 mb-4">
              <Sparkles className="w-4 h-4 text-cyan-electric" />
              <span className="text-sm font-bold text-cyan-electric uppercase tracking-wide">La solution</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-display font-extrabold px-4">
              LUMA <span className="gradient-text bg-gradient-to-r from-accent to-cyan-glow bg-clip-text text-transparent">booste</span> votre efficacité commerciale.
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto font-medium px-4">
              Toutes les fonctionnalités dont vous avez besoin : Tournées optimisées, CRM intégré, prospection intelligente et données terrain en temps réel.
            </p>
          </div>

          <div className={`grid md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto transition-all duration-1000 ${solutionSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className={`glass-card p-7 text-center space-y-4 border-accent/30 hover:border-accent hover:bg-accent/5 transition-all duration-500 group ${solutionSection.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`} style={{
              transitionDelay: solutionSection.isVisible ? '200ms' : '0ms'
            }}>
              <div className="inline-flex w-18 h-18 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-accent/20">
                <Map className="w-9 h-9 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground">???</h3>
              <p className="text-muted-foreground leading-relaxed">
                ???
              </p>
            </div>

            <div className={`glass-card p-7 text-center space-y-4 border-accent/30 hover:border-accent hover:bg-accent/5 transition-all duration-500 group ${solutionSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{
              transitionDelay: solutionSection.isVisible ? '400ms' : '0ms'
            }}>
              <div className="inline-flex w-18 h-18 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-accent/20">
                <TrendingUp className="w-9 h-9 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground">???</h3>
              <p className="text-muted-foreground leading-relaxed">
                ???
              </p>
            </div>

            <div className={`glass-card p-7 text-center space-y-4 border-accent/30 hover:border-accent hover:bg-accent/5 transition-all duration-500 group ${solutionSection.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`} style={{
              transitionDelay: solutionSection.isVisible ? '600ms' : '0ms'
            }}>
              <div className="inline-flex w-18 h-18 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-accent/20">
                <Sparkles className="w-9 h-9 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground">???</h3>
              <p className="text-muted-foreground leading-relaxed">
                ???
              </p>
            </div>
          </div>

          {/* Résultats mesurables - En vert avec tailles réduites */}
          <div className="glass-card p-6 sm:p-8 md:p-10 lg:p-12 max-w-5xl mx-auto border-green-500/50 bg-gradient-to-br from-green-500/15 via-green-500/5 to-transparent shadow-2xl shadow-green-500/20">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-center mb-6 md:mb-10 text-green-400">Ce que nos utilisateurs réalisent avec LUMA.</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center">
              <div className="space-y-2 md:space-y-3">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-400">6h/semaine</div>
                <div className="text-base sm:text-lg md:text-xl text-foreground font-bold">Temps économisé</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Moins d'administratif, plus de temps pour vendre.</div>
              </div>
              <div className="space-y-2 md:space-y-3">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-400">×2.5</div>
                <div className="text-base sm:text-lg md:text-xl text-foreground font-bold">Rendez-vous décrochés</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Grâce à une organisation optimisée.</div>
              </div>
              <div className="space-y-2 md:space-y-3">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-400">+40%</div>
                <div className="text-base sm:text-lg md:text-xl text-foreground font-bold">Croissance du CA</div>
                <div className="text-xs sm:text-sm text-muted-foreground">En moyenne après 6 mois d'utilisation.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mapping Problème → Solution */}
      <ProblemSolutionMapping />

      {/* Cas clients - après le mapping */}
      <CaseStudies />

      {/* Section Prix */}
      <section id="pricing-section" className={`relative py-16 md:py-28 px-4 bg-gradient-to-b from-background via-primary/30 to-background transition-all duration-1000`}>
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8 md:mb-12 space-y-4 md:space-y-5 animate-fade-in px-4">
            <h2 className="text-2xl md:text-3xl lg:text-5xl xl:text-6xl font-display font-extrabold text-foreground leading-tight">
              Choisissez le plan qui
              <br />
              <span className="gradient-text bg-gradient-to-r from-accent to-cyan-glow bg-clip-text text-transparent">accélère votre croissance.</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
              Gagnez en efficacité et augmentez vos performances commerciales dès aujourd'hui.
            </p>
            
            {/* Toggle Mensuel/Trimestriel/Annuel */}
            <div className="inline-flex items-center gap-2 p-1 bg-muted/50 rounded-full border border-border/50">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 sm:px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-background shadow-md text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingPeriod('quarterly')}
                className={`px-4 sm:px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  billingPeriod === 'quarterly'
                    ? 'bg-background shadow-md text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Trimestriel
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-4 sm:px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  billingPeriod === 'annual'
                    ? 'bg-background shadow-md text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Annuel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mb-12 md:mb-20">
            {/* Plan Starter */}
            <div className="glass-card p-6 md:p-8 space-y-4 md:space-y-6 hover:border-accent/60 transition-all duration-300 border-accent/30">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Starter</h3>
                <p className="text-muted-foreground font-medium">Pour démarrer votre prospection</p>
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold gradient-text">{getStarterPrice()}€</span>
                  {!payOnceStarter && (
                    <span className="text-muted-foreground font-medium">/mois</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="payOnceStarter"
                    checked={payOnceStarter}
                    onChange={(e) => setPayOnceStarter(e.target.checked)}
                    className="w-4 h-4 accent-accent cursor-pointer"
                  />
                  <label htmlFor="payOnceStarter" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                    Payer en une fois
                    <span className="text-xs text-green-500 font-bold">-25%</span>
                  </label>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">Jusqu'à 500 entreprises</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">Cartographie interactive</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">CRM basique</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">Optimisation de tournées</span>
                </li>
              </ul>
              <Button onClick={() => navigate("/auth")} className="w-full bg-card hover:bg-accent/10 text-foreground border-2 border-accent/40 hover:border-accent font-bold" size="lg">
                Commencer
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
                <p className="text-sm md:text-base text-foreground font-semibold">Complet pour professionnels</p>
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-2 md:mb-3">
                  <span className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text drop-shadow-lg">{getProPrice()}€</span>
                  {!payOncePro && (
                    <span className="text-foreground font-semibold text-base md:text-lg">/mois</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="payOncePro"
                    checked={payOncePro}
                    onChange={(e) => setPayOncePro(e.target.checked)}
                    className="w-4 h-4 accent-accent cursor-pointer"
                  />
                  <label htmlFor="payOncePro" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                    Payer en une fois
                    <span className="text-xs text-green-500 font-bold">-25%</span>
                  </label>
                </div>
              </div>
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-5 h-5 md:w-6 md:h-6 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-semibold text-base md:text-lg">Entreprises illimitées</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-5 h-5 md:w-6 md:h-6 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-semibold text-base md:text-lg">CRM complet + Pipeline</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-5 h-5 md:w-6 md:h-6 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-semibold text-base md:text-lg">Nouveaux sites en temps réel</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <Check className="w-5 h-5 md:w-6 md:h-6 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-semibold text-base md:text-lg">Support prioritaire</span>
                </li>
              </ul>
              <Button onClick={() => navigate("/auth")} className="w-full btn-hero shadow-2xl shadow-accent/60 font-bold text-base md:text-lg py-6 md:py-7 hover:scale-105 transition-transform" size="lg">
                Commencer
              </Button>
            </div>

            {/* Plan Entreprise */}
            <div className="glass-card p-6 md:p-8 space-y-4 md:space-y-6 hover:border-accent/60 transition-all duration-300 border-accent/30">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Entreprise</h3>
                <p className="text-muted-foreground font-medium">Solution personnalisée</p>
              </div>
              <div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold gradient-text">Sur mesure</span>
                </div>
                <div className="text-sm text-accent font-bold">Contactez-nous pour un devis</div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">Tout du plan Pro inclus</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">Utilisateurs illimités</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">Intégrations sur mesure</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">Formation dédiée</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">Account manager dédié</span>
                </li>
              </ul>
              <Button onClick={() => {
                const contactSection = document.querySelector('#contact');
                if (contactSection) {
                  contactSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  });
                }
              }} className="w-full bg-card hover:bg-accent/10 text-foreground border-2 border-accent/40 hover:border-accent font-bold" size="lg">
                Nous contacter
              </Button>
            </div>
          </div>

        </div>
      </section>

      {/* Section Témoignages */}
      <section id="testimonials-section" ref={testimonialsSection.ref} className={`relative py-20 px-4 bg-gradient-to-b from-background via-navy-deep/20 to-background transition-all duration-1000 ${testimonialsSection.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'}`}>
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 md:mb-12 space-y-2 md:space-y-3 animate-fade-in px-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-cyan-electric text-cyan-electric" />)}
              </div>
              <span className="text-lg md:text-xl font-bold text-foreground">4.8/5</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-foreground">
              Ils accélèrent leur <span className="gradient-text">croissance.</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">Résultats réels et mesurables.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className={`glass-card p-6 space-y-4 hover:border-cyan-electric/40 transition-all duration-500 ${testimonialsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{
              transitionDelay: testimonialsSection.isVisible ? '200ms' : '0ms'
            }}>
              <Quote className="w-8 h-8 text-cyan-electric/30" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-cyan-electric text-cyan-electric" />)}
              </div>
              <p className="text-base text-foreground leading-relaxed">
                "Enfin un outil pensé pour les commerciaux terrain ! Tournées optimisées, suivi commercial simple. J'ai doublé mes RDV."
              </p>
              <div className="inline-flex px-3 py-1.5 rounded-full bg-cyan-electric/10 border border-cyan-electric/30">
                <span className="text-sm font-semibold text-cyan-electric">+100% de RDV</span>
              </div>
              <div className="pt-3 border-t border-accent/10 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Sophie Martin</div>
                  <div className="text-sm text-muted-foreground">Commerciale BtoB</div>
                </div>
              </div>
            </div>

            <div className={`glass-card p-6 space-y-4 hover:border-cyan-electric/40 transition-all duration-500 ${testimonialsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{
              transitionDelay: testimonialsSection.isVisible ? '400ms' : '0ms'
            }}>
              <Quote className="w-8 h-8 text-cyan-electric/30" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-cyan-electric text-cyan-electric" />)}
              </div>
              <p className="text-base text-foreground leading-relaxed">
                "Plus besoin de jongler entre 5 outils. Tout est centralisé, je gagne 2h par jour et je vois tout mon secteur."
              </p>
              <div className="inline-flex px-3 py-1.5 rounded-full bg-cyan-electric/10 border border-cyan-electric/30">
                <span className="text-sm font-semibold text-cyan-electric">2h/jour économisées</span>
              </div>
              <div className="pt-3 border-t border-accent/10 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Thomas Dubois</div>
                  <div className="text-sm text-muted-foreground">Responsable commercial</div>
                </div>
              </div>
            </div>

            <div className={`glass-card p-6 space-y-4 hover:border-cyan-electric/40 transition-all duration-500 ${testimonialsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{
              transitionDelay: testimonialsSection.isVisible ? '600ms' : '0ms'
            }}>
              <Quote className="w-8 h-8 text-cyan-electric/30" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-cyan-electric text-cyan-electric" />)}
              </div>
              <p className="text-base text-foreground leading-relaxed">
                "L'outil parfait pour les indépendants. Simple, complet, avec le bonus des créations d'entreprises."
              </p>
              <div className="inline-flex px-3 py-1.5 rounded-full bg-cyan-electric/10 border border-cyan-electric/30">
                <span className="text-sm font-semibold text-cyan-electric">+15 clients</span>
              </div>
              <div className="pt-3 border-t border-accent/10 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Marie Leroux</div>
                  <div className="text-sm text-muted-foreground">Indépendante</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Réservation - Avant FAQ */}
      <div id="demo-section">
        <BookingSection />
      </div>

      {/* Section FAQ + CTA */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div ref={faqSection.ref} className={`text-center mb-8 md:mb-12 space-y-2 md:space-y-3 transition-all duration-1000 px-4 ${faqSection.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'}`}>
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-foreground">
              Questions <span className="gradient-text">fréquentes.</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Tout ce que vous devez savoir sur LUMA.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3 mb-12">
            <AccordionItem value="item-1" className="glass-card px-6 py-1 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-cyan-electric">
                D'où viennent les données entreprises ?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-2 space-y-3">
                <p>Les données proviennent exclusivement de <strong>sources officielles françaises</strong> :</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>INSEE</strong> : Base SIRENE actualisée <span className="text-accent font-semibold">quotidiennement</span> (mise à jour J+1)</li>
                  <li><strong>Infogreffe</strong> : Données juridiques et financières</li>
                  <li><strong>Data.gouv.fr</strong> : Créations d'entreprises en temps réel</li>
                </ul>
                <p className="bg-accent/5 p-3 rounded-lg border-l-4 border-accent">
                  <strong>Exemple concret</strong> : Une entreprise créée aujourd'hui à Lyon apparaîtra dans votre onglet "Nouveaux Sites" <span className="text-accent font-semibold">dès demain matin à 8h</span>.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="glass-card px-6 py-1 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-cyan-electric">
                Comment fonctionne l'essai gratuit ?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-2 space-y-3">
                <p>Vous bénéficiez de <strong className="text-accent">14 jours d'essai gratuit</strong> sans engagement, avec accès à toutes les fonctionnalités.</p>
                <p><strong>Timeline de démarrage</strong> :</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Jour 1 (2 min)</strong> : Inscription et import de vos premiers prospects</li>
                  <li><strong>Jour 1 (15 min)</strong> : Configuration de votre première tournée</li>
                  <li><strong>Jour 2-3</strong> : Prise en main complète du CRM</li>
                  <li><strong>Jour 14</strong> : Décision sans pression, résiliation en 1 clic</li>
                </ul>
                <p className="bg-green-500/5 p-3 rounded-lg border-l-4 border-green-500">
                  <strong>Résultat moyen</strong> : Nos utilisateurs économisent <span className="text-green-500 font-semibold">6h/semaine dès la 2ème semaine</span>.
                </p>
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
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-2 space-y-3">
                <p>LUMA utilise des algorithmes d'optimisation avancés qui calculent l'itinéraire optimal en <strong className="text-accent">moins de 3 secondes</strong>.</p>
                <p><strong>Critères d'optimisation</strong> :</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Distance et temps de trajet (données Mapbox temps réel)</li>
                  <li>Priorités commerciales (prospects chauds en premier)</li>
                  <li>Horaires d'ouverture des entreprises</li>
                  <li>Trafic en temps réel</li>
                </ul>
                <p className="bg-accent/5 p-3 rounded-lg border-l-4 border-accent">
                  <strong>Exemple réel</strong> : Un commercial avec 12 rendez-vous/jour économise en moyenne <span className="text-accent font-semibold">45 min de route</span> et peut caser <span className="text-accent font-semibold">2-3 visites supplémentaires</span>.
                </p>
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
                  <button onClick={() => window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                })} className="hover:text-accent transition-colors">
                    Fonctionnalités
                  </button>
                </li>
                <li>
                  <button onClick={() => {
                  const pricingSection = document.querySelector('section:has(h2:contains("investissement"))');
                  pricingSection?.scrollIntoView({
                    behavior: 'smooth'
                  });
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
                  <a href="#contact" onClick={e => {
                  e.preventDefault();
                  document.getElementById('contact')?.scrollIntoView({
                    behavior: 'smooth'
                  });
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
    </div>;
};
export default Index;