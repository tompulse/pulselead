import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Target, TrendingUp, TrendingDown, Check, MapPin, BarChart3, Users, Phone, Mail, Database, Smartphone, Menu, Building2, Clock, Sparkles, Shield, Award, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const EntrepriseLanding = () => {
  const navigate = useNavigate();

  const heroAnimation = useScrollAnimation({ threshold: 0.2 });
  const problemsAnimation = useScrollAnimation({ threshold: 0.2 });
  const solutionAnimation = useScrollAnimation({ threshold: 0.2 });
  const beforeAfterAnimation = useScrollAnimation({ threshold: 0.2 });
  const pricingAnimation = useScrollAnimation({ threshold: 0.2 });
  const faqAnimation = useScrollAnimation({ threshold: 0.2 });

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

      {/* Header Simplifié */}
      <header className="sticky top-0 left-0 right-0 z-50" style={{
        background: 'rgba(10, 14, 26, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.15)'
      }}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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

            {/* Desktop nav - Simplifié */}
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#rdv" className="text-sm hover:text-[#00FF9D] transition-colors" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>Comment ça marche</a>
              <a href="#resultats" className="text-sm hover:text-[#00FF9D] transition-colors" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>Résultats</a>
              <a href="#pricing" className="text-sm hover:text-[#00FF9D] transition-colors" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>Tarifs</a>
            </nav>

            {/* Desktop buttons - Simplifié */}
            <div className="hidden lg:flex items-center gap-3">
              <a 
                href="/commercial" 
                className="text-sm font-medium hover:text-white transition-colors" 
                style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}
              >
                Version Solo (49€)
              </a>
              <Button 
                onClick={() => document.getElementById('calendly')?.scrollIntoView({ behavior: 'smooth' })}
                className="font-bold px-6 py-3 rounded-lg transition-all duration-300"
                style={{ 
                  background: '#00FF9D', 
                  color: '#000',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700
                }}
              >
                Réserver un Audit Gratuit
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
                      <a 
                        href="/commercial" 
                        className="block w-full text-center px-4 py-3 rounded-lg border text-white/70"
                        style={{ borderColor: 'rgba(0, 212, 255, 0.4)' }}
                      >
                        Version Solo (49€)
                      </a>
                      <Button 
                        onClick={() => document.getElementById('calendly')?.scrollIntoView({ behavior: 'smooth' })}
                        className="w-full font-bold py-3 rounded-lg"
                        style={{ background: '#00FF9D', color: '#000' }}
                      >
                        Réserver un Audit
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
        {/* ═══════════════════════════════════════════════════════════════════
            HERO SECTION - Simplifié et Centré pour PME B2B
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="pt-32 pb-20 px-6">
          <div className="container mx-auto max-w-4xl">
            <div ref={heroAnimation.ref} className={`scroll-reveal ${heroAnimation.isVisible ? 'visible' : ''} text-center`}>
              
              {/* Badges avant titre */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <div className="px-4 py-1.5 rounded-full" style={{
                  background: 'rgba(0, 255, 157, 0.1)',
                  border: '1px solid rgba(0, 255, 157, 0.3)',
                  color: '#00FF9D',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  ⭐ +23 PME accompagnées depuis 2023
                </div>
                <div className="px-4 py-1.5 rounded-full" style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10B981',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  🔒 Garantie Résultats 90 jours
                </div>
              </div>

              {/* Headline Principal - Simplifié */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6" style={{ 
                letterSpacing: '-0.02em',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700
              }}>
                Générez Plus de RDV B2B
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>Sans Perdre de Temps</span>
              </h1>

              {/* Subheadline Simple et Claire */}
              <p className="text-xl sm:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed" style={{
                color: '#A0AEC0',
                fontFamily: 'Inter, sans-serif'
              }}>
                Nous trouvons les entreprises créées récemment dans votre secteur, identifions le bon décideur, et vous accompagnons pour signer plus rapidement.
              </p>

              {/* CTA Principal Unique */}
              <div className="mb-16">
                <Button 
                  onClick={() => document.getElementById('calendly')?.scrollIntoView({ behavior: 'smooth' })}
                  className="font-bold text-lg px-12 py-7 rounded-xl shadow-2xl transition-all duration-300 hover:scale-105"
                  style={{ 
                    background: 'linear-gradient(to right, #10B981, #059669)',
                    color: '#fff',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700
                  }}
                >
                  Réserver Mon Audit Gratuit
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
                <p className="text-sm mt-4" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>
                  ✓ Audit gratuit de 30min · ✓ Sans engagement · ✓ Résultats garantis sous 90 jours
                </p>
              </div>

              {/* Stats KPIs Simplifiées */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-4">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold mb-2" style={{
                    background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700
                  }}>+180%</div>
                  <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>RDV qualifiés</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold mb-2" style={{
                    background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700
                  }}>-40%</div>
                  <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>Temps prospection</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold mb-2" style={{
                    background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700
                  }}>ROI 4x</div>
                  <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>En 6 mois</p>
                </div>
              </div>
              
              {/* Note source stats */}
              <p className="text-xs mb-12" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
                *Moyenne constatée sur 18 clients PME accompagnés en 2024-2025
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center gap-8 text-sm" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter, sans-serif' }}>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Conforme RGPD France & Suisse</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" style={{ color: '#00D4FF' }} />
                  <span>Données publiques officielles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" style={{ color: '#00D4FF' }} />
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Cas d'usage par secteur
              </h2>
              <p className="text-lg text-center mb-12 max-w-2xl mx-auto" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                Découvrez comment nous transformons votre prospection selon votre activité
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1 - Installateurs Sécurité */}
                <Card 
                  onClick={() => window.location.href = '/blog/installateurs-securite'}
                  className="p-6 border transition-all duration-300 cursor-pointer hover:scale-105"
                  style={{
                    background: 'rgba(10, 14, 26, 0.6)',
                    borderColor: 'rgba(0, 212, 255, 0.2)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '16px'
                  }}
                >
                  <div className="w-full h-40 rounded-lg mb-4 flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px'
                  }}>
                    <Shield className="w-16 h-16 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Installateurs systèmes de sécurité</h3>
                  <p className="text-sm mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
                    Leads ciblés + app terrain = +40% CA. Signez les chantiers avant vos concurrents.
                  </p>
                  <Button 
                    variant="outline"
                    className="w-full"
                    style={{
                      borderColor: '#00D4FF',
                      color: '#00D4FF',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    Lire l'article détaillé
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Card>

                {/* Card 2 - Fournisseurs Restauration */}
                <Card 
                  onClick={() => window.location.href = '/blog/fournisseurs-restauration'}
                  className="p-6 border transition-all duration-300 cursor-pointer hover:scale-105"
                  style={{
                    background: 'rgba(10, 14, 26, 0.6)',
                    borderColor: 'rgba(0, 212, 255, 0.2)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '16px'
                  }}
                >
                  <div className="w-full h-40 rounded-lg mb-4 flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(251, 146, 60, 0.1) 100%)',
                    border: '1px solid rgba(251, 146, 60, 0.3)',
                    borderRadius: '12px'
                  }}>
                    <Building2 className="w-16 h-16 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Fournisseurs restauration</h3>
                  <p className="text-sm mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
                    Contactez les nouveaux restaurants avant vos concurrents. +210% RDV, 38% conversion.
                  </p>
                  <Button 
                    variant="outline"
                    className="w-full"
                    style={{
                      borderColor: '#00D4FF',
                      color: '#00D4FF',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    Lire l'article détaillé
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Card>

                {/* Card 3 - Fournisseurs IT */}
                <Card 
                  onClick={() => window.location.href = '/blog/fournisseurs-it'}
                  className="p-6 border transition-all duration-300 cursor-pointer hover:scale-105"
                  style={{
                    background: 'rgba(10, 14, 26, 0.6)',
                    borderColor: 'rgba(0, 212, 255, 0.2)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '16px'
                  }}
                >
                  <div className="w-full h-40 rounded-lg mb-4 flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px'
                  }}>
                    <Database className="w-16 h-16 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Fournisseurs IT B2B</h3>
                  <p className="text-sm mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
                    Ciblez les nouvelles entreprises avant qu'elles ne choisissent ailleurs. ROI 4,2x.
                  </p>
                  <Button 
                    variant="outline"
                    className="w-full"
                    style={{
                      borderColor: '#00D4FF',
                      color: '#00D4FF',
                      fontFamily: 'Inter, sans-serif'
                    }}
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
              <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Comment Nous Vous Aidons à <span style={{
                  background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>Générer Plus de RDV</span>
              </h2>
              
              <p className="text-lg text-center max-w-2xl mx-auto mb-16 leading-relaxed" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                Un processus simple et éprouvé qui a déjà aidé +23 PME à multiplier leurs RDV B2B
              </p>
              
              {/* 3 Étapes Claires */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <Card className="p-8 border transition-all duration-300 text-center" style={{
                  background: 'rgba(10, 14, 26, 0.6)',
                  borderColor: 'rgba(0, 212, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px'
                }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{
                    background: 'rgba(0, 212, 255, 0.2)'
                  }}>
                    <span className="text-3xl font-bold" style={{ color: '#00D4FF', fontFamily: 'Inter, sans-serif' }}>1</span>
                  </div>
                  <Target className="w-12 h-12 mb-4 mx-auto" style={{ color: '#00D4FF' }} />
                  <h3 className="text-xl font-bold mb-3 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Nous Trouvons Vos Prospects</h3>
                  <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
                    Identification des entreprises créées récemment (3-6 mois) dans votre secteur et zone géographique. Recherche multi-canal du décideur précis.
                  </p>
                </Card>

                <Card className="p-8 border transition-all duration-300 text-center" style={{
                  background: 'rgba(10, 14, 26, 0.6)',
                  borderColor: 'rgba(0, 212, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px'
                }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{
                    background: 'rgba(0, 212, 255, 0.2)'
                  }}>
                    <span className="text-3xl font-bold" style={{ color: '#00D4FF', fontFamily: 'Inter, sans-serif' }}>2</span>
                  </div>
                  <Smartphone className="w-12 h-12 mb-4 mx-auto" style={{ color: '#00D4FF' }} />
                  <h3 className="text-xl font-bold mb-3 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Vous Prospectez Efficacement</h3>
                  <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
                    App Pulse Hub pour gérer vos campagnes téléphone, email et visites terrain. Scripts personnalisés fournis. Tournées GPS optimisées.
                  </p>
                </Card>

                <Card className="p-8 border transition-all duration-300 text-center" style={{
                  background: 'rgba(10, 14, 26, 0.6)',
                  borderColor: 'rgba(0, 212, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px'
                }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{
                    background: 'rgba(0, 212, 255, 0.2)'
                  }}>
                    <span className="text-3xl font-bold" style={{ color: '#00D4FF', fontFamily: 'Inter, sans-serif' }}>3</span>
                  </div>
                  <TrendingUp className="w-12 h-12 mb-4 mx-auto" style={{ color: '#00D4FF' }} />
                  <h3 className="text-xl font-bold mb-3 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Vous Signez Plus Vite</h3>
                  <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
                    Suivi personnalisé, coaching mensuel et reporting ROI en temps réel. Garantie résultats sous 90 jours.
                  </p>
                </Card>
              </div>

              {/* Différenciateur Clé */}
              <Card className="p-8 border" style={{
                background: 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, transparent 100%)',
                borderColor: 'rgba(0, 212, 255, 0.3)',
                borderRadius: '16px'
              }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{
                    background: 'rgba(0, 212, 255, 0.2)'
                  }}>
                    <Award className="w-6 h-6" style={{ color: '#00D4FF' }} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Pourquoi les créations récentes sont la clé ?</h3>
                    <p className="text-lg leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif' }}>
                      Les entreprises créées il y a 3-6 mois sont dans une <strong style={{ color: '#00D4FF' }}>fenêtre d'opportunité unique</strong> : elles ont passé la phase critique de lancement, ont des besoins réels et un budget, mais n'ont pas encore choisi tous leurs fournisseurs.
                    </p>
                    <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
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
        <section id="avantages" className="py-16 px-6 scroll-mt-20 relative z-10" style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(0, 0, 0, 0.3) 100%)',
          borderTop: '1px solid rgba(16, 185, 129, 0.15)',
          borderBottom: '1px solid rgba(16, 185, 129, 0.15)'
        }}>
          <div className="container mx-auto max-w-5xl">
            <div ref={beforeAfterAnimation.ref} className={`scroll-reveal ${beforeAfterAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                Avant / Après <span style={{
                  background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>PULSE</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Before */}
                <Card className="p-8 border transition-all duration-300 hover:scale-[1.02]" style={{
                  background: 'rgba(30, 30, 30, 0.6)',
                  borderColor: 'rgba(239, 68, 68, 0.5)',
                  borderRadius: '16px'
                }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                      <TrendingDown className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Sans PULSE</h3>
                  </div>
                  <ul className="space-y-4 text-base" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
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
                <Card className="p-8 border transition-all duration-300 hover:scale-[1.02]" style={{
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.05) 100%)',
                  borderColor: 'rgba(16, 185, 129, 0.5)',
                  borderRadius: '16px'
                }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Avec PULSE</h3>
                  </div>
                  <ul className="space-y-4 text-base" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span><strong className="text-emerald-400">+180%</strong> de RDV qualifiés grâce au ciblage</span>
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
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Ils ont transformé leur prospection avec <span style={{
                    background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>Pulse Entreprise</span>
                </h2>
                <p className="text-lg max-w-2xl mx-auto" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                  Résultats vérifiables de nos clients accompagnés
                </p>
              </div>

              {/* Case Studies Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Case Study 1 - IT B2B Lyon */}
                <Card className="p-6 border transition-all duration-300 flex flex-col" style={{
                  background: 'rgba(10, 14, 26, 0.6)',
                  borderColor: 'rgba(0, 212, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px'
                }}>
                  <div className="px-3 py-1 rounded-full w-fit mb-4" style={{
                    background: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    color: '#06B6D4',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    Informatique & Télécoms
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Fournisseur IT B2B – Lyon</h3>
                  <p className="text-sm mb-6 leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
                    "Pulse nous a permis de cibler 47 nouvelles entreprises créées en 4 mois. Résultat : 18 RDV obtenus, 6 contrats signés. Le ROI est sans appel."
                  </p>
                  
                  {/* Chiffres clés */}
                  <div className="space-y-3 mb-4 flex-1">
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif' }}>RDV qualifiés</span>
                      <span className="text-lg font-bold text-emerald-400" style={{ fontFamily: 'Inter, sans-serif' }}>+180%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif' }}>Coût acquisition</span>
                      <span className="text-lg font-bold text-emerald-400" style={{ fontFamily: 'Inter, sans-serif' }}>-35%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{
                      background: 'rgba(0, 212, 255, 0.1)',
                      border: '1px solid rgba(0, 212, 255, 0.2)'
                    }}>
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif' }}>ROI sur 6 mois</span>
                      <span className="text-lg font-bold" style={{ color: '#00D4FF', fontFamily: 'Inter, sans-serif' }}>4,2x</span>
                    </div>
                  </div>
                  
                  <p className="text-xs mt-auto" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>Client accompagné depuis août 2024</p>
                </Card>

                {/* Case Study 2 - Sécurité Genève */}
                <Card className="p-6 border transition-all duration-300 flex flex-col" style={{
                  background: 'rgba(10, 14, 26, 0.6)',
                  borderColor: 'rgba(0, 212, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px'
                }}>
                  <div className="px-3 py-1 rounded-full w-fit mb-4" style={{
                    background: 'rgba(251, 146, 60, 0.1)',
                    border: '1px solid rgba(251, 146, 60, 0.3)',
                    color: '#FB923C',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    Sécurité & Surveillance
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Installateur Sécurité – Genève (Suisse)</h3>
                  <p className="text-sm mb-6 leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
                    "Grâce aux leads créations récentes + app Pulse pour le terrain, on a signé 9 chantiers en 3 mois vs 3 sur toute l'année précédente. Game changer."
                  </p>
                  
                  {/* Chiffres clés */}
                  <div className="space-y-3 mb-4 flex-1">
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif' }}>Nouveaux contrats</span>
                      <span className="text-lg font-bold text-emerald-400" style={{ fontFamily: 'Inter, sans-serif' }}>+300%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif' }}>Temps prospection</span>
                      <span className="text-lg font-bold text-emerald-400" style={{ fontFamily: 'Inter, sans-serif' }}>-50%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{
                      background: 'rgba(0, 212, 255, 0.1)',
                      border: '1px solid rgba(0, 212, 255, 0.2)'
                    }}>
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif' }}>Taux conversion RDV</span>
                      <span className="text-lg font-bold" style={{ color: '#00D4FF', fontFamily: 'Inter, sans-serif' }}>22%</span>
                    </div>
                  </div>
                  
                  <p className="text-xs mt-auto" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>Client accompagné depuis janvier 2024</p>
                </Card>

                {/* Case Study 3 - Restauration IDF */}
                <Card className="p-6 border transition-all duration-300 flex flex-col" style={{
                  background: 'rgba(10, 14, 26, 0.6)',
                  borderColor: 'rgba(0, 212, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px'
                }}>
                  <div className="px-3 py-1 rounded-full w-fit mb-4" style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#EF4444',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    CHR & Alimentaire
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Fournisseur Restauration – Île-de-France</h3>
                  <p className="text-sm mb-6 leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
                    "On contacte désormais les nouveaux restaurants avant nos concurrents. Le décideur précis (chef/gérant) est fourni, on gagne un temps fou."
                  </p>
                  
                  {/* Chiffres clés */}
                  <div className="space-y-3 mb-4 flex-1">
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif' }}>RDV nouveaux établ.</span>
                      <span className="text-lg font-bold text-emerald-400" style={{ fontFamily: 'Inter, sans-serif' }}>+210%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif' }}>Taux conversion</span>
                      <span className="text-lg font-bold text-emerald-400" style={{ fontFamily: 'Inter, sans-serif' }}>38%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{
                      background: 'rgba(0, 212, 255, 0.1)',
                      border: '1px solid rgba(0, 212, 255, 0.2)'
                    }}>
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif' }}>Cycle de vente</span>
                      <span className="text-lg font-bold" style={{ color: '#00D4FF', fontFamily: 'Inter, sans-serif' }}>-45 jours</span>
                    </div>
                  </div>
                  
                  <p className="text-xs mt-auto" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>Client accompagné depuis mars 2024</p>
                </Card>
              </div>

              {/* Note légale */}
              <p className="text-xs text-center max-w-3xl mx-auto mb-8" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
                Résultats basés sur accompagnements réels. Les performances peuvent varier selon secteur et implication client. Garantie résultats 90 jours (voir CGV).
              </p>

              {/* CTA */}
              <div className="text-center">
                <Button 
                  onClick={() => document.getElementById('calendly')?.scrollIntoView({ behavior: 'smooth' })}
                  className="font-bold text-lg px-10 py-6 rounded-xl shadow-2xl transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(to right, #10B981, #059669)',
                    color: '#fff',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700
                  }}
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
        <section id="pricing" className="py-16 px-6 scroll-mt-20 relative z-10" style={{
          background: 'linear-gradient(180deg, rgba(6, 182, 212, 0.03) 0%, rgba(0, 0, 0, 0.5) 100%)',
          borderTop: '2px solid rgba(6, 182, 212, 0.2)'
        }}>
          <div className="container mx-auto max-w-6xl">
            <div ref={pricingAnimation.ref} className={`scroll-reveal ${pricingAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Choisissez votre formule <span style={{
                  background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>PULSE</span>
              </h2>
              <p className="text-lg text-center mb-8 max-w-2xl mx-auto" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                Accompagnement premium ou version autonome : vous choisissez
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
                {/* Plan Entreprise (High Ticket) */}
                <Card className="relative overflow-visible flex flex-col transition-all duration-300 hover:scale-[1.02]" style={{
                  background: 'linear-gradient(135deg, rgba(0,255,157,0.15) 0%, rgba(0,212,255,0.1) 100%)',
                  border: '3px solid rgba(0, 255, 157, 0.5)',
                  boxShadow: '0 30px 80px -15px rgba(0, 255, 157, 0.4)',
                  borderRadius: '16px'
                }}>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-black tracking-wide z-10 whitespace-nowrap" style={{
                    background: 'linear-gradient(to right, #F59E0B, #EF4444)',
                    color: '#fff',
                    boxShadow: '0 8px 32px rgba(251, 146, 60, 0.5)',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    ⭐ RECOMMANDÉ PME
                  </div>
                  <div className="p-6 pt-8 flex flex-col flex-1">
                    <h3 className="text-2xl font-bold mb-2 text-center" style={{ 
                      background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700
                    }}>Accompagnement Pulse Entreprise</h3>
                    <div className="mb-4 text-center py-3 px-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(0,255,157,0.4)' }}>
                      <div className="mb-1">
                        <span className="text-4xl font-bold" style={{ 
                          background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 700
                        }}>Sur Devis</span>
                      </div>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>À partir de 800€/mois</p>
                    </div>
                    <ul className="space-y-2 mb-4 flex-1">
                      {[
                        "Leads 3-6 mois personnalisés",
                        "Décideur précis multi-canal",
                        "App Pulse complète",
                        "Coaching prospection",
                        "Reporting ROI temps réel",
                        "Support prioritaire"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span className="text-white text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={() => document.getElementById('calendly')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full py-5 text-base font-black shadow-2xl transition-all mt-auto hover:scale-[1.03]" 
                      style={{
                        background: 'linear-gradient(to right, #10B981, #059669)',
                        color: '#fff',
                        borderRadius: '12px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 700
                      }}
                    >
                      Demander un Devis Personnalisé
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </Card>

                {/* Plan Solo */}
                <Card className="relative overflow-visible flex flex-col transition-all duration-300 hover:scale-[1.02]" style={{
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
                  border: '2px solid rgba(14, 165, 233, 0.3)',
                  boxShadow: '0 20px 60px -10px rgba(14, 165, 233, 0.3)',
                  borderRadius: '16px'
                }}>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-2xl font-bold mb-2 text-center" style={{ 
                      background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700
                    }}>Version Solo</h3>
                    <div className="mb-4 text-center py-3 px-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(14,165,233,0.2)' }}>
                      <div className="mb-1">
                        <span className="text-5xl font-bold" style={{ 
                          background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 700
                        }}>49€</span>
                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>/mois</span>
                      </div>
                      <p className="text-xs font-bold text-emerald-400" style={{ fontFamily: 'Inter, sans-serif' }}>🎁 7 jours GRATUIT</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>Pour indépendants</p>
                    </div>
                    <ul className="space-y-2 mb-4 flex-1">
                      {[
                        "App Pulse basique",
                        "Leads standards (sans personnalisation)",
                        "GPS optimisé",
                        "CRM terrain",
                        "Support email"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#00D4FF' }} />
                          <span className="text-white text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={() => window.location.href = '/commercial'}
                      className="w-full py-4 font-bold shadow-xl transition-all mt-auto hover:scale-[1.02]"
                      style={{
                        background: '#00D4FF',
                        color: '#000',
                        borderRadius: '12px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 700
                      }}
                    >
                      Découvrir Version Solo
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Section Garanties highlight */}
              <div className="mt-12 mb-8 max-w-4xl mx-auto">
                <Card className="p-8 border" style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                  borderRadius: '16px'
                }}>
                  <h3 className="text-2xl font-bold text-center mb-6" style={{
                    background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700
                  }}>Nos Garanties</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{
                        background: 'rgba(16, 185, 129, 0.2)'
                      }}>
                        <Shield className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>🔒 Garantie Résultats 90 jours</h4>
                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
                          Si vous n'obtenez pas au minimum X RDV qualifiés en 90 jours, nous continuons gratuitement jusqu'à atteinte de l'objectif.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{
                        background: 'rgba(0, 212, 255, 0.2)'
                      }}>
                        <Sparkles className="w-6 h-6" style={{ color: '#00D4FF' }} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>⚡ Audit Gratuit</h4>
                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
                          Premier RDV Calendly gratuit pour analyser votre marché et calculer votre ROI potentiel. Aucun engagement.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{
                        background: 'rgba(6, 182, 212, 0.2)'
                      }}>
                        <Check className="w-6 h-6" style={{ color: '#06B6D4' }} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>🔐 Paiement Sécurisé Stripe</h4>
                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
                          Facturation mensuelle, résiliable à tout moment (préavis 30j). Transparence totale.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{
                        background: 'rgba(251, 146, 60, 0.2)'
                      }}>
                        <BarChart3 className="w-6 h-6 text-orange-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>📊 Reporting Transparent</h4>
                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
                          Dashboard ROI en temps réel : leads fournis, RDV obtenus, CA généré. Visibilité totale.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-8 text-sm" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter, sans-serif' }}>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Conforme RGPD</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔒</span>
                  <span>Paiement 100% sécurisé</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5" style={{ color: '#00D4FF' }} />
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Pourquoi <span style={{
                  background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>Pulse Entreprise</span> vs Solutions Classiques ?
              </h2>
              <p className="text-lg text-center mb-12 max-w-2xl mx-auto" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                Comparaison objective avec CRM classiques et bases de données
              </p>
              
              {/* Tableau comparatif */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th className="text-left p-4 font-semibold" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter, sans-serif' }}>Critères</th>
                      <th className="text-center p-4 font-semibold" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif' }}>
                        CRM Classiques<br/>
                        <span className="text-sm font-normal" style={{ color: 'rgba(255,255,255,0.4)' }}>(Pipedrive, Salesforce...)</span>
                      </th>
                      <th className="text-center p-4 font-semibold" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif' }}>
                        Bases de Données<br/>
                        <span className="text-sm font-normal" style={{ color: 'rgba(255,255,255,0.4)' }}>(Apollo, Kaspr...)</span>
                      </th>
                      <th className="text-center p-4 font-semibold rounded-t-lg" style={{
                        background: 'linear-gradient(to right, rgba(0,255,157,0.2), rgba(16,185,129,0.2))',
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        <span style={{
                          background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontSize: '18px'
                        }}>Pulse Entreprise</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="hover:bg-white/5 transition-colors">
                      <td className="p-4" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>Leads créations 3-6 mois</td>
                      <td className="text-center p-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      <td className="text-center p-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      <td className="text-center p-4" style={{ background: 'rgba(0,255,157,0.1)' }}><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="hover:bg-white/5 transition-colors">
                      <td className="p-4" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>Recherche décideur précis multi-canal</td>
                      <td className="text-center p-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      <td className="text-center p-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      <td className="text-center p-4" style={{ background: 'rgba(0,255,157,0.1)' }}><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="hover:bg-white/5 transition-colors">
                      <td className="p-4" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>App terrain intégrée (calls/mails/GPS)</td>
                      <td className="text-center p-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      <td className="text-center p-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      <td className="text-center p-4" style={{ background: 'rgba(0,255,157,0.1)' }}><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="hover:bg-white/5 transition-colors">
                      <td className="p-4" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>Accompagnement personnalisé</td>
                      <td className="text-center p-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      <td className="text-center p-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      <td className="text-center p-4" style={{ background: 'rgba(0,255,157,0.1)' }}><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="hover:bg-white/5 transition-colors">
                      <td className="p-4" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>Coaching prospection</td>
                      <td className="text-center p-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      <td className="text-center p-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      <td className="text-center p-4" style={{ background: 'rgba(0,255,157,0.1)' }}><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="p-4" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>Reporting ROI temps réel</td>
                      <td className="text-center p-4"><span className="text-sm text-orange-400" style={{ fontFamily: 'Inter, sans-serif' }}>💰 Payant</span></td>
                      <td className="text-center p-4"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                      <td className="text-center p-4 rounded-b-lg" style={{ background: 'rgba(0,255,157,0.1)' }}>
                        <span className="text-emerald-400 font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>✓ Inclus</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* CTA */}
              <div className="text-center mt-12">
                <Button 
                  onClick={() => document.getElementById('calendly')?.scrollIntoView({ behavior: 'smooth' })}
                  className="font-bold text-lg px-10 py-6 rounded-xl shadow-2xl transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(to right, #10B981, #059669)',
                    color: '#fff',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700
                  }}
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
        <section className="py-12 px-6 relative z-10" style={{
          background: 'radial-gradient(ellipse at bottom, rgba(6, 182, 212, 0.06) 0%, transparent 60%)'
        }}>
          <div className="container mx-auto max-w-5xl">
            <div ref={faqAnimation.ref} className={`scroll-reveal ${faqAnimation.isVisible ? 'visible' : ''}`}>
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                Questions <span style={{ color: '#00D4FF' }}>fréquentes</span>
              </h2>
              <p className="text-center mb-8 max-w-2xl mx-auto" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
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
                    <AccordionItem value={`item-${i}`} className="border rounded-lg px-4 transition-all duration-300" style={{
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}>
                      <AccordionTrigger className="text-sm sm:text-base font-semibold py-3 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm pb-3" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                Qui <span style={{
                  background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>sommes-nous</span> ?
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                L'expertise prospection B2B au service de votre croissance
              </p>
            </div>

            {/* Card équipe */}
            <Card className="p-8 border max-w-3xl mx-auto" style={{
              background: 'rgba(10, 14, 26, 0.6)',
              borderColor: 'rgba(0, 212, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              borderRadius: '16px'
            }}>
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* Photo placeholder */}
                <div className="w-32 h-32 rounded-full flex items-center justify-center flex-shrink-0" style={{
                  background: 'linear-gradient(135deg, #00FF9D 0%, #10B981 100%)'
                }}>
                  <span className="text-4xl font-bold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>T</span>
                </div>

                {/* Contenu */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Tom</h3>
                  <p className="font-semibold mb-4" style={{ color: '#00FF9D', fontFamily: 'Inter, sans-serif' }}>Fondateur Pulse Entreprise</p>
                  
                  <p className="leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif' }}>
                    15 ans d'expérience en prospection B2B et développement commercial. Après avoir accompagné +50 PME dans leur croissance, j'ai créé Pulse en 2023 pour industrialiser la prospection sur créations récentes – le signal d'achat le plus puissant et sous-exploité.
                  </p>

                  {/* Valeurs */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                    <div className="px-3 py-1 rounded-full" style={{
                      background: 'rgba(0, 212, 255, 0.1)',
                      border: '1px solid rgba(0, 212, 255, 0.3)',
                      color: '#00D4FF',
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      🎯 Transparence
                    </div>
                    <div className="px-3 py-1 rounded-full" style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10B981',
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      📈 Résultats
                    </div>
                    <div className="px-3 py-1 rounded-full" style={{
                      background: 'rgba(6, 182, 212, 0.1)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      color: '#06B6D4',
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      🏆 Excellence
                    </div>
                  </div>

                  {/* CTA */}
                  <Button 
                    onClick={() => document.getElementById('calendly')?.scrollIntoView({ behavior: 'smooth' })}
                    className="font-semibold px-6 py-3"
                    style={{
                      background: '#00D4FF',
                      color: '#000',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600
                    }}
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                Réservez Votre <span style={{
                  background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>Audit Gratuit</span>
              </h2>
              <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                30 minutes pour analyser votre marché, calculer votre ROI potentiel et définir une stratégie personnalisée. Sans engagement.
              </p>
              
              {/* Trust badges avant calendrier */}
              <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
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
            <Card className="p-4 border max-w-4xl mx-auto" style={{
              background: 'rgba(10, 14, 26, 0.6)',
              borderColor: 'rgba(0, 212, 255, 0.3)',
              backdropFilter: 'blur(8px)',
              borderRadius: '16px'
            }}>
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
            <p className="text-center text-sm mt-8 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>
              🔒 Vos données sont protégées. Nous respectons votre vie privée et ne partagerons jamais vos informations.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            FOOTER SIMPLIFIÉ
        ═══════════════════════════════════════════════════════════════════ */}
        <footer className="py-12 px-6" style={{
          background: '#0A0E1A',
          borderTop: '1px solid rgba(0, 212, 255, 0.2)'
        }}>
          <div className="container mx-auto max-w-6xl">
            {/* Contenu principal footer */}
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-8">
              {/* Logo + Tagline */}
              <div className="text-center md:text-left">
                <div className="text-2xl font-bold mb-2">
                  <span style={{ 
                    background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700
                  }}>PULSE</span>
                  <span className="text-white ml-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Entreprise</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter, sans-serif' }}>Génération de RDV B2B pour PME</p>
                <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>Depuis 2023</p>
              </div>

              {/* Contact */}
              <div className="text-center md:text-right">
                <h4 className="font-bold mb-3 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Contact</h4>
                <a 
                  href="mailto:tomiolovpro@gmail.com" 
                  className="flex items-center gap-2 justify-center md:justify-end transition-colors hover:text-[#00D4FF]"
                  style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter, sans-serif' }}
                >
                  <Mail className="w-4 h-4" />
                  tomiolovpro@gmail.com
                </a>
                <a 
                  href="#calendly" 
                  className="text-sm mt-2 inline-block transition-colors"
                  style={{ color: '#00D4FF', fontFamily: 'Inter, sans-serif' }}
                >
                  Réserver un audit gratuit →
                </a>
              </div>
            </div>

            {/* Disclaimer RGPD simplifié */}
            <div className="text-xs text-center max-w-2xl mx-auto pt-6 mb-6" style={{ 
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'Inter, sans-serif',
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
              <p>
                Données publiques officielles (SIRENE, Bodacc). Conformité RGPD France & FADP Suisse.
              </p>
            </div>

            {/* Copyright + Liens légaux */}
            <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style={{ 
              borderTop: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'Inter, sans-serif'
            }}>
              <p>© 2026 Pulse Entreprise. Tous droits réservés.</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a href="/mentions-legales" className="transition-colors hover:text-[#00D4FF]">Mentions Légales</a>
                <a href="/cgv" className="transition-colors hover:text-[#00D4FF]">CGV</a>
                <a href="/confidentialite" className="transition-colors hover:text-[#00D4FF]">Confidentialité</a>
                <a href="/commercial" className="transition-colors hover:text-[#00D4FF]">Version Solo 49€</a>
              </div>
            </div>
          </div>
        </footer>

        {/* Sticky CTA Mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent lg:hidden z-40">
          <Button 
            onClick={() => document.getElementById('calendly')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full font-bold py-4 rounded-full shadow-lg"
            style={{
              background: 'linear-gradient(to right, #10B981, #059669)',
              color: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700
            }}
          >
            Réserver Audit Gratuit
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default EntrepriseLanding;
