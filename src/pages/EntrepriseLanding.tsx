import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowRight, Check, TrendingUp, Phone, Target, Route, Smartphone, Users, BarChart3, Sparkles, Menu, X, ChevronDown, Zap, Shield, TrendingDown, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const EntrepriseLanding = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    secteur: '',
    tailleEquipe: '',
    fonctionsCiblees: ''
  });

  const heroAnimation = useScrollAnimation({ threshold: 0.2 });
  const educationAnimation = useScrollAnimation({ threshold: 0.2 });
  const expertiseAnimation = useScrollAnimation({ threshold: 0.2 });
  const accompagnementAnimation = useScrollAnimation({ threshold: 0.2 });
  const beforeAfterAnimation = useScrollAnimation({ threshold: 0.2 });
  const testimonialsAnimation = useScrollAnimation({ threshold: 0.2 });
  const pricingAnimation = useScrollAnimation({ threshold: 0.2 });
  const faqAnimation = useScrollAnimation({ threshold: 0.2 });
  const ctaFinalAnimation = useScrollAnimation({ threshold: 0.2 });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Intégrer votre logique d'envoi de formulaire (email, CRM, etc.)
    console.log('Form submitted:', formData);
    alert('Merci ! Nous vous contactons sous 24h.');
  };

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

      {/* Header */}
      <header className="sticky top-0 left-0 right-0 z-50" style={{
        background: 'rgba(10, 14, 26, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.15)'
      }}>
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="text-2xl font-bold">
              <span style={{ 
                background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>PULSE</span>
              <span className="text-white ml-1">Entreprise</span>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#education" className="text-sm" style={{ color: '#A0AEC0' }} onMouseEnter={(e) => e.currentTarget.style.color = '#00FF9D'} onMouseLeave={(e) => e.currentTarget.style.color = '#A0AEC0'}>Pourquoi &lt;3 Mois ?</a>
              <a href="#expertise" className="text-sm" style={{ color: '#A0AEC0' }} onMouseEnter={(e) => e.currentTarget.style.color = '#00FF9D'} onMouseLeave={(e) => e.currentTarget.style.color = '#A0AEC0'}>Prospection Téléphonique Ciblée</a>
              <a href="#accompagnement" className="text-sm" style={{ color: '#A0AEC0' }} onMouseEnter={(e) => e.currentTarget.style.color = '#00FF9D'} onMouseLeave={(e) => e.currentTarget.style.color = '#A0AEC0'}>Gestion Terrain via App</a>
              <a href="#roi" className="text-sm" style={{ color: '#A0AEC0' }} onMouseEnter={(e) => e.currentTarget.style.color = '#00FF9D'} onMouseLeave={(e) => e.currentTarget.style.color = '#A0AEC0'}>ROI Prouvé</a>
              <a href="#pricing" className="text-sm" style={{ color: '#A0AEC0' }} onMouseEnter={(e) => e.currentTarget.style.color = '#00FF9D'} onMouseLeave={(e) => e.currentTarget.style.color = '#A0AEC0'}>Tarifs Exclusifs</a>
              <a href="#contact" className="text-sm" style={{ color: '#A0AEC0' }} onMouseEnter={(e) => e.currentTarget.style.color = '#00FF9D'} onMouseLeave={(e) => e.currentTarget.style.color = '#A0AEC0'}>Contact</a>
            </nav>

            {/* Desktop Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <a href="/commercial" className="text-sm font-medium transition-colors" style={{ color: '#A0AEC0' }} onMouseEnter={(e) => e.currentTarget.style.color = '#00FF9D'} onMouseLeave={(e) => e.currentTarget.style.color = '#A0AEC0'}>
                Version Solo (49 €)
              </a>
              <Button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="font-bold px-6 py-3 rounded-lg transition-all duration-300"
                style={{ 
                  background: '#00FF9D', 
                  color: '#000'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#00D4FF'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#00FF9D'}
              >
                Réserver une Démonstration Personnalisée
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
                    <a href="#education" className="text-base" style={{ color: '#A0AEC0' }}>Pourquoi &lt;3 Mois ?</a>
                    <a href="#expertise" className="text-base" style={{ color: '#A0AEC0' }}>Prospection Ciblée</a>
                    <a href="#accompagnement" className="text-base" style={{ color: '#A0AEC0' }}>App Terrain</a>
                    <a href="#roi" className="text-base" style={{ color: '#A0AEC0' }}>ROI</a>
                    <a href="#pricing" className="text-base" style={{ color: '#A0AEC0' }}>Tarifs</a>
                    <a href="#contact" className="text-base" style={{ color: '#A0AEC0' }}>Contact</a>
                    <div className="border-t pt-6" style={{ borderColor: 'rgba(0,212,255,0.2)' }}>
                      <a href="/commercial" className="block mb-4 text-sm" style={{ color: '#A0AEC0' }}>Version Solo (49 €)</a>
                      <Button className="w-full font-bold" style={{ background: '#00FF9D', color: '#000' }}>
                        Réserver une Démo
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
        <section className="pt-32 pb-20 px-6" style={{ paddingTop: '120px' }}>
          <div className="container mx-auto max-w-7xl">
            <div ref={heroAnimation.ref} className={`scroll-reveal ${heroAnimation.isVisible ? 'visible' : ''}`}>
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Texte */}
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
                    Transformez Vos Leads &lt;3 Mois en Pipeline Qualifié
                  </h1>
                  <p className="text-lg sm:text-xl mb-8" style={{ color: '#A0AEC0', lineHeight: '1.6' }}>
                    Prospection téléphonique ciblée + App terrain collaborative = <span className="font-semibold" style={{ color: '#00FF9D' }}>3x plus de RDV qualifiés</span> que la prospection classique.
                  </p>

                  {/* Stats Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    {[
                      '+200 % de RDV qualifiés',
                      '-40 % de temps terrain',
                      'ROI positif dès 3 mois'
                    ].map((stat, i) => (
                      <Card key={i} className="p-6 text-center border transition-all hover:scale-105" style={{
                        background: 'rgba(0, 212, 255, 0.05)',
                        borderColor: 'rgba(0, 212, 255, 0.3)',
                        borderRadius: '12px'
                      }}>
                        <p className="text-sm font-semibold text-white">{stat}</p>
                      </Card>
                    ))}
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Button 
                      onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                      className="font-bold px-8 py-6 text-lg rounded-xl shadow-2xl transition-all hover:scale-105"
                      style={{ background: '#00FF9D', color: '#000' }}
                    >
                      Réserver une Démo Gratuite
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="font-bold px-8 py-6 text-lg rounded-xl transition-all hover:scale-105"
                      style={{ borderColor: '#00D4FF', color: '#00D4FF' }}
                      onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Voir les Tarifs
                    </Button>
                  </div>
                </div>

                {/* Mockup Placeholder */}
                <div className="relative">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{
                    background: 'linear-gradient(135deg, rgba(0,255,157,0.1) 0%, rgba(0,212,255,0.1) 100%)',
                    border: '2px solid rgba(0,212,255,0.3)',
                    height: '400px'
                  }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Phone className="w-20 h-20 mx-auto mb-4" style={{ color: '#00FF9D' }} />
                        <p className="text-white text-lg font-semibold">Mockup Téléphone + Dashboard App</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-[#00FF9D]/20 to-[#00D4FF]/20 blur-3xl -z-10 rounded-3xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EDUCATION SECTION */}
        <section id="education" className="py-28 px-6" style={{
          background: 'linear-gradient(135deg, rgba(0,212,255,0.06) 0%, rgba(10,14,26,0.8) 100%)',
          borderTop: '2px solid rgba(0,212,255,0.2)',
          borderBottom: '1px solid rgba(0,212,255,0.1)'
        }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={educationAnimation.ref} className={`scroll-reveal ${educationAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-6">
                Pourquoi les Leads &lt;3 Mois Sont Plus Efficaces ?
              </h2>
              <p className="text-base text-center mb-12 max-w-3xl mx-auto" style={{ color: '#A0AEC0' }}>
                Les entreprises nouvellement créées ont des <strong style={{ color: '#00FF9D' }}>besoins urgents</strong> et un <strong style={{ color: '#00FF9D' }}>budget alloué</strong>. Notre méthode combine prospection téléphonique ciblée et optimisation terrain pour maximiser vos résultats.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    title: 'Taux de Conversion x3',
                    desc: '5% en prospection froide → 15-25% sur leads <3 mois',
                    icon: TrendingUp
                  },
                  {
                    title: 'Prospection Téléphonique',
                    desc: 'Qualification des décideurs avant votre visite terrain',
                    icon: Phone
                  },
                  {
                    title: 'App Terrain Optimisée',
                    desc: 'Routing intelligent + CRM collaboratif en temps réel',
                    icon: Smartphone
                  },
                  {
                    title: 'Cycle de Vente Réduit',
                    desc: 'Besoins urgents = décisions rapides (30-60j de gagné)',
                    icon: Target
                  },
                  {
                    title: 'Données Enrichies',
                    desc: 'Contacts décideurs, secteur, taille, budget estimé',
                    icon: Zap
                  },
                  {
                    title: 'Résultats Prouvés',
                    desc: 'Déjà testé par +50 équipes commerciales en France',
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
                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-sm" style={{ color: '#A0AEC0' }}>{item.desc}</p>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button 
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="font-bold px-8 py-6 text-lg rounded-xl shadow-2xl transition-all hover:scale-105" 
                  style={{ background: '#00FF9D', color: '#000' }}
                >
                  Voir les Tarifs
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* EXPERTISE SECTORIELLE - Installateurs Sécurité */}
        <section id="expertise" className="py-28 px-6" style={{
          background: 'linear-gradient(135deg, rgba(0,31,63,0.9) 0%, rgba(10,14,26,0.95) 100%)',
          borderTop: '2px solid rgba(0,212,255,0.3)',
          borderBottom: '2px solid rgba(0,212,255,0.3)'
        }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={expertiseAnimation.ref} className={`scroll-reveal ${expertiseAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-6">
                Spécialisés dans les Secteurs à Forte Valeur
              </h2>
              <p className="text-lg text-center mb-8 max-w-3xl mx-auto" style={{ color: '#A0AEC0' }}>
                Nos clients principaux : installateurs de sécurité, télécoms, énergies renouvelables, IT B2B. <strong style={{ color: '#00FF9D' }}>Nous connaissons vos enjeux terrain.</strong>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                  '20-35 % de RDV bookés',
                  'Cycle de vente -40 jours',
                  'CAC divisé par 2'
                ].map((stat, i) => (
                  <Card key={i} className="p-6 text-center border transition-all hover:scale-105" style={{
                    background: 'rgba(0, 255, 157, 0.08)',
                    borderColor: 'rgba(0, 212, 255, 0.4)',
                    borderRadius: '12px'
                  }}>
                    <p className="text-lg font-bold" style={{ color: '#00FF9D' }}>{stat}</p>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Button 
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="font-bold px-8 py-6 text-lg rounded-xl shadow-2xl transition-all hover:scale-105" 
                  style={{ background: '#00FF9D', color: '#000' }}
                >
                  Réserver une Démo Gratuite
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ACCOMPAGNEMENT SECTION */}
        <section id="accompagnement" className="py-28 px-6" style={{
          background: 'linear-gradient(180deg, #0A0E1A 0%, rgba(0,31,63,0.5) 100%)'
        }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={accompagnementAnimation.ref} className={`scroll-reveal ${accompagnementAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-12">
                Un Partenariat Exclusif Haut de Gamme : Le Combo Téléphonique + Terrain
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { title: 'Leads <3 mois enrichis', icon: Target },
                  { title: 'Prospection téléphonique ciblée', icon: Phone },
                  { title: 'App dédiée pour gestion terrain', icon: Smartphone },
                  { title: 'Coaching stratégique combo', icon: Users },
                  { title: 'Reporting ROI unifié', icon: BarChart3 },
                  { title: 'Expansion FR/CH/BE', icon: Sparkles }
                ].map((item, i) => (
                  <Card key={i} className="p-8 border transition-all hover:scale-105 hover:shadow-2xl" style={{
                    background: 'rgba(10, 14, 26, 0.6)',
                    borderColor: 'rgba(0, 212, 255, 0.3)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '16px'
                  }}>
                    <item.icon className="w-12 h-12 mb-4" style={{ color: '#00FF9D' }} />
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button className="font-bold px-8 py-6 text-lg rounded-xl shadow-2xl transition-all hover:scale-105" style={{ background: '#00FF9D', color: '#000' }}>
                  Découvrez Comment Nous Personnalisons Cet Accompagnement
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* AVANT / APRÈS SECTION */}
        <section id="roi" className="py-28 px-6" style={{
          background: 'linear-gradient(135deg, rgba(0,31,63,0.8) 0%, rgba(10,14,26,0.9) 100%)',
          borderTop: '2px solid rgba(0,212,255,0.2)'
        }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={beforeAfterAnimation.ref} className={`scroll-reveal ${beforeAfterAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-12">
                Du Chaos d'une Prospection Aléatoire au Duo Gagnant
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
                      <TrendingDown className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Avant</h3>
                  </div>
                  <ul className="space-y-4 text-base" style={{ color: '#A0AEC0' }}>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 text-xl">✗</span>
                      <span>Prospection aléatoire : temps perdu, faible retour</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 text-xl">✗</span>
                      <span>Kilomètres inutiles sans ciblage</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 text-xl">✗</span>
                      <span>Pas de suivi structuré, prospects oubliés</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 text-xl">✗</span>
                      <span>ROI difficile à mesurer et faible</span>
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
                    <h3 className="text-2xl font-bold text-white">Après</h3>
                  </div>
                  <ul className="space-y-4 text-base text-white">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#00FF9D' }} />
                      <span><strong style={{ color: '#00FF9D' }}>+300 %</strong> de RDV qualifiés grâce au duo</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#00FF9D' }} />
                      <span>Tournées optimisées : -40 % de km inutiles</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#00FF9D' }} />
                      <span>Suivi CRM collaboratif en temps réel</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#00FF9D' }} />
                      <span><strong style={{ color: '#00D4FF' }}>+40 %</strong> de ROI mesuré sur 3 mois</span>
                    </li>
                  </ul>
                </Card>
              </div>

              <div className="text-center mt-12">
                <Button className="font-bold px-8 py-6 text-lg rounded-xl shadow-2xl transition-all hover:scale-105" style={{ background: '#00FF9D', color: '#000' }}>
                  Ne Laissez Plus Passer : Réservez Votre Démonstration VIP
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* TÉMOIGNAGES */}
        <section className="py-28 px-6" style={{
          background: 'linear-gradient(180deg, #0A0E1A 0%, rgba(0,31,63,0.4) 100%)'
        }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={testimonialsAnimation.ref} className={`scroll-reveal ${testimonialsAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-10">
                Ils Ont Déjà Transformé Leur Prospection
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    quote: "Nous avons doublé nos RDV qualifiés en 2 mois avec Pulse.",
                    author: "Marc D.",
                    role: "Dir. Commercial, Sécurité",
                    stars: 5
                  },
                  {
                    quote: "Les leads <3 mois sont une vraie mine d'or. ROI positif dès le 1er mois.",
                    author: "Sophie L.",
                    role: "Gérante, IT B2B",
                    stars: 5
                  },
                  {
                    quote: "App terrain intuitive, gain de temps énorme. On ne pourrait plus s'en passer.",
                    author: "Thomas B.",
                    role: "Commercial terrain",
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
                    <p className="text-base text-white mb-6 italic">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-semibold text-white">{testimonial.author}</p>
                      <p className="text-sm" style={{ color: '#A0AEC0' }}>{testimonial.role}</p>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-10">
                <Button 
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="font-bold px-8 py-6 text-lg rounded-xl shadow-2xl transition-all hover:scale-105" 
                  style={{ background: '#00FF9D', color: '#000' }}
                >
                  Voir les Tarifs
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* TARIFS SECTION */}
        <section id="pricing" className="py-28 px-6" style={{
          background: 'linear-gradient(135deg, rgba(0,255,157,0.08) 0%, rgba(0,212,255,0.08) 50%, rgba(10,14,26,0.9) 100%)',
          borderTop: '2px solid rgba(0,212,255,0.3)'
        }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={pricingAnimation.ref} className={`scroll-reveal ${pricingAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
                Tarifs Transparents, ROI Prouvé
              </h2>
              <p className="text-base text-center mb-12" style={{ color: '#A0AEC0' }}>
                Sans engagement • Annulable à tout moment
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Starter */}
                <Card className="p-8 border transition-all hover:scale-[1.05]" style={{
                  background: 'rgba(10, 14, 26, 0.7)',
                  borderColor: 'rgba(0, 212, 255, 0.4)',
                  borderRadius: '16px'
                }}>
                  <h3 className="text-2xl font-bold text-white text-center mb-4">Starter</h3>
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold mb-2" style={{ color: '#00FF9D' }}>990 €</div>
                    <p className="text-sm" style={{ color: '#A0AEC0' }}>par mois HT</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {[
                      '40-60 leads <3 mois/mois',
                      'Prospection téléphonique incluse',
                      'App terrain + CRM',
                      'Support email 48h',
                      'Formation initiale'
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#A0AEC0' }}>
                        <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#00FF9D' }} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full font-bold py-4 rounded-xl transition-all hover:scale-105" 
                    style={{ background: '#00D4FF', color: '#000' }}
                  >
                    Commencer
                  </Button>
                </Card>

                {/* Pro - POPULAIRE */}
                <Card className="p-8 border-2 relative transition-all hover:scale-[1.05]" style={{
                  background: 'linear-gradient(135deg, rgba(0,255,157,0.15) 0%, rgba(0,212,255,0.1) 100%)',
                  borderColor: '#00FF9D',
                  borderRadius: '16px',
                  boxShadow: '0 0 40px rgba(0,255,157,0.3)'
                }}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold" style={{ background: '#00FF9D', color: '#000' }}>
                    ⭐ RECOMMANDÉ
                  </div>
                  <h3 className="text-2xl font-bold text-white text-center mb-4 mt-4">Pro</h3>
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold mb-2" style={{ color: '#00FF9D' }}>1 490 €</div>
                    <p className="text-sm" style={{ color: '#A0AEC0' }}>par mois HT</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {[
                      '80-120 leads <3 mois/mois',
                      'Prospection téléphonique avancée',
                      'App + coaching mensuel',
                      'Scripts personnalisés',
                      'Reporting ROI',
                      'Support prioritaire 24h'
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white">
                        <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#00FF9D' }} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full font-bold py-4 rounded-xl transition-all hover:scale-105" 
                    style={{ background: '#00FF9D', color: '#000' }}
                  >
                    Démarrer Maintenant
                  </Button>
                </Card>

                {/* Scale */}
                <Card className="p-8 border transition-all hover:scale-[1.05]" style={{
                  background: 'rgba(10, 14, 26, 0.7)',
                  borderColor: 'rgba(0, 212, 255, 0.4)',
                  borderRadius: '16px'
                }}>
                  <h3 className="text-2xl font-bold text-white text-center mb-4">Scale</h3>
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold mb-2" style={{ color: '#00D4FF' }}>1 990 €</div>
                    <p className="text-sm" style={{ color: '#A0AEC0' }}>par mois HT</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {[
                      '150+ leads <3 mois/mois',
                      'Prospection téléphonique premium',
                      'Coaching dédié hebdomadaire',
                      'Multi-utilisateurs (3-5)',
                      'Account manager dédié',
                      'Support VIP 2h'
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#A0AEC0' }}>
                        <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#00D4FF' }} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full font-bold py-4 rounded-xl transition-all hover:scale-105" 
                    style={{ background: '#00D4FF', color: '#000' }}
                  >
                    Demander un Devis
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-28 px-6" style={{
          background: 'linear-gradient(180deg, #0A0E1A 0%, rgba(0,31,63,0.5) 100%)'
        }}>
          <div className="container mx-auto max-w-4xl">
            <div ref={faqAnimation.ref} className={`scroll-reveal ${faqAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-12">
                Réponses Exclusives
              </h2>

              <div className="space-y-4">
                {[
                  {
                    q: "Pourquoi les leads <3 mois sont-ils si efficaces ?",
                    a: "Les entreprises nouvellement créées ont des besoins immédiats et urgents (équipements, services, infrastructures). Elles sont en phase d'installation et donc ouvertes aux propositions. Le taux de conversion est 3 à 5 fois supérieur à une prospection aléatoire."
                  },
                  {
                    q: "Quelle est la différence avec la version Solo à 49 €/mois ?",
                    a: "La version Solo est conçue pour les commerciaux individuels qui gèrent eux-mêmes leur prospection. Pulse Entreprise est un accompagnement premium avec prospection téléphonique déléguée, coaching stratégique, scripts sur mesure et garantie ROI. C'est une solution clé en main pour PME et équipes commerciales."
                  },
                  {
                    q: "Comment se déroule la prospection téléphonique ?",
                    a: "Nous enrichissons les leads <3 mois avec les coordonnées des décideurs clés selon votre activité (responsables IT, sécurité, communication, achats…). Nous qualifions ensuite par téléphone selon vos critères et transférons les prospects chauds à votre équipe terrain via l'app."
                  },
                  {
                    q: "L'app terrain fonctionne-t-elle hors ligne ?",
                    a: "Oui, l'app Pulse Entreprise est une PWA qui fonctionne hors ligne. Vous pouvez consulter vos leads, ajouter des notes et gérer votre pipeline même sans connexion. Les données se synchronisent automatiquement dès que vous retrouvez du réseau."
                  },
                  {
                    q: "Quels sont les secteurs couverts ?",
                    a: "Nous accompagnons principalement les installateurs de systèmes de sécurité, mais aussi les services B2B à forte valeur (télécoms, énergies renouvelables, IT, RH, etc.). Contactez-nous pour valider si votre activité correspond."
                  },
                  {
                    q: "Y a-t-il une garantie de résultats ?",
                    a: "Oui, pour le plan Platinum. Nous garantissons contractuellement un ROI minimum sur 6 mois. Si les objectifs ne sont pas atteints, nous prolongeons gratuitement l'accompagnement jusqu'à satisfaction."
                  },
                  {
                    q: "Puis-je résilier avant les 6 mois ?",
                    a: "L'engagement est de 6 mois minimum pour assurer la qualité du déploiement et la montée en charge. Passé ce délai, vous pouvez résilier avec 1 mois de préavis."
                  },
                  {
                    q: "Combien de temps avant les premiers résultats ?",
                    a: "Les premiers leads qualifiés arrivent dès la 2e semaine. Le ROI devient mesurable à partir du 2e mois. Les résultats optimaux sont généralement atteints au 4e-5e mois une fois que vos équipes maîtrisent l'outil et le process."
                  }
                ].map((item, i) => (
                  <Accordion key={i} type="single" collapsible>
                    <AccordionItem value={`item-${i}`} className="border rounded-xl px-6 transition-all" style={{
                      borderColor: 'rgba(0, 212, 255, 0.3)',
                      background: 'rgba(10, 14, 26, 0.6)'
                    }}>
                      <AccordionTrigger className="text-base font-semibold text-white py-5 hover:no-underline" style={{
                        color: '#FFFFFF'
                      }}>
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm pb-5" style={{ color: '#A0AEC0' }}>
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
              <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
                Prêt à Transformer Votre Prospection ?
              </h2>
              <p className="text-base text-center mb-10" style={{ color: '#A0AEC0' }}>
                Réservez votre démo gratuite en 30 secondes. Sans engagement.
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-6 p-8 rounded-2xl max-w-2xl mx-auto" style={{
                background: 'rgba(10, 14, 26, 0.8)',
                border: '2px solid rgba(0, 212, 255, 0.3)'
              }}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Nom *</label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg text-white transition-all"
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(0, 212, 255, 0.3)'
                      }}
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg text-white transition-all"
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(0, 212, 255, 0.3)'
                      }}
                      placeholder="jean@entreprise.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Téléphone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg text-white transition-all"
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(0, 212, 255, 0.3)'
                      }}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Secteur *</label>
                    <input
                      type="text"
                      required
                      value={formData.secteur}
                      onChange={(e) => setFormData({ ...formData, secteur: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg text-white transition-all"
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(0, 212, 255, 0.3)'
                      }}
                      placeholder="Ex: Sécurité, IT..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Taille équipe (optionnel)</label>
                  <input
                    type="text"
                    value={formData.tailleEquipe}
                    onChange={(e) => setFormData({ ...formData, tailleEquipe: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg text-white transition-all"
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(0, 212, 255, 0.3)'
                    }}
                    placeholder="Ex: 3-5 commerciaux"
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full font-bold px-8 py-6 text-lg rounded-xl shadow-2xl transition-all hover:scale-105"
                  style={{ background: '#00FF9D', color: '#000' }}
                >
                  Réserver Ma Démo Gratuite
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <p className="text-xs text-center" style={{ color: '#A0AEC0' }}>
                  🔒 Vos données sont protégées • Réponse sous 24h
                </p>
              </form>
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
                  WebkitTextFillColor: 'transparent'
                }}>PULSE</span>
                <span className="text-white ml-1">Entreprise</span>
              </div>
              <p className="text-sm" style={{ color: '#A0AEC0' }}>
                L'Accompagnement Premium pour les Leaders PME
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Offre</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#A0AEC0' }}>
                <li><a href="#education" className="hover:text-white transition-colors">Leads &lt;3 Mois</a></li>
                <li><a href="#expertise" className="hover:text-white transition-colors">Prospection Ciblée</a></li>
                <li><a href="#accompagnement" className="hover:text-white transition-colors">App Terrain</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#A0AEC0' }}>
                <li><a href="#" className="hover:text-white transition-colors">Blog Éducatif</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Études de Cas</a></li>
                <li><a href="/commercial" className="hover:text-white transition-colors">Version Solo (49 €)</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Légal</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#A0AEC0' }}>
                <li><a href="/mentions-legales" className="hover:text-white transition-colors">Mentions Légales</a></li>
                <li><a href="/confidentialite" className="hover:text-white transition-colors">Politique RGPD</a></li>
                <li><a href="/cgu" className="hover:text-white transition-colors">CGU</a></li>
                <li><a href="/cgv" className="hover:text-white transition-colors">CGV</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-sm" style={{ 
            borderColor: 'rgba(0, 212, 255, 0.2)',
            color: '#A0AEC0'
          }}>
            <p>© 2026 Pulse Entreprise – L'Accompagnement Premium pour les Leaders PME</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EntrepriseLanding;
