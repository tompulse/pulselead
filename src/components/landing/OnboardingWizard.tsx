import { useState, useEffect } from 'react';
import { Check, Sparkles, Target, Rocket, MapPin, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FilterOnboarding } from '@/components/dashboard/FilterOnboarding';
import { generateDemoData } from '@/utils/demoDataGenerator';
import { ProductTour } from './ProductTour';

interface OnboardingWizardProps {
  onComplete: () => void;
}

const TOUR_STEPS = [
  {
    target: '[data-tour="map-view"]',
    title: '🗺️ Vue Carte Interactive',
    content: 'Visualisez toutes vos entreprises sur une carte. Cliquez sur un pin pour voir les détails.',
    position: 'bottom' as const,
  },
  {
    target: '[data-tour="view-switcher"]',
    title: '🔄 Changez de Vue',
    content: 'Alternez entre carte, liste, activités, tournées et pipeline selon vos besoins.',
    position: 'bottom' as const,
  },
  {
    target: '[data-tour="filters"]',
    title: '🎯 Filtres Intelligents',
    content: 'Filtrez par département, activité, statut pour cibler vos prospects.',
    position: 'right' as const,
  },
  {
    target: '[data-tour="quick-actions"]',
    title: '⚡ Actions Rapides',
    content: 'Appelez, envoyez un email ou prenez rendez-vous en un clic.',
    position: 'left' as const,
  },
];

