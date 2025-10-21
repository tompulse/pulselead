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

      const result = await generateDemoData(user.id);
      
      if (result.success) {
        toast({
          title: "Données de démo chargées",
          description: "10 entreprises fictives ont été ajoutées à votre compte",
        });
        
        await handleStepComplete();
        setCurrentStep(3);
      }
    } else {
      await handleStepComplete();
      setCurrentStep(2);
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
      <Card className="w-full max-w-4xl p-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Bienvenue sur LUMA 👋</h2>
            <span className="text-sm text-muted-foreground">
              Étape {currentStep}/3
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Welcome & Value Proposition */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-4 mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium">
                <Sparkles className="h-4 w-4" />
                Offre de lancement
              </div>
              <h3 className="text-3xl font-bold">
                Transformez votre prospection terrain
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                LUMA vous aide à trouver, qualifier et suivre vos prospects 
                tout en optimisant vos déplacements
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">+40% de conversion</h4>
                <p className="text-sm text-muted-foreground">
                  Ciblez les bons prospects au bon moment
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">-30% de temps route</h4>
                <p className="text-sm text-muted-foreground">
                  Optimisez automatiquement vos tournées
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">8h/semaine économisées</h4>
                <p className="text-sm text-muted-foreground">
                  Automatisez votre suivi commercial
                </p>
              </Card>
            </div>

            <div className="space-y-4">
              <p className="text-center font-medium mb-4">
                Comment souhaitez-vous commencer ?
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Card
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    selectedOption === 'demo' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleDemoChoice('demo')}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Mode Découverte</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Explorez LUMA avec 10 entreprises fictives pré-chargées
                      </p>
                      <div className="flex items-center gap-2 text-xs text-primary">
                        <Check className="h-3 w-3" />
                        Démo interactive
                        <Check className="h-3 w-3" />
                        Données réalistes
                        <Check className="h-3 w-3" />
                        Sans engagement
                      </div>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    selectedOption === 'real' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleDemoChoice('real')}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Rocket className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Mode Production</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Configurez votre territoire et commencez immédiatement
                      </p>
                      <div className="flex items-center gap-2 text-xs text-primary">
                        <Check className="h-3 w-3" />
                        Vraies entreprises
                        <Check className="h-3 w-3" />
                        Données à jour
                        <Check className="h-3 w-3" />
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
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 text-center">
            <div className="inline-flex h-20 w-20 rounded-full bg-primary/10 items-center justify-center mx-auto mb-4">
              <Check className="h-10 w-10 text-primary" />
            </div>
            
            <h3 className="text-2xl font-bold">Configuration terminée ! 🎉</h3>
            
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
              >
                Passer le tutoriel
              </Button>
              <Button
                size="lg"
                onClick={handleStartTour}
                className="gap-2"
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
