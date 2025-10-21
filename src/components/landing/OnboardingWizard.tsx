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
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Benefits badges en haut */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-xs font-medium text-accent">
                <Target className="h-3.5 w-3.5" />
                +40% de conversion
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-xs font-medium text-accent">
                <MapPin className="h-3.5 w-3.5" />
                -30% de temps route
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-xs font-medium text-accent">
                <TrendingUp className="h-3.5 w-3.5" />
                6h/semaine économisées
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full text-accent font-semibold">
                <Sparkles className="h-4 w-4" />
                Offre de lancement
              </div>
              <h3 className="text-3xl font-bold">
                Transformez votre prospection terrain
              </h3>
              <p className="text-base text-muted-foreground max-w-xl mx-auto">
                LUMA vous aide à trouver, qualifier et suivre vos prospects 
                tout en assurant vos déplacements
              </p>
            </div>

            {/* Single CTA Button */}
            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={() => handleDemoChoice('demo')}
                className="gap-2 hover:scale-105 transition-transform bg-accent hover:bg-accent/90 text-lg px-8 py-6"
              >
                <Rocket className="h-5 w-5" />
                C&apos;est parti, je découvre Luma
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
