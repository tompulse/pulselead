import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Target, TrendingUp, TrendingDown, Check, MapPin, BarChart3, Users, Phone, Mail, FileText, Database, Search, Route, Smartphone, Menu, Building2, Clock, Sparkles, LogOut, LayoutDashboard } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ContactSection from "@/components/landing/ContactSection";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { supabase } from "@/integrations/supabase/client";
import { DemoModeButton } from "@/components/landing/DemoModeButton";
import { SocialProof } from "@/components/landing/SocialProof";

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { initiateCheckout, isLoading: checkoutLoading } = useStripeCheckout();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { hasAccess, isLoading: subscriptionLoading } = useSubscription(userId || undefined);

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

  // Handle dashboard button click - redirect to auth if not logged in, dashboard if has access
  const handleDashboardClick = () => {
    if (!isLoggedIn) {
      // Not logged in - go to auth page
      navigate('/auth');
    } else if (hasAccess) {
      // Logged in with access - go to dashboard
      navigate('/dashboard');
    } else {
      // Logged in but no access - go to plan selection
      navigate('/plan-selection');
    }
  };

  // Handle CTA "Commencer maintenant" click - same logic: dashboard if access, otherwise plan selection
  const handleCTAClick = () => {
    if (!isLoggedIn) {
      // Not logged in - go to auth page
      navigate('/auth');
    } else if (hasAccess) {
      // Logged in with access - go directly to dashboard
      navigate('/dashboard');
    } else {
      // Logged in but no access - go to plan selection
      navigate('/plan-selection');
    }
  };

  // Check if user just logged in and should go to checkout
  // BUT first verify they don't already have access (admin or active subscription)
  useEffect(() => {
    const checkAccessAndRedirect = async () => {
      if (searchParams.get('checkout') !== 'pending' || !userId) return;

      // Clean URL immediately
      window.history.replaceState(null, '', '/');

      try {
        // Check if user is admin
        const { data: isAdmin } = await supabase.rpc('has_role', {
          _user_id: userId,
          _role: 'admin'
        });

        if (isAdmin) {
          // Admin users go directly to dashboard
          navigate('/dashboard');
          return;
        }

        // Check subscription access
        const { data: accessData } = await supabase.rpc('check_subscription_access', {
          _user_id: userId
        });

        const access = accessData as { has_access?: boolean } | null;
        if (access?.has_access) {
          // User already has access, go to dashboard
          navigate('/dashboard');
          return;
        }

        // No access, proceed to checkout
        initiateCheckout();
      } catch (error) {
        console.error('Error checking access:', error);
        // On error, still try checkout
        initiateCheckout();
      }
    };

    checkAccessAndRedirect();
  }, [searchParams, userId, navigate, initiateCheckout]);

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
              <Button onClick={handleDashboardClick} className="bg-accent hover:bg-accent/90 text-black font-semibold px-6">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Mon tableau de bord
              </Button>
              {isLoggedIn && (
                <Button onClick={handleLogout} variant="outline" className="border-white/20 text-white hover:bg-white/10 font-semibold px-4">
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Tablet buttons */}
            <div className="hidden sm:flex lg:hidden items-center gap-2">
              <Button onClick={handleDashboardClick} className="bg-accent hover:bg-accent/90 text-black font-semibold h-9 px-3 text-xs">
                <LayoutDashboard className="mr-1 h-3 w-3" />
                Dashboard
              </Button>
              {isLoggedIn && (
                <Button onClick={handleLogout} variant="outline" className="border-white/20 text-white hover:bg-white/10 h-9 px-2">
                  <LogOut className="h-3 w-3" />
                </Button>
              )}
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
                      <Button onClick={handleDashboardClick} className="w-full bg-accent text-black font-semibold">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Mon tableau de bord
                      </Button>
                      {isLoggedIn && (
                        <Button onClick={handleLogout} variant="outline" className="w-full border-white/20 text-white">
                          <LogOut className="mr-2 h-4 w-4" />
                          Se déconnecter
                        </Button>
                      )}
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
              <div className="inline-flex items-center gap-2 bg-accent/10 backdrop-blur-sm px-4 py-2 rounded-full border border-accent/30 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                <span className="text-sm text-white/90">Essai gratuit 7 jours</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.1] mb-6">
                <span className="text-white">Vendez plus.</span>
                <br />
                <span className="gradient-text">Roulez moins.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-8">
                4,5M d'entreprises • Tournées GPS optimisées • CRM terrain
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  onClick={handleCTAClick}
                  disabled={checkoutLoading || subscriptionLoading}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-6 rounded-xl shadow-2xl hover:shadow-green-500/25 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                >
                  {checkoutLoading || subscriptionLoading ? 'Redirection...' : 'Commencer maintenant'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <DemoModeButton />
              </div>

              {/* Stats KPIs - Épurés */}
              <div className="mt-10 grid grid-cols-3 gap-6 sm:gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl sm:text-5xl font-bold gradient-text mb-2">4,5M+</div>
                  <p className="text-white/60 text-xs sm:text-sm">entreprises</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-5xl font-bold gradient-text mb-2">-40%</div>
                  <p className="text-white/60 text-xs sm:text-sm">de km</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-5xl font-bold gradient-text mb-2">+35%</div>
                  <p className="text-white/60 text-xs sm:text-sm">de visites</p>
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
            SOLUTION SECTION - Fonctionnalités PULSE
        ═══════════════════════════════════════════════════════════════════ */}
        <section id="solution" className="py-20 px-6 scroll-mt-20 relative z-10">
          <div className="container mx-auto max-w-5xl">
            <div ref={solutionAnimation.ref} className={`scroll-reveal ${solutionAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-4xl sm:text-5xl font-bold text-center mb-12">
                Tout ce dont vous avez <span className="gradient-text">besoin</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="glass-card p-8 border-accent/20 hover:border-accent/50 transition-all duration-300">
                  <Database className="w-12 h-12 text-accent mb-4" />
                  <h3 className="text-xl font-bold mb-3">Base 4,5M entreprises</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Filtrez par NAF, département, taille. Données SIRENE mises à jour chaque semaine.
                  </p>
                </Card>

                <Card className="glass-card p-8 border-accent/20 hover:border-accent/50 transition-all duration-300">
                  <Route className="w-12 h-12 text-accent mb-4" />
                  <h3 className="text-xl font-bold mb-3">Tournées GPS optimisées</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    -40% de km. Navigation Waze/Maps en 1 clic. Itinéraires calculés automatiquement.
                  </p>
                </Card>

                <Card className="glass-card p-8 border-accent/20 hover:border-accent/50 transition-all duration-300">
                  <Smartphone className="w-12 h-12 text-accent mb-4" />
                  <h3 className="text-xl font-bold mb-3">CRM mobile terrain</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Notes, rappels, RDV, pipeline Kanban. Simple et rapide depuis votre poche.
                  </p>
                </Card>
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
            SOCIAL PROOF SECTION - Témoignages
        ═══════════════════════════════════════════════════════════════════ */}
        <SocialProof />

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
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
                {/* Plan Gratuit */}
                <Card className="relative overflow-visible flex flex-col hover:scale-[1.02] transition-all duration-300 cursor-default" style={{
                  background: 'linear-gradient(135deg, rgba(100, 100, 100, 0.1) 0%, rgba(50, 50, 50, 0.05) 100%)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 20px 60px -10px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="p-5 sm:p-6 flex flex-col flex-1">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-white">Découverte</h3>
                    <div className="mb-5 text-center py-3 px-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="flex items-baseline justify-center gap-2 mb-1">
                        <span className="text-4xl sm:text-5xl font-bold text-white">0€</span>
                      </div>
                      <p className="text-sm text-white/50">Gratuit pour toujours</p>
                    </div>
                    <ul className="space-y-2 mb-5 flex-1">
                      {[
                        { icon: Target, label: "20 prospects par département", desc: "Testez sur 1 zone de votre choix" },
                        { icon: Route, label: "1 tournée par mois", desc: "Max 5 prospects par tournée" },
                        { icon: Smartphone, label: "CRM basique", desc: "Notes uniquement, pas de rappels" },
                        { icon: MapPin, label: "Visualisation carte", desc: "Voir vos prospects sur la carte" },
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-all">
                          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <item.icon className="w-3 h-3 text-white/60" />
                          </div>
                          <div>
                            <span className="text-white text-sm font-semibold">{item.label}</span>
                            <p className="text-white/50 text-xs">{item.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full bg-white/10 text-white hover:bg-white/20 py-5 font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all mt-auto border border-white/20" 
                      onClick={() => navigate('/auth')}
                    >
                      Commencer gratuitement
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </Card>

                {/* Plan PRO */}
                <Card className="relative overflow-visible flex flex-col hover:scale-[1.05] transition-all duration-300 cursor-default" style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(14, 165, 233, 0.12) 100%)',
                  border: '3px solid rgba(6, 182, 212, 0.6)',
                  boxShadow: '0 30px 80px -15px rgba(6, 182, 212, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-lg z-10 whitespace-nowrap animate-pulse">
                    ⭐ PLUS POPULAIRE
                  </div>
                  <div className="p-5 sm:p-6 pt-8 flex flex-col flex-1">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-center gradient-text">PRO</h3>
                    <div className="mb-5 text-center py-3 px-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(6,182,212,0.3)' }}>
                      <div className="flex items-baseline justify-center gap-2 mb-1">
                        <span className="text-4xl sm:text-5xl font-bold gradient-text">49€</span>
                        <span className="text-base text-white/60">/mois</span>
                      </div>
                      <p className="text-sm text-emerald-400 font-semibold">7 jours d'essai gratuit</p>
                      <p className="text-xs text-white/50 mt-1">Sans engagement • Annulez quand vous voulez</p>
                      <p className="text-[10px] text-white/30 mt-1">TVA non applicable, art. 293 B du CGI</p>
                    </div>
                    <ul className="space-y-3 mb-6 flex-1">
                      {[
                        "4,5M+ entreprises France entière",
                        "Tournées GPS optimisées illimitées",
                        "CRM complet + Rappels auto",
                        "Tous filtres (NAF, dép., taille)",
                        "Export & Analytics"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-accent flex-shrink-0" />
                          <span className="text-white/90 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 py-6 text-lg font-bold shadow-2xl hover:shadow-green-500/50 hover:scale-[1.03] transition-all mt-auto" 
                      onClick={handleCTAClick}
                      disabled={checkoutLoading || subscriptionLoading}
                    >
                      {checkoutLoading || subscriptionLoading ? 'Redirection...' : 'Essayer 7 jours gratuit'}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <p className="text-center text-xs text-white/40 mt-2">✅ Garantie satisfait ou remboursé 30 jours</p>
                  </div>
                </Card>

                {/* Équipes Commerciales */}
                <Card className="relative overflow-visible flex flex-col hover:scale-[1.02] transition-all duration-300 cursor-default" style={{
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
                  border: '2px solid rgba(14, 165, 233, 0.3)',
                  boxShadow: '0 20px 60px -10px rgba(14, 165, 233, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="p-5 sm:p-6 flex flex-col flex-1">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-center gradient-text">Équipes</h3>
                    <div className="mb-5 text-center py-3 px-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(14,165,233,0.2)' }}>
                      <span className="text-3xl sm:text-4xl font-bold gradient-text">Sur devis</span>
                      <p className="text-xs text-white/50 mt-2">Pour les équipes commerciales</p>
                    </div>
                    <ul className="space-y-2 mb-5 flex-1">
                      {[
                        { icon: Check, label: "Tout PRO inclus", desc: "Fonctionnalités illimitées" },
                        { icon: Users, label: "Multi-utilisateurs", desc: "Invitez votre équipe" },
                        { icon: Sparkles, label: "Onboarding dédié", desc: "Formation personnalisée" },
                        { icon: Phone, label: "Support prioritaire", desc: "Réponse sous 2h" },
                        { icon: TrendingUp, label: "Analytics équipe", desc: "Dashboard manager" },
                        { icon: Building2, label: "Intégrations API", desc: "Connectez vos outils" },
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
                    <Button asChild className="w-full bg-cyan-glow text-black hover:bg-cyan-glow/90 py-5 font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all mt-auto">
                      <a href="mailto:tomiolovpro@gmail.com?subject=Demande de devis PULSE Équipes">
                        Demander un devis
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </a>
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
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6">
                Questions <span className="text-accent">fréquentes</span>
              </h2>
              <p className="text-center text-white/60 mb-8 max-w-2xl mx-auto">
                Tout ce que vous devez savoir sur PULSE
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
                {[
                  { q: "🎯 Quelle est la différence avec les concurrents ?", a: "PULSE est conçu POUR les commerciaux terrain. Pas de CRM usine à gaz : juste ce qu'il faut pour prospecter intelligemment. Les tournées optimisées IA sont incluses (pas besoin de 10 outils différents), et tout fonctionne en mode mobile." },
                  { q: "📱 Ça marche vraiment sur téléphone ?", a: "Oui ! PULSE est une PWA (Progressive Web App) : vous l'installez comme une appli, ça fonctionne hors ligne, et c'est optimisé pour iPhone et Android. Ajoutez vos interactions terrain en 10 secondes." },
                  { q: "🗺️ Comment fonctionne l'optimisation de tournées ?", a: "Sélectionnez vos prospects, PULSE calcule automatiquement l'itinéraire le plus court avec Mapbox. Vous économisez jusqu'à 40% de kilomètres. Vous pouvez modifier l'ordre manuellement et lancer la navigation GPS directement." },
                  { q: "🔄 Les données sont actualisées quand ?", a: "Données INSEE/SIRENE mises à jour chaque semaine. Vous avez accès aux nouvelles créations d'entreprises en quasi temps-réel (délai INSEE : ~5 jours après l'immatriculation)." },
                  { q: "💳 Comment fonctionne l'essai 7 jours ?", a: "Vous testez toutes les features gratuitement pendant 7 jours. Votre carte bancaire est demandée, mais vous ne serez débité qu'au 8ème jour. Annulez à tout moment avant sans frais." },
                  { q: "🔒 Mes données prospects sont sécurisées ?", a: "100%. Hébergement Supabase (certifié RGPD), chiffrement SSL, sauvegardes quotidiennes. Vos prospects et interactions restent privés, jamais partagés avec d'autres users." },
                  { q: "📞 Je peux avoir le téléphone des prospects ?", a: "On enrichit les données quand disponibles (environ 40% pour les nouvelles créations). Vous pouvez aussi saisir vous-même les infos trouvées sur le terrain, elles seront sauvegardées dans votre CRM." },
                  { q: "⚡ Je peux annuler quand je veux ?", a: "Oui, sans engagement. Annulez en 1 clic depuis votre espace, pas besoin de nous contacter. Vous gardez l'accès jusqu'à la fin de votre période payée." }
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
            <div className="text-xs text-white/50 text-center mb-6 max-w-3xl mx-auto border-t border-white/10 pt-6">
              <p>
                PULSE utilise des données publiques issues du répertoire SIRENE (INSEE). PULSE est un outil d'optimisation 
                de tournées terrain, pas un outil de prospection téléphonique ou par email. Les données affichées sont : SIRET/SIREN, nom de l'entreprise, adresse et date de création.
              </p>
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
          <Button 
            onClick={initiateCheckout} 
            disabled={checkoutLoading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 rounded-full shadow-lg shadow-green-500/40"
          >
            {checkoutLoading ? 'Redirection...' : 'Commencer maintenant'}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;