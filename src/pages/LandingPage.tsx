import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { 
  ArrowRight, Star, AlertCircle, Clock, 
  Target, Zap, TrendingUp, Check, Sparkles, Quote, Map, User,
  MapPin, BarChart3, Users, ChevronDown, Phone, Mail,
  TrendingDown, FileText, Database, Search, Route, Smartphone
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import ContactSection from "@/components/landing/ContactSection";

const LandingPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  
  // Scroll animations
  const heroAnimation = useScrollAnimation({ threshold: 0.2 });
  const problemsAnimation = useScrollAnimation({ threshold: 0.2 });
  const solutionAnimation = useScrollAnimation({ threshold: 0.2 });
  const beforeAfterAnimation = useScrollAnimation({ threshold: 0.2 });
  const featuresAnimation = useScrollAnimation({ threshold: 0.2 });
  const pricingAnimation = useScrollAnimation({ threshold: 0.2 });
  const faqAnimation = useScrollAnimation({ threshold: 0.2 });

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
      billingDetails: ''
    },
    yearly: { 
      originalPrice: 59, 
      discountedPrice: 41, 
      label: 'Annuel',
      billingDetails: ''
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at top, hsl(220, 60%, 12%), hsl(220, 60%, 8%), hsl(0, 0%, 0%))' }}>
      {/* Decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Large glowing orb top right */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        {/* Medium glowing orb bottom left */}
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-cyan-glow/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }}></div>
      </div>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-blue-deep/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              <span className="text-white">PULSE</span>
              <span className="text-accent ml-1">.</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#solution" className="text-white/70 hover:text-accent transition-colors">Fonctionnalités</a>
              <a href="#avantages" className="text-white/70 hover:text-accent transition-colors">Avantages</a>
              <a href="#pricing" className="text-white/70 hover:text-accent transition-colors">Tarif</a>
              <a href="#contact" className="text-white/70 hover:text-accent transition-colors">Contact</a>
            </nav>

            <div className="flex items-center gap-4">
              <Button 
                asChild
                className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <a href="https://calendly.com/tomiolovpro/30min?month=2025-11" target="_blank" rel="noopener noreferrer">
                  Je réserve ma démo
                </a>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="border-accent/50 text-accent hover:bg-accent hover:text-black"
              >
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
            <div ref={heroAnimation.ref} className={`text-center space-y-6 scroll-reveal ${heroAnimation.isVisible ? 'visible' : ''}`}>
              <h1 className="text-6xl md:text-7xl font-bold leading-tight">
                Prospectez les <span className="gradient-text">nouvelles entreprises</span><br />
                avant vos concurrents
              </h1>
              <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto">
                PULSE détecte automatiquement les mouvements d'entreprises (créations, déménagements, ventes de fonds, nouvelles implantations) dans votre zone et génère vos tournées optimisées.
              </p>
              <div className="flex justify-center pt-6">
                <Button 
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="btn-hero text-xl px-12 py-6"
                >
                  Je me lance
                  <ArrowRight className="ml-2" />
                </Button>
              </div>

              {/* Stats Section */}
              <div className="mt-12 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {/* Stat 1 */}
                <div className="text-center space-y-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <div className="text-5xl font-bold gradient-text">+850</div>
                  <p className="text-white/70 text-lg">entreprises détectées en moyenne chaque semaine</p>
                </div>
                
                {/* Stat 2 */}
                <div className="text-center space-y-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div className="text-5xl font-bold gradient-text">13</div>
                  <p className="text-white/70 text-lg">commerciaux font confiance à PULSE</p>
                </div>
                
                {/* Stat 3 */}
                <div className="text-center space-y-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <div className="text-5xl font-bold gradient-text">92%</div>
                  <p className="text-white/70 text-lg">de satisfaction client</p>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/50 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Conforme RGPD</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-accent" />
                  <span>Données publiques officielles</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accent" />
                  <span>Sources INSEE & Infogreffe</span>
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
              <h2 className="text-5xl font-bold text-center mb-8">Ce qui tue votre chiffre d'affaires</h2>
              <div className="grid md:grid-cols-3 gap-8">
              <Card className="glass-card p-8 border-white/10 hover:border-accent/50 transition-all">
                <TrendingDown className="w-12 h-12 text-accent mb-4" />
                <h3 className="text-2xl font-bold mb-3">Temps gaspillé</h3>
                <p className="text-white/70 text-lg">40% de votre journée perdue sur la route au lieu de vendre</p>
              </Card>
              <Card className="glass-card p-8 border-white/10 hover:border-accent/50 transition-all">
                <FileText className="w-12 h-12 text-accent mb-4" />
                <h3 className="text-2xl font-bold mb-3">Chaos organisationnel</h3>
                <p className="text-white/70 text-lg">Impossible de retrouver l'info au bon moment</p>
              </Card>
              <Card className="glass-card p-8 border-white/10 hover:border-accent/50 transition-all">
                <AlertCircle className="w-12 h-12 text-accent mb-4" />
                <h3 className="text-2xl font-bold mb-3">Concurrence imbattable</h3>
                <p className="text-white/70 text-lg">Ils signent avant même que vous sachiez que le prospect existe</p>
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
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
                Votre arsenal pour <span className="gradient-text">dominer</span> votre territoire
              </h2>
              <p className="text-xl text-white/60 text-center mb-10 max-w-2xl mx-auto">
                Détectez avant tout le monde, agissez plus vite, convertissez davantage
              </p>
              <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-6 border border-accent/20">
                  <Search className="w-12 h-12 text-accent" />
                </div>
                <h3 className="text-2xl font-bold">Détection Ultra-Rapide</h3>
                <p className="text-white/70 text-lg leading-relaxed">
                  Accédez en temps réel aux mouvements d'entreprises : créations, déménagements, ventes de fonds de commerce et nouvelles implantations partout en France
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-6 border border-accent/20">
                  <Route className="w-12 h-12 text-accent" />
                </div>
                <h3 className="text-2xl font-bold">Itinéraires Redoutables</h3>
                <p className="text-white/70 text-lg leading-relaxed">
                  Visitez 2x plus de prospects par jour grâce à l'optimisation automatique de vos trajets
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-6 border border-accent/20">
                  <Smartphone className="w-12 h-12 text-accent" />
                </div>
                <h3 className="text-2xl font-bold">Zéro Opportunité Perdue</h3>
                <p className="text-white/70 text-lg leading-relaxed">
                  Suivez chaque prospect, relancez au bon moment, transformez plus de contacts en contrats signés
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
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">L'impact immédiat sur vos résultats</h2>
              <p className="text-xl text-white/60 text-center mb-10 max-w-2xl mx-auto">
                Moins de kilomètres, plus de rendez-vous, meilleure conversion
              </p>
              <div className="grid md:grid-cols-2 gap-12">
              <Card className="glass-card p-10 border-red-500/30">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold">Sans PULSE</h3>
                </div>
                <ul className="space-y-5 text-base md:text-lg text-white/70">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1 text-xl">✗</span>
                    <span>La concurrence signe pendant que vous cherchez des prospects</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1 text-xl">✗</span>
                    <span>Des heures de route pour 3 rendez-vous ratés</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1 text-xl">✗</span>
                    <span>Prospects chauds refroidis faute de suivi</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1 text-xl">✗</span>
                    <span>Organisation catastrophique = CA qui stagne</span>
                  </li>
                </ul>
              </Card>
              <Card className="glass-card p-10 border-accent/50">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold">Avec PULSE</h3>
                </div>
                <ul className="space-y-5 text-base md:text-lg text-white/70">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <span>Prospects qualifiés livrés chaque semaine dans votre boîte</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <span>Itinéraires calculés en 30 sec : 2x plus de visites/jour</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <span>Aucune relance manquée, conversion maximale</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <span>Tout centralisé : focus 100% sur la vente</span>
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
          <div className="container mx-auto max-w-6xl">
            <div ref={pricingAnimation.ref} className={`scroll-reveal ${pricingAnimation.isVisible ? 'visible' : ''}`}>
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-full font-bold shadow-lg">
                  <Sparkles className="w-5 h-5" />
                  Offre de lancement -30% • Jusqu'au 31 Décembre 2025
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Notre offre unique</h2>
              <p className="text-xl text-white/60 text-center mb-8 max-w-2xl mx-auto">
                Choisissez la formule qui correspond à vos ambitions
              </p>
              
              {/* Pricing Cards */}
              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Card 1: Commercial Seul */}
                <div className="space-y-4">
                  {/* Plan Toggle for Commercial Seul */}
                  <div className="flex justify-center">
                    <div className="inline-flex rounded-lg p-1" style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(6, 182, 212, 0.2)'
                    }}>
                      <button
                        onClick={() => setSelectedPlan('monthly')}
                        className={`px-5 py-2.5 rounded-md text-sm font-semibold transition-all ${
                          selectedPlan === 'monthly'
                            ? 'bg-accent text-black shadow-lg'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        Mensuel
                      </button>
                      <button
                        onClick={() => setSelectedPlan('quarterly')}
                        className={`px-5 py-2.5 rounded-md text-sm font-semibold transition-all ${
                          selectedPlan === 'quarterly'
                            ? 'bg-accent text-black shadow-lg'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        Trimestriel
                      </button>
                      <button
                        onClick={() => setSelectedPlan('yearly')}
                        className={`px-5 py-2.5 rounded-md text-sm font-semibold transition-all ${
                          selectedPlan === 'yearly'
                            ? 'bg-accent text-black shadow-lg'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        Annuel
                      </button>
                    </div>
                  </div>

                  <Card className="relative overflow-visible" style={{
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%)',
                    border: '2px solid rgba(6, 182, 212, 0.3)',
                    boxShadow: '0 20px 60px -10px rgba(6, 182, 212, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-black px-6 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-lg z-10">
                      COMMERCIAL
                    </div>
                    <div className="p-6 md:p-8 pt-10">
                      <h3 className="text-2xl md:text-3xl font-bold mb-3 text-center gradient-text">Performance</h3>
                      <div className="mb-6 text-center py-3 px-4 rounded-xl" style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(6, 182, 212, 0.2)'
                      }}>
                        <div className="flex items-baseline justify-center gap-2 mb-1">
                          <span className="text-5xl md:text-6xl font-bold gradient-text">
                            {pricingPlans[selectedPlan].discountedPrice}€
                          </span>
                          <span className="text-2xl text-white/40 line-through">
                            {pricingPlans[selectedPlan].originalPrice}€
                          </span>
                        </div>
                        <p className="text-lg text-white/60 font-semibold">/mois</p>
                        <p className="text-sm text-white/50 mt-1">
                          {pricingPlans[selectedPlan].billingDetails}
                        </p>
                        <div className="inline-flex items-center bg-green-600/20 text-green-500 px-3 py-1 rounded-full text-xs font-bold mt-2">
                          -30% de réduction
                        </div>
                      </div>
                      <ul className="space-y-2.5 mb-6">
                        <li className="flex items-start gap-2.5 p-2 rounded-lg transition-all hover:bg-white/5">
                          <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-accent" />
                          </div>
                          <span className="text-white text-sm leading-relaxed">Chaque semaine toutes les nouvelles entreprises sur votre secteur (déménagements, nouvelles implantations, créations...)</span>
                        </li>
                        <li className="flex items-start gap-2.5 p-2 rounded-lg transition-all hover:bg-white/5">
                          <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-accent" />
                          </div>
                          <span className="text-white text-sm leading-relaxed">Mapping automatique géolocalisé</span>
                        </li>
                        <li className="flex items-start gap-2.5 p-2 rounded-lg transition-all hover:bg-white/5">
                          <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-accent" />
                          </div>
                          <span className="text-white text-sm leading-relaxed">Création de tournées optimisées</span>
                        </li>
                        <li className="flex items-start gap-2.5 p-2 rounded-lg transition-all hover:bg-white/5">
                          <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-accent" />
                          </div>
                          <span className="text-white text-sm leading-relaxed">CRM dédié à la prospection et suivi pipeline</span>
                        </li>
                        <li className="flex items-start gap-2.5 p-2 rounded-lg transition-all hover:bg-white/5">
                          <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-accent" />
                          </div>
                          <span className="text-white text-sm leading-relaxed">Support WhatsApp</span>
                        </li>
                      </ul>
                      <Button 
                        className="w-full bg-accent text-black hover:bg-accent/90 text-base py-5 font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]"
                        onClick={() => navigate('/auth')}
                      >
                        Démarrer maintenant
                        <ArrowRight className="ml-2" />
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Card 2: Équipes Commerciales */}
                <div className="space-y-4">
                  {/* Spacer to align with the first card that has the plan toggle */}
                  <div className="h-[52px]"></div>

                  <Card className="relative overflow-visible" style={{
                    background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
                    border: '2px solid rgba(14, 165, 233, 0.3)',
                    boxShadow: '0 20px 60px -10px rgba(14, 165, 233, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-black px-6 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-lg z-10">
                      ENTREPRISE
                    </div>
                    <div className="p-6 md:p-8 pt-10">
                      <h3 className="text-2xl md:text-3xl font-bold mb-3 text-center gradient-text">Équipes commerciales</h3>
                      <div className="mb-6 text-center py-3 px-4 rounded-xl" style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(14, 165, 233, 0.2)'
                      }}>
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-5xl md:text-6xl font-bold gradient-text">
                            Sur devis
                          </span>
                        </div>
                      </div>
                      <ul className="space-y-2.5 mb-6">
                        <li className="flex items-start gap-2.5 p-2 rounded-lg transition-all hover:bg-white/5">
                          <div className="w-4 h-4 rounded-full bg-cyan-glow/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-cyan-glow" />
                          </div>
                          <span className="text-white text-sm leading-relaxed">Toutes les fonctionnalités Performance</span>
                        </li>
                        <li className="flex items-start gap-2.5 p-2 rounded-lg transition-all hover:bg-white/5">
                          <div className="w-4 h-4 rounded-full bg-cyan-glow/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-cyan-glow" />
                          </div>
                          <span className="text-white text-sm leading-relaxed">Gestion multi-utilisateurs</span>
                        </li>
                        <li className="flex items-start gap-2.5 p-2 rounded-lg transition-all hover:bg-white/5">
                          <div className="w-4 h-4 rounded-full bg-cyan-glow/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-cyan-glow" />
                          </div>
                          <span className="text-white text-sm leading-relaxed">Tableau de bord manager</span>
                        </li>
                        <li className="flex items-start gap-2.5 p-2 rounded-lg transition-all hover:bg-white/5">
                          <div className="w-4 h-4 rounded-full bg-cyan-glow/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-cyan-glow" />
                          </div>
                          <span className="text-white text-sm leading-relaxed">Support prioritaire</span>
                        </li>
                        <li className="flex items-start gap-2.5 p-2 rounded-lg transition-all hover:bg-white/5">
                          <div className="w-4 h-4 rounded-full bg-cyan-glow/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-cyan-glow" />
                          </div>
                          <span className="text-white text-sm leading-relaxed">Formation sur mesure</span>
                        </li>
                      </ul>
                      <Button 
                        className="w-full bg-cyan-glow text-black hover:bg-cyan-glow/90 text-base py-5 font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]"
                        onClick={() => window.location.href = '#contact'}
                      >
                        Nous contacter
                        <ArrowRight className="ml-2" />
                      </Button>
                    </div>
                  </Card>
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
              <h2 className="text-5xl font-bold text-center mb-8">Vos questions, nos réponses</h2>
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
    </div>
  );
};

// Import X icon
const X = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default LandingPage;
