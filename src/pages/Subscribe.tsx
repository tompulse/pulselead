import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Construction } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Subscribe = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

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
            Choisissez votre formule PULSE
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Gagnez 2h par jour sur le terrain
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-5xl mx-auto">
          {/* Commercial Offer */}
          <Card className="relative p-8 border-border/50 hover:border-accent/50 transition-all duration-300">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Commercial</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-accent">69€</span>
                <span className="text-xl text-muted-foreground line-through">99€</span>
                <span className="text-sm text-muted-foreground">/mois</span>
              </div>
              <div className="inline-flex items-center bg-green-600/20 text-green-600 px-3 py-1 rounded-full text-sm font-bold mt-2">
                -30% de réduction
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm">Cartographie interactive de votre territoire</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm">Tournées optimisées automatiquement</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm">Navigation GPS intégrée (Google Maps / Waze)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm">CRM multi-supports : visites, RDV, emails, notes</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm">Programmer vos relances</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm">Pipeline de vente (Kanban)</span>
              </li>
              <li className="flex items-start gap-2 opacity-60">
                <Construction className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex items-center gap-2">
                  <span className="text-sm">Assistant IA</span>
                  <Badge variant="secondary" className="text-xs">Bientôt disponible</Badge>
                </div>
              </li>
            </ul>

            <Button
              onClick={() => handleSubscribe('commercial')}
              className="w-full"
              size="lg"
            >
              Commencer
            </Button>
          </Card>

          {/* Premium Offer */}
          <Card className="relative p-8 border-2 border-accent shadow-2xl shadow-accent/20 scale-105 transition-all duration-300">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent to-cyan-glow text-primary px-6 py-1 rounded-full text-sm font-bold shadow-lg">
              Offre la plus populaire
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-accent">104€</span>
                <span className="text-xl text-muted-foreground line-through">149€</span>
                <span className="text-sm text-muted-foreground">/mois</span>
              </div>
              <div className="inline-flex items-center bg-green-600/20 text-green-600 px-3 py-1 rounded-full text-sm font-bold mt-2">
                -30% de réduction
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm font-semibold">Tout Commercial inclus</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm font-semibold">🎯 Détection automatique des créations d'entreprises</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm font-semibold">Nouveaux sites détectés (ouvertures, déménagements)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm font-semibold">Filtres avancés (NAF, départements, catégories)</span>
              </li>
            </ul>

            <Button
              onClick={() => handleSubscribe('premium')}
              className="w-full bg-gradient-to-r from-accent to-cyan-glow hover:shadow-xl hover:shadow-accent/40"
              size="lg"
            >
              Commencer maintenant
            </Button>
          </Card>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-8 mb-12 text-center">
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">💳</span>
            <span className="text-sm text-muted-foreground">Satisfait ou remboursé 14 jours</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">🔒</span>
            <span className="text-sm text-muted-foreground">Paiement 100% sécurisé</span>
          </div>
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
