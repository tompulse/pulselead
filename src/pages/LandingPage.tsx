import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import React from "react";
import { ArrowRight, Target, Zap, TrendingUp, Check, MapPin, BarChart3, Users, Phone, Mail, TrendingDown, FileText, Database, Search, Route, Smartphone, Menu, Building2, Clock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ContactSection from "@/components/landing/ContactSection";

const LandingPage = () => {
  const navigate = useNavigate();

  const heroAnimation = useScrollAnimation({ threshold: 0.2 });
  const problemsAnimation = useScrollAnimation({ threshold: 0.2 });
  const solutionAnimation = useScrollAnimation({ threshold: 0.2 });
  const beforeAfterAnimation = useScrollAnimation({ threshold: 0.2 });
  const pricingAnimation = useScrollAnimation({ threshold: 0.2 });
  const faqAnimation = useScrollAnimation({ threshold: 0.2 });

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'radial-gradient(ellipse at top, hsl(220, 60%, 12%), hsl(220, 60%, 8%), hsl(0, 0%, 0%))'
    }}>
      {/* Vibrant background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-blue-deep/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-xl sm:text-2xl font-bold">
              <span className="text-white">PULSE</span>
              <span className="text-accent">.</span>
            </div>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              <a href="#solution" className="text-sm text-white/60 hover:text-white transition-colors">Fonctionnalités</a>
              <a href="#avantages" className="text-sm text-white/60 hover:text-white transition-colors">Avantages</a>
              <a href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">Tarifs</a>
              <a href="#contact" className="text-sm text-white/60 hover:text-white transition-colors">Contact</a>
            </nav>

            {/* Tablet nav */}
            <nav className="hidden sm:flex lg:hidden items-center gap-4 flex-1 justify-center mx-4">
              <a href="#solution" className="text-xs text-white/60 hover:text-white transition-colors">Fonctionnalités</a>
              <a href="#avantages" className="text-xs text-white/60 hover:text-white transition-colors">Avantages</a>
              <a href="#pricing" className="text-xs text-white/60 hover:text-white transition-colors">Tarifs</a>
              <a href="#contact" className="text-xs text-white/60 hover:text-white transition-colors">Contact</a>
            </nav>

            {/* Desktop buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Button asChild variant="outline" className="border-2 border-accent text-accent hover:bg-accent/10 font-semibold px-6">
                <a href="https://calendly.com/tomiolovpro/pulse" target="_blank" rel="noopener noreferrer">
                  Réserver une démo
                </a>
              </Button>
              <Button onClick={() => navigate('/auth')} className="bg-accent hover:bg-accent/90 text-black font-semibold px-6">
                Connexion
              </Button>
            </div>

            {/* Tablet buttons */}
            <div className="hidden sm:flex lg:hidden items-center gap-2">
              <Button onClick={() => navigate('/auth')} className="bg-accent hover:bg-accent/90 text-black font-semibold h-9 px-4 text-xs">
                Connexion
              </Button>
            </div>

            {/* Mobile menu */}
            <div className="sm:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 bg-card/95 backdrop-blur-xl border-accent/20">
                  <nav className="flex flex-col gap-4 mt-8">
                    <a href="#solution" className="text-lg text-white/80 hover:text-white py-2">Fonctionnalités</a>
                    <a href="#avantages" className="text-lg text-white/80 hover:text-white py-2">Avantages</a>
                    <a href="#pricing" className="text-lg text-white/80 hover:text-white py-2">Tarifs</a>
                    <a href="#contact" className="text-lg text-white/80 hover:text-white py-2">Contact</a>
                    <div className="border-t border-white/10 pt-4 mt-4 space-y-3">
                      <Button asChild variant="outline" className="w-full border-white/20 text-white">
                        <a href="https://calendly.com/tomiolovpro/pulse" target="_blank" rel="noopener noreferrer">
                          Réserver une démo
                        </a>
                      </Button>
                      <Button onClick={() => navigate('/auth')} className="w-full bg-accent text-black font-semibold">
                        Connexion
                      </Button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-12">
        {/* ═══════════════════════════════════════════════════════════════════
            HERO SECTION - Accroche principale
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="pt-0 pb-10 sm:pb-12 px-6 relative z-10">
          <div className="container mx-auto max-w-6xl">
            <div ref={heroAnimation.ref} className={`text-center scroll-reveal ${heroAnimation.isVisible ? 'visible' : ''}`}>
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-accent/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-accent/20 mb-5">
                <Target className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs sm:text-sm text-white/90 font-medium">Essai gratuit 7 jours</span>
              </div>

              {/* Headline - Harmonisé */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] mb-4">
                Vendez plus.
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 bg-clip-text text-transparent">Roulez moins.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-6">
                Liste de prospects filtrée • Tournées optimisées • CRM simple pour suivre vos visites sur le terrain
              </p>

              {/* CTA */}
              <Button 
                onClick={() => navigate('/subscribe')} 
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-6 rounded-xl shadow-2xl hover:shadow-green-500/25 hover:scale-105 transition-all duration-300"
              >
                Commencer maintenant
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              {/* Stats - Encapsulés dans des mini-cards */}
              <div className="mt-8 sm:mt-10 flex justify-center gap-2 sm:gap-6 max-w-3xl mx-auto px-2">
                <div className="glass-card p-2 sm:p-4 border border-accent/20 rounded-xl text-center hover:border-accent/60 hover:shadow-lg hover:shadow-accent/20 hover:scale-105 transition-all duration-300 cursor-default flex-1 max-w-[120px] sm:max-w-none">
                  <div className="text-lg sm:text-3xl md:text-4xl font-bold gradient-text whitespace-nowrap">+1 900</div>
                  <p className="text-white/60 text-[9px] sm:text-sm mt-1">entreprises/sem.</p>
                </div>
                <div className="glass-card p-2 sm:p-4 border border-accent/20 rounded-xl text-center hover:border-accent/60 hover:shadow-lg hover:shadow-accent/20 hover:scale-105 transition-all duration-300 cursor-default flex-1 max-w-[120px] sm:max-w-none">
                  <div className="text-lg sm:text-3xl md:text-4xl font-bold gradient-text">1h30</div>
                  <p className="text-white/60 text-[9px] sm:text-sm mt-1">gagnées/jour</p>
                </div>
                <div className="glass-card p-2 sm:p-4 border border-accent/20 rounded-xl text-center hover:border-accent/60 hover:shadow-lg hover:shadow-accent/20 hover:scale-105 transition-all duration-300 cursor-default flex-1 max-w-[120px] sm:max-w-none">
                  <div className="text-lg sm:text-3xl md:text-4xl font-bold gradient-text">92%</div>
                  <p className="text-white/60 text-[9px] sm:text-sm mt-1">satisfaction</p>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/50">
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

        {/* ═══════════════════════════════════════════════════════════════════
            PROBLEMS SECTION - Le problème
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-14 sm:py-16 px-6 relative z-10" style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(0, 0, 0, 0.3) 100%)',
          borderTop: '1px solid rgba(239, 68, 68, 0.1)',
          borderBottom: '1px solid rgba(239, 68, 68, 0.1)'
        }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={problemsAnimation.ref} className={`scroll-reveal ${problemsAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-10">
                Ce qui vous freine aujourd'hui
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                <Card className="glass-card p-5 sm:p-6 border-white/10 hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/20 hover:scale-[1.02] transition-all duration-300 cursor-default">
                  <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mb-3" />
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Aucune visibilité secteur</h3>
                  <p className="text-white/60 text-sm sm:text-base">Impossible de savoir où sont vos prospects, qui cibler en priorité</p>
                </Card>
                <Card className="glass-card p-5 sm:p-6 border-white/10 hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/20 hover:scale-[1.02] transition-all duration-300 cursor-default">
                  <Route className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mb-3" />
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Trajets improvisés</h3>
                  <p className="text-white/60 text-sm sm:text-base">Des kilomètres inutiles, du temps perdu, moins de visites</p>
                </Card>
                <Card className="glass-card p-5 sm:p-6 border-white/10 hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/20 hover:scale-[1.02] transition-all duration-300 cursor-default">
                  <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mb-3" />
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Données éparpillées</h3>
                  <p className="text-white/60 text-sm sm:text-base">Excel, carnets, post-its... Relances oubliées, historique perdu</p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SOLUTION SECTION - Fonctionnalités PULSE
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="solution" className="py-14 sm:py-16 px-6 scroll-mt-20 relative z-10" style={{
          background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
          borderTop: '1px solid rgba(6, 182, 212, 0.15)',
          borderBottom: '1px solid rgba(6, 182, 212, 0.15)'
        }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={solutionAnimation.ref} className={`scroll-reveal ${solutionAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4">
                Fonctionnalités <span className="gradient-text">PULSE</span>
              </h2>
              <p className="text-lg sm:text-xl text-white/60 text-center mb-8 sm:mb-10 max-w-2xl mx-auto">
                Contrôlez votre territoire, optimisez chaque action commerciale
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
                <div className="text-center space-y-3 group cursor-default">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-4 border border-accent/30 shadow-lg shadow-accent/10 group-hover:border-accent/60 group-hover:shadow-xl group-hover:shadow-accent/30 group-hover:scale-110 transition-all duration-300">
                    <Target className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold group-hover:text-accent transition-colors duration-300">Liste de prospects filtrée</h3>
                  <p className="text-white/60 text-sm sm:text-base">
                    Accédez à toutes les nouvelles entreprises créées en France. Filtrez par code NAF, département, taille, etc.
                  </p>
                </div>
                <div className="text-center space-y-3 group cursor-default">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-4 border border-accent/30 shadow-lg shadow-accent/10 group-hover:border-accent/60 group-hover:shadow-xl group-hover:shadow-accent/30 group-hover:scale-110 transition-all duration-300">
                    <Route className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold group-hover:text-accent transition-colors duration-300">Tournées optimisées IA</h3>
                  <p className="text-white/60 text-sm sm:text-base">
                    Sélectionnez vos prospects, créez votre tournée, l'IA calcule l'itinéraire optimal
                  </p>
                </div>
                <div className="text-center space-y-3 group cursor-default">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-4 border border-accent/30 shadow-lg shadow-accent/10 group-hover:border-accent/60 group-hover:shadow-xl group-hover:shadow-accent/30 group-hover:scale-110 transition-all duration-300">
                    <Smartphone className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold group-hover:text-accent transition-colors duration-300">CRM terrain simple</h3>
                  <p className="text-white/60 text-sm sm:text-base">
                    Suivez vos visites, appels et relances depuis votre mobile. Simple, rapide, efficace
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            BEFORE/AFTER SECTION - Transformation
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="avantages" className="py-14 sm:py-16 px-6 scroll-mt-20 relative z-10" style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(0, 0, 0, 0.3) 100%)',
          borderTop: '1px solid rgba(16, 185, 129, 0.15)',
          borderBottom: '1px solid rgba(16, 185, 129, 0.15)'
        }}>
          <div className="container mx-auto max-w-5xl">
            <div ref={beforeAfterAnimation.ref} className={`scroll-reveal ${beforeAfterAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8">
                Avant / Après <span className="gradient-text">PULSE</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Before */}
                <Card className="glass-card p-6 sm:p-8 border-red-500/30 hover:border-red-500/60 hover:shadow-xl hover:shadow-red-500/20 hover:scale-[1.02] transition-all duration-300 cursor-default">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                      <TrendingDown className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold">Sans PULSE</h3>
                  </div>
                  <ul className="space-y-4 text-sm sm:text-base text-white/70">
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1 text-lg">✗</span>
                      <span>RDV manqués et opportunités perdues faute de suivi</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1 text-lg">✗</span>
                      <span>Journées à tourner en rond sans stratégie terrain</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1 text-lg">✗</span>
                      <span>Relances oubliées, prospects jamais recontactés</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1 text-lg">✗</span>
                      <span>Fin de mois stressante sans visibilité pipeline</span>
                    </li>
                  </ul>
                </Card>

                {/* After */}
                <Card className="glass-card p-6 sm:p-8 border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-xl hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all duration-300 cursor-default">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold">Avec PULSE</h3>
                  </div>
                  <ul className="space-y-4 text-sm sm:text-base text-white/70">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span><strong className="text-emerald-400">+30%</strong> de nouveaux RDV grâce au ciblage</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Tournées optimisées : plus de visites, moins de km</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Relances programmées, aucun prospect oublié</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Pipeline clair : vous savez où vous en êtes</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            PRICING SECTION - Tarification
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="pricing" className="py-14 sm:py-16 px-6 scroll-mt-20 relative z-10" style={{
          background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.03) 0%, rgba(0, 0, 0, 0.5) 100%)',
          borderTop: '2px solid rgba(6, 182, 212, 0.2)'
        }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={pricingAnimation.ref} className={`scroll-reveal ${pricingAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4">
                Choisissez votre formule <span className="gradient-text">PULSE</span>
              </h2>
              <p className="text-lg sm:text-xl text-white/60 text-center mb-8 max-w-2xl mx-auto">
                Structurez votre prospection, optimisez chaque visite
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
                {/* Commercial Solo */}
                <Card className="relative overflow-visible flex flex-col hover:scale-[1.02] transition-all duration-300 cursor-default" style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(14, 165, 233, 0.08) 100%)',
                  border: '2px solid rgba(6, 182, 212, 0.5)',
                  boxShadow: '0 25px 70px -15px rgba(6, 182, 212, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                }}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-lg z-10 whitespace-nowrap">
                    🎁 7 JOURS D'ESSAI GRATUIT
                  </div>
                  <div className="p-5 sm:p-6 pt-8 flex flex-col flex-1">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-center gradient-text">Commercial Solo</h3>
                    <div className="mb-5 text-center py-3 px-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(6,182,212,0.2)' }}>
                      <div className="flex items-baseline justify-center gap-2 mb-1">
                        <span className="text-4xl sm:text-5xl font-bold gradient-text">49€</span>
                        <span className="text-base text-white/60">/mois</span>
                      </div>
                      <p className="text-sm text-white/50">Sans engagement • Résiliable à tout moment</p>
                    </div>
                    <ul className="space-y-2 mb-5 flex-1">
                      {[
                        { icon: Target, label: "Liste de prospects filtrée", desc: "Nouvelles entreprises selon vos critères" },
                        { icon: Route, label: "Tournées optimisées IA", desc: "Moins de route, plus de RDV" },
                        { icon: Smartphone, label: "CRM mobile terrain", desc: "Visites et relances depuis votre poche" },
                        { icon: Search, label: "Filtres intelligents", desc: "Code NAF, département, taille, juridique, siège social, date" },
                        { icon: BarChart3, label: "Pipeline Kanban", desc: "Du contact à la signature" },
                        { icon: Clock, label: "Suivi des relances", desc: "Programmez vos rappels" },
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-all">
                          <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <item.icon className="w-3 h-3 text-accent" />
                          </div>
                          <div>
                            <span className="text-white text-sm font-semibold">{item.label}</span>
                            <p className="text-white/50 text-xs">{item.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 py-5 font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all mt-auto" onClick={() => navigate('/subscribe')}>
                      Commencer maintenant
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </Card>

                {/* Équipes Commerciales */}
                <Card className="relative overflow-visible flex flex-col hover:scale-[1.02] transition-all duration-300 cursor-default" style={{
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
                  border: '2px solid rgba(14, 165, 233, 0.3)',
                  boxShadow: '0 20px 60px -10px rgba(14, 165, 233, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="p-5 sm:p-6 flex flex-col flex-1">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-center gradient-text">Équipes Commerciales</h3>
                    <div className="mb-5 text-center py-3 px-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(14,165,233,0.2)' }}>
                      <span className="text-3xl sm:text-4xl font-bold gradient-text">Sur devis</span>
                      <p className="text-xs text-white/50 mt-2">Pour les équipes ambitieuses</p>
                    </div>
                    <ul className="space-y-2 mb-5 flex-1">
                      {[
                        { icon: Check, label: "Tout PULSE inclus", desc: "Toutes les fonctionnalités standard" },
                        { icon: Users, label: "Équipes illimitées", desc: "Invitez tous vos commerciaux" },
                        { icon: Sparkles, label: "Onboarding personnalisé", desc: "Formation dédiée" },
                        { icon: Phone, label: "Support prioritaire", desc: "Réponse sous 24h garantie" },
                        { icon: TrendingUp, label: "Session d'analyse mensuelle", desc: "Optimisez vos performances" },
                        { icon: Building2, label: "Intégrations sur mesure", desc: "Connectez vos outils" },
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-all">
                          <div className="w-5 h-5 rounded-full bg-cyan-glow/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <item.icon className="w-3 h-3 text-cyan-glow" />
                          </div>
                          <div>
                            <span className="text-white text-sm font-semibold">{item.label}</span>
                            <p className="text-white/50 text-xs">{item.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full bg-cyan-glow text-black hover:bg-cyan-glow/90 py-5 font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all mt-auto" onClick={() => navigate('/subscribe')}>
                      Demander un devis
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Conforme RGPD</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔒</span>
                  <span>Paiement 100% sécurisé</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-accent" />
                  <span>Données publiques officielles</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            FAQ SECTION
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-10 sm:py-12 px-6 relative z-10" style={{
          background: 'radial-gradient(ellipse at bottom, rgba(6, 182, 212, 0.06) 0%, transparent 60%)'
        }}>
          <div className="container mx-auto max-w-5xl">
            <div ref={faqAnimation.ref} className={`scroll-reveal ${faqAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6">Vos questions, nos réponses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
                {[
                  { q: "Comment PULSE structure ma prospection ?", a: "PULSE vous donne une vision complète de votre territoire avec tous vos prospects, des tournées calculées automatiquement pour optimiser vos déplacements, et un CRM mobile pour suivre chaque action." },
                  { q: "Les données sont-elles fiables ?", a: "Nos données proviennent de sources officielles (INSEE, SIRENE) et sont mises à jour quotidiennement." },
                  { q: "Peut-on l'utiliser partout en France ?", a: "Oui, PULSE couvre l'intégralité du territoire français métropolitain." },
                  { q: "Comment fonctionne l'essai gratuit ?", a: "Vous bénéficiez de 7 jours d'accès complet à toutes les fonctionnalités. Annulez à tout moment sans frais." },
                  { q: "Puis-je personnaliser mes critères ?", a: "Absolument ! Filtrez par code NAF, département, taille d'entreprise, catégorie juridique, siège social et date de création." },
                  { q: "Y a-t-il un engagement ?", a: "Non, PULSE est sans engagement. Vous pouvez résilier à tout moment depuis votre espace client." }
                ].map((item, i) => (
                  <Accordion key={i} type="single" collapsible>
                    <AccordionItem value={`item-${i}`} className="border border-white/10 rounded-lg px-4 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300">
                      <AccordionTrigger className="text-sm sm:text-base font-semibold hover:text-accent py-3">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-white/70 text-sm pb-3">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}
              </div>
            </div>
          </div>
        </section>

        <ContactSection />

        {/* ═══════════════════════════════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════════════════════════════ */}
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
                  <li><a href="#solution" className="hover:text-accent transition-colors">Fonctionnalités</a></li>
                  <li><a href="#pricing" className="hover:text-accent transition-colors">Tarifs</a></li>
                  <li><a href="https://calendly.com/tomiolovpro/pulse" className="hover:text-accent transition-colors">Démo</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Contact</h4>
                <ul className="space-y-2 text-white/60">
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <a href="mailto:tomiolovpro@gmail.com" className="hover:text-accent transition-colors">tomiolovpro@gmail.com</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white/40 text-sm">
              <p>© 2026 PULSE. Tous droits réservés.</p>
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
          <Button onClick={() => navigate('/subscribe')} className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 rounded-full shadow-lg shadow-green-500/40">
            Commencer maintenant
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;