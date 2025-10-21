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
      <Card className="w-full max-w-3xl max-h-[85vh] overflow-auto custom-scrollbar p-4 md:p-6">
        {/* Progress Header */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Bienvenue sur LUMA</h2>
        </div>

        {/* Step 1: Welcome & Value Proposition */}
        {currentStep === 1 && (
          <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4">
            {/* Benefits badges en haut - Plus gros et en vert */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-1.5 md:py-2.5 bg-green-500/10 border border-green-500/30 rounded-full text-xs md:text-sm font-semibold text-green-500">
                <Target className="h-3 w-3 md:h-4 md:w-4" />
                +40%
              </div>
              <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-1.5 md:py-2.5 bg-green-500/10 border border-green-500/30 rounded-full text-xs md:text-sm font-semibold text-green-500">
                <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                -30% temps
              </div>
              <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-1.5 md:py-2.5 bg-green-500/10 border border-green-500/30 rounded-full text-xs md:text-sm font-semibold text-green-500">
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                6h/semaine
              </div>
            </div>

            <div className="text-center space-y-3 md:space-y-6">
              <h3 className="text-2xl md:text-4xl font-bold leading-tight px-2">
                La prospection terrain intelligente
              </h3>
              <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
                Identifiez les meilleurs prospects, optimisez vos tournées et boostez vos conversions.
              </p>
            </div>

            {/* Single CTA Button */}
            <div className="flex justify-center pt-2 md:pt-6">
              <Button
                size="lg"
                onClick={() => handleDemoChoice('demo')}
                className="gap-2 hover:scale-105 transition-transform bg-accent hover:bg-accent/90 text-base md:text-lg px-8 md:px-10 py-6 md:py-7 shadow-lg w-full md:w-auto max-w-xs"
              >
                <Rocket className="h-5 w-5 md:h-6 md:w-6" />
                Démarrer maintenant
              </Button>
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
