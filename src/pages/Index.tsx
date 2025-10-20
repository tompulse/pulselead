import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import React from "react";
import { Lightbulb, ArrowRight, Shield, CheckCircle, Star, AlertCircle, Clock, Target, Zap, TrendingUp, Check, Sparkles, Quote, Calendar } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-b from-navy-deep via-black-deep to-background relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-electric/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
      </div>

      {/* Header fixe */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/40 border-b border-accent/10">
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
                className="border-accent/30 text-foreground hover:bg-accent/10 hover:border-accent/50 transition-all duration-300 px-4 sm:px-6 h-9 sm:h-10 text-sm sm:text-base"
              >
                Connexion
              </Button>
              <Button 
                onClick={handleCreerCompteClick}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-4 sm:px-8 h-9 sm:h-10 text-sm sm:text-base rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-accent/50 hover:-translate-y-0.5"
              >
                Créer un compte
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8 animate-fade-in">
            {/* Badge simple */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-electric/10 border border-cyan-electric/30 backdrop-blur-sm">
              <span className="text-sm text-cyan-electric font-semibold">Temps réel</span>
            </div>
            
            {/* Message ultra clair */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-foreground">Trouve toutes les nouvelles entreprises</span>
              <br />
              <span className="gradient-text">qui se créent près de chez toi</span>
            </h1>
            
            {/* Explication simple */}
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Une carte interactive qui affiche en temps réel toutes les créations d'entreprises.
              <br className="hidden sm:block" />
              Parfait pour la prospection commerciale.
            </p>

            {/* Sélecteur de région interactif */}
            <div className="glass-card p-6 max-w-2xl mx-auto border-cyan-electric/20">
              <div className="space-y-4">
                <div className="text-left">
                  <h3 className="text-base font-semibold text-foreground mb-1">Choisissez votre région</h3>
                  <p className="text-sm text-muted-foreground">Le prix varie selon le nombre de créations d'entreprises</p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    onClick={() => setSelectedRegion('1')}
                    variant={selectedRegion === '1' ? 'default' : 'outline'}
                    className={selectedRegion === '1' 
                      ? 'bg-cyan-electric text-black-deep hover:bg-cyan-electric/90 border-cyan-electric' 
                      : 'border-cyan-electric/30 hover:bg-cyan-electric/10 hover:border-cyan-electric'
                    }
                  >
                    1 Région
                  </Button>
                  <Button
                    onClick={() => setSelectedRegion('plusieurs')}
                    variant={selectedRegion === 'plusieurs' ? 'default' : 'outline'}
                    className={selectedRegion === 'plusieurs' 
                      ? 'bg-cyan-electric text-black-deep hover:bg-cyan-electric/90 border-cyan-electric' 
                      : 'border-cyan-electric/30 hover:bg-cyan-electric/10 hover:border-cyan-electric'
                    }
                  >
                    Plusieurs Régions
                  </Button>
                  <Button
                    onClick={() => setSelectedRegion('france')}
                    variant={selectedRegion === 'france' ? 'default' : 'outline'}
                    className={selectedRegion === 'france' 
                      ? 'bg-cyan-electric text-black-deep hover:bg-cyan-electric/90 border-cyan-electric' 
                      : 'border-cyan-electric/30 hover:bg-cyan-electric/10 hover:border-cyan-electric'
                    }
                  >
                    France entière
                  </Button>
                </div>
              </div>
            </div>
            
            {/* CTA */}
            <div className="flex flex-col items-center gap-4 pt-4">
              <Button 
                onClick={handleExplorerClick}
                size="lg"
                className="btn-hero w-full sm:w-auto min-w-[240px] h-14 text-lg font-semibold group"
              >
                Voir la carte maintenant
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-cyan-electric" />
                <span>Gratuit • Sans CB • Accès immédiat</span>
              </div>
            </div>

            {/* Visuel */}
            <div className="pt-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="glass-card p-4 sm:p-6 max-w-5xl mx-auto relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-electric/0 via-cyan-electric/10 to-cyan-electric/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <DashboardPreview />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative py-12 px-4 border-y border-cyan-electric/10 bg-gradient-to-r from-navy-deep/30 to-black-deep/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-electric/20 blur-lg group-hover:blur-xl transition-all"></div>
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-electric/20 to-cyan-electric/5 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-cyan-electric" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-base font-bold text-foreground">100% fiable</div>
                <div className="text-sm text-muted-foreground">Données vérifiées</div>
              </div>
            </div>

            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-electric/20 blur-lg group-hover:blur-xl transition-all"></div>
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-electric/20 to-cyan-electric/5 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-cyan-electric" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-base font-bold text-foreground">+50 utilisateurs</div>
                <div className="text-sm text-muted-foreground">Actifs quotidiennement</div>
              </div>
            </div>

            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-electric/20 blur-lg group-hover:blur-xl transition-all"></div>
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-electric/20 to-cyan-electric/5 flex items-center justify-center">
                  <Star className="w-6 h-6 text-cyan-electric fill-cyan-electric" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-base font-bold text-foreground">4.8/5 ★★★★★</div>
                <div className="text-sm text-muted-foreground">+25 avis vérifiés</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Problèmes */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 space-y-3 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Tu perds des <span className="text-destructive">opportunités</span> chaque jour
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sans outil adapté, tu passes à côté de prospects
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="glass-card p-6 space-y-4 border-destructive/20 hover:border-destructive/40 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-destructive" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Trop lent</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tes concurrents contactent en premier. Pendant que tu cherches, ils signent.
              </p>
            </div>

            <div className="glass-card p-6 space-y-4 border-destructive/20 hover:border-destructive/40 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Clock className="w-7 h-7 text-destructive" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Temps perdu</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Des heures sur Excel et recherches manuelles. Ce temps devrait servir à vendre.
              </p>
            </div>

            <div className="glass-card p-6 space-y-4 border-destructive/20 hover:border-destructive/40 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Target className="w-7 h-7 text-destructive" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Zéro visibilité</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tu ne sais pas où sont les opportunités. Tu prospectes à l'aveugle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Solution */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-background via-navy-deep/20 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 space-y-3 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              LUMA transforme ta <span className="gradient-text">prospection</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sois le premier à contacter. Gagne du temps. Développe ton portefeuille.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
            <div className="text-center space-y-3">
              <div className="inline-flex w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-electric/20 to-cyan-electric/5 items-center justify-center">
                <Zap className="w-8 h-8 text-cyan-electric" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Réactivité maximale</h3>
              <p className="text-sm text-muted-foreground">
                Notifications en temps réel. Contact immédiat avant la concurrence.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="inline-flex w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-electric/20 to-cyan-electric/5 items-center justify-center">
                <TrendingUp className="w-8 h-8 text-cyan-electric" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Vision stratégique</h3>
              <p className="text-sm text-muted-foreground">
                Identifie les zones à fort potentiel. Priorise intelligemment.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="inline-flex w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-electric/20 to-cyan-electric/5 items-center justify-center">
                <Shield className="w-8 h-8 text-cyan-electric" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Données fiables</h3>
              <p className="text-sm text-muted-foreground">
                Informations officielles vérifiées. Zéro erreur.
              </p>
            </div>
          </div>

          {/* Résultats */}
          <div className="glass-card p-8 max-w-4xl mx-auto border-cyan-electric/30 bg-gradient-to-br from-cyan-electric/5 to-transparent">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-1">
                <div className="text-4xl font-bold gradient-text">×2</div>
                <div className="text-base text-foreground font-semibold">Plus de RDV</div>
                <div className="text-sm text-muted-foreground">En moyenne</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-bold gradient-text">2h</div>
                <div className="text-base text-foreground font-semibold">Gagnées/jour</div>
                <div className="text-sm text-muted-foreground">En recherche</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-bold gradient-text">+30%</div>
                <div className="text-base text-foreground font-semibold">Nouveaux clients</div>
                <div className="text-sm text-muted-foreground">En moyenne</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Prix */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4 animate-fade-in">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground">
              Un investissement <span className="gradient-text">rentable</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Combien coûte un client perdu face à un concurrent plus rapide ?
            </p>
          </div>

          {/* Segmentation par région */}
          <div className="glass-card p-6 max-w-2xl mx-auto mb-12 border-cyan-electric/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <div className="text-lg font-semibold text-foreground">Choisissez votre région</div>
                <div className="text-sm text-muted-foreground">Le prix varie selon le nombre de créations d'entreprises</div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="border-cyan-electric/30 hover:bg-cyan-electric/10 hover:border-cyan-electric">
                  1 Région
                </Button>
                <Button variant="outline" className="border-cyan-electric/30 hover:bg-cyan-electric/10 hover:border-cyan-electric">
                  Plusieurs Régions
                </Button>
                <Button variant="outline" className="border-cyan-electric/30 hover:bg-cyan-electric/10 hover:border-cyan-electric">
                  France entière
                </Button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {/* Plan Starter */}
            <div className="glass-card p-8 space-y-6 hover:border-accent/50 transition-all duration-300">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Starter</h3>
                <p className="text-muted-foreground">Pour démarrer efficacement</p>
              </div>
              <div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold gradient-text">99€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <div className="text-sm text-cyan-electric font-semibold">1 région incluse</div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">200 entreprises/mois</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Carte interactive</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Tous filtres avancés</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Suivi des interactions</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Export Excel</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Support email</span>
                </li>
              </ul>
              <Button onClick={() => navigate("/auth")} className="w-full bg-card hover:bg-accent/10 text-foreground border border-accent/30" size="lg">
                Commencer
              </Button>
            </div>

            {/* Plan Pro - Populaire */}
            <div className="relative glass-card p-8 space-y-6 border-cyan-electric/50 shadow-2xl shadow-cyan-electric/20 scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-cyan-electric to-cyan-electric/80 text-black-deep text-sm font-semibold rounded-full flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Le plus populaire
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Pro</h3>
                <p className="text-muted-foreground">Pour les pros de la prospection</p>
              </div>
              <div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold gradient-text">199€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <div className="text-sm text-cyan-electric font-semibold">Jusqu'à 3 régions</div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Entreprises illimitées</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Multi-régions (jusqu'à 3)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Alertes temps réel par SMS</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">API pour intégrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Statistiques avancées</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Support prioritaire</span>
                </li>
              </ul>
              <Button onClick={() => navigate("/auth")} className="w-full btn-hero" size="lg">
                Démarrer l'essai gratuit
              </Button>
            </div>

            {/* Plan Équipe - Sur devis */}
            <div className="glass-card p-8 space-y-6 hover:border-accent/50 transition-all duration-300">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Équipe</h3>
                <p className="text-muted-foreground">Solution sur-mesure</p>
              </div>
              <div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold gradient-text">Sur devis</span>
                </div>
                <div className="text-sm text-cyan-electric font-semibold">France entière • Multi-utilisateurs</div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Tout du plan Pro</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">France entière incluse</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Utilisateurs illimités</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Tableau de bord équipe</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Gestion des territoires</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyan-electric mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Formation & accompagnement</span>
                </li>
              </ul>
              <Button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="w-full bg-card hover:bg-accent/10 text-foreground border border-accent/30" size="lg">
                Nous contacter
              </Button>
            </div>
          </div>

          <div className="glass-card p-8 max-w-3xl mx-auto text-center border-cyan-electric/20">
            <p className="text-xl text-muted-foreground mb-2">ROI moyen constaté :</p>
            <p className="text-3xl font-bold">
              <span className="line-through text-destructive/70">100h de recherche manuelle</span>
              {" → "}
              <span className="gradient-text">10 minutes avec LUMA</span>
            </p>
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
          <div className="glass-card p-10 text-center space-y-6 border-cyan-electric/30 bg-gradient-to-br from-cyan-electric/5 via-navy-deep/10 to-transparent">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground">
              Prêt à transformer ta prospection ?
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Rejoins les commerciaux qui cartonnent avec LUMA
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button onClick={() => navigate("/auth")} size="lg" className="btn-hero min-w-[220px] h-12">
                Démarrer maintenant
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                size="lg"
                variant="outline"
                className="border-2 border-cyan-electric/50 text-foreground hover:bg-cyan-electric/10 hover:border-cyan-electric min-w-[220px] h-12"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Voir la démo
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-cyan-electric" />
                <span>Sans CB</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-cyan-electric" />
                <span>Setup 5 min</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-cyan-electric" />
                <span>Support 7j/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer complet */}
      <footer className="relative py-12 px-4 bg-navy-deep/50 border-t border-accent/10">
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
