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

const LandingPage = () => {
  const navigate = useNavigate();
  
  // Scroll animations
  const heroAnimation = useScrollAnimation({ threshold: 0.2 });
  const problemsAnimation = useScrollAnimation({ threshold: 0.2 });
  const solutionAnimation = useScrollAnimation({ threshold: 0.2 });
  const beforeAfterAnimation = useScrollAnimation({ threshold: 0.2 });
  const featuresAnimation = useScrollAnimation({ threshold: 0.2 });
  const pricingAnimation = useScrollAnimation({ threshold: 0.2 });
  const faqAnimation = useScrollAnimation({ threshold: 0.2 });

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
              <span className="text-white">LUMA</span>
              <span className="text-accent ml-1">.</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#solution" className="text-white/70 hover:text-accent transition-colors">Fonctionnalités</a>
              <a href="#avantages" className="text-white/70 hover:text-accent transition-colors">Avantages</a>
              <a href="#pricing" className="text-white/70 hover:text-accent transition-colors">Tarifs</a>
            </nav>

            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="border-accent/50 text-accent hover:bg-accent hover:text-black"
            >
              Connexion
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-6 relative z-10">
          <div className="container mx-auto max-w-6xl">
            <div ref={heroAnimation.ref} className={`text-center space-y-8 scroll-reveal ${heroAnimation.isVisible ? 'visible' : ''}`}>
              <h1 className="text-6xl md:text-7xl font-bold leading-tight">
                Multipliez vos <span className="gradient-text">opportunités</span> avec la détection automatique de prospects
              </h1>
              <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto">
                Chaque semaine, LUMA identifie les nouvelles entreprises de votre secteur. Prospectez les premiers, vendez plus vite.
              </p>
              <div className="flex gap-4 justify-center pt-8">
                <Button 
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="btn-hero text-xl px-12 py-6"
                >
                  Démarrer gratuitement
                  <ArrowRight className="ml-2" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-accent text-accent hover:bg-accent/10 text-xl px-12 py-6"
                >
                  Voir une démo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Problems Section */}
        <section className="py-20 px-6 relative z-10" style={{ 
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(0, 0, 0, 0.3) 100%)',
          borderTop: '1px solid rgba(6, 182, 212, 0.1)',
          borderBottom: '1px solid rgba(6, 182, 212, 0.1)'
        }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={problemsAnimation.ref} className={`scroll-reveal ${problemsAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-5xl font-bold text-center mb-16">Ce qui tue votre chiffre d'affaires</h2>
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
        <section id="solution" className="py-20 px-6 relative z-10" style={{
          background: 'radial-gradient(circle at center, rgba(14, 165, 233, 0.08) 0%, transparent 70%)'
        }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={solutionAnimation.ref} className={`scroll-reveal ${solutionAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
                Votre arsenal pour <span className="gradient-text">dominer</span> votre territoire
              </h2>
              <p className="text-xl text-white/60 text-center mb-16 max-w-2xl mx-auto">
                Détectez avant tout le monde, agissez plus vite, convertissez davantage
              </p>
              <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-6 border border-accent/20">
                  <Search className="w-12 h-12 text-accent" />
                </div>
                <h3 className="text-2xl font-bold">Détection Ultra-Rapide</h3>
                <p className="text-white/70 text-lg leading-relaxed">
                  Identifiez automatiquement chaque nouvelle entreprise de votre secteur avant vos concurrents
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
        <section id="avantages" className="py-20 px-6 relative z-10" style={{
          background: 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.4)), repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(6, 182, 212, 0.03) 50px, rgba(6, 182, 212, 0.03) 51px)',
          backgroundSize: '100% 100%, 100px 100%'
        }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={beforeAfterAnimation.ref} className={`scroll-reveal ${beforeAfterAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">L'impact immédiat sur vos résultats</h2>
              <p className="text-xl text-white/60 text-center mb-16 max-w-2xl mx-auto">
                Moins de kilomètres, plus de rendez-vous, meilleure conversion
              </p>
              <div className="grid md:grid-cols-2 gap-12">
              <Card className="glass-card p-10 border-red-500/30">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold">Sans LUMA</h3>
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
                    <span>Organisation catastrophique = CA en berne</span>
                  </li>
                </ul>
              </Card>
              <Card className="glass-card p-10 border-accent/50">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold">Avec LUMA</h3>
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
        <section id="pricing" className="py-20 px-6 relative z-10" style={{
          background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.03) 0%, rgba(0, 0, 0, 0.5) 100%)',
          borderTop: '2px solid rgba(6, 182, 212, 0.2)'
        }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={pricingAnimation.ref} className={`scroll-reveal ${pricingAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">Investissement rentable dès le premier mois</h2>
              <p className="text-xl text-white/60 text-center mb-16 max-w-2xl mx-auto">
                Un seul contrat signé et l'outil est amorti
              </p>
              <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                <Card className="glass-card p-8 border-white/10 hover:border-accent/30 transition-all">
                  <h3 className="text-2xl font-bold mb-4">Essentiel</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold">99€</span>
                    <span className="text-white/60">/mois</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">Pour 1 commercial terrain</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">Flux prospects automatique</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">Tournées ultra-optimisées</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">Support email réactif</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-accent text-black hover:bg-accent/90"
                    onClick={() => navigate('/auth')}
                  >
                    Démarrer
                  </Button>
                </Card>

                <Card className="glass-card p-8 border-accent/50 relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-black px-4 py-1 rounded-full text-sm font-bold">
                    BEST SELLER
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Performance</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold">149€</span>
                    <span className="text-white/60">/mois</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">Pour 1 commercial ambitieux</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">Tout du plan Essentiel</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">CRM complet + pipeline</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">Data enrichie sans limite</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">Support prioritaire 24/7</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-accent text-black hover:bg-accent/90"
                    onClick={() => navigate('/auth')}
                  >
                    Démarrer
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </section>


        {/* FAQ */}
        <section className="py-20 px-6 relative z-10" style={{
          background: 'radial-gradient(ellipse at bottom, rgba(6, 182, 212, 0.06) 0%, transparent 60%)'
        }}>
          <div className="container mx-auto max-w-4xl">
            <div ref={faqAnimation.ref} className={`scroll-reveal ${faqAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-5xl font-bold text-center mb-16">Vos questions, nos réponses</h2>
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
                  Oui, LUMA couvre l'intégralité du territoire français. Notre base de données contient plus de 
                  10 millions d'entreprises actives.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-xl font-semibold hover:text-accent">
                  Peut-on intégrer LUMA avec notre CRM ?
                </AccordionTrigger>
                <AccordionContent className="text-white/70 text-lg">
                  Oui, nous proposons des intégrations natives avec les principaux CRM (Salesforce, HubSpot, Pipedrive) 
                  et une API complète pour des intégrations sur mesure.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-xl font-semibold hover:text-accent">
                  Quel délai pour voir les premiers résultats ?
                </AccordionTrigger>
                <AccordionContent className="text-white/70 text-lg">
                  La plupart de nos clients constatent une amélioration dès la première semaine d'utilisation. 
                  L'optimisation des tournées est immédiate, et les gains de productivité se mesurent rapidement.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6 bg-gradient-to-b from-black-deep/30 to-transparent relative z-10">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-6xl font-bold mb-6">
              Prêt à <span className="gradient-text">transformer</span> votre prospection terrain ?
            </h2>
            <p className="text-2xl text-white/70 mb-12">
              Rejoignez +200 équipes qui visitent + de prospects en moins de temps
            </p>
            <div className="flex gap-6 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="btn-hero text-xl px-12 py-6"
              >
                Démarrer gratuit 14j
                <ArrowRight className="ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-accent text-accent hover:bg-accent/10 text-xl px-12 py-6"
              >
                Réserver une démo
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="text-2xl font-bold mb-4">
                  <span className="text-white">LUMA</span>
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
                    <span>contact@luma.fr</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>01 23 45 67 89</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 text-center text-white/40">
              <p>&copy; 2024 LUMA. Tous droits réservés.</p>
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
