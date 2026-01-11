import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Sparkles, ArrowRight, Calendar, MapPin, Route, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userName, setUserName] = useState<string>('');
  const isTrial = searchParams.get('trial') === 'true';

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      
      // Extract name from email if available
      const email = session.user.email || '';
      const name = email.split('@')[0].replace(/[._]/g, ' ');
      setUserName(name.charAt(0).toUpperCase() + name.slice(1));
    };
    
    checkUser();
  }, [navigate]);

  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 7);

  const steps = [
    {
      icon: MapPin,
      title: 'Définir votre territoire',
      description: 'Sélectionnez vos régions et départements cibles'
    },
    {
      icon: Route,
      title: 'Créer votre première tournée',
      description: 'Planifiez vos visites avec l\'optimisation IA'
    },
    {
      icon: MessageSquare,
      title: 'Tracker vos interactions',
      description: 'Enregistrez vos visites et programmez vos relances'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4" style={{
      background: 'radial-gradient(ellipse at top, hsl(220, 60%, 12%), hsl(220, 60%, 8%), hsl(0, 0%, 0%))'
    }}>
      {/* Decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <Card className="p-8 md:p-12 text-center" style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)',
          border: '2px solid rgba(34, 197, 94, 0.4)',
          boxShadow: '0 25px 70px -15px rgba(34, 197, 94, 0.3)'
        }}>
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
            <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 animate-in slide-in-from-bottom duration-500 delay-100">
            <span className="text-green-400">Bienvenue</span> {userName && `${userName} `}sur{' '}
            <span className="gradient-text">PULSE</span> ! 🎉
          </h1>

          {/* Subtitle */}
          {isTrial && (
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-full mb-6 animate-in slide-in-from-bottom duration-500 delay-200">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Essai gratuit de 7 jours activé</span>
            </div>
          )}

          <p className="text-muted-foreground text-lg mb-8 animate-in slide-in-from-bottom duration-500 delay-300">
            Votre compte est prêt. Configurez votre espace de travail en quelques minutes et commencez à prospecter intelligemment.
          </p>

          {/* Trial info */}
          {isTrial && (
            <div className="bg-background/50 border border-border/50 rounded-lg p-4 mb-8 flex items-center justify-center gap-3 animate-in slide-in-from-bottom duration-500 delay-400">
              <Calendar className="w-5 h-5 text-accent" />
              <span className="text-sm">
                Essai gratuit jusqu'au{' '}
                <span className="font-semibold text-white">
                  {trialEndDate.toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </span>
              </span>
            </div>
          )}

          {/* Next Steps */}
          <div className="space-y-4 mb-8 text-left animate-in slide-in-from-bottom duration-500 delay-500">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide text-center">
              Prochaines étapes
            </h3>
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="flex items-start gap-4 p-4 rounded-lg bg-background/30 border border-border/30"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gradient-to-r from-green-500 to-accent text-black hover:opacity-90 text-lg py-6 font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] animate-in slide-in-from-bottom duration-500 delay-700"
          >
            Commencer la configuration
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            Un email de confirmation a été envoyé à votre adresse
          </p>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
