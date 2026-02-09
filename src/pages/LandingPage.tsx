import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, lazy, Suspense, useRef } from "react";
import { ArrowRight, Target, TrendingUp, TrendingDown, Check, MapPin, BarChart3, Users, Phone, Mail, FileText, Database, Search, Route, Smartphone, Menu, Building2, Clock, Sparkles, LogOut, LayoutDashboard, Shield, Award, Star, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { DemoModeButton } from "@/components/landing/DemoModeButton";

// Lazy load des composants non-critiques pour améliorer les performances
const ContactSection = lazy(() => import("@/components/landing/ContactSection"));

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Lazy load video with Intersection Observer
  useEffect(() => {
    if (!videoRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoadVideo(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  // Check auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setUserId(session?.user?.id || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserId(null);
  };

  // Handle dashboard button click - redirect to auth if not logged in, dashboard otherwise
  const handleDashboardClick = () => {
    if (!isLoggedIn) {
      navigate('/auth');
    } else {
      navigate('/dashboard');
    }
  };

  // Handle CTA - Si connecté → Stripe, sinon → Auth
  const handleCTAClick = async () => {
    if (!isLoggedIn) {
      // Pas connecté → Inscription
      navigate('/auth');
      return;
    }

    // Connecté → Vérifier si a un abonnement actif
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data: quotas } = await supabase
        .from('user_quotas')
        .select('plan_type, is_first_login')
        .eq('user_id', session.user.id)
        .single();

      // Si plan actif → Dashboard
      if (quotas && quotas.is_first_login === false && quotas.plan_type) {
        navigate('/dashboard');
        return;
      }

      // Pas de plan actif → Stripe
      const paymentUrl = `${import.meta.env.VITE_STRIPE_PAYMENT_LINK_PRO || 'https://buy.stripe.com/00w6oH0PRckQ6IHcro2ZO00'}?client_reference_id=${session.user.id}&prefilled_email=${encodeURIComponent(session.user.email || '')}`;
      window.location.href = paymentUrl;
    } catch (error) {
      console.error('Error checking subscription:', error);
      navigate('/auth');
    }
  };

  // 🔥 SUPPRIMÉ : Plus de redirection automatique vers checkout
  // L'utilisateur choisit son plan dans /onboarding après connexion

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

      {/* Header Simplifié */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-blue-deep/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-xl sm:text-2xl font-bold">
              <span className="text-white">PULSE</span>
              <span className="text-accent"> Entreprise</span>
            </div>

            {/* Desktop nav - Simplifié */}
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#rdv" className="text-sm text-white/60 hover:text-white transition-colors">Comment ça marche</a>
              <a href="#resultats" className="text-sm text-white/60 hover:text-white transition-colors">Résultats</a>
              <a href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">Tarifs</a>
            </nav>

            {/* Desktop buttons - Simplifié */}
            <div className="hidden lg:flex items-center gap-3">
              <Button 
                onClick={() => navigate('/commercial')}
                variant="ghost" 
                className="text-white/70 hover:text-white font-medium"
              >
                Version Solo (49€)
              </Button>
              <Button asChild className="bg-accent hover:bg-accent/90 text-black font-semibold px-6">
                <a href="#calendly">
                  Réserver un Audit Gratuit
                </a>
              </Button>
            </div>

            {/* Mobile menu */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 bg-card/95 backdrop-blur-xl border-accent/20">
                  <nav className="flex flex-col gap-4 mt-8">
                    <a href="#rdv" className="text-lg text-white/80 hover:text-white py-2">Comment ça marche</a>
                    <a href="#resultats" className="text-lg text-white/80 hover:text-white py-2">Résultats</a>
                    <a href="#pricing" className="text-lg text-white/80 hover:text-white py-2">Tarifs</a>
                    <div className="border-t border-white/10 pt-4 mt-4 space-y-3">
                      <Button 
                        onClick={() => navigate('/commercial')}
                        variant="outline" 
                        className="w-full border-white/20 text-white"
                      >
                        Version Solo (49€)
                      </Button>
                      <Button asChild className="w-full bg-accent text-black font-semibold">
                        <a href="#calendly">
                          Réserver un Audit
                        </a>
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
            HERO SECTION - Simplifié et Centré pour PME B2B
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="pt-20 pb-20 px-6 relative z-10">
          <div className="container mx-auto max-w-4xl">
            <div ref={heroAnimation.ref} className={`scroll-reveal ${heroAnimation.isVisible ? 'visible' : ''} text-center`}>
              
              {/* Badges avant titre */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <Badge className="bg-accent/10 text-accent border-accent/30 px-4 py-1.5">
                  ⭐ +23 PME accompagnées depuis 2023
                </Badge>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-4 py-1.5">
                  🔒 Garantie Résultats 90 jours
                </Badge>
              </div>

              {/* Headline Principal - Simplifié */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6">
                <span className="text-white">Générez Plus de RDV B2B</span>
                <br />
                <span className="gradient-text">Sans Perdre de Temps</span>
              </h1>

              {/* Subheadline Simple et Claire */}
              <p className="text-xl sm:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
                Nous trouvons les entreprises créées récemment dans votre secteur, identifions le bon décideur, et vous accompagnons pour signer plus rapidement.
              </p>

              {/* CTA Principal Unique */}
              <div className="mb-16">
                <Button 
                  onClick={() => document.getElementById('calendly')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg px-12 py-7 rounded-xl shadow-2xl hover:shadow-green-500/25 hover:scale-105 transition-all duration-300"
                >
                  Réserver Mon Audit Gratuit
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
                <p className="text-sm text-white/50 mt-4">
                  ✓ Audit gratuit de 30min · ✓ Sans engagement · ✓ Résultats garantis sous 90 jours
                </p>
              </div>

              {/* Stats KPIs Simplifiées */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-4">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">+180%</div>
                  <p className="text-sm text-white/70 font-medium">RDV qualifiés</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">-40%</div>
                  <p className="text-sm text-white/70 font-medium">Temps prospection</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">ROI 4x</div>
                  <p className="text-sm text-white/70 font-medium">En 6 mois</p>
                </div>
              </div>
              
              {/* Note source stats */}
              <p className="text-xs text-white/40 mb-12">
                *Moyenne constatée sur 18 clients PME accompagnés en 2024-2025
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center gap-8 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Conforme RGPD France & Suisse</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  <span>Données publiques officielles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-accent" />
                  <span>Depuis 2023</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            USE CASES SECTION - Cas d'usage par secteur
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 px-6 relative z-10" style={{
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(0, 0, 0, 0.3) 100%)',
          borderTop: '1px solid rgba(14, 165, 233, 0.15)'
        }}>
          <div className="container mx-auto max-w-6xl">
            <div className={`scroll-reveal ${problemsAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4">
                Cas d'usage par secteur
              </h2>
              <p className="text-lg text-white/60 text-center mb-12 max-w-2xl mx-auto">
                Découvrez comment nous transformons votre prospection selon votre activité
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1 - Installateurs Sécurité */}
                <Card 
                  onClick={() => window.location.href = '/blog/installateurs-securite'}
                  className="glass-card p-6 border-accent/20 hover:border-accent/50 transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  <div className="w-full h-40 rounded-lg mb-4 flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}>
                    <Shield className="w-16 h-16 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Installateurs systèmes de sécurité</h3>
                  <p className="text-white/70 text-sm mb-4 leading-relaxed">
                    Leads ciblés + app terrain = +40% CA. Signez les chantiers avant vos concurrents.
                  </p>
                  <Button 
                    variant="outline"
                    className="w-full border-accent text-accent hover:bg-accent/10"
                  >
                    Lire l'article détaillé
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Card>

                {/* Card 2 - Fournisseurs Restauration */}
                <Card 
                  onClick={() => window.location.href = '/blog/fournisseurs-restauration'}
                  className="glass-card p-6 border-accent/20 hover:border-accent/50 transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  <div className="w-full h-40 rounded-lg mb-4 flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(251, 146, 60, 0.1) 100%)',
                    border: '1px solid rgba(251, 146, 60, 0.3)'
                  }}>
                    <Building2 className="w-16 h-16 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Fournisseurs restauration</h3>
                  <p className="text-white/70 text-sm mb-4 leading-relaxed">
                    Contactez les nouveaux restaurants avant vos concurrents. +210% RDV, 38% conversion.
                  </p>
                  <Button 
                    variant="outline"
                    className="w-full border-accent text-accent hover:bg-accent/10"
                  >
                    Lire l'article détaillé
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Card>

                {/* Card 3 - Fournisseurs IT */}
                <Card 
                  onClick={() => window.location.href = '/blog/fournisseurs-it'}
                  className="glass-card p-6 border-accent/20 hover:border-accent/50 transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  <div className="w-full h-40 rounded-lg mb-4 flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}>
                    <Database className="w-16 h-16 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Fournisseurs IT B2B</h3>
                  <p className="text-white/70 text-sm mb-4 leading-relaxed">
                    Ciblez les nouvelles entreprises avant qu'elles ne choisissent ailleurs. ROI 4,2x.
                  </p>
                  <Button 
                    variant="outline"
                    className="w-full border-accent text-accent hover:bg-accent/10"
                  >
                    Lire l'article détaillé
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            COMMENT ÇA MARCHE - Processus Simple en 3 Étapes
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="rdv" className="py-20 px-6 scroll-mt-20 relative z-10" style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(14, 165, 233, 0.04) 50%, rgba(0, 0, 0, 0.3) 100%)',
          borderTop: '2px solid rgba(6, 182, 212, 0.3)',
          borderBottom: '1px solid rgba(6, 182, 212, 0.15)'
        }}>
          <div className="container mx-auto max-w-5xl">
            <div ref={solutionAnimation.ref} className={`scroll-reveal ${solutionAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4">
                Comment Nous Vous Aidons à <span className="gradient-text">Générer Plus de RDV</span>
              </h2>
              
              <p className="text-lg text-white/60 text-center max-w-2xl mx-auto mb-16 leading-relaxed">
                Un processus simple et éprouvé qui a déjà aidé +23 PME à multiplier leurs RDV B2B
              </p>
              
              {/* 3 Étapes Claires */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <Card className="glass-card p-8 border-accent/20 hover:border-accent/50 transition-all duration-300 text-center">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl font-bold text-accent">1</span>
                  </div>
                  <Target className="w-12 h-12 text-accent mb-4 mx-auto" />
                  <h3 className="text-xl font-bold mb-3">Nous Trouvons Vos Prospects</h3>
                  <p className="text-white/70 leading-relaxed">
                    Identification des entreprises créées récemment (3-6 mois) dans votre secteur et zone géographique. Recherche multi-canal du décideur précis.
                  </p>
                </Card>

                <Card className="glass-card p-8 border-accent/20 hover:border-accent/50 transition-all duration-300 text-center">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl font-bold text-accent">2</span>
                  </div>
                  <Smartphone className="w-12 h-12 text-accent mb-4 mx-auto" />
                  <h3 className="text-xl font-bold mb-3">Vous Prospectez Efficacement</h3>
                  <p className="text-white/70 leading-relaxed">
                    App Pulse Hub pour gérer vos campagnes téléphone, email et visites terrain. Scripts personnalisés fournis. Tournées GPS optimisées.
                  </p>
                </Card>

                <Card className="glass-card p-8 border-accent/20 hover:border-accent/50 transition-all duration-300 text-center">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl font-bold text-accent">3</span>
                  </div>
                  <TrendingUp className="w-12 h-12 text-accent mb-4 mx-auto" />
                  <h3 className="text-xl font-bold mb-3">Vous Signez Plus Vite</h3>
                  <p className="text-white/70 leading-relaxed">
                    Suivi personnalisé, coaching mensuel et reporting ROI en temps réel. Garantie résultats sous 90 jours.
                  </p>
                </Card>
              </div>

              {/* Différenciateur Clé */}
              <Card className="p-8 border-accent/30 bg-gradient-to-br from-accent/10 to-transparent">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">Pourquoi les créations récentes sont la clé ?</h3>
                    <p className="text-white/80 text-lg leading-relaxed mb-4">
                      Les entreprises créées il y a 3-6 mois sont dans une <strong className="text-accent">fenêtre d'opportunité unique</strong> : elles ont passé la phase critique de lancement, ont des besoins réels et un budget, mais n'ont pas encore choisi tous leurs fournisseurs.
                    </p>
                    <p className="text-white/70 leading-relaxed">
                      <Check className="w-5 h-5 text-emerald-400 inline mr-2" />
                      Timing parfait pour signer avant vos concurrents
                      <br />
                      <Check className="w-5 h-5 text-emerald-400 inline mr-2" />
                      Taux de conversion 3-5x supérieur à la prospection classique
                      <br />
                      <Check className="w-5 h-5 text-emerald-400 inline mr-2" />
                      Cycle de vente réduit de -40% en moyenne
                    </p>
                  </div>
                </div>
              </Card>

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
            RÉSULTATS CLIENTS SECTION - Case Studies avec preuves
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="resultats" className="py-20 px-6 relative z-10 scroll-mt-20" style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(0, 0, 0, 0.3) 100%)',
        }}>
          <div className="container mx-auto max-w-6xl">
            <div className={`scroll-reveal ${problemsAnimation.isVisible ? 'visible' : ''}`}>
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                  Ils ont transformé leur prospection avec <span className="gradient-text">Pulse Entreprise</span>
                </h2>
                <p className="text-lg text-white/60 max-w-2xl mx-auto">
                  Résultats vérifiables de nos clients accompagnés
                </p>
              </div>

              {/* Case Studies Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Case Study 1 - IT B2B Lyon */}
                <Card className="glass-card p-6 border-accent/20 hover:border-accent/40 transition-all duration-300 flex flex-col">
                  <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 w-fit mb-4">
                    Informatique & Télécoms
                  </Badge>
                  <h3 className="text-xl font-bold mb-3">Fournisseur IT B2B – Lyon</h3>
                  <p className="text-white/70 text-sm mb-6 leading-relaxed italic">
                    "Pulse nous a permis de cibler 47 nouvelles entreprises créées en 4 mois. Résultat : 18 RDV obtenus, 6 contrats signés. Le ROI est sans appel."
                  </p>
                  
                  {/* Chiffres clés */}
                  <div className="space-y-3 mb-4 flex-1">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-sm text-white/80">RDV qualifiés</span>
                      <span className="text-lg font-bold text-emerald-400">+180%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-sm text-white/80">Coût acquisition</span>
                      <span className="text-lg font-bold text-emerald-400">-35%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-accent/20">
                      <span className="text-sm text-white/80">ROI sur 6 mois</span>
                      <span className="text-lg font-bold text-accent">4,2x</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-white/40 mt-auto">Client accompagné depuis août 2024</p>
                </Card>

                {/* Case Study 2 - Sécurité Genève */}
                <Card className="glass-card p-6 border-accent/20 hover:border-accent/40 transition-all duration-300 flex flex-col">
                  <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30 w-fit mb-4">
                    Sécurité & Surveillance
                  </Badge>
                  <h3 className="text-xl font-bold mb-3">Installateur Sécurité – Genève (Suisse)</h3>
                  <p className="text-white/70 text-sm mb-6 leading-relaxed italic">
                    "Grâce aux leads créations récentes + app Pulse pour le terrain, on a signé 9 chantiers en 3 mois vs 3 sur toute l'année précédente. Game changer."
                  </p>
                  
                  {/* Chiffres clés */}
                  <div className="space-y-3 mb-4 flex-1">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-sm text-white/80">Nouveaux contrats</span>
                      <span className="text-lg font-bold text-emerald-400">+300%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-sm text-white/80">Temps prospection</span>
                      <span className="text-lg font-bold text-emerald-400">-50%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-accent/20">
                      <span className="text-sm text-white/80">Taux conversion RDV</span>
                      <span className="text-lg font-bold text-accent">22%</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-white/40 mt-auto">Client accompagné depuis janvier 2024</p>
                </Card>

                {/* Case Study 3 - Restauration IDF */}
                <Card className="glass-card p-6 border-accent/20 hover:border-accent/40 transition-all duration-300 flex flex-col">
                  <Badge className="bg-red-500/10 text-red-400 border-red-500/30 w-fit mb-4">
                    CHR & Alimentaire
                  </Badge>
                  <h3 className="text-xl font-bold mb-3">Fournisseur Restauration – Île-de-France</h3>
                  <p className="text-white/70 text-sm mb-6 leading-relaxed italic">
                    "On contacte désormais les nouveaux restaurants avant nos concurrents. Le décideur précis (chef/gérant) est fourni, on gagne un temps fou."
                  </p>
                  
                  {/* Chiffres clés */}
                  <div className="space-y-3 mb-4 flex-1">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-sm text-white/80">RDV nouveaux établ.</span>
                      <span className="text-lg font-bold text-emerald-400">+210%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-sm text-white/80">Taux conversion</span>
                      <span className="text-lg font-bold text-emerald-400">38%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-accent/20">
                      <span className="text-sm text-white/80">Cycle de vente</span>
                      <span className="text-lg font-bold text-accent">-45 jours</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-white/40 mt-auto">Client accompagné depuis mars 2024</p>
                </Card>
              </div>

              {/* Note légale */}
              <p className="text-xs text-white/40 text-center max-w-3xl mx-auto mb-8">
                Résultats basés sur accompagnements réels. Les performances peuvent varier selon secteur et implication client. Garantie résultats 90 jours (voir CGV).
              </p>

              {/* CTA */}
              <div className="text-center">
                <Button 
                  onClick={() => window.open('https://calendly.com/tomiolovpro/pulse', '_blank')}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg px-10 py-6 rounded-xl shadow-2xl hover:shadow-green-500/25 hover:scale-105 transition-all duration-300"
                >
                  Obtenez vos résultats – Réserver Audit
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
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
                {/* ═══════════════════════════════════════════════════════════════════
                    🔒 PLAN GRATUIT - MASQUÉ (Code conservé pour réactivation future)
                    
                    Pour réactiver : 
                    1. Changer grid-cols-2 en grid-cols-3
                    2. Décommenter la Card ci-dessous
                ═══════════════════════════════════════════════════════════════════
                <Card className="relative overflow-visible flex flex-col hover:scale-[1.02] transition-all duration-300 cursor-default" style={{
                  background: 'linear-gradient(135deg, rgba(100, 100, 100, 0.1) 0%, rgba(50, 50, 50, 0.05) 100%)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 20px 60px -10px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="p-4 sm:p-5 flex flex-col flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 text-center text-white">Découverte</h3>
                    <div className="mb-4 text-center py-2 px-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-3xl sm:text-4xl font-bold text-white">0€</span>
                      </div>
                      <p className="text-xs text-white/50">Gratuit</p>
                    </div>
                    <ul className="space-y-2 mb-4 flex-1">
                      {[
                        { icon: Target, label: "30 prospects max" },
                        { icon: Route, label: "2 tournées/mois" },
                        { icon: Smartphone, label: "CRM basique" },
                        { icon: MapPin, label: "GPS intégré" },
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <item.icon className="w-4 h-4 text-white/60 flex-shrink-0" />
                          <span className="text-white text-sm">{item.label}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full bg-white/10 text-white hover:bg-white/20 py-4 font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all mt-auto border border-white/20" 
                      onClick={handleCTAClick}
                    >
                      Commencer gratuitement
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </Card>
                ═══════════════════════════════════════════════════════════════════ */}

                {/* Plan PRO */}
                <Card className="relative overflow-visible flex flex-col hover:scale-[1.05] transition-all duration-300 cursor-default" style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(14, 165, 233, 0.15) 100%)',
                  border: '3px solid rgba(6, 182, 212, 0.7)',
                  boxShadow: '0 30px 80px -15px rgba(6, 182, 212, 0.6), 0 0 100px rgba(6, 182, 212, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-4 py-1.5 rounded-full text-xs font-black tracking-wide shadow-2xl z-10 whitespace-nowrap border-2 border-white/30" style={{
                    boxShadow: '0 8px 32px rgba(251, 146, 60, 0.5), 0 0 0 3px rgba(251, 146, 60, 0.2)'
                  }}>
                    ⭐ PLUS POPULAIRE
                  </div>
                  <div className="p-4 sm:p-5 pt-7 flex flex-col flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 text-center gradient-text">PRO</h3>
                    <div className="mb-4 text-center py-2 px-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(6,182,212,0.4)' }}>
                      <div className="flex items-baseline justify-center gap-1 mb-1">
                        <span className="text-4xl sm:text-5xl font-bold gradient-text">49€</span>
                        <span className="text-sm text-white/70">/mois</span>
                      </div>
                      <p className="text-xs text-emerald-400 font-bold">🎁 7 jours GRATUIT</p>
                      <p className="text-[10px] text-white/50">Sans engagement</p>
                    </div>
                    <ul className="space-y-1.5 mb-4 flex-1">
                      {[
                        "🗺️ Nouvelles entreprises, chaque semaine",
                        "🚀 Tournées GPS optimisées (-40% km)",
                        "📊 CRM complet + Rappels auto",
                        "🎯 Filtres avancés (NAF, dép., taille)",
                        "📈 Export CSV + Analytics",
                        "💬 Support prioritaire 7j/7"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span className="text-white text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 py-5 text-base font-black shadow-2xl hover:shadow-green-500/60 hover:scale-[1.03] transition-all mt-auto border-2 border-green-400/30" 
                      onClick={handleCTAClick}
                    >
                      🚀 Essayer 7 jours GRATUIT
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <p className="text-center text-[10px] text-green-400/70 mt-1.5">✅ Garantie 30j • 🔒 Paiement sécurisé</p>
                  </div>
                </Card>

                {/* Équipes Commerciales */}
                <Card className="relative overflow-visible flex flex-col hover:scale-[1.02] transition-all duration-300 cursor-default" style={{
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
                  border: '2px solid rgba(14, 165, 233, 0.3)',
                  boxShadow: '0 20px 60px -10px rgba(14, 165, 233, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="p-4 sm:p-5 flex flex-col flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 text-center gradient-text">Équipes</h3>
                    <div className="mb-4 text-center py-2 px-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(14,165,233,0.2)' }}>
                      <span className="text-3xl sm:text-4xl font-bold gradient-text">Sur devis</span>
                      <p className="text-xs text-white/50 mt-1">Équipes commerciales</p>
                    </div>
                    <ul className="space-y-2 mb-4 flex-1">
                      {[
                        { icon: Check, label: "Tout PRO inclus" },
                        { icon: Users, label: "Multi-utilisateurs" },
                        { icon: Sparkles, label: "Onboarding dédié" },
                        { icon: Phone, label: "Support prioritaire (2h)" },
                        { icon: TrendingUp, label: "Analytics équipe" },
                        { icon: Building2, label: "Intégrations API" },
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <item.icon className="w-4 h-4 text-cyan-glow flex-shrink-0" />
                          <span className="text-white text-sm">{item.label}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild className="w-full bg-cyan-glow text-black hover:bg-cyan-glow/90 py-4 font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all mt-auto">
                      <a href="mailto:tomiolovpro@gmail.com?subject=Demande de devis PULSE Équipes">
                        Demander un devis
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Section Garanties highlight */}
              <div className="mt-12 mb-8 max-w-4xl mx-auto">
                <Card className="glass-card p-8 border-emerald-500/30" style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
                }}>
                  <h3 className="text-2xl font-bold text-center mb-6 gradient-text">Nos Garanties</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-2">🔒 Garantie Résultats 90 jours</h4>
                        <p className="text-sm text-white/70 leading-relaxed">
                          Si vous n'obtenez pas au minimum X RDV qualifiés en 90 jours, nous continuons gratuitement jusqu'à atteinte de l'objectif.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-2">⚡ Audit Gratuit</h4>
                        <p className="text-sm text-white/70 leading-relaxed">
                          Premier RDV Calendly gratuit pour analyser votre marché et calculer votre ROI potentiel. Aucun engagement.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-2">🔐 Paiement Sécurisé Stripe</h4>
                        <p className="text-sm text-white/70 leading-relaxed">
                          Facturation mensuelle, résiliable à tout moment (préavis 30j). Transparence totale.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-6 h-6 text-orange-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-2">📊 Reporting Transparent</h4>
                        <p className="text-sm text-white/70 leading-relaxed">
                          Dashboard ROI en temps réel : leads fournis, RDV obtenus, CA généré. Visibilité totale.
                        </p>
                      </div>
                    </div>
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
            COMPARAISON SECTION - Pulse vs Autres Solutions
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 px-6 relative z-10" style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(0, 0, 0, 0.3) 100%)',
          borderTop: '1px solid rgba(16, 185, 129, 0.15)',
          borderBottom: '1px solid rgba(16, 185, 129, 0.15)'
        }}>
          <div className="container mx-auto max-w-6xl">
            <div className={`scroll-reveal ${faqAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4">
                Pourquoi <span className="gradient-text">Pulse Entreprise</span> vs Solutions Classiques ?
              </h2>
              <p className="text-lg text-white/60 text-center mb-12 max-w-2xl mx-auto">
                Comparaison objective avec CRM classiques et bases de données
              </p>
              
              {/* Tableau comparatif */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-white/60 font-semibold">Critères</th>
                      <th className="text-center p-4 text-white/80 font-semibold">CRM Classiques<br/><span className="text-sm font-normal text-white/40">(Pipedrive, Salesforce...)</span></th>
                      <th className="text-center p-4 text-white/80 font-semibold">Bases de Données<br/><span className="text-sm font-normal text-white/40">(Apollo, Kaspr...)</span></th>
                      <th className="text-center p-4 font-semibold bg-gradient-to-r from-accent/20 to-emerald-500/20 rounded-t-lg">
                        <span className="gradient-text text-lg">Pulse Entreprise</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white/70">Leads créations 3-6 mois</td>
                      <td className="text-center p-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      <td className="text-center p-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      <td className="text-center p-4 bg-accent/10"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white/70">Recherche décideur précis multi-canal</td>
                      <td className="text-center p-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      <td className="text-center p-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      <td className="text-center p-4 bg-accent/10"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white/70">App terrain intégrée (calls/mails/GPS)</td>
                      <td className="text-center p-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      <td className="text-center p-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      <td className="text-center p-4 bg-accent/10"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white/70">Accompagnement personnalisé</td>
                      <td className="text-center p-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      <td className="text-center p-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      <td className="text-center p-4 bg-accent/10"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white/70">Coaching prospection</td>
                      <td className="text-center p-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      <td className="text-center p-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      <td className="text-center p-4 bg-accent/10"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white/70">Reporting ROI temps réel</td>
                      <td className="text-center p-4"><span className="text-sm text-orange-400">💰 Payant</span></td>
                      <td className="text-center p-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      <td className="text-center p-4 bg-accent/10 rounded-b-lg">
                        <span className="text-emerald-400 font-semibold">✓ Inclus</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* CTA */}
              <div className="text-center mt-12">
                <Button 
                  onClick={() => window.open('https://calendly.com/tomiolovpro/pulse', '_blank')}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg px-10 py-6 rounded-xl shadow-2xl hover:shadow-green-500/25 hover:scale-105 transition-all duration-300"
                >
                  Voir la différence en action – Réserver RDV
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
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
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6">
                Questions <span className="text-accent">fréquentes</span>
              </h2>
              <p className="text-center text-white/60 mb-8 max-w-2xl mx-auto">
                Tout ce que vous devez savoir sur PULSE
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
                {[
                  { q: "Quelle est la différence avec un CRM classique ?", a: "Les CRM classiques (Pipedrive, Salesforce...) sont des outils de gestion de contacts. Pulse Entreprise est un accompagnement complet : nous vous fournissons les leads créations 3-6 mois avec décideur précis + app terrain intégrée + coaching prospection. Vous n'avez pas à chercher vos prospects, on les trouve pour vous." },
                  { q: "Comment sont trouvés les décideurs précis ?", a: "Recherche multi-canal manuelle et automatisée : LinkedIn Premium, Facebook, Google Actualités, journaux locaux, newsletters professionnelles, Bodacc, Full Enrich. Nous identifions le responsable achat, technique ou communication selon votre secteur – pas juste le gérant. Taux de précision >80%." },
                  { q: "L'app Pulse fonctionne-t-elle hors ligne ?", a: "Oui, l'app Pulse est une PWA (Progressive Web App) qui fonctionne offline. Vous pouvez ajouter des notes, interactions et RDV terrain même sans réseau. Synchronisation automatique dès connexion rétablie. Compatible iOS et Android." },
                  { q: "Quels secteurs accompagnez-vous ?", a: "Fournisseurs IT B2B, installateurs sécurité/alarme, fournisseurs CHR/restauration, services aux entreprises, BTP/travaux, équipements professionnels. Si vous ciblez des créations d'entreprises B2B (restaurants, garages, pharmacies, bureaux…), Pulse est adapté. RDV gratuit pour valider votre secteur." },
                  { q: "Garantie résultats : comment ça marche ?", a: "Engagement co-construit lors du premier RDV (ex: 15 RDV qualifiés en 90 jours). Si objectif non atteint, nous continuons l'accompagnement gratuitement jusqu'à atteinte. Reporting ROI transparent chaque mois : leads fournis, RDV obtenus, CA généré. Détails complets dans CGV." },
                  { q: "Puis-je résilier à tout moment ?", a: "Oui, facturation mensuelle résiliable avec préavis 30 jours. Aucun engagement minimum après les 3 premiers mois d'accompagnement (période nécessaire pour déploiement et résultats). Résiliation simple par email, pas de frais cachés." },
                  { q: "Données RGPD : êtes-vous conformes ?", a: "100% conformes RGPD (France) et FADP (Suisse). Données publiques (SIRENE, Bodacc) + recherche multi-canal légale (sources ouvertes). Hébergement Supabase EU, chiffrement SSL, sauvegardes quotidiennes. Vos leads et interactions restent privés, jamais partagés. DPO disponible sur demande." },
                  { q: "Combien de leads fournis par mois ?", a: "Volume adapté à votre secteur et zone géographique. Exemple : 30-50 leads/mois pour fournisseur IT sur région Île-de-France, 15-25 leads/mois pour installateur sécurité sur canton Genève. Définition précise lors du premier RDV en fonction de votre capacité de traitement et objectifs CA." }
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

        {/* ═══════════════════════════════════════════════════════════════════
            NOTRE ÉQUIPE SECTION
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 px-6 relative z-10" style={{
          background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.08) 0%, transparent 60%)'
        }}>
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Qui <span className="gradient-text">sommes-nous</span> ?
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                L'expertise prospection B2B au service de votre croissance
              </p>
            </div>

            {/* Card équipe */}
            <Card className="glass-card p-8 border-accent/20 max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* Photo placeholder */}
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-accent to-emerald-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl font-bold text-white">T</span>
                </div>

                {/* Contenu */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">Tom</h3>
                  <p className="text-accent font-semibold mb-4">Fondateur Pulse Entreprise</p>
                  
                  <p className="text-white/70 leading-relaxed mb-6">
                    15 ans d'expérience en prospection B2B et développement commercial. Après avoir accompagné +50 PME dans leur croissance, j'ai créé Pulse en 2023 pour industrialiser la prospection sur créations récentes – le signal d'achat le plus puissant et sous-exploité.
                  </p>

                  {/* Valeurs */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                    <Badge className="bg-accent/10 text-accent border-accent/30">
                      🎯 Transparence
                    </Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      📈 Résultats
                    </Badge>
                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                      🏆 Excellence
                    </Badge>
                  </div>

                  {/* CTA */}
                  <Button 
                    onClick={() => window.open('https://calendly.com/tomiolovpro/pulse', '_blank')}
                    className="bg-accent hover:bg-accent/90 text-black font-semibold px-6 py-3"
                  >
                    Échanger avec Tom
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            CALENDLY INTÉGRÉ - Réservation Audit Gratuit
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="calendly" className="py-20 px-6 relative z-10" style={{
          background: 'linear-gradient(135deg, rgba(0, 255, 157, 0.08) 0%, rgba(0, 0, 0, 0.3) 100%)',
          borderTop: '2px solid rgba(0, 255, 157, 0.3)'
        }}>
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Réservez Votre <span className="gradient-text">Audit Gratuit</span>
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
                30 minutes pour analyser votre marché, calculer votre ROI potentiel et définir une stratégie personnalisée. Sans engagement.
              </p>
              
              {/* Trust badges avant calendrier */}
              <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span>✓ 100% Gratuit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span>✓ Sans Engagement</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span>✓ Résultats Garantis 90j</span>
                </div>
              </div>
            </div>

            {/* Calendly Embed */}
            <Card className="glass-card p-4 border-accent/30 max-w-4xl mx-auto">
              <div 
                className="calendly-inline-widget" 
                data-url="https://calendly.com/tomiolovpro/pulse?hide_event_type_details=1&hide_gdpr_banner=1&primary_color=00fff0"
                style={{ 
                  minWidth: '320px', 
                  height: '700px',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              ></div>
            </Card>

            {/* Note rassurante */}
            <p className="text-center text-white/50 text-sm mt-8 max-w-xl mx-auto">
              🔒 Vos données sont protégées. Nous respectons votre vie privée et ne partagerons jamais vos informations.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            FOOTER SIMPLIFIÉ
        ═══════════════════════════════════════════════════════════════════ */}
        <footer className="border-t border-white/10 py-12 px-6">
          <div className="container mx-auto max-w-6xl">
            {/* Contenu principal footer */}
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-8">
              {/* Logo + Tagline */}
              <div className="text-center md:text-left">
                <div className="text-2xl font-bold mb-2">
                  <span className="text-white">PULSE</span>
                  <span className="text-accent"> Entreprise</span>
                </div>
                <p className="text-white/60">Génération de RDV B2B pour PME</p>
                <p className="text-white/40 text-sm mt-2">Depuis 2023</p>
              </div>

              {/* Contact */}
              <div className="text-center md:text-right">
                <h4 className="font-bold mb-3 text-white">Contact</h4>
                <a 
                  href="mailto:tomiolovpro@gmail.com" 
                  className="flex items-center gap-2 text-white/60 hover:text-accent transition-colors justify-center md:justify-end"
                >
                  <Mail className="w-4 h-4" />
                  tomiolovpro@gmail.com
                </a>
                <a 
                  href="#calendly" 
                  className="text-accent hover:text-accent/80 transition-colors text-sm mt-2 inline-block"
                >
                  Réserver un audit gratuit →
                </a>
              </div>
            </div>

            {/* Disclaimer RGPD simplifié */}
            <div className="text-xs text-white/40 text-center max-w-2xl mx-auto border-t border-white/10 pt-6 mb-6">
              <p>
                Données publiques officielles (SIRENE, Bodacc). Conformité RGPD France & FADP Suisse.
              </p>
            </div>

            {/* Copyright + Liens légaux */}
            <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white/40 text-sm">
              <p>© 2026 Pulse Entreprise. Tous droits réservés.</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a href="/mentions-legales" className="hover:text-accent transition-colors">Mentions Légales</a>
                <a href="/cgv" className="hover:text-accent transition-colors">CGV</a>
                <a href="/confidentialite" className="hover:text-accent transition-colors">Confidentialité</a>
                <a href="/commercial" className="hover:text-accent transition-colors">Version Solo 49€</a>
              </div>
            </div>
          </div>
        </footer>

        {/* Sticky CTA Mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent md:hidden z-40 safe-area-bottom">
          <Button 
            onClick={() => document.getElementById('calendly')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 rounded-full shadow-lg shadow-green-500/40"
          >
            Réserver Audit Gratuit
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;