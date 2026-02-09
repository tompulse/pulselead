import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowRight, Check, Phone, Target, Smartphone, Users, BarChart3, Sparkles, Menu, TrendingUp, Shield, Award, Clock, Building2, FileText, Search, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const EntrepriseLanding = () => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    secteur: '',
    tailleEquipe: '',
    message: ''
  });
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const heroAnimation = useScrollAnimation({ threshold: 0.2 });
  const educationAnimation = useScrollAnimation({ threshold: 0.2 });
  const secteurAnimation = useScrollAnimation({ threshold: 0.2 });
  const useCasesAnimation = useScrollAnimation({ threshold: 0.2 });
  const accompagnementAnimation = useScrollAnimation({ threshold: 0.2 });
  const beforeAfterAnimation = useScrollAnimation({ threshold: 0.2 });
  const testimonialsAnimation = useScrollAnimation({ threshold: 0.2 });
  const pricingAnimation = useScrollAnimation({ threshold: 0.2 });
  const newsletterAnimation = useScrollAnimation({ threshold: 0.2 });
  const faqAnimation = useScrollAnimation({ threshold: 0.2 });
  const ctaFinalAnimation = useScrollAnimation({ threshold: 0.2 });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Merci ! Nous vous contactons sous 24h.');
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter:', newsletterEmail);
    alert('Merci pour votre inscription !');
    setNewsletterEmail('');
  };

  const calendlyUrl = "https://calendly.com/tomiolovpro/pulse";

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #0A0E1A 0%, #001F3F 50%, #0A0E1A 100%)'
    }}>
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[120px]" style={{
          background: 'radial-gradient(circle, rgba(0,255,157,0.12) 0%, transparent 70%)'
        }}></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-[100px]" style={{
          background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)'
        }}></div>
      </div>

      {/* Header sticky */}
      <header className="sticky top-0 left-0 right-0 z-50" style={{
        background: 'rgba(10, 14, 26, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.15)'
      }}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="text-2xl font-bold">
              <span style={{ 
                background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700
              }}>PULSE</span>
              <span className="text-white ml-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Entreprise</span>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden lg:flex items-center gap-6">
              <a href="#education" className="text-sm hover:text-[#00FF9D] transition-colors" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>Pourquoi Leads Récents ?</a>
              <a href="#decideurs" className="text-sm hover:text-[#00FF9D] transition-colors" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>Personnalisation Décideurs</a>
              <a href="#app" className="text-sm hover:text-[#00FF9D] transition-colors" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>App Pulse Hub</a>
              <a href="#roi" className="text-sm hover:text-[#00FF9D] transition-colors" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>ROI & Garanties</a>
              <a href="#pricing" className="text-sm hover:text-[#00FF9D] transition-colors" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>Tarifs Sur Devis</a>
              <a href="#contact" className="text-sm hover:text-[#00FF9D] transition-colors" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>Contact</a>
              <a href="#use-cases" className="text-sm hover:text-[#00FF9D] transition-colors" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>Use Cases</a>
            </nav>

            {/* Desktop Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <a 
                href="/commercial" 
                className="text-sm font-medium px-4 py-2 rounded-lg border transition-all hover:border-[#00D4FF] hover:text-[#00D4FF]" 
                style={{ 
                  color: '#00D4FF', 
                  borderColor: 'rgba(0, 212, 255, 0.4)',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                Version Solo (49 €)
              </a>
              <Button 
                onClick={() => window.open(calendlyUrl, '_blank')}
                className="font-bold px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
                style={{ 
                  background: '#00FF9D', 
                  color: '#000',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#00D4FF'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#00FF9D'}
              >
                Réserver RDV Calendly
              </Button>
            </div>

            {/* Mobile Menu */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80" style={{ background: '#0A0E1A', borderLeft: '1px solid rgba(0,212,255,0.2)' }}>
                  <nav className="flex flex-col gap-6 mt-8">
                    <a href="#education" className="text-base" style={{ color: '#A0AEC0' }}>Pourquoi Leads Récents ?</a>
                    <a href="#decideurs" className="text-base" style={{ color: '#A0AEC0' }}>Décideurs</a>
                    <a href="#app" className="text-base" style={{ color: '#A0AEC0' }}>App Pulse</a>
                    <a href="#roi" className="text-base" style={{ color: '#A0AEC0' }}>ROI</a>
                    <a href="#pricing" className="text-base" style={{ color: '#A0AEC0' }}>Tarifs</a>
                    <a href="#contact" className="text-base" style={{ color: '#A0AEC0' }}>Contact</a>
                    <a href="#use-cases" className="text-base" style={{ color: '#A0AEC0' }}>Use Cases</a>
                    <div className="border-t pt-6" style={{ borderColor: 'rgba(0,212,255,0.2)' }}>
                      <a href="/commercial" className="block mb-4 text-sm" style={{ color: '#A0AEC0' }}>Version Solo (49 €)</a>
                      <Button className="w-full font-bold" style={{ background: '#00FF9D', color: '#000' }} onClick={() => window.open(calendlyUrl, '_blank')}>
                        Réserver RDV
                      </Button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="pt-32 pb-20 px-6" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
          <div className="container mx-auto max-w-7xl">
            <div ref={heroAnimation.ref} className={`scroll-reveal ${heroAnimation.isVisible ? 'visible' : ''}`}>
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Texte */}
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6" style={{ 
                    letterSpacing: '-0.02em',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700
                  }}>
                    Dominez Votre Secteur B2B : Leads Personnalisés + App Terrain
                  </h1>
                  <p className="text-2xl sm:text-3xl mb-6" style={{ 
                    color: '#00FF9D', 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700
                  }}>
                    Signez avant vos concurrents – pourquoi n'avez-vous pas commencé plus tôt ?
                  </p>
                  <p className="text-lg sm:text-xl mb-8" style={{ color: '#A0AEC0', lineHeight: '1.6', fontFamily: 'Inter, sans-serif' }}>
                    Accompagnement premium depuis 2023 : recherche multi-canal du décideur précis sur créations 3-6 mois (restaurants, garages, pharmacies…), app Pulse hub pour prospection complète (téléphone, mail, terrain). Multipliez vos RDV par 3 à 5 et prenez des parts de marché.
                  </p>

                  {/* Stats Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    {[
                      '+3-5x RDV vs aléatoire',
                      '-40% km terrain',
                      '+40% ROI mesuré'
                    ].map((stat, i) => (
                      <Card key={i} className="p-6 text-center border transition-all hover:scale-105" style={{
                        background: 'rgba(0, 212, 255, 0.05)',
                        borderColor: 'rgba(0, 212, 255, 0.3)',
                        borderRadius: '12px'
                      }}>
                        <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>{stat}</p>
                      </Card>
                    ))}
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Button 
                      onClick={() => window.open(calendlyUrl, '_blank')}
                      className="font-bold px-8 py-6 text-lg rounded-xl shadow-2xl transition-all hover:scale-105"
                      style={{ background: '#00FF9D', color: '#000', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}
                    >
                      Réserver RDV Calendly
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="font-bold px-8 py-6 text-lg rounded-xl transition-all hover:scale-105"
                      style={{ borderColor: '#00D4FF', color: '#00D4FF', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}
                      onClick={() => {
                        // TODO: Télécharger le guide
                        alert('Guide gratuit en préparation');
                      }}
                    >
                      Guide Gratuit Leads Récents
                    </Button>
                  </div>
                </div>

                {/* Mockup App Pulse */}
                <div className="relative">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{
                    background: 'linear-gradient(135deg, rgba(0,255,157,0.1) 0%, rgba(0,212,255,0.1) 100%)',
                    border: '2px solid rgba(0,212,255,0.3)',
                    height: '450px',
                    width: '700px',
                    maxWidth: '100%',
                    margin: '0 auto'
                  }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Smartphone className="w-20 h-20 mx-auto mb-4" style={{ color: '#00FF9D' }} />
                        <p className="text-white text-lg font-semibold">Mockup App Pulse Hub</p>
                        <p className="text-sm" style={{ color: '#A0AEC0' }}>Téléphone + Mail + Terrain</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-[#00FF9D]/20 to-[#00D4FF]/20 blur-3xl -z-10 rounded-3xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION ÉDUCATION */}
        <section id="education" className="py-28 px-6" style={{
          background: 'linear-gradient(135deg, rgba(0,212,255,0.06) 0%, rgba(10,14,26,0.8) 100%)',
          borderTop: '2px solid rgba(0,212,255,0.2)',
          borderBottom: '1px solid rgba(0,212,255,0.1)'
        }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={educationAnimation.ref} className={`scroll-reveal ${educationAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-6" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                Le Secret Ignoré : Créations 3-6 Mois = Signaux d'Achat Puissants
              </h2>
              <p className="text-base text-center mb-12 max-w-3xl mx-auto" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                Depuis 2023, nous aidons des PME B2B à exploiter les créations récentes comme opportunité massive. Notre recherche multi-canal (Facebook, Google Actualités, journaux locaux, Bodacc, newsletters professionnelles, LinkedIn Premium, Full Enrich…) permet d'être le premier à contacter le décideur précis (responsable achat, technique, communication…) – pas juste le gérant. Pourquoi aléatoire quand on peut être réactif et précis ? Vos concurrents le font déjà.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    title: 'Signal vs Aléatoire',
                    desc: 'Créations 3-6 mois = besoins urgents, budget alloué. Taux conversion x5 vs prospection froide.',
                    icon: Target
                  },
                  {
                    title: 'Recherche Multi-Canal',
                    desc: 'Facebook, Google News, Bodacc, LinkedIn Premium, Full Enrich… pour trouver LE bon décideur.',
                    icon: Search
                  },
                  {
                    title: 'Décideur Précis',
                    desc: 'Pas juste le gérant : responsable achat, technique, communication selon votre activité.',
                    icon: Users
                  },
                  {
                    title: 'App Pulse Multi-Canal',
                    desc: 'Prospection téléphone + mail + terrain dans une seule app collaborative.',
                    icon: Smartphone
                  },
                  {
                    title: 'Expertise Depuis 2023',
                    desc: 'Des centaines de leads fournis, expertise terrain éprouvée, résultats mesurés.',
                    icon: Award
                  }
                ].map((item, i) => (
                  <Card key={i} className="p-8 border transition-all hover:scale-105 hover:shadow-2xl" style={{
                    background: 'rgba(10, 14, 26, 0.6)',
                    borderColor: 'rgba(0, 212, 255, 0.3)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '16px'
                  }}>
                    <item.icon className="w-12 h-12 mb-4" style={{ color: '#00FF9D' }} />
                    <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>{item.title}</h3>
                    <p className="text-sm" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>{item.desc}</p>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button 
                  onClick={() => {
                    alert('Téléchargement du guide en cours...');
                  }}
                  className="font-bold px-8 py-6 text-lg rounded-xl shadow-2xl transition-all hover:scale-105" 
                  style={{ background: '#00FF9D', color: '#000', fontFamily: 'Inter, sans-serif' }}
                >
                  Téléchargez le Guide
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ENCART SECTEUR - Installateurs Sécurité */}
        <section id="decideurs" className="py-28 px-6" style={{
          background: 'linear-gradient(135deg, rgba(0,31,63,0.9) 0%, rgba(10,14,26,0.95) 100%)',
          borderTop: '2px solid rgba(0,212,255,0.3)',
          borderBottom: '2px solid rgba(0,212,255,0.3)'
        }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={secteurAnimation.ref} className={`scroll-reveal ${secteurAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                Spécialement conçu pour les installateurs de systèmes de sécurité
              </h2>
              <p className="text-xl text-center mb-8" style={{ color: '#00FF9D', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                Nous connaissons votre métier par cœur
              </p>
              <p className="text-lg text-center mb-10 max-w-3xl mx-auto" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                Chantiers à forte valeur, prospection chronophage. Nous ciblons créations 3-6 mois avec besoin sécurité, décideur précis (gérants/resp travaux/sécurité/facility), multi-canal pour assaut complet. Résultats : 22–38 % RDV, cycle -30-60 jours, coût ÷2-3.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                  '22-38% RDV bookés',
                  'Cycle vente -30-60 jours',
                  'Coût acquisition ÷2-3'
                ].map((stat, i) => (
                  <Card key={i} className="p-6 text-center border transition-all hover:scale-105" style={{
                    background: 'rgba(0, 255, 157, 0.08)',
                    borderColor: 'rgba(0, 212, 255, 0.4)',
                    borderRadius: '12px'
                  }}>
                    <p className="text-lg font-bold" style={{ color: '#00FF9D', fontFamily: 'Inter, sans-serif' }}>{stat}</p>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Button 
                  onClick={() => window.open(calendlyUrl, '_blank')}
                  className="font-bold px-8 py-6 text-lg rounded-xl shadow-2xl transition-all hover:scale-105" 
                  style={{ background: '#00FF9D', color: '#000', fontFamily: 'Inter, sans-serif' }}
                >
                  Devis Sécurité
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* USE CASES SECTION */}
        <section id="use-cases" className="py-28 px-6" style={{
          background: 'linear-gradient(180deg, #0A0E1A 0%, rgba(0,31,63,0.5) 100%)'
        }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={useCasesAnimation.ref} className={`scroll-reveal ${useCasesAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                Cas d'usage par secteur
              </h2>
              <p className="text-xl text-center mb-12" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                Découvrez comment nous transformons votre prospection
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: 'Installateurs systèmes de sécurité',
                    teaser: 'Leads ciblés + app terrain = +40% CA',
                    link: '/blog/installateurs-securite',
                    icon: Shield
                  },
                  {
                    title: 'Fournisseurs restauration',
                    teaser: 'Signez les nouveaux restaurants avant vos concurrents',
                    link: '/blog/fournisseurs-restauration',
                    icon: Building2
                  },
                  {
                    title: 'Fournisseurs IT B2B',
                    teaser: 'Ciblez les nouvelles entreprises avant qu\'elles ne choisissent ailleurs',
                    link: '/blog/fournisseurs-it',
                    icon: Target
                  }
                ].map((item, i) => (
                  <Card key={i} className="p-8 border transition-all hover:scale-105 hover:shadow-2xl" style={{
                    background: 'rgba(10, 14, 26, 0.6)',
                    borderColor: 'rgba(0, 212, 255, 0.3)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '16px'
                  }}>
                    <item.icon className="w-12 h-12 mb-4" style={{ color: '#00FF9D' }} />
                    <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>{item.title}</h3>
                    <p className="text-sm mb-6" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>{item.teaser}</p>
                    <Button 
                      onClick={() => window.location.href = item.link}
                      variant="outline"
                      className="w-full transition-all hover:scale-105"
                      style={{ borderColor: '#00D4FF', color: '#00D4FF', fontFamily: 'Inter, sans-serif' }}
                    >
                      Lire l'article détaillé
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ACCOMPAGNEMENT SECTION */}
        <section id="app" className="py-28 px-6" style={{
          background: 'linear-gradient(135deg, rgba(0,31,63,0.8) 0%, rgba(10,14,26,0.9) 100%)',
          borderTop: '2px solid rgba(0,212,255,0.2)'
        }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={accompagnementAnimation.ref} className={`scroll-reveal ${accompagnementAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-12" style={{ fontFamily: 'Inter, sans-serif' }}>
                Accompagnement Tout-en-Un Ultra-Personnalisé
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { title: 'Leads 3-6 mois multi-canal', desc: 'Recherche exhaustive sur tous les canaux pour trouver les créations récentes', icon: Search },
                  { title: 'Décideur précis', desc: 'Identification du vrai décideur (achat, technique, communication)', icon: Target },
                  { title: 'App Pulse (calls/mails/terrain)', desc: 'Prospection complète téléphone + mail + terrain en une seule app', icon: Smartphone },
                  { title: 'Reporting ROI', desc: 'Tableaux de bord temps réel avec métriques clés et ROI mesuré', icon: BarChart3 },
                  { title: 'Co-construction Calendly', desc: 'RDV personnalisé pour définir votre stratégie sur mesure', icon: Clock },
                  { title: 'Expansion FR/Suisse', desc: 'Déploiement multi-pays (France, Suisse, Belgique)', icon: Sparkles }
                ].map((item, i) => (
                  <Card key={i} className="p-8 border transition-all hover:scale-105 hover:shadow-2xl" style={{
                    background: 'rgba(10, 14, 26, 0.6)',
                    borderColor: 'rgba(0, 212, 255, 0.3)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '16px'
                  }}>
                    <item.icon className="w-12 h-12 mb-4" style={{ color: '#00FF9D' }} />
                    <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>{item.title}</h3>
                    <p className="text-sm" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>{item.desc}</p>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button 
                  onClick={() => window.open(calendlyUrl, '_blank')}
                  className="font-bold px-8 py-6 text-lg rounded-xl shadow-2xl transition-all hover:scale-105" 
                  style={{ background: '#00FF9D', color: '#000', fontFamily: 'Inter, sans-serif' }}
                >
                  Réserver RDV Calendly
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* AVANT / APRÈS SECTION */}
        <section id="roi" className="py-28 px-6" style={{
          background: 'linear-gradient(180deg, #0A0E1A 0%, rgba(0,31,63,0.4) 100%)',
          borderTop: '2px solid rgba(0,212,255,0.2)'
        }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={beforeAfterAnimation.ref} className={`scroll-reveal ${beforeAfterAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-12" style={{ fontFamily: 'Inter, sans-serif' }}>
                Du Chaos de la Prospection Aléatoire au Système Maîtrisé
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Avant */}
                <Card className="p-8 border transition-all hover:scale-[1.02]" style={{
                  background: 'rgba(30, 30, 30, 0.6)',
                  borderColor: 'rgba(239, 68, 68, 0.5)',
                  borderRadius: '16px'
                }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-red-500 transform rotate-180" />
                    </div>
                    <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Avant</h3>
                  </div>
                  <ul className="space-y-4 text-base" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 text-xl">✗</span>
                      <span>Prospection aléatoire : temps perdu, faible retour</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 text-xl">✗</span>
                      <span>Kilomètres inutiles sans ciblage précis</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 text-xl">✗</span>
                      <span>Pas de suivi structuré, prospects oubliés</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 text-xl">✗</span>
                      <span>ROI difficile à mesurer, résultats aléatoires</span>
                    </li>
                  </ul>
                </Card>

                {/* Après */}
                <Card className="p-8 border transition-all hover:scale-[1.02]" style={{
                  background: 'linear-gradient(135deg, rgba(0,255,157,0.1) 0%, rgba(0,212,255,0.05) 100%)',
                  borderColor: 'rgba(0,255,157,0.5)',
                  borderRadius: '16px'
                }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,255,157,0.2)' }}>
                      <TrendingUp className="w-6 h-6" style={{ color: '#00FF9D' }} />
                    </div>
                    <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Après</h3>
                  </div>
                  <ul className="space-y-4 text-base text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#00FF9D' }} />
                      <span><strong style={{ color: '#00FF9D' }}>+3-5x</strong> de RDV qualifiés grâce au ciblage précis</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#00FF9D' }} />
                      <span>Tournées optimisées : -40 % de km inutiles</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#00FF9D' }} />
                      <span>App Pulse : téléphone + mail + terrain en un seul outil</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#00FF9D' }} />
                      <span><strong style={{ color: '#00D4FF' }}>+40 %</strong> de ROI mesuré sur 3 mois</span>
                    </li>
                  </ul>
                </Card>
              </div>

              <div className="text-center mt-12">
                <Button 
                  onClick={() => window.open(calendlyUrl, '_blank')}
                  className="font-bold px-8 py-6 text-lg rounded-xl shadow-2xl transition-all hover:scale-105" 
                  style={{ background: '#00FF9D', color: '#000', fontFamily: 'Inter, sans-serif' }}
                >
                  Réserver RDV Calendly
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* TÉMOIGNAGES */}
        <section className="py-28 px-6" style={{
          background: 'linear-gradient(135deg, rgba(0,212,255,0.06) 0%, rgba(10,14,26,0.8) 100%)'
        }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={testimonialsAnimation.ref} className={`scroll-reveal ${testimonialsAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-10" style={{ fontFamily: 'Inter, sans-serif' }}>
                Ils Ont Déjà Transformé Leur Prospection
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    quote: "Nous avons triplé nos RDV qualifiés en 2 mois avec Pulse Entreprise. L'app terrain est géniale.",
                    author: "Marc D.",
                    role: "Dir. Commercial, Sécurité",
                    stars: 5
                  },
                  {
                    quote: "Les leads récents sont une vraie mine d'or. ROI positif dès le 1er mois, accompagnement au top.",
                    author: "Sophie L.",
                    role: "Gérante, Fournitures Pro",
                    stars: 5
                  },
                  {
                    quote: "App terrain + recherche décideur : on ne pourrait plus s'en passer. Gain de temps énorme.",
                    author: "Thomas B.",
                    role: "Commercial IT B2B",
                    stars: 5
                  }
                ].map((testimonial, i) => (
                  <Card key={i} className="p-8 border transition-all hover:scale-[1.02]" style={{
                    background: 'rgba(10, 14, 26, 0.6)',
                    borderColor: 'rgba(0, 212, 255, 0.3)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '16px'
                  }}>
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.stars)].map((_, j) => (
                        <span key={j} className="text-xl" style={{ color: '#00FF9D' }}>★</span>
                      ))}
                    </div>
                    <p className="text-base text-white mb-6 italic" style={{ fontFamily: 'Inter, sans-serif' }}>"{testimonial.quote}"</p>
                    <div>
                      <p className="font-semibold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>{testimonial.author}</p>
                      <p className="text-sm" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>{testimonial.role}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TARIFS SECTION */}
        <section id="pricing" className="py-28 px-6" style={{
          background: 'linear-gradient(135deg, rgba(0,255,157,0.08) 0%, rgba(0,212,255,0.08) 50%, rgba(10,14,26,0.9) 100%)',
          borderTop: '2px solid rgba(0,212,255,0.3)'
        }}>
          <div className="container mx-auto max-w-4xl">
            <div ref={pricingAnimation.ref} className={`scroll-reveal ${pricingAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Tarifs Sur Devis – Accompagnement Premium
              </h2>
              <p className="text-base text-center mb-12" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                Solution complète personnalisée selon votre secteur et vos objectifs
              </p>

              <Card className="p-12 border-2 transition-all hover:scale-[1.02]" style={{
                background: 'linear-gradient(135deg, rgba(0,255,157,0.15) 0%, rgba(0,212,255,0.1) 100%)',
                borderColor: '#00FF9D',
                borderRadius: '16px',
                boxShadow: '0 0 40px rgba(0,255,157,0.3)'
              }}>
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Accompagnement Entreprise</h3>
                  <div className="text-5xl font-bold mb-2" style={{ color: '#00FF9D', fontFamily: 'Inter, sans-serif' }}>Sur Devis</div>
                  <p className="text-sm" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>Tarif adapté à vos besoins</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {[
                    'Leads 3-6 mois recherche multi-canal exhaustive',
                    'Identification décideur précis (achat, technique, communication)',
                    'App Pulse Hub : téléphone + mail + terrain intégré',
                    'Scripts personnalisés selon votre activité',
                    'Coaching stratégique mensuel + co-construction',
                    'Reporting ROI temps réel avec dashboards',
                    'Support prioritaire dédié (24-48h)',
                    'Expansion FR/Suisse/Belgique'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-base text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <Check className="w-6 h-6 flex-shrink-0" style={{ color: '#00FF9D' }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => window.open(calendlyUrl, '_blank')}
                  className="w-full font-bold py-6 text-lg rounded-xl transition-all hover:scale-105" 
                  style={{ background: '#00FF9D', color: '#000', fontFamily: 'Inter, sans-serif' }}
                >
                  Réserver RDV Calendly pour Devis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Card>

              <p className="text-center text-sm mt-8" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                ✅ ROI garanti • 🔒 Sans engagement long terme • 🎯 Résultats mesurés
              </p>
            </div>
          </div>
        </section>

        {/* NEWSLETTER SECTION */}
        <section className="py-20 px-6" style={{
          background: 'linear-gradient(135deg, rgba(0,31,63,0.8) 0%, rgba(10,14,26,0.9) 100%)',
          borderTop: '1px solid rgba(0,212,255,0.2)'
        }}>
          <div className="container mx-auto max-w-2xl">
            <div ref={newsletterAnimation.ref} className={`scroll-reveal ${newsletterAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Recevez nos Stratégies Exclusives
              </h2>
              <p className="text-base text-center mb-8" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                1 email par mois avec nos meilleurs conseils prospection B2B
              </p>

              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-6 py-4 rounded-lg text-white transition-all"
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  placeholder="votre@email.com"
                />
                <Button 
                  type="submit"
                  className="font-bold px-8 py-4 rounded-lg transition-all hover:scale-105"
                  style={{ background: '#00FF9D', color: '#000', fontFamily: 'Inter, sans-serif' }}
                >
                  S'inscrire
                </Button>
              </form>

              <p className="text-xs text-center mt-4" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                🔒 Vos données sont protégées • Désabonnement en 1 clic
              </p>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-28 px-6" style={{
          background: 'linear-gradient(180deg, #0A0E1A 0%, rgba(0,31,63,0.5) 100%)'
        }}>
          <div className="container mx-auto max-w-4xl">
            <div ref={faqAnimation.ref} className={`scroll-reveal ${faqAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-12" style={{ fontFamily: 'Inter, sans-serif' }}>
                Questions Fréquentes
              </h2>

              <div className="space-y-4">
                {[
                  {
                    q: "Pourquoi les leads 3-6 mois sont-ils si efficaces ?",
                    a: "Les entreprises nouvellement créées ont des besoins immédiats et urgents (équipements, services, infrastructures). Elles sont en phase d'installation et donc ouvertes aux propositions. Le taux de conversion est 3 à 5 fois supérieur à une prospection aléatoire. Depuis 2023, nous avons fourni des centaines de leads à nos clients avec des résultats mesurés."
                  },
                  {
                    q: "Quelle est la différence avec la version Solo à 49 €/mois ?",
                    a: "La version Solo est conçue pour les commerciaux individuels qui gèrent eux-mêmes leur prospection terrain (app CRM + leads). Pulse Entreprise est un accompagnement premium avec recherche multi-canal exhaustive du décideur précis, prospection téléphone + mail + terrain intégrée, coaching stratégique personnalisé, scripts sur mesure et garantie ROI. C'est une solution clé en main pour PME et équipes commerciales qui veulent déléguer la prospection initiale."
                  },
                  {
                    q: "Comment se déroule la recherche du décideur précis ?",
                    a: "Nous utilisons une méthodologie multi-canal éprouvée depuis 2023 : Facebook, Google Actualités, journaux locaux, Bodacc, newsletters professionnelles, LinkedIn Premium, Full Enrich, recherches manuelles ciblées. Selon votre activité, nous identifions non pas juste le gérant, mais le vrai décideur (responsable achats, technique, communication, sécurité, facility management…). Cela augmente drastiquement le taux de conversion."
                  },
                  {
                    q: "L'app Pulse Hub fonctionne-t-elle hors ligne ?",
                    a: "Oui, l'app Pulse Hub est une PWA (Progressive Web App) qui fonctionne hors ligne. Vous pouvez consulter vos leads, ajouter des notes, gérer votre pipeline terrain même sans connexion. Les données se synchronisent automatiquement dès que vous retrouvez du réseau. C'est conçu pour les commerciaux terrain en déplacement."
                  },
                  {
                    q: "Quels sont les secteurs couverts ?",
                    a: "Nous accompagnons principalement les installateurs de systèmes de sécurité, les fournisseurs restauration, les services IT B2B, les télécoms, les énergies renouvelables, et tous services B2B à forte valeur. Si vous ciblez des entreprises récemment créées, contactez-nous pour valider si votre activité correspond."
                  },
                  {
                    q: "Y a-t-il une garantie de résultats ?",
                    a: "Oui. Nous garantissons un ROI mesurable sur 6 mois. Si les objectifs ne sont pas atteints (définis ensemble en phase de co-construction), nous prolongeons gratuitement l'accompagnement jusqu'à satisfaction. Notre expertise depuis 2023 nous permet d'être confiants dans nos méthodes."
                  },
                  {
                    q: "Combien de temps avant les premiers résultats ?",
                    a: "Les premiers leads qualifiés arrivent dès la 2e-3e semaine après la phase de co-construction. Le ROI devient mesurable à partir du 2e mois. Les résultats optimaux sont généralement atteints au 4e-5e mois une fois que vos équipes maîtrisent l'outil et le processus."
                  },
                  {
                    q: "Proposez-vous une expansion FR/Suisse/Belgique ?",
                    a: "Oui, nous accompagnons nos clients sur la France, la Suisse et la Belgique. La recherche multi-canal est adaptée à chaque pays (sources locales, réseaux professionnels, bases de données officielles)."
                  }
                ].map((item, i) => (
                  <Accordion key={i} type="single" collapsible>
                    <AccordionItem value={`item-${i}`} className="border rounded-xl px-6 transition-all" style={{
                      borderColor: 'rgba(0, 212, 255, 0.3)',
                      background: 'rgba(10, 14, 26, 0.6)'
                    }}>
                      <AccordionTrigger className="text-base font-semibold text-white py-5 hover:no-underline" style={{
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm pb-5" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA FINAL + FORMULAIRE */}
        <section id="contact" className="py-28 px-6" style={{
          background: 'linear-gradient(135deg, rgba(0,255,157,0.12) 0%, rgba(0,212,255,0.12) 100%)',
          borderTop: '2px solid rgba(0,255,157,0.3)',
          borderBottom: '2px solid rgba(0,212,255,0.3)'
        }}>
          <div className="container mx-auto max-w-4xl">
            <div ref={ctaFinalAnimation.ref} className={`scroll-reveal ${ctaFinalAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Prêt à Transformer Votre Prospection ?
              </h2>
              <p className="text-base text-center mb-10" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                Réservez votre RDV Calendly en 30 secondes. Sans engagement.
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-6 p-8 rounded-2xl max-w-2xl mx-auto" style={{
                background: 'rgba(10, 14, 26, 0.8)',
                border: '2px solid rgba(0, 212, 255, 0.3)'
              }}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Nom *</label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg text-white transition-all"
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        fontFamily: 'Inter, sans-serif'
                      }}
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg text-white transition-all"
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        fontFamily: 'Inter, sans-serif'
                      }}
                      placeholder="jean@entreprise.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Téléphone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg text-white transition-all"
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        fontFamily: 'Inter, sans-serif'
                      }}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Secteur *</label>
                    <input
                      type="text"
                      required
                      value={formData.secteur}
                      onChange={(e) => setFormData({ ...formData, secteur: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg text-white transition-all"
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        fontFamily: 'Inter, sans-serif'
                      }}
                      placeholder="Ex: Sécurité, IT, Restauration..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Taille équipe (optionnel)</label>
                  <input
                    type="text"
                    value={formData.tailleEquipe}
                    onChange={(e) => setFormData({ ...formData, tailleEquipe: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg text-white transition-all"
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(0, 212, 255, 0.3)',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    placeholder="Ex: 3-5 commerciaux"
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit"
                    className="flex-1 font-bold px-8 py-6 text-lg rounded-xl shadow-2xl transition-all hover:scale-105"
                    style={{ background: '#00FF9D', color: '#000', fontFamily: 'Inter, sans-serif' }}
                  >
                    Envoyer ma demande
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    type="button"
                    onClick={() => window.open(calendlyUrl, '_blank')}
                    variant="outline"
                    className="flex-1 font-bold px-8 py-6 text-lg rounded-xl transition-all hover:scale-105"
                    style={{ borderColor: '#00D4FF', color: '#00D4FF', fontFamily: 'Inter, sans-serif' }}
                  >
                    Ou réserver RDV Calendly
                  </Button>
                </div>

                <p className="text-xs text-center" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                  🔒 Vos données sont protégées RGPD • Réponse sous 24h
                </p>
              </form>

              {/* Calendly Embed (optionnel - décommenter si besoin) */}
              {/* <div className="mt-12">
                <div className="calendly-inline-widget" data-url={calendlyUrl} style={{ minWidth: '320px', height: '630px' }}></div>
                <script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js" async></script>
              </div> */}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-12 px-6" style={{
        background: '#0A0E1A',
        borderTop: '1px solid rgba(0, 212, 255, 0.2)'
      }}>
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold mb-4">
                <span style={{ 
                  background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: 'Inter, sans-serif'
                }}>PULSE</span>
                <span className="text-white ml-1" style={{ fontFamily: 'Inter, sans-serif' }}>Entreprise</span>
              </div>
              <p className="text-sm" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                L'Accompagnement Premium Depuis 2023
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Offre</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                <li><a href="#education" className="hover:text-white transition-colors">Leads Récents</a></li>
                <li><a href="#decideurs" className="hover:text-white transition-colors">Décideurs Précis</a></li>
                <li><a href="#app" className="hover:text-white transition-colors">App Pulse Hub</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Ressources</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                <li><a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a></li>
                <li><a href="/blog/installateurs-securite" className="hover:text-white transition-colors">Blog Sécurité</a></li>
                <li><a href="/commercial" className="hover:text-white transition-colors">Version Solo (49 €)</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Légal</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                <li><a href="/mentions-legales" className="hover:text-white transition-colors">Mentions Légales</a></li>
                <li><a href="/confidentialite" className="hover:text-white transition-colors">Politique Confidentialité</a></li>
                <li><a href="/cgu" className="hover:text-white transition-colors">CGU</a></li>
                <li><a href="/cgv" className="hover:text-white transition-colors">CGV</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-sm" style={{ 
            borderColor: 'rgba(0, 212, 255, 0.2)',
            color: '#A0AEC0',
            fontFamily: 'Inter, sans-serif'
          }}>
            <p>© 2026 Pulse Entreprise – Accompagnement premium PME B2B FR/Suisse depuis 2023</p>
          </div>
        </div>
      </footer>

      {/* CSS pour animations scroll */}
      <style>{`
        .scroll-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .scroll-reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        @media (max-width: 768px) {
          h1 { font-size: 44px !important; }
          h2 { font-size: 32px !important; }
          body { font-size: 16px; }
          section { padding: 60px 20px !important; }
        }
      `}</style>
    </div>
  );
};

export default EntrepriseLanding;
