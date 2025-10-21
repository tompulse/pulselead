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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-6xl p-12 my-8">
        {/* Progress Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Bienvenue sur LUMA 👋
            </h2>
            <span className="text-lg font-semibold text-muted-foreground">
              Étape {currentStep}/3
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Step 1: Welcome & Value Proposition */}
        {currentStep === 1 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-6 mb-12">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-full text-primary font-semibold text-lg">
                <Sparkles className="h-5 w-5" />
                Offre de lancement
              </div>
              <h3 className="text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Transformez votre prospection terrain
              </h3>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                LUMA vous aide à trouver, qualifier et suivre vos prospects 
                tout en optimisant vos déplacements
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="p-8 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/50">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3">+40% de conversion</h4>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Ciblez les bons prospects au bon moment
                </p>
              </Card>

              <Card className="p-8 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/50">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3">-30% de temps route</h4>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Optimisez automatiquement vos tournées
                </p>
              </Card>

              <Card className="p-8 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/50">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3">8h/semaine économisées</h4>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Automatisez votre suivi commercial
                </p>
              </Card>
            </div>

            <div className="space-y-8">
              <p className="text-center text-2xl font-semibold mb-8">
                Comment souhaitez-vous commencer ?
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <Card
                  className={`p-10 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2 ${
                    selectedOption === 'demo' 
                      ? 'ring-4 ring-primary shadow-2xl shadow-primary/20 border-primary' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleDemoChoice('demo')}
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Sparkles className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold mb-2">Mode Découverte</h4>
                        <p className="text-base text-muted-foreground leading-relaxed">
                          Explorez LUMA avec 10 entreprises fictives pré-chargées
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-primary">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Démo interactive
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Données réalistes
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Sans engagement
                      </div>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-10 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2 ${
                    selectedOption === 'real' 
                      ? 'ring-4 ring-primary shadow-2xl shadow-primary/20 border-primary' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleDemoChoice('real')}
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Rocket className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold mb-2">Mode Production</h4>
                        <p className="text-base text-muted-foreground leading-relaxed">
                          Configurez votre territoire et commencez immédiatement
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-primary">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Vraies entreprises
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Données à jour
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
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
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 text-center py-8">
            <div className="inline-flex h-28 w-28 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 items-center justify-center mx-auto mb-6 shadow-2xl">
              <Check className="h-16 w-16 text-primary" />
            </div>
            
            <h3 className="text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Configuration terminée ! 🎉
            </h3>
            
            <p className="text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {selectedOption === 'demo' 
                ? "Vos données de démo sont prêtes. Voulez-vous un tour guidé de l'interface ?"
                : "Votre territoire est configuré. Voulez-vous un tour guidé de l'interface ?"
              }
            </p>

            <div className="flex items-center justify-center gap-6 pt-8">
              <Button
                variant="outline"
                size="lg"
                onClick={handleSkipTour}
                className="text-lg px-8 py-6 h-auto hover:scale-105 transition-transform"
              >
                Passer le tutoriel
              </Button>
              <Button
                size="lg"
                onClick={handleStartTour}
                className="gap-3 text-lg px-8 py-6 h-auto hover:scale-105 transition-transform shadow-lg hover:shadow-2xl"
              >
                <Sparkles className="h-6 w-6" />
                Démarrer le tour guidé
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
