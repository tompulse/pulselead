import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, ArrowRight, Sparkles, Building2, Send, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Prix IDs Stripe - À REMPLACER avec les vrais IDs après création dans Stripe
const STRIPE_PRICES = {
  monthly: 'price_pulse_monthly', // 49€/mois
  quarterly: 'price_pulse_quarterly', // 117€/trimestre (39€/mois)
  yearly: 'price_pulse_yearly', // 348€/an (29€/mois)
};

type PricingPlan = {
  price: number;
  label: string;
  billingDetails: string;
  priceId: string;
  savings?: string;
};

const pricingPlans: Record<'monthly' | 'quarterly' | 'yearly', PricingPlan> = {
  monthly: {
    price: 49,
    label: 'Mensuel',
    billingDetails: 'Facturé tous les mois',
    priceId: STRIPE_PRICES.monthly,
  },
  quarterly: {
    price: 39,
    label: 'Trimestriel',
    billingDetails: 'Soit 117€ facturé tous les 3 mois',
    savings: '-20%',
    priceId: STRIPE_PRICES.quarterly,
  },
  yearly: {
    price: 29,
    label: 'Annuel',
    billingDetails: 'Soit 348€ facturé à l\'année',
    savings: '-40%',
    priceId: STRIPE_PRICES.yearly,
  },
};

const features = [
  {
    icon: '🗺️',
    title: 'Cartographie territoire',
    description: 'Visualisez TOUS vos prospects sur une carte. Fini les zones blanches.',
  },
  {
    icon: '🚀',
    title: 'Tournées optimisées IA',
    description: 'L\'IA calcule votre meilleur itinéraire. Moins de route, plus de RDV.',
  },
  {
    icon: '📱',
    title: 'CRM mobile terrain',
    description: 'Enregistrez visites et relances depuis votre poche. Zéro paperasse.',
  },
  {
    icon: '🎯',
    title: 'Filtres intelligents',
    description: 'Ciblez par département, secteur d\'activité, taille d\'entreprise.',
  },
  {
    icon: '📊',
    title: 'Pipeline Kanban',
    description: 'Suivez vos deals du premier contact à la signature.',
  },
  {
    icon: '🔔',
    title: 'Relances programmées',
    description: 'Ne ratez plus jamais un rappel client.',
  },
];

const enterpriseFeatures = [
  'Tout PULSE inclus',
  'Équipes illimitées',
  'Onboarding personnalisé',
  'Support prioritaire',
  'Session d\'analyse mensuelle offerte',
  'Dashboard managers',
];

