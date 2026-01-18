import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, ArrowRight, Sparkles, Building2, Send, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';

// Prix ID Stripe - Mode Production - Plan mensuel à 79€/mois
const STRIPE_PRICE_ID = 'price_1SqxKmHjyidZ5i9L8tCztpFU';

const features = [
  {
    icon: '📋',
    title: 'Liste de prospects filtrée',
    description: 'Accédez à toutes les nouvelles entreprises créées, filtrées selon vos critères.',
  },
  {
    icon: '🚀',
    title: 'Tournées optimisées IA',
    description: "L'IA calcule votre meilleur itinéraire. Moins de route, plus de RDV.",
  },
  {
    icon: '📱',
    title: 'CRM mobile terrain',
    description: 'Enregistrez visites et relances depuis votre poche. Zéro paperasse.',
  },
  {
    icon: '🎯',
    title: 'Filtres intelligents',
    description: "Ciblez par département, secteur d'activité, taille d'entreprise.",
  },
  {
    icon: '📊',
    title: 'Pipeline Kanban',
    description: 'Suivez vos deals du premier contact à la signature.',
  },
  {
    icon: '🔄',
    title: 'Suivi des relances',
    description: 'Programmez vos rappels clients et retrouvez-les dans votre CRM.',
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
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const { hasAccess, subscriptionStatus, isReturningUser, isLoading: subscriptionLoading } = useSubscription(userId || undefined);
  
  // Check if checkout was cancelled
  const checkoutCancelled = searchParams.get('checkout') === 'cancelled';
  
  // Enterprise form state
  const [enterpriseForm, setEnterpriseForm] = useState({
    name: '',
    email: '',
    phone: '',
    teamSize: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  // Show toast if checkout was cancelled
  useEffect(() => {
    if (checkoutCancelled) {
      toast({
        title: "Paiement annulé",
        description: "Vous pouvez réessayer quand vous le souhaitez",
      });
    }
  }, [checkoutCancelled, toast]);

  // Redirect to dashboard if user already has access
  useEffect(() => {
    if (!isCheckingAuth && !subscriptionLoading && userId && hasAccess) {
      toast({
        title: "Vous avez déjà un abonnement actif",
        description: "Redirection vers votre tableau de bord...",
      });
      navigate('/dashboard');
    }
  }, [isCheckingAuth, subscriptionLoading, userId, hasAccess, navigate, toast]);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        // Redirect to auth with return URL to come back here after login
        navigate('/auth?redirect=subscribe');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: STRIPE_PRICE_ID },
      });

      if (error) throw error;

      if (!data?.url) {
        throw new Error('No checkout URL received');
      }

      const checkoutUrl: string = data.url;
      const inIframe = window.self !== window.top;

      // Stripe Checkout ne se charge pas dans une iframe (comme l'aperçu Lovable).
      // On ouvre donc dans un nouvel onglet (ou on "break out" si popup bloquée).
      if (inIframe) {
        const opened = window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
        if (!opened) {
          try {
            window.top!.location.href = checkoutUrl;
          } catch {
            window.location.href = checkoutUrl;
          }
        } else {
          toast({
            title: 'Ouverture du paiement',
            description: 'Le paiement s’ouvre dans un nouvel onglet.',
          });
        }
      } else {
        window.location.href = checkoutUrl;
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

  // Show loading while checking auth/subscription
  if (isCheckingAuth || (userId && subscriptionLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'radial-gradient(ellipse at top, hsl(220, 60%, 12%), hsl(220, 60%, 8%), hsl(0, 0%, 0%))'
      }}>
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-accent">PULSE</h1>
          <p className="text-muted-foreground">Vérification de votre compte...</p>
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'radial-gradient(ellipse at top, hsl(220, 60%, 12%), hsl(220, 60%, 8%), hsl(0, 0%, 0%))'
    }}>
      {/* Decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-cyan-glow/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }}></div>
      </div>

      <div className="relative z-10 py-8 sm:py-12 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            {/* Message personnalisé pour les utilisateurs de retour (cancelled/expired) */}
            {userId && !hasAccess && isReturningUser && (
              <div className="bg-amber-500/20 border border-amber-500/30 text-amber-400 px-4 sm:px-6 py-3 sm:py-4 rounded-xl mb-4 sm:mb-6 max-w-xl mx-auto">
                <p className="font-bold text-base sm:text-lg">🎉 Bon retour parmi nous !</p>
                <p className="text-xs sm:text-sm mt-1">Vos tournées et données CRM sont toujours là. Réactivez votre accès pour les retrouver.</p>
              </div>
            )}
            {/* Message pour nouveaux utilisateurs connectés */}
            {userId && !hasAccess && !isReturningUser && (
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 px-4 sm:px-6 py-2 rounded-full mb-4 font-medium text-sm sm:text-base">
                👋 Bienvenue ! Activez votre essai
              </div>
            )}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 text-green-400 px-4 sm:px-6 py-2 rounded-full mb-4 sm:mb-6 font-bold shadow-lg text-sm sm:text-base">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              7 jours d'essai gratuit • CB requise
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              {userId ? 'Activez votre accès à' : 'Choisissez'} <span className="gradient-text">PULSE</span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              Testez toutes les fonctionnalités gratuitement pendant 7 jours
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* PULSE Card */}
            <Card className="relative overflow-visible" style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)',
              border: '2px solid rgba(6, 182, 212, 0.5)',
              boxShadow: '0 25px 70px -15px rgba(6, 182, 212, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
            }}>
              <div className="p-4 sm:p-6 md:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center gradient-text">Commercial Solo</h2>
                
                {/* Price Display - Plan unique mensuel */}
                <div className="text-center mb-6 sm:mb-8 py-4 sm:py-6 px-3 sm:px-4 rounded-xl" style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(6, 182, 212, 0.2)'
                }}>
                  <div className="flex items-baseline justify-center gap-1 sm:gap-2">
                    <span className="text-4xl sm:text-5xl font-bold gradient-text">49€</span>
                    <span className="text-lg sm:text-xl text-muted-foreground">/mois</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">Sans engagement • Résiliable à tout moment</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-all hover:bg-white/5">
                      <span className="text-xl sm:text-2xl flex-shrink-0">{feature.icon}</span>
                      <div className="min-w-0">
                        <span className="font-semibold text-white text-sm sm:text-base">{feature.title}</span>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">{feature.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-accent to-cyan-glow text-black hover:opacity-90 text-base sm:text-lg py-5 sm:py-6 font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                      Redirection...
                    </>
                  ) : (
                    <>
                      Commencer mon essai gratuit
                      <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                    </>
                  )}
                </Button>
                <p className="text-[10px] sm:text-xs text-center text-muted-foreground mt-2 sm:mt-3">
                  Vous ne serez débité qu'après 7 jours d'essai
                </p>
              </div>
            </Card>

            {/* Enterprise Card */}
            <Card className="relative overflow-visible" style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
              border: '2px solid rgba(14, 165, 233, 0.3)',
              boxShadow: '0 20px 60px -10px rgba(14, 165, 233, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              <div className="p-4 sm:p-6 md:p-8">
                <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
                  <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-glow shrink-0" />
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">Équipes Commerciales</h2>
                </div>

                <p className="text-center text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                  Solution adaptée aux équipes avec accompagnement personnalisé
                </p>

                {/* Enterprise Features */}
                <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  {enterpriseFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-cyan-glow/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-glow" />
                      </div>
                      <span className="text-white text-xs sm:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Enterprise Form */}
                <form onSubmit={handleEnterpriseSubmit} className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="name" className="text-xs sm:text-sm">Nom complet *</Label>
                      <Input
                        id="name"
                        value={enterpriseForm.name}
                        onChange={(e) => setEnterpriseForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Jean Dupont"
                        required
                        className="bg-background/50 border-border/50 h-9 sm:h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="email" className="text-xs sm:text-sm">Email pro *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={enterpriseForm.email}
                        onChange={(e) => setEnterpriseForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="jean@entreprise.com"
                        required
                        className="bg-background/50 border-border/50 h-9 sm:h-10 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="phone" className="text-xs sm:text-sm">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={enterpriseForm.phone}
                        onChange={(e) => setEnterpriseForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="06 12 34 56 78"
                        className="bg-background/50 border-border/50 h-9 sm:h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="teamSize" className="text-xs sm:text-sm">Taille équipe</Label>
                      <Input
                        id="teamSize"
                        value={enterpriseForm.teamSize}
                        onChange={(e) => setEnterpriseForm(prev => ({ ...prev, teamSize: e.target.value }))}
                        placeholder="5-10 commerciaux"
                        className="bg-background/50 border-border/50 h-9 sm:h-10 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="message" className="text-xs sm:text-sm">Besoins spécifiques</Label>
                    <Textarea
                      id="message"
                      value={enterpriseForm.message}
                      onChange={(e) => setEnterpriseForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Décrivez vos besoins..."
                      rows={2}
                      className="bg-background/50 border-border/50 resize-none text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-cyan-glow text-black hover:bg-cyan-glow/90 text-sm sm:text-base py-4 sm:py-5 font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Demander un devis
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-8 sm:mb-12 text-center">
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl mb-1">💳</span>
              <span className="text-xs sm:text-sm text-muted-foreground">Satisfait ou remboursé 14j</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl mb-1">🔒</span>
              <span className="text-xs sm:text-sm text-muted-foreground">Paiement sécurisé</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl mb-1">✅</span>
              <span className="text-xs sm:text-sm text-muted-foreground">Conforme RGPD</span>
            </div>
          </div>

          {/* FAQ Section - Enhanced Legal Compliance */}
          <div className="bg-card/50 border border-border/50 rounded-lg p-4 sm:p-6 md:p-8 max-w-3xl mx-auto backdrop-blur-sm">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Questions fréquentes</h2>
            <div className="space-y-4 sm:space-y-5">
              <div className="border-b border-border/30 pb-3 sm:pb-4">
                <h3 className="font-semibold mb-1.5 sm:mb-2 flex items-start gap-2 text-sm sm:text-base">
                  <span className="text-cyan-400 shrink-0">💳</span>
                  <span>Quand serai-je débité ?</span>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Votre carte ne sera débitée qu'après 7 jours. 
                  <strong className="text-foreground"> Un rappel 3 jours avant</strong> vous permettra d'annuler si besoin.
                </p>
              </div>
              
              <div className="border-b border-border/30 pb-3 sm:pb-4">
                <h3 className="font-semibold mb-1.5 sm:mb-2 flex items-start gap-2 text-sm sm:text-base">
                  <span className="text-cyan-400 shrink-0">🔄</span>
                  <span>Comment annuler ?</span>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  En 2 clics : <strong className="text-foreground">Paramètres → Mon Abonnement → "Gérer"</strong>. 
                  Annulation sans justification ni frais cachés.
                </p>
              </div>
              
              <div className="border-b border-border/30 pb-3 sm:pb-4">
                <h3 className="font-semibold mb-1.5 sm:mb-2 flex items-start gap-2 text-sm sm:text-base">
                  <span className="text-cyan-400 shrink-0">⏸️</span>
                  <span>Si j'annule pendant l'essai ?</span>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <strong className="text-foreground">Aucun prélèvement.</strong> Accès actif jusqu'à la fin des 7 jours, puis désactivation automatique.
                </p>
              </div>
              
              <div className="border-b border-border/30 pb-3 sm:pb-4">
                <h3 className="font-semibold mb-1.5 sm:mb-2 flex items-start gap-2 text-sm sm:text-base">
                  <span className="text-cyan-400 shrink-0">💾</span>
                  <span>Mes données sont conservées ?</span>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <strong className="text-foreground">Oui !</strong> Tournées, CRM et paramètres conservés indéfiniment. Tout sera là si vous revenez.
                </p>
              </div>
              
              <div className="border-b border-border/30 pb-3 sm:pb-4">
                <h3 className="font-semibold mb-1.5 sm:mb-2 flex items-start gap-2 text-sm sm:text-base">
                  <span className="text-cyan-400 shrink-0">💰</span>
                  <span>Comment obtenir un remboursement ?</span>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <strong className="text-foreground">14 jours de rétractation</strong> après le premier paiement. Contact :{' '}
                  <a href="mailto:tomiolovpro@gmail.com" className="text-cyan-400 hover:underline">tomiolovpro@gmail.com</a>.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1.5 sm:mb-2 flex items-start gap-2 text-sm sm:text-base">
                  <span className="text-cyan-400 shrink-0">📧</span>
                  <span>Quels emails vais-je recevoir ?</span>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  (1) Email de bienvenue, (2) rappel 3 jours avant la fin de l'essai, (3) confirmation après chaque paiement.
                </p>
              </div>
            </div>
            
            {/* Legal mention */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border/30">
              <p className="text-[10px] sm:text-xs text-muted-foreground text-center leading-relaxed">
                En cliquant sur "Commencer mon essai", vous acceptez qu'après 7 jours, 
                votre carte soit débitée de 79€/mois. Annulation possible à tout moment. 
                Droit de rétractation 14 jours.
              </p>
            </div>
          </div>

          {/* Back to home */}
          <div className="text-center mt-6 sm:mt-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground text-sm"
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
