import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Subscribe = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const plans = [
    {
      name: 'Mensuel',
      originalPrice: 99,
      discountedPrice: 69,
      period: '/mois',
      plan: 'monthly',
      popular: false,
      savings: '-30%'
    },
    {
      name: 'Trimestriel',
      originalPrice: 237,
      discountedPrice: 166,
      period: '/3 mois',
      plan: 'quarterly',
      popular: true,
      savings: '-30%',
      monthlyEquivalent: '55€/mois'
    },
    {
      name: 'Annuel',
      originalPrice: 708,
      discountedPrice: 496,
      period: '/an',
      plan: 'yearly',
      popular: false,
      savings: '-30%',
      monthlyEquivalent: '41€/mois'
    }
  ];

  const handleSubscribe = (plan: string) => {
    toast({
      title: 'Paiement bientôt disponible',
      description: 'Le système de paiement sera activé très prochainement',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/5 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-full mb-6 font-bold shadow-lg">
            <Sparkles className="w-5 h-5" />
            Offre de lancement -30% • Jusqu'au 31 Décembre 2025
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-accent via-cyan-glow to-accent bg-clip-text text-transparent">
            Choisissez votre abonnement PULSE
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Accédez à toutes les fonctionnalités de PULSE : détection de mouvements d'entreprises, 
            tournées optimisées et CRM intégré
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.plan}
              className={`relative p-8 ${
                plan.popular
                  ? 'border-2 border-accent shadow-2xl shadow-accent/20 scale-105'
                  : 'border-border/50 hover:border-accent/50'
              } transition-all duration-300 hover:scale-105`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent to-cyan-glow text-primary px-6 py-1 rounded-full text-sm font-bold shadow-lg">
                  Le plus populaire
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-accent">{plan.discountedPrice}€</span>
                  <span className="text-xl text-muted-foreground line-through">{plan.originalPrice}€</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{plan.period}</p>
                {plan.monthlyEquivalent && (
                  <p className="text-sm font-semibold text-green-600">
                    Soit {plan.monthlyEquivalent}
                  </p>
                )}
                <div className="inline-flex items-center bg-green-600/20 text-green-600 px-3 py-1 rounded-full text-sm font-bold mt-2">
                  {plan.savings} de réduction
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Détection automatique des mouvements d'entreprises</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Tournées optimisées avec GPS</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">CRM intégré avec suivi des interactions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Assistant IA pour l'optimisation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">Accès mobile et hors-ligne</span>
                </li>
              </ul>

              <Button
                onClick={() => handleSubscribe(plan.plan)}
                className={`w-full ${
                  plan.popular
                    ? 'bg-gradient-to-r from-accent to-cyan-glow hover:shadow-xl hover:shadow-accent/40'
                    : ''
                }`}
                size="lg"
              >
                Commencer maintenant
              </Button>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-card border border-border/50 rounded-lg p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Questions fréquentes</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Puis-je changer de formule plus tard ?</h3>
              <p className="text-sm text-muted-foreground">
                Oui, vous pouvez passer à une formule supérieure à tout moment. 
                Le montant déjà payé sera déduit de votre nouvelle formule.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">L'offre -30% est-elle valable pour tous ?</h3>
              <p className="text-sm text-muted-foreground">
                Oui, cette offre de lancement est disponible pour tous les nouveaux abonnements 
                jusqu'au 31 décembre 2025.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Que se passe-t-il à la fin de mon abonnement ?</h3>
              <p className="text-sm text-muted-foreground">
                Votre abonnement se renouvelle automatiquement au tarif en vigueur. 
                Vous pouvez annuler à tout moment depuis votre espace.
              </p>
            </div>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
