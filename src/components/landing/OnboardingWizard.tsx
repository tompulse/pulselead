import { useState, useEffect } from 'react';
import { Check, Sparkles, Target, Rocket, MapPin, TrendingUp, Building2, Route, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProductTour } from './ProductTour';
import { REGIONS_DATA, DEPARTMENT_NAMES } from '@/utils/regionsData';
import { DETAILED_CATEGORIES } from '@/utils/detailedCategories';
import { ChevronDown } from 'lucide-react';

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

type Step = 'welcome' | 'territory' | 'sectors' | 'complete';

export const OnboardingWizard = ({ onComplete }: OnboardingWizardProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [showTour, setShowTour] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [expandedRegions, setExpandedRegions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [entrepriseCount, setEntrepriseCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState(false);
  const { toast } = useToast();

  const stepOrder: Step[] = ['welcome', 'territory', 'sectors', 'complete'];
  const currentStepIndex = stepOrder.indexOf(currentStep);
  const progress = ((currentStepIndex) / (stepOrder.length - 1)) * 100;

  // Region/Department handlers
  const handleRegionToggle = (regionKey: string) => {
    const regionDepts = REGIONS_DATA[regionKey].departments;
    
    if (selectedRegions.includes(regionKey)) {
      setSelectedRegions(prev => prev.filter(r => r !== regionKey));
      setSelectedDepartments(prev => prev.filter(d => !regionDepts.includes(d)));
    } else {
      setSelectedRegions(prev => [...prev, regionKey]);
      setSelectedDepartments(prev => {
        const newDepts = regionDepts.filter(d => !prev.includes(d));
        return [...prev, ...newDepts];
      });
    }
  };

  const handleDepartmentToggle = (deptCode: string, regionKey: string) => {
    const regionDepts = REGIONS_DATA[regionKey].departments;
    
    if (selectedDepartments.includes(deptCode)) {
      setSelectedDepartments(prev => prev.filter(d => d !== deptCode));
      const remainingDepts = selectedDepartments.filter(d => d !== deptCode && regionDepts.includes(d));
      if (remainingDepts.length === 0) {
        setSelectedRegions(prev => prev.filter(r => r !== regionKey));
      }
    } else {
      setSelectedDepartments(prev => [...prev, deptCode]);
      const allSelected = regionDepts.every(d => d === deptCode || selectedDepartments.includes(d));
      if (allSelected && !selectedRegions.includes(regionKey)) {
        setSelectedRegions(prev => [...prev, regionKey]);
      }
    }
  };

  const toggleRegionExpansion = (regionKey: string) => {
    setExpandedRegions(prev => 
      prev.includes(regionKey) ? prev.filter(r => r !== regionKey) : [...prev, regionKey]
    );
  };

  const handleCategoryToggle = (categoryKey: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryKey) ? prev.filter(c => c !== categoryKey) : [...prev, categoryKey]
    );
  };

  // Count entreprises
  useEffect(() => {
    const fetchCount = async () => {
      if (selectedDepartments.length === 0) {
        setEntrepriseCount(0);
        return;
      }

      setLoadingCount(true);
      try {
        const { count, error } = await supabase
          .from('nouveaux_sites')
          .select('*', { count: 'exact', head: true })
          .not('latitude', 'is', null);

        if (error) {
          setEntrepriseCount(0);
          return;
        }

        setEntrepriseCount(count || 0);
      } catch (error) {
        setEntrepriseCount(0);
      } finally {
        setLoadingCount(false);
      }
    };

    fetchCount();
  }, [selectedDepartments]);

  const handleStartOnboarding = () => {
    setCurrentStep('territory');
  };

  const handleTerritoryNext = () => {
    if (selectedDepartments.length === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins une région ou un département",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep('sectors');
  };

  const handleSectorsNext = async () => {
    // Save filters to localStorage
    const filters = {
      departments: selectedDepartments,
      nafSections: selectedCategories,
    };
    localStorage.setItem('pulse_initial_filters', JSON.stringify(filters));

    // Update onboarding progress
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_onboarding_progress')
        .upsert({
          user_id: user.id,
          current_step: 3,
          completed_steps: [1, 2, 3],
          completed_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
    }

    setCurrentStep('complete');
  };

  const handleSkipToComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_onboarding_progress')
        .upsert({
          user_id: user.id,
          current_step: 3,
          completed_steps: [1, 2, 3],
          completed_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
    }
    onComplete();
  };

  const handleStartTour = () => {
    setShowTour(true);
  };

  const handleTourComplete = async () => {
    setShowTour(false);
    onComplete();
  };

  const handleSkipTour = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_onboarding_progress')
        .update({ skipped_tutorial: true })
        .eq('user_id', user.id);
    }
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
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Progress Header */}
        <div className="p-4 md:p-6 border-b border-accent/20 bg-gradient-to-br from-accent/10 to-transparent shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl md:text-2xl font-bold gradient-text">Bienvenue sur PULSE</h2>
            <Button variant="ghost" size="sm" onClick={handleSkipToComplete} className="text-muted-foreground hover:text-foreground">
              Passer
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span className={currentStep === 'welcome' ? 'text-accent font-medium' : ''}>Accueil</span>
            <span className={currentStep === 'territory' ? 'text-accent font-medium' : ''}>Territoire</span>
            <span className={currentStep === 'sectors' ? 'text-accent font-medium' : ''}>Secteurs</span>
            <span className={currentStep === 'complete' ? 'text-accent font-medium' : ''}>Terminé</span>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">
            {/* Step: Welcome */}
            {currentStep === 'welcome' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 text-center py-8">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Badge variant="outline" className="px-4 py-2 text-sm bg-green-500/10 border-green-500/30 text-green-500">
                    <Target className="h-4 w-4 mr-2" />
                    +40% de prospects qualifiés
                  </Badge>
                  <Badge variant="outline" className="px-4 py-2 text-sm bg-green-500/10 border-green-500/30 text-green-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    -30% de temps sur la route
                  </Badge>
                  <Badge variant="outline" className="px-4 py-2 text-sm bg-green-500/10 border-green-500/30 text-green-500">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    6h économisées / semaine
                  </Badge>
                </div>

                <div className="space-y-4">
                  <h3 className="text-3xl md:text-4xl font-bold">
                    La prospection terrain <span className="gradient-text">intelligente</span>
                  </h3>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Configurons ensemble votre espace de travail en 2 minutes pour maximiser votre efficacité commerciale.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                    <div className="inline-flex p-2 bg-accent/10 rounded-lg mb-3">
                      <MapPin className="h-5 w-5 text-accent" />
                    </div>
                    <h4 className="font-semibold mb-1">1. Votre territoire</h4>
                    <p className="text-sm text-muted-foreground">Définissez vos zones de prospection</p>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                    <div className="inline-flex p-2 bg-accent/10 rounded-lg mb-3">
                      <Building2 className="h-5 w-5 text-accent" />
                    </div>
                    <h4 className="font-semibold mb-1">2. Vos secteurs cibles</h4>
                    <p className="text-sm text-muted-foreground">Choisissez les activités qui vous intéressent</p>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                    <div className="inline-flex p-2 bg-accent/10 rounded-lg mb-3">
                      <Route className="h-5 w-5 text-accent" />
                    </div>
                    <h4 className="font-semibold mb-1">3. C'est parti !</h4>
                    <p className="text-sm text-muted-foreground">Découvrez vos premiers prospects</p>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={handleStartOnboarding}
                  className="gap-2 bg-accent hover:bg-accent/90 text-lg px-10 py-7"
                >
                  <Rocket className="h-5 w-5" />
                  Commencer la configuration
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Step: Territory */}
            {currentStep === 'territory' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-accent/30">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Définissez votre territoire <span className="text-destructive">*</span></h3>
                    <p className="text-sm text-muted-foreground">Sélectionnez les régions et départements où vous prospectez</p>
                  </div>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(REGIONS_DATA).map(([regionKey, regionData]) => {
                    const isSelected = selectedRegions.includes(regionKey);
                    const isExpanded = expandedRegions.includes(regionKey);
                    const selectedDeptCount = regionData.departments.filter(d => selectedDepartments.includes(d)).length;
                    
                    return (
                      <div
                        key={regionKey}
                        className={`rounded-xl border-2 transition-colors ${
                          isSelected ? 'border-accent bg-accent/5' : 'border-accent/20'
                        }`}
                      >
                        <div className="flex items-center gap-3 p-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleRegionToggle(regionKey)}
                            className="h-5 w-5 border-accent/50 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                          />
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => toggleRegionExpansion(regionKey)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{regionKey}</span>
                              <ChevronDown className={`w-5 h-5 text-accent transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                            {selectedDeptCount > 0 && (
                              <span className="text-xs text-accent">{selectedDeptCount} département{selectedDeptCount > 1 ? 's' : ''}</span>
                            )}
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-3 gap-2 border-t border-accent/20 pt-3 bg-accent/5">
                            {regionData.departments.map((deptCode) => (
                              <label
                                key={deptCode}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/10 cursor-pointer text-sm"
                              >
                                <Checkbox
                                  checked={selectedDepartments.includes(deptCode)}
                                  onCheckedChange={() => handleDepartmentToggle(deptCode, regionKey)}
                                  className="h-4 w-4 border-accent/50 data-[state=checked]:bg-accent"
                                />
                                <span>{deptCode} - {DEPARTMENT_NAMES[deptCode]}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step: Sectors */}
            {currentStep === 'sectors' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-accent/30">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <Building2 className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Vos secteurs d'activité cibles <span className="text-muted-foreground text-sm font-normal">(optionnel)</span></h3>
                    <p className="text-sm text-muted-foreground">Sélectionnez les secteurs qui vous intéressent ou passez cette étape</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={handleSectorsNext}
                    className="flex items-center gap-3 p-4 rounded-xl border-2 border-accent bg-accent/10 hover:bg-accent/20 transition-colors text-left"
                  >
                    <Sparkles className="w-6 h-6 text-accent shrink-0" />
                    <div>
                      <span className="font-semibold">✨ Tous les secteurs m'intéressent</span>
                      <p className="text-sm text-muted-foreground">Voir tous les prospects disponibles</p>
                    </div>
                  </button>

                  {DETAILED_CATEGORIES.map((category) => (
                    <label
                      key={category.key}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        selectedCategories.includes(category.key)
                          ? 'border-accent bg-accent/10'
                          : 'border-accent/20 hover:border-accent/40'
                      }`}
                    >
                      <Checkbox
                        checked={selectedCategories.includes(category.key)}
                        onCheckedChange={() => handleCategoryToggle(category.key)}
                        className="h-5 w-5 border-accent/50 data-[state=checked]:bg-accent"
                      />
                      <span className="font-medium">{category.emoji} {category.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step: Complete */}
            {currentStep === 'complete' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 text-center py-8">
                <div className="inline-flex h-20 w-20 rounded-full bg-accent/30 items-center justify-center mx-auto">
                  <Check className="h-10 w-10 text-accent" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-3xl font-bold">Configuration terminée ! 🎉</h3>
                  <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                    Votre territoire est configuré avec {selectedDepartments.length} département{selectedDepartments.length > 1 ? 's' : ''}.
                    Voulez-vous un tour guidé de l'interface ?
                  </p>
                </div>

                {entrepriseCount > 0 && (
                  <Badge variant="outline" className="px-4 py-2 text-base bg-accent/10 border-accent/30 text-accent">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {entrepriseCount.toLocaleString('fr-FR')} prospects disponibles
                  </Badge>
                )}

                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleSkipTour}
                    className="border-accent/50"
                  >
                    Commencer à prospecter
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleStartTour}
                    className="gap-2 bg-accent hover:bg-accent/90"
                  >
                    <Sparkles className="h-5 w-5" />
                    Tour guidé (2 min)
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Navigation */}
        {(currentStep === 'territory' || currentStep === 'sectors') && (
          <div className="p-4 border-t border-accent/20 bg-card/50 shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {currentStep === 'territory' && (
                  <span>{selectedDepartments.length} département{selectedDepartments.length > 1 ? 's' : ''} sélectionné{selectedDepartments.length > 1 ? 's' : ''}</span>
                )}
                {currentStep === 'sectors' && selectedCategories.length > 0 && (
                  <span>{selectedCategories.length} secteur{selectedCategories.length > 1 ? 's' : ''} sélectionné{selectedCategories.length > 1 ? 's' : ''}</span>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep === 'sectors' ? 'territory' : 'welcome')}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </Button>
                <Button
                  onClick={currentStep === 'territory' ? handleTerritoryNext : handleSectorsNext}
                  className="gap-2 bg-accent hover:bg-accent/90"
                  disabled={currentStep === 'territory' && selectedDepartments.length === 0}
                >
                  {currentStep === 'sectors' ? 'Terminer' : 'Suivant'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
