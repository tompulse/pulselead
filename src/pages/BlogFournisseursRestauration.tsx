import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Building2, Phone, Target, TrendingUp, Users, BarChart3, Clock, Search } from "lucide-react";
import { Card } from "@/components/ui/card";

const BlogFournisseursRestauration = () => {
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
                <Building2 className="w-5 h-5" style={{ color: '#00FF9D' }} />
                <span className="text-sm font-semibold" style={{ color: '#00FF9D', fontFamily: 'Inter, sans-serif' }}>Fournisseurs Restauration</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6" style={{ 
                letterSpacing: '-0.02em',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700
              }}>
                Fournisseurs restauration : Signez les nouveaux restaurants avant vos concurrents
              </h1>
              <p className="text-xl" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                Créations récentes + timing parfait = +40% CA en 6 mois
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
                <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Votre Activité : Équipement et Fournitures Restauration</h2>
                <p className="text-lg mb-4" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif', lineHeight: '1.7' }}>
                  Vous fournissez des équipements professionnels, des denrées alimentaires, des boissons, ou des consommables pour les restaurants, cafés, boulangeries, traiteurs… Chaque nouveau client représente un CA récurrent mensuel significatif (500 € à 5 000 €/mois selon le type d'établissement).
                </p>
                <p className="text-lg" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif', lineHeight: '1.7' }}>
                  <strong style={{ color: '#00FF9D' }}>Le problème ?</strong> La concurrence est féroce sur les nouveaux établissements, et vous arrivez souvent trop tard : vos concurrents ont déjà signé les contrats pendant la phase de travaux.
                </p>
              </Card>

              {/* Problématique */}
              <Card className="p-8 mb-8" style={{
                background: 'rgba(30, 30, 30, 0.6)',
                borderColor: 'rgba(239, 68, 68, 0.5)',
                borderRadius: '16px'
              }}>
                <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>La Problématique : Être Premier sur les Nouveaux Restaurants</h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">✗</span>
                    <div>
                      <strong className="text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Concurrence féroce sur nouvelles ouvertures</strong>
                      <p className="text-base" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>Tous les fournisseurs locaux ciblent les mêmes établissements. Le premier arrivé remporte le contrat.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">✗</span>
                    <div>
                      <strong className="text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Timing raté</strong>
                      <p className="text-base" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>Vous apprenez l'ouverture quand c'est déjà trop tard : le restaurateur a déjà choisi ses fournisseurs.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">✗</span>
                    <div>
                      <strong className="text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Prospection inefficace</strong>
                      <p className="text-base" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>Vous prospectez des établissements déjà bien établis, avec des fournisseurs historiques difficiles à déloger.</p>
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
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>Notre Solution : Créations 3-6 Mois + Décideur + Multi-Canal</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,255,157,0.2)' }}>
                      <Target className="w-6 h-6" style={{ color: '#00FF9D' }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Créations récentes 3-6 mois ciblées restauration</h3>
                      <p className="text-base" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif', lineHeight: '1.7' }}>
                        Nous identifions les nouveaux restaurants, cafés, boulangeries, traiteurs créés il y a 3 à 6 mois. Période idéale : ils sont opérationnels, cherchent à optimiser leurs achats, et n'ont pas encore de contrats longue durée avec vos concurrents.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,255,157,0.2)' }}>
                      <Users className="w-6 h-6" style={{ color: '#00FF9D' }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Décideur identifié (gérant, chef, responsable achats)</h3>
                      <p className="text-base" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif', lineHeight: '1.7' }}>
                        Selon la taille de l'établissement, nous trouvons le vrai décideur : gérant pour les petits restaurants, chef de cuisine, responsable achats pour les chaînes ou grands établissements. Recherche multi-canal (LinkedIn, Facebook, Google, réseaux pros).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,255,157,0.2)' }}>
                      <Phone className="w-6 h-6" style={{ color: '#00FF9D' }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Prospection téléphone + mail + terrain via app Pulse</h3>
                      <p className="text-base" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif', lineHeight: '1.7' }}>
                        Vous lancez une campagne téléphone pour qualifier l'intérêt, puis envoyez des emails ciblés, et finalement organisez vos visites terrain sur les prospects chauds. L'app Pulse centralise tout : plus aucun prospect oublié.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Étapes */}
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
                      title: 'RDV Calendly : définition cible',
                        desc: 'Nous définissons votre profil client idéal (type d\'établissement, taille, zones géo), et vos critères de qualification.',
                      icon: Clock
                    },
                    {
                      step: '2',
                      title: 'Recherche créations 3-6 mois restauration',
                      desc: 'Nos équipes identifient les nouvelles créations restauration sur vos zones, avec recherche multi-canal du décideur.',
                      icon: Search
                    },
                    {
                      step: '3',
                      title: 'Leads fournis dans app Pulse',
                      desc: 'Vous recevez vos leads qualifiés : nom établissement, adresse, décideur identifié, téléphone quand disponible.',
                      icon: Target
                    },
                    {
                      step: '4',
                      title: 'Campagne téléphone + mails',
                      desc: 'Vous lancez vos campagnes de qualification par téléphone et mail. Scripts personnalisés fournis.',
                      icon: Phone
                    },
                    {
                      step: '5',
                      title: 'Visites terrain optimisées',
                      desc: 'Tournées GPS optimisées pour visiter les prospects chauds. -40% de km inutiles.',
                      icon: Building2
                    },
                    {
                      step: '6',
                      title: 'Coaching + reporting ROI',
                      desc: 'Coaching mensuel + dashboards ROI temps réel : RDV, taux conversion, CA signé.',
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
                    <div className="text-4xl font-bold mb-2" style={{ color: '#00FF9D', fontFamily: 'Inter, sans-serif' }}>+40%</div>
                    <p className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>CA généré</p>
                    <p className="text-sm" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                      Résultats moyens constatés sur 6 mois d'accompagnement par nos clients fournisseurs restauration.
                    </p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2" style={{ color: '#00D4FF', fontFamily: 'Inter, sans-serif' }}>RDV x3</div>
                    <p className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>RDV qualifiés</p>
                    <p className="text-sm" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                      Triplement des RDV qualifiés vs prospection classique grâce au ciblage créations récentes.
                    </p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2" style={{ color: '#00FF9D', fontFamily: 'Inter, sans-serif' }}>25-35%</div>
                    <p className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Taux de conversion</p>
                    <p className="text-sm" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                      Contre 8-12% en prospection froide. Le timing parfait fait toute la différence.
                    </p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2" style={{ color: '#00D4FF', fontFamily: 'Inter, sans-serif' }}>2-3 mois</div>
                    <p className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>ROI positif</p>
                    <p className="text-sm" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                      Retour sur investissement positif dès le 2e-3e mois d'accompagnement.
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,255,0.3)' }}>
                  <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>Exemple Concret</h3>
                  <p className="text-base mb-4" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif' }}>
                    <strong className="text-white">Sophie L., fournisseur équipements restauration région PACA :</strong>
                  </p>
                  <p className="text-base" style={{ color: '#A0AEC0', fontFamily: 'Inter, sans-serif', lineHeight: '1.7' }}>
                    « Avec Pulse, nous avons signé 28 nouveaux clients restauration en 6 mois (contre 12 habituellement). Le CA récurrent mensuel a augmenté de +42%. Le secret ? Être le premier à contacter les nouveaux établissements pendant leur phase d'optimisation achats. L'app Pulse multi-canal (téléphone + mail + terrain) est un game-changer. On a enfin une longueur d'avance sur nos concurrents. »
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
                Prêt à Signer Avant Vos Concurrents ?
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
                  Réserver RDV Calendly pour Devis
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

export default BlogFournisseursRestauration;
