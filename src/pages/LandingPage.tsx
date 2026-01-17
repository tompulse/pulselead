import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { ArrowRight, Star, AlertCircle, Clock, Target, Zap, TrendingUp, Check, Sparkles, Quote, Map, User, MapPin, BarChart3, Users, ChevronDown, Phone, Mail, TrendingDown, FileText, Database, Search, Route, Smartphone, Construction, Menu, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ContactSection from "@/components/landing/ContactSection";
const LandingPage = () => {
  const navigate = useNavigate();

  // Scroll animations
  const heroAnimation = useScrollAnimation({
    threshold: 0.2
  });
  const problemsAnimation = useScrollAnimation({
    threshold: 0.2
  });
  const solutionAnimation = useScrollAnimation({
    threshold: 0.2
  });
  const beforeAfterAnimation = useScrollAnimation({
    threshold: 0.2
  });
  const featuresAnimation = useScrollAnimation({
    threshold: 0.2
  });
  const pricingAnimation = useScrollAnimation({
    threshold: 0.2
  });
  const faqAnimation = useScrollAnimation({
    threshold: 0.2
  });
  return <div className="min-h-screen relative overflow-hidden" style={{
    background: 'radial-gradient(ellipse at top, hsl(220, 60%, 12%), hsl(220, 60%, 8%), hsl(0, 0%, 0%))'
  }}>
      {/* Decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Large glowing orb top right */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{
        animationDuration: '8s'
      }}></div>
        {/* Medium glowing orb bottom left */}
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-cyan-glow/10 rounded-full blur-3xl animate-pulse" style={{
        animationDuration: '10s'
      }}></div>
      </div>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-blue-deep/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="text-xl sm:text-2xl font-bold">
              <span className="text-white">PULSE</span>
              <span className="text-accent ml-1">.</span>
            </div>

            {/* Desktop & Tablet nav - visible from sm breakpoint */}
            <nav className="hidden sm:flex items-center gap-3 md:gap-6 lg:gap-8 absolute left-1/2 transform -translate-x-1/2">
              <a href="#solution" className="text-xs md:text-sm lg:text-base text-white/70 hover:text-accent transition-colors whitespace-nowrap">Fonctionnalités</a>
              <a href="#avantages" className="text-xs md:text-sm lg:text-base text-white/70 hover:text-accent transition-colors whitespace-nowrap">Avantages</a>
              <a href="#pricing" className="text-xs md:text-sm lg:text-base text-white/70 hover:text-accent transition-colors whitespace-nowrap">Tarifs</a>
              <a href="#contact" className="text-xs md:text-sm lg:text-base text-white/70 hover:text-accent transition-colors whitespace-nowrap">Contact</a>
            </nav>

            {/* Desktop buttons - visible from md breakpoint */}
            <div className="hidden md:flex items-center gap-3">
              <Button asChild className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 h-8 px-3 text-xs">
                <a href="https://calendly.com/tomiolovpro/30min" target="_blank" rel="noopener noreferrer">
                  Réserver ma démo
                </a>
              </Button>
              <Button variant="outline" onClick={() => navigate('/auth')} className="border-accent/50 text-accent hover:bg-accent hover:text-black font-semibold h-8 px-3 text-xs">
                Connexion
              </Button>
            </div>

            {/* Tablet buttons - visible only on sm, hidden on md+ */}
            <div className="hidden sm:flex md:hidden items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/auth')} className="border-accent/50 text-accent hover:bg-accent hover:text-black font-semibold h-7 px-2 text-xs">
                Connexion
              </Button>
            </div>

            {/* Mobile hamburger menu - visible only below sm */}
            <Sheet>
              <SheetTrigger asChild className="sm:hidden">
                <Button variant="ghost" size="icon" className="h-10 w-10 text-white" aria-label="Ouvrir le menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-card/95 backdrop-blur-xl border-accent/20">
                <nav className="flex flex-col gap-4 mt-8">
                  <a href="#solution" className="text-lg font-medium text-foreground hover:text-accent transition-colors py-2">Fonctionnalités</a>
                  <a href="#avantages" className="text-lg font-medium text-foreground hover:text-accent transition-colors py-2">Avantages</a>
                  <a href="#pricing" className="text-lg font-medium text-foreground hover:text-accent transition-colors py-2">Tarifs</a>
                  <a href="#contact" className="text-lg font-medium text-foreground hover:text-accent transition-colors py-2">Contact</a>
                  <div className="border-t border-accent/20 pt-4 mt-4 space-y-3">
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold">
                      <a href="https://calendly.com/tomiolovpro/30min" target="_blank" rel="noopener noreferrer">
                        Réserver ma démo
                      </a>
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/auth')} className="w-full border-accent/50 text-accent hover:bg-accent hover:text-black font-semibold">
                      Connexion
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-8 px-6 relative z-10">
          <div className="container mx-auto max-w-6xl">
            <div ref={heroAnimation.ref} className={`text-center space-y-3 scroll-reveal ${heroAnimation.isVisible ? 'visible' : ''}`}>
              <div className="inline-flex items-center gap-2 bg-accent/10 backdrop-blur-sm px-4 py-2 rounded-full border border-accent/20 mb-4">
                <Target className="w-4 h-4 text-accent" />
                <span className="text-sm text-white/90 font-medium">Essai gratuit 7 jours</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Vendez plus.
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 bg-clip-text text-transparent">Roulez moins.</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/70 max-w-3xl mx-auto pt-2">Liste de prospects filtrée • Tournées optimisées • CRM simple pour suivre vos visites sur le terrain</p>
              <div className="flex justify-center py-6">
                <Button onClick={() => navigate('/subscribe')} className="btn-hero-pulse">
                  Essayer gratuitement 7 jours
                  <ArrowRight className="ml-4 w-8 h-8" />
                </Button>
              </div>

              {/* Stats Section */}
              <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
                {/* Stat 1 */}
                <div className="text-center space-y-2 animate-fade-in" style={{
                animationDelay: '0.1s'
              }}>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">+850</div>
                  <p className="text-white/70 text-sm sm:text-base md:text-lg">nouvelles entreprises détectées par semaine</p>
                </div>
                
                {/* Stat 2 */}
                <div className="text-center space-y-2 animate-fade-in" style={{
                animationDelay: '0.2s'
              }}>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">2h</div>
                  <p className="text-white/70 text-sm sm:text-base md:text-lg">gagnées par jour en moyenne</p>
                </div>
                
                {/* Stat 3 */}
                <div className="text-center space-y-2 animate-fade-in" style={{
                animationDelay: '0.3s'
              }}>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">7 jours</div>
                  <p className="text-white/70 text-sm sm:text-base md:text-lg">d'essai gratuit sans engagement</p>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/50 animate-fade-in" style={{
              animationDelay: '0.4s'
            }}>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Conforme RGPD</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-accent" />
                  <span>Données publiques officielles</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problems Section */}
        <section className="py-12 px-6 relative z-10" style={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(0, 0, 0, 0.3) 100%)',
        borderTop: '1px solid rgba(6, 182, 212, 0.1)',
        borderBottom: '1px solid rgba(6, 182, 212, 0.1)'
      }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={problemsAnimation.ref} className={`scroll-reveal ${problemsAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 sm:mb-8">Ce qui désorganise votre prospection</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <Card className="glass-card p-6 sm:p-8 border-white/10 hover:border-accent/50 transition-all">
                <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-accent mb-3 sm:mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Aucune visibilité sur votre secteur</h3>
                <p className="text-white/70 text-base sm:text-lg">Impossible de savoir où sont vos prospects, qui cibler en priorité, quel territoire couvrir</p>
              </Card>
              <Card className="glass-card p-6 sm:p-8 border-white/10 hover:border-accent/50 transition-all">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-accent mb-3 sm:mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Informations éparpillées partout</h3>
                <p className="text-white/70 text-base sm:text-lg">Excel, carnets, post-its... Relances oubliées, données perdues, aucun historique structuré</p>
              </Card>
              <Card className="glass-card p-6 sm:p-8 border-white/10 hover:border-accent/50 transition-all">
                <Route className="w-10 h-10 sm:w-12 sm:h-12 text-accent mb-3 sm:mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Trajets improvisés inefficaces</h3>
                <p className="text-white/70 text-base sm:text-lg">Des kilomètres inutiles, du temps perdu, moins de visites, moins de chiffre d'affaires</p>
              </Card>
            </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section id="solution" className="py-12 px-6 relative z-10 scroll-mt-20" style={{
        background: 'radial-gradient(circle at center, rgba(14, 165, 233, 0.08) 0%, transparent 70%)'
      }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={solutionAnimation.ref} className={`scroll-reveal ${solutionAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 sm:mb-6">
                Fonctionnalités <span className="gradient-text">PULSE</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white/60 text-center mb-8 sm:mb-10 max-w-2xl mx-auto">
                Contrôlez votre territoire, optimisez chaque action commerciale
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-4 sm:mb-6 border border-accent/20">
                  <Target className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">Liste de prospects filtrée</h3>
                <p className="text-white/70 text-sm sm:text-base md:text-lg leading-relaxed">
                  Accédez à toutes les nouvelles entreprises créées en France. Filtrez par département, secteur et taille
                </p>
              </div>
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-4 sm:mb-6 border border-accent/20">
                  <Route className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">Tournées optimisées</h3>
                <p className="text-white/70 text-sm sm:text-base md:text-lg leading-relaxed">
                  Sélectionnez vos prospects, créez votre tournée, et l'IA calcule l'itinéraire optimal avec GPS intégré
                </p>
              </div>
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-4 sm:mb-6 border border-accent/20">
                  <Smartphone className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">CRM terrain simple</h3>
                <p className="text-white/70 text-sm sm:text-base md:text-lg leading-relaxed">
                  Suivez vos visites, appels et relances directement depuis votre mobile. Simple, rapide, efficace
                </p>
              </div>
              </div>
            </div>
          </div>
        </section>

        {/* Before/After Section */}
        <section id="avantages" className="py-12 px-6 relative z-10 scroll-mt-20" style={{
        background: 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.4)), repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(6, 182, 212, 0.03) 50px, rgba(6, 182, 212, 0.03) 51px)',
        backgroundSize: '100% 100%, 100px 100%'
      }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={beforeAfterAnimation.ref} className={`scroll-reveal ${beforeAfterAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 sm:mb-6">Avant / Après PULSE</h2>
              <p className="text-base sm:text-lg md:text-xl text-white/60 text-center mb-8 sm:mb-10 max-w-2xl mx-auto">
                Passez du chaos à une prospection structurée et méthodique
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
              <Card className="glass-card p-6 sm:p-8 md:p-10 border-red-500/30">
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Sans PULSE</h3>
                </div>
                <ul className="space-y-4 sm:space-y-5 text-sm sm:text-base md:text-lg text-white/70">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1 text-xl">✗</span>
                    <span>Prospection désorganisée sans vision claire de votre territoire</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1 text-xl">✗</span>
                    <span>Trajets improvisés, temps perdu dans les bouchons et les détours</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1 text-xl">✗</span>
                    <span>Notes éparpillées sur des carnets, Excel, post-its perdus</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1 text-xl">✗</span>
                    <span>Aucune visibilité sur vos prospects cibles et votre secteur</span>
                  </li>
                </ul>
              </Card>
              <Card className="glass-card p-6 sm:p-8 md:p-10 border-accent/50">
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Avec PULSE</h3>
                </div>
                <ul className="space-y-4 sm:space-y-5 text-sm sm:text-base md:text-lg text-white/70">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <span>Prospection structurée avec visibilité complète de tous vos prospects cibles</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <span>Tournées méthodiques et optimisées qui vous font gagner 2h par jour</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <span>CRM organisé : toutes vos actions centralisées et accessibles partout</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <span>Maîtrise totale de votre activité avec suivi en temps réel</span>
                  </li>
                </ul>
              </Card>
            </div>
            </div>
          </div>
        </section>



        {/* Pricing */}
        <section id="pricing" className="py-16 px-6 relative z-10 scroll-mt-20" style={{
        background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.03) 0%, rgba(0, 0, 0, 0.5) 100%)',
        borderTop: '2px solid rgba(6, 182, 212, 0.2)'
      }}>
          <div className="container mx-auto max-w-7xl">
            <div ref={pricingAnimation.ref} className={`scroll-reveal ${pricingAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4">
                Choisissez votre formule <span className="gradient-text">PULSE</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white/60 text-center mb-8 sm:mb-10 max-w-2xl mx-auto">
                Structurez votre prospection, optimisez chaque visite
              </p>
              
              {/* Pricing Cards - 2 columns: PULSE + Sur Mesure */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto items-stretch mb-8">
                
                {/* PULSE Offer */}
                <Card className="relative overflow-visible flex flex-col" style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(14, 165, 233, 0.08) 100%)',
                border: '2px solid rgba(6, 182, 212, 0.5)',
                boxShadow: '0 25px 70px -15px rgba(6, 182, 212, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
              }}>
                  {/* Badge essai gratuit */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-lg z-10 whitespace-nowrap">
                    🎁 7 JOURS D'ESSAI GRATUIT
                  </div>
                  
                  <div className="p-6 md:p-8 pt-10 flex flex-col flex-1">
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 text-center gradient-text">Commercial Solo</h3>
                    <div className="mb-6 text-center py-3 px-4 rounded-xl" style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(6, 182, 212, 0.2)'
                  }}>
                      <div className="flex items-baseline justify-center gap-2 mb-1">
                        <span className="text-4xl md:text-5xl font-bold gradient-text">49€</span>
                        <span className="text-base text-white/60">/mois</span>
                      </div>
                      <p className="text-sm text-white/50 mt-2">Sans engagement • Résiliable à tout moment</p>
                    </div>

                    <ul className="space-y-2 mb-6 flex-1">
                      <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                        <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Target className="w-3 h-3 text-accent" />
                        </div>
                        <div>
                          <span className="text-white text-sm font-semibold">Liste de prospects filtrée</span>
                          <p className="text-white/50 text-xs">Nouvelles entreprises selon vos critères</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                        <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Route className="w-3 h-3 text-accent" />
                        </div>
                        <div>
                          <span className="text-white text-sm font-semibold">Tournées optimisées IA</span>
                          <p className="text-white/50 text-xs">Moins de route, plus de RDV</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                        <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Smartphone className="w-3 h-3 text-accent" />
                        </div>
                        <div>
                          <span className="text-white text-sm font-semibold">CRM mobile terrain</span>
                          <p className="text-white/50 text-xs">Visites et relances depuis votre poche</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                        <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Search className="w-3 h-3 text-accent" />
                        </div>
                        <div>
                          <span className="text-white text-sm font-semibold">Filtres intelligents</span>
                          <p className="text-white/50 text-xs">Département, activité, taille d'entreprise</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                        <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <BarChart3 className="w-3 h-3 text-accent" />
                        </div>
                        <div>
                          <span className="text-white text-sm font-semibold">Pipeline Kanban</span>
                          <p className="text-white/50 text-xs">Du premier contact à la signature</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                        <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Clock className="w-3 h-3 text-accent" />
                        </div>
                        <div>
                          <span className="text-white text-sm font-semibold">Suivi des relances</span>
                          <p className="text-white/50 text-xs">Programmez vos rappels dans le CRM</p>
                        </div>
                      </li>
                    </ul>

                    <Button className="w-full bg-gradient-to-r from-accent to-cyan-glow text-black hover:opacity-90 text-sm py-5 font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] mt-auto" onClick={() => navigate('/subscribe')}>
                      Essayer gratuitement 7 jours
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </Card>

                {/* Sur Mesure / Enterprise */}
                <Card className="relative overflow-visible flex flex-col" style={{
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
                border: '2px solid rgba(14, 165, 233, 0.3)',
                boxShadow: '0 20px 60px -10px rgba(14, 165, 233, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}>
                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 text-center gradient-text">Équipes Commerciales</h3>
                    <div className="mb-6 text-center py-3 px-4 rounded-xl" style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(14, 165, 233, 0.2)'
                  }}>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-3xl md:text-4xl font-bold gradient-text">
                          Sur devis
                        </span>
                      </div>
                      <p className="text-xs text-white/50 mt-2">Pour les équipes ambitieuses</p>
                    </div>

                    <ul className="space-y-2 mb-6 flex-1">
                      <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                        <div className="w-5 h-5 rounded-full bg-cyan-glow/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-cyan-glow" />
                        </div>
                        <div>
                          <span className="text-white text-sm font-semibold">Tout PULSE inclus</span>
                          <p className="text-white/50 text-xs">Toutes les fonctionnalités de l'offre standard</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                        <div className="w-5 h-5 rounded-full bg-cyan-glow/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Users className="w-3 h-3 text-cyan-glow" />
                        </div>
                        <div>
                          <span className="text-white text-sm font-semibold">Équipes illimitées</span>
                          <p className="text-white/50 text-xs">Invitez tous vos commerciaux</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                        <div className="w-5 h-5 rounded-full bg-cyan-glow/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-3 h-3 text-cyan-glow" />
                        </div>
                        <div>
                          <span className="text-white text-sm font-semibold">Onboarding personnalisé</span>
                          <p className="text-white/50 text-xs">Formation dédiée à votre équipe</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                        <div className="w-5 h-5 rounded-full bg-cyan-glow/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Phone className="w-3 h-3 text-cyan-glow" />
                        </div>
                        <div>
                          <span className="text-white text-sm font-semibold">Support prioritaire</span>
                          <p className="text-white/50 text-xs">Réponse sous 24h garantie</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                        <div className="w-5 h-5 rounded-full bg-cyan-glow/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <TrendingUp className="w-3 h-3 text-cyan-glow" />
                        </div>
                        <div>
                          <span className="text-white text-sm font-semibold">Session d'analyse mensuelle</span>
                          <p className="text-white/50 text-xs">Optimisez vos performances</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                        <div className="w-5 h-5 rounded-full bg-cyan-glow/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Building2 className="w-3 h-3 text-cyan-glow" />
                        </div>
                        <div>
                          <span className="text-white text-sm font-semibold">Intégrations sur mesure</span>
                          <p className="text-white/50 text-xs">Connectez vos outils existants</p>
                        </div>
                      </li>
                    </ul>

                    <Button className="w-full bg-cyan-glow text-black hover:bg-cyan-glow/90 text-sm py-5 font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] mt-auto" onClick={() => navigate('/subscribe')}>
                      Demander un devis
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-8 text-center text-white/70">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Conforme RGPD</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔒</span>
                  <span className="text-sm">Paiement 100% sécurisé</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-accent" />
                  <span className="text-sm">Données publiques officielles</span>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* FAQ */}
        <section className="py-12 px-6 relative z-10" style={{
        background: 'radial-gradient(ellipse at bottom, rgba(6, 182, 212, 0.06) 0%, transparent 60%)'
      }}>
          <div className="container mx-auto max-w-4xl">
            <div ref={faqAnimation.ref} className={`scroll-reveal ${faqAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 sm:mb-8">Vos questions, nos réponses</h2>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-xl font-semibold hover:text-accent">
                  Comment PULSE structure ma prospection ?
                </AccordionTrigger>
                <AccordionContent className="text-white/70 text-lg">
                  PULSE vous donne une vision complète de votre territoire avec tous vos prospects sur une carte interactive, 
                  des tournées calculées automatiquement pour optimiser vos déplacements, et un CRM mobile pour suivre chaque action. 
                  Tout est centralisé, organisé et accessible en temps réel.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-xl font-semibold hover:text-accent">
                  Les données sont-elles fiables ?
                </AccordionTrigger>
                <AccordionContent className="text-white/70 text-lg">
                  Nos données proviennent de sources officielles (INSEE, SIRENE) et sont mises à jour quotidiennement. 
                  Nous enrichissons également les informations via nos algorithmes propriétaires.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-xl font-semibold hover:text-accent">
                  Peut-on l'utiliser partout en France ?
                </AccordionTrigger>
                <AccordionContent className="text-white/70 text-lg">
                  Oui, PULSE couvre l'intégralité du territoire français, de la plus grande ville au plus petit bourg.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-xl font-semibold hover:text-accent">
                  Quelles données vais-je retrouver ?
                </AccordionTrigger>
                <AccordionContent className="text-white/70 text-lg">
                  PULSE vous donne accès à toutes les entreprises de votre territoire : nouvelles créations, établissements existants. 
                  Vous pouvez filtrer par département, secteur d'activité (NAF), taille d'entreprise et forme juridique.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-xl font-semibold hover:text-accent">
                  Puis-je personnaliser mes critères de recherche ?
                </AccordionTrigger>
                <AccordionContent className="text-white/70 text-lg">
                  Absolument ! Toutes les offres incluent des filtres avancés : département, secteur d'activité (code NAF), taille d'entreprise, 
                  forme juridique. Vous ciblez précisément les prospects qui vous intéressent.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-xl font-semibold hover:text-accent">
                  Comment fonctionne l'essai gratuit de 7 jours ?
                </AccordionTrigger>
                <AccordionContent className="text-white/70 text-lg">
                  Vous bénéficiez de 7 jours d'accès complet à toutes les fonctionnalités de PULSE. 
                  Vous pouvez annuler à tout moment pendant les 7 jours sans aucun frais.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            </div>
          </div>
        </section>

        <ContactSection />

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="text-2xl font-bold mb-4">
                  <span className="text-white">PULSE</span>
                  <span className="text-accent">.</span>
                </div>
                <p className="text-white/60">La prospection terrain réinventée</p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Produit</h4>
                <ul className="space-y-2 text-white/60">
                  <li><a href="#" className="hover:text-accent transition-colors">Fonctionnalités</a></li>
                  <li><a href="#" className="hover:text-accent transition-colors">Tarifs</a></li>
                  <li><a href="#" className="hover:text-accent transition-colors">Démo</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Contact</h4>
                <ul className="space-y-2 text-white/60">
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <a href="mailto:tomiolovpro@gmail.com" className="hover:text-accent transition-colors">
                      tomiolovpro@gmail.com
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white/40 text-sm">
              <p>&copy; 2025 Individual Entrepreneur PULSE. Tous droits réservés.</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a href="/mentions-legales" className="hover:text-accent transition-colors">Mentions Légales</a>
                <span className="text-white/20">•</span>
                <a href="/cgu" className="hover:text-accent transition-colors">CGU</a>
                <span className="text-white/20">•</span>
                <a href="/cgv" className="hover:text-accent transition-colors">CGV</a>
                <span className="text-white/20">•</span>
                <a href="/confidentialite" className="hover:text-accent transition-colors">Confidentialité</a>
              </div>
            </div>
          </div>
        </footer>

        {/* Sticky CTA Mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent md:hidden z-40 safe-area-bottom">
          <Button onClick={() => navigate('/subscribe')} className="w-full bg-gradient-to-r from-accent to-cyan-glow text-primary font-bold py-4 rounded-full shadow-lg shadow-accent/40" aria-label="Essayer gratuitement">
            Essayer gratuitement 7 jours
            <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
          </Button>
        </div>
      </main>
    </div>;
};

// Import X icon
const X = ({
  className
}: {
  className?: string;
}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>;
export default LandingPage;