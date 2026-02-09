import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Check, Target, TrendingUp, Users, Clock, Shield, BarChart3, Zap, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";

const GuideLeadsRecents = () => {
  const calendlyUrl = "https://calendly.com/tomiolovpro/pulse";
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Intégrer avec votre système d'email/CRM
    console.log("Email soumis:", email);
    setIsSubmitted(true);
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
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-2xl font-bold">
              <span style={{ 
                background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700
              }}>PULSE</span>
              <span className="text-white ml-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Entreprise</span>
            </a>
            <Button 
              onClick={() => window.open(calendlyUrl, '_blank')}
              className="font-bold px-6 py-3 rounded-lg transition-all duration-300"
              style={{ 
                background: '#00FF9D', 
                color: '#000',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700
              }}
            >
              Réserver RDV
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="container mx-auto max-w-5xl">
            
            {/* Hero Content */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{
                background: 'rgba(0, 255, 157, 0.1)',
                border: '1px solid rgba(0, 255, 157, 0.3)'
              }}>
                <Download className="w-5 h-5" style={{ color: '#00FF9D' }} />
                <span className="text-sm font-semibold" style={{ color: '#00FF9D', fontFamily: 'Inter, sans-serif' }}>Guide Gratuit</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6" style={{ 
                letterSpacing: '-0.02em',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700
              }}>
                Le Guide Complet des <span style={{
                  background: 'linear-gradient(135deg, #00FF9D 0%, #00D4FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>Leads Récents</span>
              </h1>
              
              <p className="text-xl mb-8" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                Découvrez pourquoi les créations d'entreprises 3-6 mois sont le signal d'achat le plus puissant (et sous-exploité) en prospection B2B
              </p>

              {/* Stats preview */}
              <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
                <div>
                  <div className="text-4xl font-bold mb-2" style={{ color: '#00FF9D', fontFamily: 'Inter, sans-serif' }}>+180%</div>
                  <p className="text-sm" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>RDV qualifiés</p>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2" style={{ color: '#00D4FF', fontFamily: 'Inter, sans-serif' }}>-40%</div>
                  <p className="text-sm" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>Cycle de vente</p>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2" style={{ color: '#00FF9D', fontFamily: 'Inter, sans-serif' }}>ROI 4x</div>
                  <p className="text-sm" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>Sur 6 mois</p>
                </div>
              </div>
            </div>

            {/* Formulaire Download */}
            {!isSubmitted ? (
              <Card className="p-8 max-w-2xl mx-auto mb-16" style={{
                background: 'linear-gradient(135deg, rgba(0,255,157,0.12) 0%, rgba(0,212,255,0.12) 100%)',
                borderColor: 'rgba(0,255,157,0.4)',
                borderRadius: '16px'
              }}>
                <h2 className="text-2xl font-bold text-white mb-4 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Téléchargez le Guide Gratuit
                </h2>
                <p className="text-center mb-6" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                  Entrez votre email professionnel pour recevoir le guide PDF (32 pages)
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@entreprise.fr"
                    required
                    className="w-full px-6 py-4 rounded-lg text-lg"
                    style={{
                      background: 'rgba(10, 14, 26, 0.8)',
                      border: '2px solid rgba(0, 212, 255, 0.3)',
                      color: '#FFFFFF',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  />
                  
                  <Button 
                    type="submit"
                    className="w-full font-bold px-8 py-6 text-lg rounded-xl shadow-2xl transition-all hover:scale-105"
                    style={{ background: '#00FF9D', color: '#000', fontFamily: 'Inter, sans-serif' }}
                  >
                    <Download className="mr-2 w-5 h-5" />
                    Télécharger le Guide Gratuit
                  </Button>
                </form>

                <p className="text-xs text-center mt-4" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                  🔒 Vos données sont sécurisées. Pas de spam. Conforme RGPD.
                </p>
              </Card>
            ) : (
              <Card className="p-8 max-w-2xl mx-auto mb-16 text-center" style={{
                background: 'linear-gradient(135deg, rgba(0,255,157,0.12) 0%, rgba(0,212,255,0.12) 100%)',
                borderColor: 'rgba(0,255,157,0.4)',
                borderRadius: '16px'
              }}>
                <Check className="w-16 h-16 mx-auto mb-4" style={{ color: '#00FF9D' }} />
                <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Merci ! Vérifiez votre boîte mail
                </h2>
                <p className="text-lg mb-6" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                  Le guide PDF a été envoyé à <strong className="text-white">{email}</strong>
                </p>
                <Button 
                  onClick={() => window.open(calendlyUrl, '_blank')}
                  className="font-bold px-8 py-4 text-lg rounded-xl"
                  style={{ background: '#00FF9D', color: '#000', fontFamily: 'Inter, sans-serif' }}
                >
                  Réserver un Audit Gratuit
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Card>
            )}

            {/* Aperçu du contenu du guide */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-white text-center mb-12" style={{ fontFamily: 'Inter, sans-serif' }}>
                Ce que vous allez découvrir
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6" style={{
                  background: 'rgba(10, 14, 26, 0.6)',
                  borderColor: 'rgba(0, 212, 255, 0.3)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px'
                }}>
                  <Target className="w-10 h-10 mb-4" style={{ color: '#00FF9D' }} />
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Chapitre 1 : Pourquoi les Créations 3-6 Mois ?
                  </h3>
                  <ul className="space-y-2" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#00FF9D' }} />
                      <span>Le timing parfait : phase d'optimisation achat</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#00FF9D' }} />
                      <span>Signal d'achat vs prospection aléatoire</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#00FF9D' }} />
                      <span>Statistiques INSEE : 600 000+ créations/an en France</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6" style={{
                  background: 'rgba(10, 14, 26, 0.6)',
                  borderColor: 'rgba(0, 212, 255, 0.3)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px'
                }}>
                  <Users className="w-10 h-10 mb-4" style={{ color: '#00D4FF' }} />
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Chapitre 2 : Trouver le Décideur Précis
                  </h3>
                  <ul className="space-y-2" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#00D4FF' }} />
                      <span>Méthodologie recherche multi-canal (LinkedIn, Facebook, Google...)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#00D4FF' }} />
                      <span>Identifier le vrai décideur (responsable achat, IT, technique)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#00D4FF' }} />
                      <span>Outils gratuits et payants recommandés</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6" style={{
                  background: 'rgba(10, 14, 26, 0.6)',
                  borderColor: 'rgba(0, 212, 255, 0.3)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px'
                }}>
                  <Zap className="w-10 h-10 mb-4" style={{ color: '#00FF9D' }} />
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Chapitre 3 : Approche Multi-Canal Gagnante
                  </h3>
                  <ul className="space-y-2" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#00FF9D' }} />
                      <span>Séquence téléphone + email + terrain optimale</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#00FF9D' }} />
                      <span>Scripts téléphone adaptés par secteur</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#00FF9D' }} />
                      <span>Templates emails froids qui convertissent à 20%+</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6" style={{
                  background: 'rgba(10, 14, 26, 0.6)',
                  borderColor: 'rgba(0, 212, 255, 0.3)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px'
                }}>
                  <TrendingUp className="w-10 h-10 mb-4" style={{ color: '#00D4FF' }} />
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Chapitre 4 : Cas Pratiques & ROI
                  </h3>
                  <ul className="space-y-2" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#00D4FF' }} />
                      <span>3 études de cas détaillées (IT, Sécurité, Restauration)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#00D4FF' }} />
                      <span>Calculateur ROI personnalisé (fichier Excel inclus)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#00D4FF' }} />
                      <span>Erreurs à éviter (top 10)</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6" style={{
                  background: 'rgba(10, 14, 26, 0.6)',
                  borderColor: 'rgba(0, 212, 255, 0.3)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px'
                }}>
                  <Clock className="w-10 h-10 mb-4" style={{ color: '#00FF9D' }} />
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Chapitre 5 : Plan d'Action 90 Jours
                  </h3>
                  <ul className="space-y-2" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#00FF9D' }} />
                      <span>Roadmap semaine par semaine</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#00FF9D' }} />
                      <span>KPIs à tracker (dashboard inclus)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#00FF9D' }} />
                      <span>Checklist déploiement immédiat</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6" style={{
                  background: 'rgba(10, 14, 26, 0.6)',
                  borderColor: 'rgba(0, 212, 255, 0.3)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px'
                }}>
                  <Shield className="w-10 h-10 mb-4" style={{ color: '#00D4FF' }} />
                  <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Bonus : Conformité & Légal
                  </h3>
                  <ul className="space-y-2" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#00D4FF' }} />
                      <span>RGPD (France) et FADP (Suisse) : guide complet</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#00D4FF' }} />
                      <span>Sources de données publiques légales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#00D4FF' }} />
                      <span>Templates mentions légales prospection</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>

            {/* Objections */}
            <Card className="p-8 mb-16" style={{
              background: 'rgba(30, 30, 30, 0.6)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              borderRadius: '16px'
            }}>
              <div className="flex items-start gap-4 mb-6">
                <AlertTriangle className="w-8 h-8 flex-shrink-0" style={{ color: '#EF4444' }} />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                    ⚠️ Les Erreurs Que Font 90% des Commerciaux B2B
                  </h3>
                  <ul className="space-y-3" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span><strong className="text-white">Ils prospectent trop tard :</strong> L'entreprise a déjà signé avec un concurrent pendant la phase création.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span><strong className="text-white">Ils contactent la mauvaise personne :</strong> Le gérant n'est pas le décideur pour les achats IT, sécurité, équipements...</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✗</span>
                      <span><strong className="text-white">Ils utilisent un seul canal :</strong> Téléphone seul = taux de réponse 5%. Multi-canal = 25%+.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-6 rounded-lg" style={{ background: 'rgba(0,255,157,0.1)', border: '1px solid rgba(0,255,157,0.3)' }}>
                <p className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <Check className="w-5 h-5 inline mr-2" style={{ color: '#00FF9D' }} />
                  Ce guide vous évite ces erreurs et vous donne la méthodologie complète.
                </p>
                <p style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                  Résultat attendu : +150-300% de RDV qualifiés en 90 jours.
                </p>
              </div>
            </Card>

            {/* CTA Final */}
            <Card className="p-8 text-center" style={{
              background: 'linear-gradient(135deg, rgba(0,255,157,0.12) 0%, rgba(0,212,255,0.12) 100%)',
              borderColor: 'rgba(0,255,157,0.4)',
              borderRadius: '16px'
            }}>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Vous voulez déléguer cette prospection ?
              </h2>
              <p className="text-lg mb-8" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                Pulse Entreprise fait tout pour vous : recherche leads + décideurs + accompagnement complet.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => window.open(calendlyUrl, '_blank')}
                  className="font-bold px-8 py-6 text-lg rounded-xl shadow-2xl transition-all hover:scale-105"
                  style={{ background: '#00FF9D', color: '#000', fontFamily: 'Inter, sans-serif' }}
                >
                  Réserver Audit Gratuit Calendly
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="font-bold px-8 py-6 text-lg rounded-xl transition-all hover:scale-105"
                  style={{ borderColor: '#00D4FF', color: '#00D4FF', fontFamily: 'Inter, sans-serif' }}
                >
                  Retour Accueil
                </Button>
              </div>
            </Card>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6" style={{
        background: '#0A0E1A',
        borderTop: '1px solid rgba(0, 212, 255, 0.2)'
      }}>
        <div className="container mx-auto max-w-6xl">
          <div className="text-center text-sm" style={{ 
            color: '#A0AEC0',
            fontFamily: 'Inter, sans-serif'
          }}>
            <p>© 2026 Pulse Entreprise – Accompagnement premium PME B2B FR/Suisse depuis 2023</p>
            <div className="mt-4 flex justify-center gap-4">
              <a href="/mentions-legales" className="hover:text-white transition-colors">Mentions Légales</a>
              <a href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</a>
              <a href="/cgu" className="hover:text-white transition-colors">CGU</a>
              <a href="/cgv" className="hover:text-white transition-colors">CGV</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GuideLeadsRecents;