export const OnboardingWizard = ({ onComplete }: OnboardingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState<'demo' | 'real' | null>(null);
  const [showTour, setShowTour] = useState(false);
  const { toast } = useToast();

  const progress = (currentStep / 3) * 100;

  const handleStepComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('user_onboarding_progress')
      .upsert({
        user_id: user.id,
        current_step: currentStep + 1,
        completed_steps: Array.from({ length: currentStep }, (_, i) => i + 1),
      });
  };

  const handleDemoChoice = async (choice: 'demo' | 'real') => {
    setSelectedOption(choice);
    
    if (choice === 'demo') {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      toast({
        title: "Chargement des données de démo...",
        description: "Veuillez patienter",
      });

      const result = await generateDemoData(user.id);
      
      if (result.success) {
        toast({
          title: "Données de démo chargées",
          description: "10 entreprises fictives ont été ajoutées à votre compte",
        });
        
        await supabase
          .from('user_onboarding_progress')
          .upsert({
            user_id: user.id,
            current_step: 3,
            completed_steps: [1,2,3],
            demo_data_loaded: true,
            completed_at: new Date().toISOString(),
          });

        localStorage.setItem('luma_onboarding_complete', 'true');

        // Fermer l'onboarding et montrer directement le dashboard
        onComplete();
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de démo",
          variant: "destructive",
        });
      }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_onboarding_progress')
          .upsert({ user_id: user.id, current_step: 2 });
      }
      // Demander l'onboarding filtre en plein écran via Dashboard
      localStorage.setItem('luma_launch_filter_onboarding', 'true');
      onComplete();
    }
  };

  const handleFiltersComplete = async () => {
    await handleStepComplete();
    setCurrentStep(3);
  };

  const handleStartTour = () => {
    setShowTour(true);
  };

  const handleTourComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('user_onboarding_progress')
      .update({
        completed_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    setShowTour(false);
    onComplete();
  };

  const handleSkipTour = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('user_onboarding_progress')
      .update({
        skipped_tutorial: true,
        completed_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    setShowTour(false);
    onComplete();
  };

  if (showTour) {
    return (
      <ProductTour
        steps={TOUR_STEPS}
        onComplete={handleTourComplete}
        onSkip={handleSkipTour}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
      <Card className="w-full max-w-3xl max-h-[80vh] overflow-auto custom-scrollbar p-6">
        {/* Progress Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Bienvenue sur LUMA 👋</h2>
            <span className="text-sm font-semibold text-muted-foreground">
              Étape {currentStep}/3
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Welcome & Value Proposition */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-4 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full text-accent font-semibold">
                <Sparkles className="h-4 w-4" />
                Offre de lancement
              </div>
              <h3 className="text-2xl font-bold">
                Transformez votre prospection terrain
              </h3>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                LUMA vous aide à trouver, qualifier et suivre vos prospects 
                tout en optimisant vos déplacements
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <Card className="p-4 text-center border-accent/30">
                <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center mx-auto mb-3">
                  <Target className="h-5 w-5 text-accent" />
                </div>
                <h4 className="text-base font-bold mb-1">+40% de conversion</h4>
                <p className="text-xs text-muted-foreground">
                  Ciblez les bons prospects au bon moment
                </p>
              </Card>

              <Card className="p-4 text-center border-accent/30">
                <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="h-5 w-5 text-accent" />
                </div>
                <h4 className="text-base font-bold mb-1">-30% de temps route</h4>
                <p className="text-xs text-muted-foreground">
                  Optimisez automatiquement vos tournées
                </p>
              </Card>

              <Card className="p-4 text-center border-accent/30">
                <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <h4 className="text-base font-bold mb-1">8h/semaine économisées</h4>
                <p className="text-xs text-muted-foreground">
                  Automatisez votre suivi commercial
                </p>
              </Card>
            </div>

            <div className="space-y-4">
              <p className="text-center text-lg font-semibold mb-2">
                Comment souhaitez-vous commencer ?
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Card
                  className={`p-6 cursor-pointer transition-all border ${
                    selectedOption === 'demo' 
                      ? 'ring-2 ring-accent border-accent' 
                      : 'border-accent/30 hover:border-accent/50'
                  }`}
                  onClick={() => handleDemoChoice('demo')}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-accent/30 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold mb-0.5">Mode Découverte</h4>
                        <p className="text-sm text-muted-foreground">
                          Explorez LUMA avec 10 entreprises fictives pré-chargées
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-accent">
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5" />
                        Démo interactive
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5" />
                        Données réalistes
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5" />
                        Sans engagement
                      </div>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-6 cursor-pointer transition-all border ${
                    selectedOption === 'real' 
                      ? 'ring-2 ring-accent border-accent' 
                      : 'border-accent/30 hover:border-accent/50'
                  }`}
                  onClick={() => handleDemoChoice('real')}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-accent/30 flex items-center justify-center flex-shrink-0">
                        <Rocket className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold mb-0.5">Mode Production</h4>
                        <p className="text-sm text-muted-foreground">
                          Configurez votre territoire et commencez immédiatement
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-accent">
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5" />
                        Vraies entreprises
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5" />
                        Données à jour
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5" />
                        Résultats réels
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Territory Configuration (only if real data) */}
        {currentStep === 2 && selectedOption === 'real' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <FilterOnboarding onComplete={handleFiltersComplete} />
          </div>
        )}

        {/* Step 3: Launch Tour */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 text-center py-6">
            <div className="inline-flex h-20 w-20 rounded-full bg-accent/30 items-center justify-center mx-auto mb-4">
              <Check className="h-10 w-10 text-accent" />
            </div>
            
            <h3 className="text-3xl font-bold">
              Configuration terminée ! 🎉
            </h3>
            
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {selectedOption === 'demo' 
                ? "Vos données de démo sont prêtes. Voulez-vous un tour guidé de l'interface ?"
                : "Votre territoire est configuré. Voulez-vous un tour guidé de l'interface ?"
              }
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handleSkipTour}
                className="hover:scale-105 transition-transform border-accent/50"
              >
                Passer le tutoriel
              </Button>
              <Button
                size="lg"
                onClick={handleStartTour}
                className="gap-2 hover:scale-105 transition-transform bg-accent hover:bg-accent/90"
              >
                <Sparkles className="h-5 w-5" />
                Démarrer le tour guidé
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
