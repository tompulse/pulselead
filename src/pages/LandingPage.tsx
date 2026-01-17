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
    <div className="min-h-screen relative overflow-hidden bg-[#0a0f1a]">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1a]/90 backdrop-blur-xl border-b border-white/5">
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
              <Button asChild variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5">
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
                <SheetContent side="right" className="w-72 bg-[#0a0f1a] border-white/10">
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

      <main className="pt-20">
        {/* ═══════════════════════════════════════════════════════════════════
            HERO SECTION - Accroche principale
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 lg:py-28 px-6">
          <div className="container mx-auto max-w-5xl">
            <div ref={heroAnimation.ref} className={`text-center scroll-reveal ${heroAnimation.isVisible ? 'visible' : ''}`}>
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full border border-accent/20 mb-8">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-sm text-white/80">7 jours d'essai gratuit • Sans engagement</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
                Trouvez vos clients.
                <br />
                <span className="bg-gradient-to-r from-accent via-cyan-400 to-accent bg-clip-text text-transparent">
                  Pas votre chemin.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10">
                PULSE détecte les nouvelles entreprises de votre secteur, optimise vos tournées et centralise votre suivi commercial.
              </p>

              {/* CTA */}
              <Button 
                onClick={() => navigate('/subscribe')} 
                className="bg-accent hover:bg-accent/90 text-black font-bold text-lg px-10 py-7 rounded-xl shadow-2xl shadow-accent/20 hover:shadow-accent/30 hover:scale-[1.02] transition-all"
              >
                Commencer gratuitement
                <ArrowRight className="ml-3 w-5 h-5" />
              </Button>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-accent">+1 900</div>
                  <p className="text-white/50 text-sm mt-1">entreprises/semaine</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-accent">1h30</div>
                  <p className="text-white/50 text-sm mt-1">gagnées/jour</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-accent">92%</div>
                  <p className="text-white/50 text-sm mt-1">de satisfaction</p>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-white/40">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Conforme RGPD</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-accent" />
                  <span>Données INSEE officielles</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            PROBLEMS SECTION - Le problème que vous résolvez
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-24 px-6">
          <div className="container mx-auto max-w-5xl">
            <div ref={problemsAnimation.ref} className={`scroll-reveal ${problemsAnimation.isVisible ? 'visible' : ''}`}>
              
              <div className="text-center mb-14">
                <span className="text-red-400/70 text-xs font-semibold uppercase tracking-widest">Le constat</span>
                <h2 className="text-3xl sm:text-4xl font-bold mt-4">
                  Vous perdez du temps et des opportunités
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/[0.02] border-white/5 p-6 hover:border-red-500/20 transition-colors">
                  <MapPin className="w-8 h-8 text-red-400/70 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune visibilité terrain</h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    Vous ne savez pas où sont vos prospects ni lesquels cibler en priorité.
                  </p>
                </Card>

                <Card className="bg-white/[0.02] border-white/5 p-6 hover:border-red-500/20 transition-colors">
                  <FileText className="w-8 h-8 text-red-400/70 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Données éparpillées</h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    Excel, carnets, post-its... Vos informations sont perdues et inutilisables.
                  </p>
                </Card>

                <Card className="bg-white/[0.02] border-white/5 p-6 hover:border-red-500/20 transition-colors">
                  <Route className="w-8 h-8 text-red-400/70 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Trajets improvisés</h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    Des kilomètres inutiles, du temps perdu, moins de visites par jour.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SOLUTION SECTION - Comment PULSE résout le problème
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="solution" className="py-20 sm:py-24 px-6 scroll-mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.02] via-accent/[0.04] to-accent/[0.02] pointer-events-none"></div>
          
          <div className="container mx-auto max-w-5xl relative">
            <div ref={solutionAnimation.ref} className={`scroll-reveal ${solutionAnimation.isVisible ? 'visible' : ''}`}>
              
              <div className="text-center mb-14">
                <span className="text-accent text-xs font-semibold uppercase tracking-widest">La solution</span>
                <h2 className="text-3xl sm:text-4xl font-bold mt-4">
                  Tout ce qu'il vous faut pour prospecter
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Target className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Prospects qualifiés</h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    Accédez aux nouvelles entreprises créées chaque semaine. Filtrez par zone, secteur et taille.
                  </p>
                </div>

                <div className="text-center group">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Route className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Tournées optimisées</h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    L'IA calcule le meilleur itinéraire. Moins de route, plus de rendez-vous.
                  </p>
                </div>

                <div className="text-center group">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Smartphone className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">CRM mobile</h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    Suivez vos visites et relances depuis votre téléphone. Simple et efficace.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            BEFORE/AFTER SECTION - Transformation
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="avantages" className="py-20 sm:py-24 px-6 scroll-mt-20">
          <div className="container mx-auto max-w-4xl">
            <div ref={beforeAfterAnimation.ref} className={`scroll-reveal ${beforeAfterAnimation.isVisible ? 'visible' : ''}`}>
              
              <div className="text-center mb-14">
                <span className="text-white/40 text-xs font-semibold uppercase tracking-widest">Transformation</span>
                <h2 className="text-3xl sm:text-4xl font-bold mt-4">
                  Avant / Après <span className="text-accent">PULSE</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Before */}
                <Card className="bg-red-500/[0.03] border-red-500/10 p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    </div>
                    <span className="font-semibold text-lg">Sans PULSE</span>
                  </div>
                  <ul className="space-y-4">
                    {[
                      "Opportunités perdues faute de suivi",
                      "Journées improvisées sans stratégie",
                      "Relances oubliées, prospects jamais recontactés",
                      "Fin de mois stressante"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-white/60">
                        <span className="text-red-400 mt-0.5">✕</span>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* After */}
                <Card className="bg-emerald-500/[0.03] border-emerald-500/10 p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="font-semibold text-lg">Avec PULSE</span>
                  </div>
                  <ul className="space-y-4">
                    {[
                      "+30% de RDV grâce au ciblage précis",
                      "Tournées planifiées, temps optimisé",
                      "Relances programmées, rien n'est oublié",
                      "Pipeline clair, objectifs maîtrisés"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-white/60">
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            PRICING SECTION - Tarification
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="pricing" className="py-20 sm:py-24 px-6 scroll-mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.02] via-accent/[0.04] to-accent/[0.02] pointer-events-none"></div>
          
          <div className="container mx-auto max-w-5xl relative">
            <div ref={pricingAnimation.ref} className={`scroll-reveal ${pricingAnimation.isVisible ? 'visible' : ''}`}>
              
              <div className="text-center mb-14">
                <span className="text-accent text-xs font-semibold uppercase tracking-widest">Tarifs</span>
                <h2 className="text-3xl sm:text-4xl font-bold mt-4">
                  Un prix simple, tout inclus
                </h2>
                <p className="text-white/50 mt-3">Sans engagement • Annulable à tout moment</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
                
                {/* Commercial Solo */}
                <Card className="relative bg-accent/[0.05] border-accent/30 p-6 sm:p-8">
                  <div className="absolute -top-3 left-6 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    7 JOURS GRATUITS
                  </div>
                  
                  <h3 className="text-2xl font-bold text-accent mt-2">Commercial Solo</h3>
                  <p className="text-white/50 text-sm mt-1 mb-6">Pour les commerciaux indépendants</p>
                  
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold">49€</span>
                    <span className="text-white/50">/mois</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {[
                      { icon: Target, text: "Liste de prospects filtrée" },
                      { icon: Route, text: "Tournées optimisées IA" },
                      { icon: Smartphone, text: "CRM mobile terrain" },
                      { icon: Search, text: "Filtres avancés (NAF, taille, zone)" },
                      { icon: BarChart3, text: "Pipeline Kanban" },
                      { icon: Clock, text: "Suivi des relances" },
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <item.icon className="w-4 h-4 text-accent flex-shrink-0" />
                        <span className="text-white/70">{item.text}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => navigate('/subscribe')} 
                    className="w-full bg-accent hover:bg-accent/90 text-black font-semibold py-6"
                  >
                    Démarrer l'essai gratuit
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Card>

                {/* Équipes */}
                <Card className="bg-white/[0.02] border-white/10 p-6 sm:p-8">
                  <h3 className="text-2xl font-bold">Équipes Commerciales</h3>
                  <p className="text-white/50 text-sm mt-1 mb-6">Pour les équipes ambitieuses</p>
                  
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold">Sur devis</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {[
                      { icon: Check, text: "Tout PULSE inclus" },
                      { icon: Users, text: "Utilisateurs illimités" },
                      { icon: Sparkles, text: "Onboarding personnalisé" },
                      { icon: Phone, text: "Support prioritaire" },
                      { icon: TrendingUp, text: "Analyse mensuelle" },
                      { icon: Building2, text: "Intégrations sur mesure" },
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <item.icon className="w-4 h-4 text-white/40 flex-shrink-0" />
                        <span className="text-white/60">{item.text}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={() => navigate('/subscribe')} 
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/5 py-6"
                  >
                    Demander un devis
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Card>
              </div>

              {/* Trust */}
              <div className="flex flex-wrap justify-center gap-8 mt-10 text-sm text-white/40">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Paiement sécurisé</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Annulation en 2 clics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Données conservées</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            FAQ SECTION
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-24 px-6">
          <div className="container mx-auto max-w-3xl">
            <div ref={faqAnimation.ref} className={`scroll-reveal ${faqAnimation.isVisible ? 'visible' : ''}`}>
              
              <div className="text-center mb-14">
                <span className="text-white/40 text-xs font-semibold uppercase tracking-widest">FAQ</span>
                <h2 className="text-3xl sm:text-4xl font-bold mt-4">
                  Questions fréquentes
                </h2>
              </div>
              <Accordion type="single" collapsible className="space-y-3">
                {[
                  {
                    q: "D'où viennent les données ?",
                    a: "Toutes nos données proviennent de sources officielles (INSEE, SIRENE) et sont mises à jour quotidiennement."
                  },
                  {
                    q: "PULSE fonctionne-t-il partout en France ?",
                    a: "Oui, PULSE couvre l'intégralité du territoire français métropolitain."
                  },
                  {
                    q: "Comment fonctionne l'essai gratuit ?",
                    a: "Vous bénéficiez de 7 jours d'accès complet à toutes les fonctionnalités. Annulez à tout moment sans frais."
                  },
                  {
                    q: "Puis-je personnaliser mes critères de recherche ?",
                    a: "Absolument. Filtrez par département, secteur d'activité (code NAF), taille d'entreprise et forme juridique."
                  },
                  {
                    q: "Comment annuler mon abonnement ?",
                    a: "En 2 clics depuis votre espace personnel. Vos données sont conservées si vous souhaitez revenir."
                  }
                ].map((item, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border border-white/5 rounded-lg px-5 bg-white/[0.01]">
                    <AccordionTrigger className="text-left font-medium hover:text-accent py-4">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-white/60 pb-4">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        <ContactSection />

        {/* ═══════════════════════════════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════════════════════════════ */}
        <footer className="border-t border-white/5 py-10 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="text-xl font-bold">
                  <span className="text-white">PULSE</span>
                  <span className="text-accent">.</span>
                </div>
                <span className="text-white/40 text-sm hidden sm:inline">La prospection terrain, simplifiée.</span>
              </div>
              
              <div className="flex items-center gap-4 text-white/40 text-sm">
                <a href="mailto:tomiolovpro@gmail.com" className="hover:text-white transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">tomiolovpro@gmail.com</span>
                </a>
              </div>
            </div>
            
            <div className="border-t border-white/5 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/30 text-xs">
              <p>© 2026 PULSE. Tous droits réservés.</p>
              <div className="flex items-center gap-4">
                <a href="/mentions-legales" className="hover:text-white/60 transition-colors">Mentions légales</a>
                <a href="/cgu" className="hover:text-white/60 transition-colors">CGU</a>
                <a href="/cgv" className="hover:text-white/60 transition-colors">CGV</a>
                <a href="/confidentialite" className="hover:text-white/60 transition-colors">Confidentialité</a>
              </div>
            </div>
          </div>
        </footer>

        {/* Sticky CTA Mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/95 to-transparent md:hidden z-40">
          <Button 
            onClick={() => navigate('/subscribe')} 
            className="w-full bg-accent text-black font-bold py-5 rounded-xl shadow-xl"
          >
            Essayer gratuitement
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
