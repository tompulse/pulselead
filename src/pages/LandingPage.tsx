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

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'commercial' | 'entreprise'>('commercial');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with Switch */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              <span className="text-white">LUMA</span>
              <span className="text-accent ml-1">.</span>
            </div>

            {/* Switch Toggle */}
            <div className="flex items-center gap-2 bg-white/5 rounded-full p-1 border border-white/10">
              <button
                onClick={() => setActiveView('commercial')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  activeView === 'commercial'
                    ? 'bg-accent text-black shadow-[0_0_20px_hsl(190_100%_50%/0.5)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Commercial
              </button>
              <button
                onClick={() => setActiveView('entreprise')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  activeView === 'entreprise'
                    ? 'bg-accent text-black shadow-[0_0_20px_hsl(190_100%_50%/0.5)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Entreprise
              </button>
            </div>

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
        {activeView === 'commercial' ? (
          <section className="py-20 px-6">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center space-y-8 animate-fade-in">
                <h1 className="text-7xl font-bold leading-tight">
                  Vos commerciaux perdent <span className="gradient-text">8h/semaine</span> en trajets mal optimisés
                </h1>
                <p className="text-2xl text-white/70 max-w-3xl mx-auto">
                  LUMA crée vos tournées parfaites en 30 secondes, pour plus de RDV et moins de km
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
        ) : (
          <section className="py-20 px-6">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center space-y-8 animate-fade-in">
                <h1 className="text-7xl font-bold leading-tight">
                  Votre force commerciale <span className="gradient-text">tourne à vide ?</span> Faites plus avec moins
                </h1>
                <p className="text-2xl text-white/70 max-w-3xl mx-auto">
                  Optimisez la prospection terrain de toute votre équipe—plus de visites, moins de temps
                </p>
                <div className="flex gap-4 justify-center pt-8">
                  <Button 
                    size="lg"
                    onClick={() => navigate('/auth')}
                    className="btn-hero text-xl px-12 py-6"
                  >
                    Demandez un devis
                    <ArrowRight className="ml-2" />
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-2 border-accent text-accent hover:bg-accent/10 text-xl px-12 py-6"
                  >
                    Contactez-nous
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Problems Section */}
        {activeView === 'commercial' ? (
          <section className="py-20 px-6 bg-gradient-to-b from-black to-black-deep">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-5xl font-bold text-center mb-16">Les défis du terrain</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="glass-card p-8 border-white/10 hover:border-accent/50 transition-all">
                  <TrendingDown className="w-12 h-12 text-accent mb-4" />
                  <h3 className="text-2xl font-bold mb-3">Trajets improductifs</h3>
                  <p className="text-white/70 text-lg">Perte de 40% du temps en déplacement mal planifié</p>
                </Card>
                <Card className="glass-card p-8 border-white/10 hover:border-accent/50 transition-all">
                  <FileText className="w-12 h-12 text-accent mb-4" />
                  <h3 className="text-2xl font-bold mb-3">Données dispersées</h3>
                  <p className="text-white/70 text-lg">Notes papier et Excel, tout se perd rapidement</p>
                </Card>
                <Card className="glass-card p-8 border-white/10 hover:border-accent/50 transition-all">
                  <AlertCircle className="w-12 h-12 text-accent mb-4" />
                  <h3 className="text-2xl font-bold mb-3">Informations obsolètes</h3>
                  <p className="text-white/70 text-lg">Vous arrivez après la concurrence</p>
                </Card>
              </div>
            </div>
          </section>
        ) : (
          <section className="py-20 px-6 bg-gradient-to-b from-black to-black-deep">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-5xl font-bold text-center mb-16">Les enjeux de votre pipeline commercial</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="glass-card p-8 border-white/10 hover:border-accent/50 transition-all">
                  <Users className="w-12 h-12 text-accent mb-4" />
                  <h3 className="text-2xl font-bold mb-3">Gestion d'équipe</h3>
                  <p className="text-white/70 text-lg">Suivi centralisé, moins de perte de leads</p>
                </Card>
                <Card className="glass-card p-8 border-white/10 hover:border-accent/50 transition-all">
                  <Route className="w-12 h-12 text-accent mb-4" />
                  <h3 className="text-2xl font-bold mb-3">Optimisation des tournées</h3>
                  <p className="text-white/70 text-lg">Visites plus nombreuses, coût réduit</p>
                </Card>
                <Card className="glass-card p-8 border-white/10 hover:border-accent/50 transition-all">
                  <BarChart3 className="w-12 h-12 text-accent mb-4" />
                  <h3 className="text-2xl font-bold mb-3">Reporting avancé</h3>
                  <p className="text-white/70 text-lg">Performance en temps réel, décisions rapides</p>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Solution Section */}
        {activeView === 'commercial' ? (
          <section className="py-20 px-6">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-5xl font-bold text-center mb-16">
                Comment LUMA <span className="gradient-text">booste</span> la prospection terrain
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-6">
                    <Search className="w-10 h-10 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold">Détection automatique</h3>
                  <p className="text-white/70 text-lg">Nouvelles entreprises dans votre zone chaque semaine</p>
                </div>
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-6">
                    <Map className="w-10 h-10 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold">Itinéraires optimisés</h3>
                  <p className="text-white/70 text-lg">Générez en 30s des parcours parfaits</p>
                </div>
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-6">
                    <Smartphone className="w-10 h-10 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold">CRM de prospection</h3>
                  <p className="text-white/70 text-lg">Notes, relances, historique complet</p>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="py-20 px-6">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-5xl font-bold text-center mb-16">
                Une plateforme pour <span className="gradient-text">gérer</span> toute votre équipe
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-6">
                    <Database className="w-10 h-10 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold">Vue d'ensemble</h3>
                  <p className="text-white/70 text-lg">Liste globale des prospects + nouvelles entreprises</p>
                </div>
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-6">
                    <BarChart3 className="w-10 h-10 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold">Dashboard</h3>
                  <p className="text-white/70 text-lg">Rapports avancés, KPIs en temps réel</p>
                </div>
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-6">
                    <Target className="w-10 h-10 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold">Organisation</h3>
                  <p className="text-white/70 text-lg">Gestion et assignation des tournées, alertes</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Before/After Section */}
        <section className="py-20 px-6 bg-black-deep">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-5xl font-bold text-center mb-16">Votre journée avant/après LUMA</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <Card className="glass-card p-10 border-red-500/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <X className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-3xl font-bold">Avant</h3>
                </div>
                <ul className="space-y-4 text-lg text-white/70">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Trajets désorganisés et inefficaces</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Notes perdues sur papier</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Peu de visites effectuées</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Temps perdu en recherche</span>
                  </li>
                </ul>
              </Card>
              <Card className="glass-card p-10 border-accent/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-3xl font-bold">Après</h3>
                </div>
                <ul className="space-y-4 text-lg text-white/70">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <span>Itinéraires automatisés et optimaux</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <span>Mini compte rendu centralisé</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <span>+40% de visites en moyenne</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <span>Ciblage précis et efficace</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </section>


        {/* Features Grid */}
        <section className="py-20 px-6 bg-gradient-to-b from-black to-black-deep">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-5xl font-bold text-center mb-16">
              Tout pour <span className="gradient-text">dominer</span> votre prospection
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Search, title: "Détection auto", desc: "Nouvelles entreprises" },
                { icon: Route, title: "Optimisation tournées", desc: "Algorithme intelligent" },
                { icon: Smartphone, title: "CRM de prospection", desc: "Notes et historique" },
                { icon: Database, title: "Enrichissement data", desc: "Contacts + activités" },
              ].map((feature, idx) => (
                <Card key={idx} className="glass-card p-6 border-white/10 hover:border-accent/50 transition-all">
                  <feature.icon className="w-10 h-10 text-accent mb-4" />
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-white/60">{feature.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        {activeView === 'commercial' && (
          <section className="py-20 px-6">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-5xl font-bold text-center mb-16">Choisissez votre formule</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="glass-card p-8 border-white/10 hover:border-accent/30 transition-all">
                  <h3 className="text-2xl font-bold mb-4">Solo</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold">99€</span>
                    <span className="text-white/60">/mois</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">1 commercial</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">Détection auto prospects</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">Optimisation tournées</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">Support email</span>
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
                  <h3 className="text-2xl font-bold mb-4">Solo Pro</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold">149€</span>
                    <span className="text-white/60">/mois</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">1 commercial</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">Toutes fonctionnalités Solo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">CRM de prospection avancé</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">Enrichissement data illimité</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">Support prioritaire</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-accent text-black hover:bg-accent/90"
                    onClick={() => navigate('/auth')}
                  >
                    Démarrer
                  </Button>
                </Card>

                <Card className="glass-card p-8 border-white/10 hover:border-accent/30 transition-all">
                  <h3 className="text-2xl font-bold mb-4">Entreprise</h3>
                  <div className="mb-6">
                    <span className="text-3xl font-bold">Sur devis</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">Utilisateurs illimités</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">Gestion d'équipe complète</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">Intégrations sur mesure</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">Support premium 24/7</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-white/80">Formation équipe</span>
                    </li>
                  </ul>
                  <Button 
                    variant="outline"
                    className="w-full border-accent text-accent hover:bg-accent hover:text-black"
                    onClick={() => navigate('/auth')}
                  >
                    Contactez-nous
                  </Button>
                </Card>
              </div>
            </div>
          </section>
        )}


        {/* FAQ */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-5xl font-bold text-center mb-16">Questions fréquentes</h2>
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
                  L'app mobile fonctionne-t-elle hors-ligne ?
                </AccordionTrigger>
                <AccordionContent className="text-white/70 text-lg">
                  Oui, vous pouvez consulter vos tournées et ajouter des notes même sans connexion. 
                  Les données se synchronisent automatiquement dès que vous retrouvez du réseau.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-white/10 rounded-lg px-6">
                <AccordionTrigger className="text-xl font-semibold hover:text-accent">
                  Peut-on intégrer LUMA avec notre CRM ?
                </AccordionTrigger>
                <AccordionContent className="text-white/70 text-lg">
                  Oui, nous proposons des intégrations natives avec les principaux CRM (Salesforce, HubSpot, Pipedrive) 
                  et une API complète pour des intégrations sur mesure.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-white/10 rounded-lg px-6">
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
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6 bg-gradient-to-b from-black-deep to-black">
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
