import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Shield, Phone, Target, TrendingUp, Users, BarChart3, Clock, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const BlogInstallateursSecurite = () => {
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
            <div className="flex items-center gap-4">
              <a 
                href="/commercial" 
                className="hidden sm:inline-block text-sm font-medium px-4 py-2 rounded-lg border transition-all hover:border-[#00D4FF] hover:text-[#00D4FF]" 
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
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Article */}
        <section className="pt-32 pb-20 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{
                background: 'rgba(0, 255, 157, 0.1)',
                border: '1px solid rgba(0, 255, 157, 0.3)'
              }}>
                <Shield className="w-5 h-5" style={{ color: '#00FF9D' }} />
                <span className="text-sm font-semibold" style={{ color: '#00FF9D', fontFamily: 'Inter, sans-serif' }}>Installateurs Systèmes de Sécurité</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6" style={{ 
                letterSpacing: '-0.02em',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700
              }}>
                Comment les installateurs de systèmes de sécurité explosent leur CA avec Pulse
              </h1>
              <p className="text-xl" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                Chantiers à forte valeur + prospection ciblée = ROI x3 en 6 mois
              </p>
            </div>

            {/* Introduction */}
            <div className="prose prose-invert max-w-none mb-16">
              <Card className="p-8 mb-8" style={{
                background: 'rgba(10, 14, 26, 0.6)',
                borderColor: 'rgba(0, 212, 255, 0.3)',
                backdropFilter: 'blur(8px)',
                borderRadius: '16px'
              }}>
                <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Votre Activité : Des Chantiers à Forte Valeur</h2>
                <p className="text-lg mb-4" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif', lineHeight: '1.7' }}>
                  Vous installez des systèmes de sécurité pour le résidentiel, le tertiaire et l'industriel. Alarmes, vidéosurveillance, contrôle d'accès, sécurité incendie… Chaque chantier représente une valeur significative (5 000 € à 50 000 € selon la complexité).
                </p>
                <p className="text-lg" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif', lineHeight: '1.7' }}>
                  <strong style={{ color: '#00FF9D' }}>Le problème ?</strong> La prospection est chronophage, les concurrents sont nombreux sur les nouveaux établissements, et vous perdez du temps et de l'argent en déplacements inefficaces.
                </p>
              </Card>

              {/* Problématique */}
              <Card className="p-8 mb-8" style={{
                background: 'rgba(30, 30, 30, 0.6)',
                borderColor: 'rgba(239, 68, 68, 0.5)',
                borderRadius: '16px'
              }}>
                <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>La Problématique : Prospection Inefficace</h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">✗</span>
                    <div>
                      <strong className="text-white" style={{ fontFamily: 'Inter, sans-serif' }}>RDV rares et mal ciblés</strong>
                      <p className="text-base" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>Vous prospectez à l'aveugle, sans savoir qui a réellement besoin de sécurité maintenant.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">✗</span>
                    <div>
                      <strong className="text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Concurrence locale féroce</strong>
                      <p className="text-base" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>Les gros acteurs raflent les nouveaux chantiers avant vous.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">✗</span>
                    <div>
                      <strong className="text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Coûts déplacements élevés</strong>
                      <p className="text-base" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>Des centaines de kilomètres pour quelques prospects réellement intéressés.</p>
                    </div>
                  </li>
                </ul>
              </Card>

              {/* Notre Solution */}
              <Card className="p-8 mb-8" style={{
                background: 'linear-gradient(135deg, rgba(0,255,157,0.1) 0%, rgba(0,212,255,0.05) 100%)',
                borderColor: 'rgba(0, 255, 157, 0.5)',
                borderRadius: '16px'
              }}>
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>Notre Solution : Leads Ciblés + Décideur Précis + App Pulse</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,255,157,0.2)' }}>
                      <Target className="w-6 h-6" style={{ color: '#00FF9D' }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Leads &lt;3-6 mois avec besoin sécurité</h3>
                      <p className="text-base" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif', lineHeight: '1.7' }}>
                        Nous identifions les créations d'entreprises récentes (3 à 6 mois) qui ont un besoin sécurité : nouveaux bureaux, entrepôts, commerces, restaurants, cliniques… Ces établissements sont en phase d'équipement et ont un budget alloué.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,255,157,0.2)' }}>
                      <Users className="w-6 h-6" style={{ color: '#00FF9D' }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Décideur précis identifié</h3>
                      <p className="text-base" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif', lineHeight: '1.7' }}>
                        Pas juste le gérant. Nous trouvons le vrai décideur : responsable travaux, responsable sécurité, facility manager, responsable achats… selon la taille et le type d'établissement. Recherche multi-canal (LinkedIn Premium, Facebook, Google News, Bodacc, Full Enrich).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,255,157,0.2)' }}>
                      <Phone className="w-6 h-6" style={{ color: '#00FF9D' }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Prospection multi-canal (téléphone/mails/terrain)</h3>
                      <p className="text-base" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif', lineHeight: '1.7' }}>
                        L'app Pulse Hub intègre téléphone, mails et gestion terrain. Vous lancez une campagne téléphone pour qualifier, puis vous ciblez vos visites terrain sur les prospects chauds. Tout est centralisé, rien n'est oublié.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Étapes Accompagnement */}
              <Card className="p-8 mb-8" style={{
                background: 'rgba(10, 14, 26, 0.6)',
                borderColor: 'rgba(0, 212, 255, 0.3)',
                backdropFilter: 'blur(8px)',
                borderRadius: '16px'
              }}>
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>Les Étapes de l'Accompagnement</h2>
                
                <div className="space-y-6">
                  {[
                    {
                      step: '1',
                      title: 'RDV Calendly de co-construction',
                      desc: 'Nous définissons ensemble votre profil client idéal, vos zones géographiques prioritaires, et vos critères de qualification.',
                      icon: Clock
                    },
                    {
                      step: '2',
                      title: 'Recherche multi-canal et identification décideur',
                      desc: 'Nos équipes trouvent les créations récentes avec besoin sécurité et identifient le vrai décideur (travaux, sécurité, achats).',
                      icon: Target
                    },
                    {
                      step: '3',
                      title: 'Leads fournis + app Pulse Hub',
                      desc: 'Vous recevez vos leads qualifiés dans l\'app Pulse. Coordonnées décideur, téléphone quand disponible, notes contextuelles.',
                      icon: Phone
                    },
                    {
                      step: '4',
                      title: 'Prospection téléphone + terrain',
                      desc: 'Vous lancez vos campagnes téléphone pour qualifier, puis vous organisez vos tournées terrain optimisées (-40% km).',
                      icon: Building2
                    },
                    {
                      step: '5',
                      title: 'Coaching + ajustements',
                      desc: 'Coaching mensuel pour affiner votre approche, scripts, objections… Nous restons à vos côtés.',
                      icon: Users
                    },
                    {
                      step: '6',
                      title: 'Reporting ROI',
                      desc: 'Tableaux de bord temps réel : RDV générés, taux conversion, CA signé, ROI mesuré. Transparence totale.',
                      icon: BarChart3
                    }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg" style={{ background: 'rgba(0,212,255,0.2)', color: '#00D4FF', fontFamily: 'Inter, sans-serif' }}>
                        {item.step}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                          <item.icon className="w-5 h-5 inline mr-2" style={{ color: '#00FF9D' }} />
                          {item.title}
                        </h3>
                        <p className="text-base" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Résultats */}
              <Card className="p-8 mb-8" style={{
                background: 'linear-gradient(135deg, rgba(0,255,157,0.15) 0%, rgba(0,212,255,0.1) 100%)',
                borderColor: 'rgba(0, 255, 157, 0.6)',
                borderRadius: '16px',
                boxShadow: '0 0 40px rgba(0,255,157,0.2)'
              }}>
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <TrendingUp className="w-8 h-8 inline mr-3" style={{ color: '#00FF9D' }} />
                  Résultats Concrets Mesurés
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <div className="text-4xl font-bold mb-2" style={{ color: '#00FF9D', fontFamily: 'Inter, sans-serif' }}>22-38%</div>
                    <p className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Taux de RDV bookés</p>
                    <p className="text-sm" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                      Contre 5-10% en prospection froide classique. Le ciblage précis fait toute la différence.
                    </p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2" style={{ color: '#00D4FF', fontFamily: 'Inter, sans-serif' }}>-30-60 jours</div>
                    <p className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Cycle de vente réduit</p>
                    <p className="text-sm" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                      Les entreprises récentes ont des besoins urgents et signent plus vite.
                    </p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2" style={{ color: '#00FF9D', fontFamily: 'Inter, sans-serif' }}>÷2-3</div>
                    <p className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Coût d'acquisition</p>
                    <p className="text-sm" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                      Moins de déplacements inutiles, meilleur ROI par euro investi.
                    </p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2" style={{ color: '#00D4FF', fontFamily: 'Inter, sans-serif' }}>+40%</div>
                    <p className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>CA généré</p>
                    <p className="text-sm" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                      Résultats moyens constatés sur 6 mois d'accompagnement.
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,255,0.3)' }}>
                  <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>Exemple Concret</h3>
                  <p className="text-base mb-4" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                    <strong className="text-white">Marc D., installateur sécurité région Île-de-France :</strong>
                  </p>
                  <p className="text-base" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif', lineHeight: '1.7' }}>
                    « En 3 mois avec Pulse, nous avons généré 42 RDV qualifiés sur 180 leads fournis (23% conversion). 14 chantiers signés pour un CA de 287 000 €. L'app terrain est géniale : on optimise nos tournées, on ne perd plus de temps. Le ROI est positif dès le 1er mois. On ne reviendra jamais à l'ancien système. »
                  </p>
                </div>
              </Card>
            </div>

            {/* CTA Final */}
            <Card className="p-8 text-center" style={{
              background: 'linear-gradient(135deg, rgba(0,255,157,0.12) 0%, rgba(0,212,255,0.12) 100%)',
              borderColor: 'rgba(0,255,157,0.4)',
              borderRadius: '16px'
            }}>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Prêt à Transformer Votre Prospection Sécurité ?
              </h2>
              <p className="text-lg mb-8" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                Réservez votre RDV Calendly pour obtenir un devis personnalisé
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => window.open(calendlyUrl, '_blank')}
                  className="font-bold px-8 py-6 text-lg rounded-xl shadow-2xl transition-all hover:scale-105"
                  style={{ background: '#00FF9D', color: '#000', fontFamily: 'Inter, sans-serif' }}
                >
                  Réserver RDV Calendly pour Devis Sécurité
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

export default BlogInstallateursSecurite;
