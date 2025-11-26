import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { ArrowRight, Star, AlertCircle, Clock, Target, Zap, TrendingUp, Check, Sparkles, Quote, Map, User, MapPin, BarChart3, Users, ChevronDown, Phone, Mail, TrendingDown, FileText, Database, Search, Route, Smartphone, Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import ContactSection from "@/components/landing/ContactSection";
const LandingPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

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

  const pricingPlans = {
    monthly: {
      originalPrice: 99,
      discountedPrice: 69,
      label: 'Mensuel',
      billingDetails: 'Facturé mensuellement'
    },
    quarterly: {
      originalPrice: 79,
      discountedPrice: 55,
      label: 'Trimestriel',
      billingDetails: 'Soit 165€ au lieu de 237€'
    },
    yearly: {
      originalPrice: 59,
      discountedPrice: 41,
      label: 'Annuel',
      billingDetails: 'Soit 492€ au lieu de 708€'
    }
  };
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
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              <span className="text-white">PULSE</span>
              <span className="text-accent ml-1">.</span>
            </div>

            <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              <a href="#solution" className="text-white/70 hover:text-accent transition-colors">Fonctionnalités</a>
              <a href="#avantages" className="text-white/70 hover:text-accent transition-colors">Avantages</a>
              <a href="#pricing" className="text-white/70 hover:text-accent transition-colors">Tarifs</a>
              <a href="#contact" className="text-white/70 hover:text-accent transition-colors">Contact</a>
            </nav>

            <div className="flex items-center gap-3">
              <Button asChild className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 h-8 px-3 text-xs">
                <a href="https://calendly.com/tomiolovpro/30min?month=2025-11" target="_blank" rel="noopener noreferrer">
                  Réserver ma démo
                </a>
              </Button>
              <Button variant="outline" onClick={() => navigate('/auth')} className="border-accent/50 text-accent hover:bg-accent hover:text-black font-semibold h-8 px-3 text-xs">
                Connexion
              </Button>
            </div>
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
                <span className="text-sm text-white/90 font-medium">L'outil terrain des commerciaux qui veulent gagner du temps</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Vendez plus.
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 bg-clip-text text-transparent">Roulez moins.</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/70 max-w-3xl mx-auto pt-2">
                Cartographie de votre territoire • Tournées optimisées • CRM simple et mobile pour suivre vos visites sur le terrain
              </p>
              <div className="flex justify-center py-6">
                <Button onClick={() => navigate('/auth')} className="btn-hero-pulse">
                  Commencer maintenant
                  <ArrowRight className="ml-4 w-8 h-8" />
                </Button>
              </div>

              {/* Stats Section */}
              <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
                {/* Stat 1 */}
                <div className="text-center space-y-2 animate-fade-in" style={{
                animationDelay: '0.1s'
              }}>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">2h</div>
                  <p className="text-white/70 text-sm sm:text-base md:text-lg">gagnées par jour en moyenne</p>
                </div>
                
                {/* Stat 2 */}
                <div className="text-center space-y-2 animate-fade-in" style={{
                animationDelay: '0.2s'
              }}>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">13</div>
                  <p className="text-white/70 text-sm sm:text-base md:text-lg">commerciaux ont fait confiance à PULSE</p>
                </div>
                
                {/* Stat 3 */}
                <div className="text-center space-y-2 animate-fade-in" style={{
                animationDelay: '0.3s'
              }}>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">92%</div>
                  <p className="text-white/70 text-sm sm:text-base md:text-lg">de satisfaction client</p>
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
                  <Smartphone className="w-4 h-4 text-accent" />
                  <span>Adapté aux TPE/PME</span>
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 sm:mb-8">Ce qui tue votre chiffre d'affaires</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <Card className="glass-card p-6 sm:p-8 border-white/10 hover:border-accent/50 transition-all">
                <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-accent mb-3 sm:mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">40% du temps perdu sur la route</h3>
                <p className="text-white/70 text-base sm:text-lg">Des trajets mal optimisés qui vous empêchent de voir plus de clients</p>
              </Card>
              <Card className="glass-card p-6 sm:p-8 border-white/10 hover:border-accent/50 transition-all">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-accent mb-3 sm:mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Excel, carnets, post-its...</h3>
                <p className="text-white/70 text-base sm:text-lg">Informations éparpillées, relances oubliées, opportunités perdues</p>
              </Card>
              <Card className="glass-card p-6 sm:p-8 border-white/10 hover:border-accent/50 transition-all">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-accent mb-3 sm:mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Les CRM classiques sont trop lourds</h3>
                <p className="text-white/70 text-base sm:text-lg">Compliqués, lents, pas adaptés au terrain et aux commerciaux mobiles</p>
              </Card>
            </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section id="solution" className="py-12 px-6 relative z-10" style={{
        background: 'radial-gradient(circle at center, rgba(14, 165, 233, 0.08) 0%, transparent 70%)'
      }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={solutionAnimation.ref} className={`scroll-reveal ${solutionAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 sm:mb-6">
                Les 3 piliers de <span className="gradient-text">PULSE</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white/60 text-center mb-8 sm:mb-10 max-w-2xl mx-auto">
                Maîtrisez votre territoire, optimisez vos déplacements, suivez vos actions
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-4 sm:mb-6 border border-accent/20">
                  <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">Cartographie de votre territoire</h3>
                <p className="text-white/70 text-sm sm:text-base md:text-lg leading-relaxed">
                  Tous vos prospects et clients sur une carte interactive. Visualisez votre zone et identifiez les opportunités à proximité
                </p>
              </div>
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-4 sm:mb-6 border border-accent/20">
                  <Route className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">Tournées optimisées</h3>
                <p className="text-white/70 text-sm sm:text-base md:text-lg leading-relaxed">
                  Itinéraires calculés automatiquement avec GPS intégré. Visitez 2x plus de prospects en divisant par 2 vos kilomètres
                </p>
              </div>
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-4 sm:mb-6 border border-accent/20">
                  <Smartphone className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold">CRM terrain simple et mobile</h3>
                <p className="text-white/70 text-sm sm:text-base md:text-lg leading-relaxed">
                  Suivez vos visites, appels et relances directement depuis votre mobile. Simple, rapide, efficace
                </p>
              </div>
              </div>
            </div>
          </div>
        </section>

        {/* Before/After Section */}
        <section id="avantages" className="py-12 px-6 relative z-10" style={{
        background: 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.4)), repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(6, 182, 212, 0.03) 50px, rgba(6, 182, 212, 0.03) 51px)',
        backgroundSize: '100% 100%, 100px 100%'
      }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={beforeAfterAnimation.ref} className={`scroll-reveal ${beforeAfterAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 sm:mb-6">Avant / Après PULSE</h2>
              <p className="text-base sm:text-lg md:text-xl text-white/60 text-center mb-8 sm:mb-10 max-w-2xl mx-auto">
                Passez du chaos à l'organisation, du temps perdu au temps investi
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
                    <span>Trajets improvisés, temps perdu dans les bouchons et les détours</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1 text-xl">✗</span>
                    <span>Notes éparpillées sur des carnets, Excel, post-its perdus</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1 text-xl">✗</span>
                    <span>Relances oubliées, prospects qui passent entre les mailles</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1 text-xl">✗</span>
                    <span>Aucune visibilité sur votre activité réelle et vos résultats</span>
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
                    <span>2h gagnées par jour grâce aux tournées optimisées et au GPS intégré</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <span>Toutes les infos centralisées dans un CRM simple accessible partout</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <span>Aucune relance manquée, suivi clair de chaque prospect</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <span>Visibilité totale sur votre activité et vos performances</span>
                  </li>
                </ul>
              </Card>
            </div>
            </div>
          </div>
        </section>



        {/* Pricing */}
        <section id="pricing" className="py-16 px-6 relative z-10" style={{
        background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.03) 0%, rgba(0, 0, 0, 0.5) 100%)',
        borderTop: '2px solid rgba(6, 182, 212, 0.2)'
      }}>
          <div className="container mx-auto max-w-7xl">
            <div ref={pricingAnimation.ref} className={`scroll-reveal ${pricingAnimation.isVisible ? 'visible' : ''}`}>
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-full font-bold shadow-lg">
                  <Sparkles className="w-5 h-5" />
                  Offre de lancement -30% • Jusqu'au 31 Décembre 2025
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4">
                Choisissez votre formule <span className="gradient-text">PULSE</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white/60 text-center mb-8 sm:mb-10 max-w-2xl mx-auto">
                Gagnez 2h par jour sur le terrain
              </p>
              
              {/* Pricing Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto mb-8">
                {/* Commercial Offer with duration selector */}
                <div className="space-y-4">
                  {/* Plan Toggle */}
                  <div className="flex justify-center">
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(6, 182, 212, 0.2)'
                    }} className="inline-flex rounded-lg p-1">
                      <button onClick={() => setSelectedPlan('monthly')} className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${selectedPlan === 'monthly' ? 'bg-accent text-black shadow-lg' : 'text-white/70 hover:text-white'}`}>
                        Mensuel
                      </button>
                      <button onClick={() => setSelectedPlan('quarterly')} className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${selectedPlan === 'quarterly' ? 'bg-accent text-black shadow-lg' : 'text-white/70 hover:text-white'}`}>
                        Trimestriel
                      </button>
                      <button onClick={() => setSelectedPlan('yearly')} className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${selectedPlan === 'yearly' ? 'bg-accent text-black shadow-lg' : 'text-white/70 hover:text-white'}`}>
                        Annuel
                      </button>
                    </div>
                  </div>

                  <Card className="relative overflow-visible" style={{
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%)',
                    border: '2px solid rgba(6, 182, 212, 0.3)',
                    boxShadow: '0 20px 60px -10px rgba(6, 182, 212, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}>
                    <div className="p-6 md:p-8">
                      <h3 className="text-2xl md:text-3xl font-bold mb-3 text-center gradient-text">Commercial</h3>
                      <div className="mb-6 text-center py-3 px-4 rounded-xl" style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(6, 182, 212, 0.2)'
                      }}>
                        <div className="flex items-baseline justify-center gap-2 mb-1">
                          <span className="text-4xl md:text-5xl font-bold gradient-text">
                            {pricingPlans[selectedPlan].discountedPrice}€
                          </span>
                          <span className="text-xl text-white/40 line-through">
                            {pricingPlans[selectedPlan].originalPrice}€
                          </span>
                        </div>
                        <p className="text-base text-white/60 font-semibold">/mois</p>
                        {pricingPlans[selectedPlan].billingDetails && (
                          <p className="text-xs text-white/50 mt-1">
                            {pricingPlans[selectedPlan].billingDetails}
                          </p>
                        )}
                        <div className="inline-flex items-center bg-green-600/20 text-green-500 px-3 py-1 rounded-full text-xs font-bold mt-2">
                          -30% de réduction
                        </div>
                      </div>

                      <ul className="space-y-2 mb-6">
                        <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                          <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-accent" />
                          </div>
                          <span className="text-white text-xs leading-relaxed">Cartographie interactive</span>
                        </li>
                        <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                          <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-accent" />
                          </div>
                          <span className="text-white text-xs leading-relaxed">Tournées optimisées</span>
                        </li>
                        <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                          <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-accent" />
                          </div>
                          <span className="text-white text-xs leading-relaxed">GPS intégré</span>
                        </li>
                        <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                          <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-accent" />
                          </div>
                          <span className="text-white text-xs leading-relaxed">CRM mobile</span>
                        </li>
                        <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                          <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-accent" />
                          </div>
                          <span className="text-white text-xs leading-relaxed">Pipeline Kanban</span>
                        </li>
                        <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5 opacity-60">
                          <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Construction className="w-3 h-3 text-white/50" />
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white/70 text-xs">Assistant IA</span>
                            <Badge variant="secondary" className="text-[10px] py-0 px-1.5">Bientôt</Badge>
                          </div>
                        </li>
                      </ul>

                      <Button className="w-full bg-accent text-black hover:bg-accent/90 text-sm py-4 font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]" onClick={() => navigate('/auth')}>
                        Commencer
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Premium Offer */}
                <Card className="relative overflow-visible lg:scale-105" style={{
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)',
                  border: '2px solid rgba(6, 182, 212, 0.5)',
                  boxShadow: '0 25px 70px -15px rgba(6, 182, 212, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                }}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent to-cyan-glow text-black px-6 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-lg z-10 whitespace-nowrap">
                    ⭐ OFFRE LA PLUS POPULAIRE
                  </div>
                  
                  <div className="p-6 md:p-8 pt-10 lg:pt-12">
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 text-center gradient-text">Premium</h3>
                    <div className="mb-6 text-center py-3 px-4 rounded-xl" style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(6, 182, 212, 0.2)'
                    }}>
                      <div className="flex items-baseline justify-center gap-2 mb-1">
                        <span className="text-4xl md:text-5xl font-bold gradient-text">104€</span>
                        <span className="text-xl text-white/40 line-through">149€</span>
                      </div>
                      <p className="text-base text-white/60 font-semibold">/mois</p>
                      <div className="inline-flex items-center bg-green-600/20 text-green-500 px-3 py-1 rounded-full text-xs font-bold mt-2">
                        -30% de réduction
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                        <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-accent" />
                        </div>
                        <span className="text-white text-xs leading-relaxed font-semibold">Tout Commercial inclus</span>
                      </li>
                      <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                        <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-accent" />
                        </div>
                        <span className="text-white text-xs leading-relaxed font-semibold">🎯 Détection créations entreprises</span>
                      </li>
                      <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                        <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-accent" />
                        </div>
                        <span className="text-white text-xs leading-relaxed font-semibold">Nouveaux sites détectés</span>
                      </li>
                      <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                        <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-accent" />
                        </div>
                        <span className="text-white text-xs leading-relaxed font-semibold">Filtres avancés (NAF, départements)</span>
                      </li>
                    </ul>

                    <Button className="w-full bg-gradient-to-r from-accent to-cyan-glow text-black hover:opacity-90 text-sm py-4 font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]" onClick={() => navigate('/auth')}>
                      Commencer maintenant
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </Card>

                {/* Enterprise Offer */}
                <div className="space-y-4">
                  {/* Spacer to align with Commercial card */}
                  <div className="h-[52px]"></div>

                  <Card className="relative overflow-visible" style={{
                    background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
                    border: '2px solid rgba(14, 165, 233, 0.3)',
                    boxShadow: '0 20px 60px -10px rgba(14, 165, 233, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}>
                    <div className="p-6 md:p-8">
                      <h3 className="text-2xl md:text-3xl font-bold mb-3 text-center gradient-text">Entreprise</h3>
                      <div className="mb-6 text-center py-3 px-4 rounded-xl" style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(14, 165, 233, 0.2)'
                      }}>
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-3xl md:text-4xl font-bold gradient-text">
                            Sur devis
                          </span>
                        </div>
                        <p className="text-xs text-white/50 mt-2">Solution sur mesure</p>
                      </div>

                      <ul className="space-y-2 mb-6">
                        <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                          <div className="w-4 h-4 rounded-full bg-cyan-glow/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-cyan-glow" />
                          </div>
                          <span className="text-white text-xs leading-relaxed font-semibold">Tout Premium inclus</span>
                        </li>
                        <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                          <div className="w-4 h-4 rounded-full bg-cyan-glow/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-cyan-glow" />
                          </div>
                          <span className="text-white text-xs leading-relaxed">Dashboard managers</span>
                        </li>
                        <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                          <div className="w-4 h-4 rounded-full bg-cyan-glow/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-cyan-glow" />
                          </div>
                          <span className="text-white text-xs leading-relaxed">Point mensuel 1h offert pour analyser vos résultats</span>
                        </li>
                        <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                          <div className="w-4 h-4 rounded-full bg-cyan-glow/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-cyan-glow" />
                          </div>
                          <span className="text-white text-xs leading-relaxed">Gestion multi-utilisateurs</span>
                        </li>
                        <li className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-white/5">
                          <div className="w-4 h-4 rounded-full bg-cyan-glow/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-cyan-glow" />
                          </div>
                          <span className="text-white text-xs leading-relaxed">Support prioritaire</span>
                        </li>
                      </ul>

                      <Button className="w-full bg-cyan-glow text-black hover:bg-cyan-glow/90 text-sm py-4 font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]" onClick={() => window.location.href = '#contact'}>
                        Nous contacter
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-8 text-center text-white/70">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💳</span>
                  <span className="text-sm">Satisfait ou remboursé 14 jours</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔒</span>
                  <span className="text-sm">Paiement 100% sécurisé</span>
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
                  Les données sont-elles fiables ?
                </AccordionTrigger>
                <AccordionContent className="text-white/70 text-lg">
                  Nos données proviennent de sources officielles (INSEE, SIRENE) et sont mises à jour quotidiennement. 
                  Nous enrichissons également les informations via nos algorithmes propriétaires.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-xl font-semibold hover:text-accent">
                  Peut-on l'utiliser partout en France ?
                </AccordionTrigger>
                <AccordionContent className="text-white/70 text-lg">
                  Oui, PULSE couvre l'intégralité du territoire français, de la plus grande ville au plus petit bourg.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-xl font-semibold hover:text-accent">
                  Quelles données vais-je retrouver ?
                </AccordionTrigger>
                <AccordionContent className="text-white/70 text-lg">
                  Chaque semaine nous vous localisons les nouvelles ouvertures d'entreprise, les déménagements en cours, les nouvelles implantations d'entreprises existantes, etc...
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-xl font-semibold hover:text-accent">
                  Puis-je personnaliser mes critères de recherche ?
                </AccordionTrigger>
                <AccordionContent className="text-white/70 text-lg">
                  Absolument ! PULSE vous permet de filtrer par secteur d'activité, zone géographique, taille d'entreprise.
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
            <div className="grid md:grid-cols-4 gap-8 mb-8">
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
                <h4 className="font-bold mb-4">Entreprise</h4>
                <ul className="space-y-2 text-white/60">
                  <li><a href="#" className="hover:text-accent transition-colors">À propos</a></li>
                  <li><a href="#" className="hover:text-accent transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-accent transition-colors">Carrières</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Contact</h4>
                <ul className="space-y-2 text-white/60">
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>contact@pulse.fr</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>01 23 45 67 89</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 text-center text-white/40">
              <p>&copy; 2024 PULSE. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>;
};

// Import X icon
const X = ({
  className
}: {
  className?: string;
}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>;
export default LandingPage;