const Subscribe = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  
  // Enterprise form state
  const [enterpriseForm, setEnterpriseForm] = useState({
    name: '',
    email: '',
    phone: '',
    teamSize: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast({
          title: 'Connexion requise',
          description: 'Veuillez vous connecter pour souscrire à un abonnement',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: pricingPlans[selectedPlan].priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la création du paiement',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterpriseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-enterprise-inquiry', {
        body: enterpriseForm,
      });

      if (error) throw error;

      toast({
        title: 'Demande envoyée ! ✅',
        description: 'Nous vous recontacterons dans les 24h.',
      });

      setEnterpriseForm({
        name: '',
        email: '',
        phone: '',
        teamSize: '',
        message: '',
      });
    } catch (error: any) {
      console.error('Enterprise inquiry error:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de l\'envoi',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPlan = pricingPlans[selectedPlan];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'radial-gradient(ellipse at top, hsl(220, 60%, 12%), hsl(220, 60%, 8%), hsl(0, 0%, 0%))'
    }}>
      {/* Decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-cyan-glow/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }}></div>
      </div>

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 text-green-400 px-6 py-2 rounded-full mb-6 font-bold shadow-lg">
              <Sparkles className="w-5 h-5" />
              Offre de lancement
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choisissez <span className="gradient-text">PULSE</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une seule offre complète pour structurer votre prospection terrain
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* PULSE Card */}
            <Card className="relative overflow-visible" style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)',
              border: '2px solid rgba(6, 182, 212, 0.5)',
              boxShadow: '0 25px 70px -15px rgba(6, 182, 212, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
            }}>
              <div className="p-8">
                <h2 className="text-3xl font-bold mb-6 text-center gradient-text">PULSE</h2>
                
                {/* Plan Toggle */}
                <div className="flex justify-center mb-6">
                  <div className="inline-flex rounded-lg p-1" style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(6, 182, 212, 0.2)'
                  }}>
                    {Object.entries(pricingPlans).map(([key, plan]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedPlan(key as 'monthly' | 'quarterly' | 'yearly')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-1 ${
                          selectedPlan === key 
                            ? 'bg-accent text-black shadow-lg' 
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        {plan.label}
                        {plan.savings && (
                          <span className={`text-xs font-bold ${selectedPlan === key ? 'text-green-700' : 'text-green-400'}`}>
                            {plan.savings}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Display */}
                <div className="text-center mb-8 py-4 px-4 rounded-xl" style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(6, 182, 212, 0.2)'
                }}>
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-5xl font-bold gradient-text">{currentPlan.price}€</span>
                    <span className="text-xl text-muted-foreground">/mois</span>
                  </div>
                  {currentPlan.savings && (
                    <span className="inline-block bg-green-600/20 text-green-400 px-4 py-1 rounded-full text-sm font-semibold border border-green-500/30">
                      {currentPlan.savings} de réduction
                    </span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 rounded-lg transition-all hover:bg-white/5">
                      <span className="text-2xl flex-shrink-0">{feature.icon}</span>
                      <div>
                        <span className="font-semibold text-white">{feature.title}</span>
                        <p className="text-sm text-muted-foreground mt-0.5">{feature.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-accent to-cyan-glow text-black hover:opacity-90 text-lg py-6 font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Redirection...
                    </>
                  ) : (
                    <>
                      Commencer maintenant
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Enterprise Card */}
            <Card className="relative overflow-visible" style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
              border: '2px solid rgba(14, 165, 233, 0.3)',
              boxShadow: '0 20px 60px -10px rgba(14, 165, 233, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              <div className="p-8">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Building2 className="w-8 h-8 text-cyan-glow" />
                  <h2 className="text-3xl font-bold gradient-text">Sur Mesure</h2>
                </div>

                <p className="text-center text-muted-foreground mb-6">
                  Solution adaptée aux équipes commerciales avec accompagnement personnalisé
                </p>

                {/* Enterprise Features */}
                <ul className="space-y-3 mb-6">
                  {enterpriseFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-cyan-glow/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-cyan-glow" />
                      </div>
                      <span className="text-white text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Enterprise Form */}
                <form onSubmit={handleEnterpriseSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm">Nom complet *</Label>
                      <Input
                        id="name"
                        value={enterpriseForm.name}
                        onChange={(e) => setEnterpriseForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Jean Dupont"
                        required
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">Email pro *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={enterpriseForm.email}
                        onChange={(e) => setEnterpriseForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="jean@entreprise.com"
                        required
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={enterpriseForm.phone}
                        onChange={(e) => setEnterpriseForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="06 12 34 56 78"
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teamSize" className="text-sm">Taille équipe</Label>
                      <Input
                        id="teamSize"
                        value={enterpriseForm.teamSize}
                        onChange={(e) => setEnterpriseForm(prev => ({ ...prev, teamSize: e.target.value }))}
                        placeholder="Ex: 5-10 commerciaux"
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm">Besoins spécifiques</Label>
                    <Textarea
                      id="message"
                      value={enterpriseForm.message}
                      onChange={(e) => setEnterpriseForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Décrivez vos besoins, vos objectifs, votre équipe..."
                      rows={3}
                      className="bg-background/50 border-border/50 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-cyan-glow text-black hover:bg-cyan-glow/90 text-base py-5 font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Demander un devis
                      </>
                    )}
                  </Button>
                </form>
              </div>
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
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-1">✅</span>
              <span className="text-sm text-muted-foreground">Conforme RGPD</span>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-card/50 border border-border/50 rounded-lg p-8 max-w-3xl mx-auto backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6 text-center">Questions fréquentes</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Puis-je changer de formule plus tard ?</h3>
                <p className="text-sm text-muted-foreground">
                  Oui, vous pouvez passer d'un abonnement mensuel à trimestriel ou annuel à tout moment.
                  La différence sera calculée au prorata.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Y a-t-il un engagement minimum ?</h3>
                <p className="text-sm text-muted-foreground">
                  Non, vous pouvez annuler à tout moment. L'abonnement reste actif jusqu'à la fin de la période payée.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Comment fonctionne le remboursement ?</h3>
                <p className="text-sm text-muted-foreground">
                  Si vous n'êtes pas satisfait dans les 14 premiers jours, contactez-nous et nous vous remboursons intégralement.
                </p>
              </div>
            </div>
          </div>

          {/* Back to home */}
          <div className="text-center mt-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
