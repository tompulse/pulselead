import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import React from "react";
import { Lightbulb, ArrowRight, Shield, CheckCircle, Star, AlertCircle, Clock, Target, Zap, TrendingUp, Check, Sparkles, Quote, Calendar, X } from "lucide-react";
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
  const [selectedRegion, setSelectedRegion] = React.useState<'1' | 'plusieurs' | 'france'>('plusieurs');
  const [billingPeriod, setBillingPeriod] = React.useState<'monthly' | 'quarterly' | 'yearly'>('yearly');

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
              <span className="text-sm text-accent font-bold">Données en temps réel</span>
            </div>
            
            {/* Titre principal optimisé pour conversion */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
              <span className="text-foreground">Prospectez les</span>
              <br />
              <span className="gradient-text">nouvelles entreprises</span>
              <br />
              <span className="text-foreground">avant vos concurrents</span>
            </h1>
            
            {/* Sous-titre optimisé */}
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
              Accédez à toutes les créations d'entreprises en France sur une carte interactive.
              <br className="hidden sm:block" />
              <span className="text-accent font-semibold">Filtrez par secteur, contactez en premier.</span>
            </p>
            
            {/* CTA optimisé */}
            <div className="flex flex-col items-center gap-5 pt-6">
              <Button 
                onClick={handleExplorerClick}
                size="lg"
                className="btn-hero w-full sm:w-auto min-w-[280px] h-16 text-xl font-bold group"
              >
                Commencer gratuitement
                <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span className="font-medium">Essai gratuit 14 jours</span>
                </div>
                <span className="text-accent/50">•</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span className="font-medium">Sans carte bancaire</span>
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
      <section className="relative py-16 px-4 border-y border-accent/10 bg-gradient-to-r from-primary/50 to-primary/30 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 blur-lg group-hover:blur-xl transition-all"></div>
                <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center shadow-lg shadow-accent/10">
                  <Shield className="w-7 h-7 text-accent" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-foreground">Données officielles</div>
                <div className="text-sm text-muted-foreground font-medium">Sources INPI & INSEE</div>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 blur-lg group-hover:blur-xl transition-all"></div>
                <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center shadow-lg shadow-accent/10">
                  <CheckCircle className="w-7 h-7 text-accent" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-foreground">+1000 entreprises</div>
                <div className="text-sm text-muted-foreground font-medium">Ajoutées chaque semaine</div>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 blur-lg group-hover:blur-xl transition-all"></div>
                <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center shadow-lg shadow-accent/10">
                  <Star className="w-7 h-7 text-accent fill-accent" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-foreground">4.8/5 ★★★★★</div>
                <div className="text-sm text-muted-foreground font-medium">Note utilisateurs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Problème/Solution */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Problème */}
          <div className="text-center mb-16 space-y-4 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Vous perdez des <span className="gradient-text">opportunités</span>
              <br />
              pendant que vos concurrents prospectent
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
              Chaque jour, des centaines d'entreprises se créent. Sans système efficace, vous passez à côté.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
            <div className="glass-card p-7 space-y-4 border-destructive/30 hover:border-destructive/50 hover:bg-destructive/5 transition-all duration-300 group">
              <div className="w-16 h-16 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-destructive/10">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Concurrence féroce</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Vos concurrents contactent les prospects en premier pendant que vous cherchez manuellement sur Internet.
              </p>
            </div>

            <div className="glass-card p-7 space-y-4 border-destructive/30 hover:border-destructive/50 hover:bg-destructive/5 transition-all duration-300 group">
              <div className="w-16 h-16 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-destructive/10">
                <Clock className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Perte de temps</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Des heures perdues à chercher, vérifier et compiler des données éparpillées sur différentes sources.
              </p>
            </div>

            <div className="glass-card p-7 space-y-4 border-destructive/30 hover:border-destructive/50 hover:bg-destructive/5 transition-all duration-300 group">
              <div className="w-16 h-16 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-destructive/10">
                <Target className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Prospection à l'aveugle</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Sans vue d'ensemble, impossible de cibler efficacement les zones et secteurs à fort potentiel.
              </p>
            </div>
          </div>

          {/* Solution */}
          <div className="text-center mb-12 space-y-4 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              LUMA vous donne l'<span className="gradient-text">avantage décisif</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
              Prospectez intelligemment avec des données actualisées et une vision complète de votre territoire.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
            <div className="glass-card p-7 text-center space-y-4 border-accent/30 hover:border-accent hover:bg-accent/5 transition-all duration-300 group">
              <div className="inline-flex w-18 h-18 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-accent/20">
                <Zap className="w-9 h-9 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Temps réel</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Accédez aux nouvelles créations dès leur publication officielle. Contactez avant tout le monde.
              </p>
            </div>

            <div className="glass-card p-7 text-center space-y-4 border-accent/30 hover:border-accent hover:bg-accent/5 transition-all duration-300 group">
              <div className="inline-flex w-18 h-18 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-accent/20">
                <TrendingUp className="w-9 h-9 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Ciblage précis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Filtrez par secteur d'activité, zone géographique et critères personnalisés. Zéro temps perdu.
              </p>
            </div>

            <div className="glass-card p-7 text-center space-y-4 border-accent/30 hover:border-accent hover:bg-accent/5 transition-all duration-300 group">
              <div className="inline-flex w-18 h-18 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-accent/20">
                <Shield className="w-9 h-9 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Fiabilité totale</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Données vérifiées issues des sources officielles (INPI, INSEE). Informations complètes et à jour.
              </p>
            </div>
          </div>

          {/* Résultats mesurables */}
          <div className="glass-card p-10 max-w-4xl mx-auto border-accent/40 bg-gradient-to-br from-accent/10 to-transparent shadow-2xl shadow-accent/10">
            <h3 className="text-2xl font-bold text-center mb-8 gradient-text">Résultats constatés par nos utilisateurs</h3>
            <div className="grid md:grid-cols-3 gap-10 text-center">
              <div className="space-y-2">
                <div className="text-5xl font-bold gradient-text">×2.5</div>
                <div className="text-lg text-foreground font-bold">Rendez-vous obtenus</div>
                <div className="text-sm text-muted-foreground font-medium">Par rapport à la prospection classique</div>
              </div>
              <div className="space-y-2">
                <div className="text-5xl font-bold gradient-text">3h/jour</div>
                <div className="text-lg text-foreground font-bold">Temps économisé</div>
                <div className="text-sm text-muted-foreground font-medium">En recherche et qualification</div>
              </div>
              <div className="space-y-2">
                <div className="text-5xl font-bold gradient-text">+40%</div>
                <div className="text-lg text-foreground font-bold">Croissance clients</div>
                <div className="text-sm text-muted-foreground font-medium">En 6 mois d'utilisation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Prix */}
      <section className="relative py-28 px-4 bg-gradient-to-b from-background via-primary/30 to-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20 space-y-5 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-foreground leading-tight">
              Choisissez le plan qui
              <br />
              <span className="gradient-text">accélère votre croissance</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
              Chaque jour sans LUMA, c'est un prospect que votre concurrent contacte avant vous.
            </p>
          </div>

          {/* Toggle de période */}
          <div className="flex justify-center mb-16">
            <div className="glass-card p-2 inline-flex gap-1.5 border-accent/30">
              <Button
                variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
                onClick={() => setBillingPeriod('monthly')}
                className={billingPeriod === 'monthly' ? 'btn-hero text-base px-6' : 'hover:bg-accent/10 text-base px-6'}
              >
                Mensuel
              </Button>
              <Button
                variant={billingPeriod === 'quarterly' ? 'default' : 'ghost'}
                onClick={() => setBillingPeriod('quarterly')}
                className={billingPeriod === 'quarterly' ? 'btn-hero text-base px-6' : 'hover:bg-accent/10 text-base px-6'}
              >
                Trimestriel
                <span className="ml-2 text-xs bg-accent/30 px-2.5 py-1 rounded-full font-bold">-15%</span>
              </Button>
              <Button
                variant={billingPeriod === 'yearly' ? 'default' : 'ghost'}
                onClick={() => setBillingPeriod('yearly')}
                className={billingPeriod === 'yearly' ? 'btn-hero text-base px-6' : 'hover:bg-accent/10 text-base px-6'}
              >
                Annuel
                <span className="ml-2 text-xs bg-accent/30 px-2.5 py-1 rounded-full font-bold">-25%</span>
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {/* Plan Starter */}
            <div className="glass-card p-8 space-y-6 hover:border-accent/60 transition-all duration-300 border-accent/30">
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
                <div className="text-sm text-accent font-bold">1 secteur d'activité</div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium"><strong>20 prospects/mois</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">Carte interactive + filtres</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">CRM intégré</span>
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
                Essai gratuit 14 jours
              </Button>
            </div>

            {/* Plan Pro - Recommandé */}
            <div className="relative glass-card p-8 space-y-6 border-accent/70 shadow-2xl shadow-accent/20 scale-105 bg-gradient-to-b from-accent/10 to-transparent">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-accent to-accent/90 text-primary text-sm font-bold rounded-full flex items-center gap-2 shadow-lg shadow-accent/30">
                <Sparkles className="w-4 h-4" />
                Le plus populaire
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Pro</h3>
                <p className="text-muted-foreground font-medium">Pour développer rapidement</p>
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold gradient-text">
                    {billingPeriod === 'monthly' ? '199' : billingPeriod === 'quarterly' ? '169' : '149'}€
                  </span>
                  <span className="text-muted-foreground font-medium">/mois</span>
                </div>
                <div className="text-sm text-accent font-bold">Multi-secteurs illimité</div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">✨ <strong>Prospects illimités</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">🎯 <strong>Tous les secteurs</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">💎 <strong>Contacts dirigeants</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">🤖 <strong>Filtres IA avancés</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">📊 Analytics & prévisions</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">⚡ <strong>Support prioritaire 24h</strong></span>
                </li>
              </ul>
              <Button onClick={() => navigate("/auth")} className="w-full btn-hero shadow-xl shadow-accent/40 font-bold text-base" size="lg">
                Essai gratuit 14 jours
              </Button>
            </div>

            {/* Plan Enterprise */}
            <div className="glass-card p-8 space-y-6 hover:border-accent/60 transition-all duration-300 border-accent/30">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Enterprise</h3>
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
              <Button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="w-full bg-card hover:bg-accent/10 text-foreground border-2 border-accent/40 hover:border-accent font-bold" size="lg">
                Nous contacter
              </Button>
            </div>
          </div>

          {/* ROI Section - Amélioration visuelle */}
          <div className="glass-card p-10 md:p-14 max-w-4xl mx-auto border-cyan-electric/30 bg-gradient-to-br from-cyan-electric/5 via-transparent to-cyan-electric/5">
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">ROI moyen constaté</h3>
                <div className="w-20 h-1 bg-gradient-to-r from-transparent via-cyan-electric to-transparent mx-auto"></div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="glass-card p-6 border-destructive/30 bg-destructive/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-destructive" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Avant</span>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-destructive line-through">100h</div>
                  <div className="text-sm text-muted-foreground mt-1">de recherche manuelle</div>
                </div>

                <div className="glass-card p-6 border-cyan-electric/50 bg-gradient-to-br from-cyan-electric/10 to-transparent relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-electric/10 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-electric/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-cyan-electric" />
                      </div>
                      <span className="text-sm font-semibold text-cyan-electric uppercase tracking-wide">Avec LUMA</span>
                    </div>
                    <div className="text-3xl md:text-4xl font-bold gradient-text">10 min</div>
                    <div className="text-sm text-muted-foreground mt-1">Temps réel et automatique</div>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-electric/10 border border-cyan-electric/30">
                  <TrendingUp className="w-5 h-5 text-cyan-electric" />
                  <span className="text-lg font-semibold gradient-text">Gain de productivité : ×600</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Témoignages */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-background via-navy-deep/20 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 space-y-3 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-cyan-electric text-cyan-electric" />
                ))}
              </div>
              <span className="text-xl font-bold text-foreground">4.8/5</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Ils accélèrent leur <span className="gradient-text">croissance</span>
            </h2>
            <p className="text-lg text-muted-foreground">Résultats réels et mesurables</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-6 space-y-4 hover:border-cyan-electric/40 transition-all duration-300">
              <Quote className="w-8 h-8 text-cyan-electric/30" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-cyan-electric text-cyan-electric" />
                ))}
              </div>
              <p className="text-base text-foreground leading-relaxed">
                "J'ai multiplié mes RDV par 2 en quelques semaines. Plus aucune opportunité ratée."
              </p>
              <div className="inline-flex px-3 py-1.5 rounded-full bg-cyan-electric/10 border border-cyan-electric/30">
                <span className="text-sm font-semibold text-cyan-electric">+100% de RDV</span>
              </div>
              <div className="pt-3 border-t border-accent/10">
                <div className="font-semibold text-foreground">Sophie Martin</div>
                <div className="text-sm text-muted-foreground">Commerciale BtoB</div>
              </div>
            </div>

            <div className="glass-card p-6 space-y-4 hover:border-cyan-electric/40 transition-all duration-300">
              <Quote className="w-8 h-8 text-cyan-electric/30" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-cyan-electric text-cyan-electric" />
                ))}
              </div>
              <p className="text-base text-foreground leading-relaxed">
                "Environ 2h gagnées chaque jour. Je vois tout mon territoire en un coup d'œil."
              </p>
              <div className="inline-flex px-3 py-1.5 rounded-full bg-cyan-electric/10 border border-cyan-electric/30">
                <span className="text-sm font-semibold text-cyan-electric">2h/jour économisées</span>
              </div>
              <div className="pt-3 border-t border-accent/10">
                <div className="font-semibold text-foreground">Thomas Dubois</div>
                <div className="text-sm text-muted-foreground">Responsable commercial</div>
              </div>
            </div>

            <div className="glass-card p-6 space-y-4 hover:border-cyan-electric/40 transition-all duration-300">
              <Quote className="w-8 h-8 text-cyan-electric/30" />
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-cyan-electric text-cyan-electric" />
                ))}
              </div>
              <p className="text-base text-foreground leading-relaxed">
                "Simple, efficace. Une quinzaine de nouveaux clients en quelques mois."
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

      {/* Section FAQ + CTA */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12 space-y-3 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Questions <span className="gradient-text">fréquentes</span>
            </h2>
            <p className="text-lg text-muted-foreground">Tout ce que tu dois savoir</p>
          </div>

          <Accordion type="single" collapsible className="space-y-3 mb-12">
            <AccordionItem value="item-1" className="glass-card px-6 py-1 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-cyan-electric">
                D'où viennent les données ?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-2">
                100% officielles. Directement de l'INPI. Mise à jour quotidienne.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="glass-card px-6 py-1 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-cyan-electric">
                C'est vraiment gratuit ?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-2">
                Oui. Aucune carte bancaire requise pour tester.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="glass-card px-6 py-1 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-cyan-electric">
                Les données sont à jour ?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-2">
                Synchronisation automatique chaque jour. Toujours frais.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="glass-card px-6 py-1 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-cyan-electric">
                Je peux annuler quand je veux ?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-2">
                Oui, sans engagement. Annulation en 1 clic.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="glass-card px-6 py-1 border-accent/20 hover:border-cyan-electric/40 transition-all">
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-cyan-electric">
                Ça marche sur mobile ?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-2">
                100% responsive. Ordinateur, tablette, smartphone.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* CTA Final */}
          <div className="glass-card p-12 text-center space-y-8 border-accent/40 bg-gradient-to-br from-accent/10 via-primary/20 to-transparent shadow-2xl shadow-accent/10">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Ne laissez plus passer
              <br />
              <span className="gradient-text">aucune opportunité</span>
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Démarrez votre essai gratuit maintenant. Sans engagement, sans carte bancaire.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button onClick={() => navigate("/auth")} size="lg" className="btn-hero min-w-[240px] h-14 text-lg font-bold">
                Commencer gratuitement
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
              <Button 
                onClick={() => window.open('https://iclosed.io/e/tomiolov', '_blank')}
                size="lg"
                variant="outline"
                className="border-2 border-accent/50 text-foreground hover:bg-accent/10 hover:border-accent min-w-[240px] h-14 text-lg font-bold rounded-full"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Demander une démo
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                <span>14 jours gratuits</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                <span>Sans carte bancaire</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                <span>Accès immédiat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer complet */}
      <footer className="relative py-12 px-4 bg-primary/50 border-t border-accent/10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo et description */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 blur-md"></div>
                  <Lightbulb className="w-6 h-6 text-accent relative" />
                </div>
                <span className="text-lg font-bold gradient-text">LUMA</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Visualise les créations d'entreprises en temps réel et développe ton portefeuille client.
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
                  <a href="#mentions-legales" className="hover:text-accent transition-colors">Mentions légales</a>
                </li>
                <li>
                  <a href="#confidentialite" className="hover:text-accent transition-colors">Politique de confidentialité</a>
                </li>
                <li>
                  <a href="#cgv" className="hover:text-accent transition-colors">CGV</a>
                </li>
                <li>
                  <a href="#cgu" className="hover:text-accent transition-colors">CGU</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-accent/10">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>© 2025 LUMA. Tous droits réservés.</p>
              <p className="text-xs">
                LUMA - SAS au capital de 10 000€ - RCS Paris
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
