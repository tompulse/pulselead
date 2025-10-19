import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Building2, ArrowRight, ArrowLeft, Sparkles, Lightbulb, ChevronDown } from "lucide-react";
import { ACTIVITY_CATEGORIES } from "@/utils/activityCategories";
import { REGIONS_DATA, DEPARTMENT_NAMES } from "@/utils/regionsData";

interface FilterOnboardingProps {
  onComplete: (filters: {
    categories: string[];
    departments: string[];
  }) => void;
}

export function FilterOnboarding({ onComplete }: FilterOnboardingProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [expandedRegions, setExpandedRegions] = useState<string[]>([]);

  const handleCategoryToggle = (categoryKey: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryKey)
        ? prev.filter(c => c !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  const handleRegionToggle = (regionKey: string) => {
    const regionDepts = REGIONS_DATA[regionKey].departments;
    
    if (selectedRegions.includes(regionKey)) {
      // Déselectionner la région
      setSelectedRegions(prev => prev.filter(r => r !== regionKey));
      setSelectedDepartments(prev => prev.filter(d => !regionDepts.includes(d)));
    } else {
      // Sélectionner la région
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
      // Déselectionner le département
      setSelectedDepartments(prev => prev.filter(d => d !== deptCode));
      // Déselectionner la région si c'était le dernier département
      const remainingDepts = selectedDepartments.filter(d => d !== deptCode && regionDepts.includes(d));
      if (remainingDepts.length === 0) {
        setSelectedRegions(prev => prev.filter(r => r !== regionKey));
      }
    } else {
      // Sélectionner le département
      setSelectedDepartments(prev => [...prev, deptCode]);
      // Vérifier si tous les départements de la région sont sélectionnés
      const allSelected = regionDepts.every(d => 
        d === deptCode || selectedDepartments.includes(d)
      );
      if (allSelected && !selectedRegions.includes(regionKey)) {
        setSelectedRegions(prev => [...prev, regionKey]);
      }
    }
  };

  const toggleRegionExpansion = (regionKey: string) => {
    setExpandedRegions(prev => 
      prev.includes(regionKey) 
        ? prev.filter(r => r !== regionKey)
        : [...prev, regionKey]
    );
  };

  const handleFinish = () => {
    const filters = {
      categories: selectedCategories,
      departments: selectedDepartments,
    };
    
    // Sauvegarder dans localStorage
    localStorage.setItem('luma_onboarding_complete', 'true');
    localStorage.setItem('luma_initial_filters', JSON.stringify(filters));
    
    onComplete(filters);
  };

  const canProceed = step === 1 
    ? selectedDepartments.length > 0  // Géographie obligatoire
    : true; // Activité optionnelle

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl glass-card border-accent/20 overflow-hidden">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-accent/20 via-accent/10 to-transparent p-8 border-b border-accent/20">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="relative flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/30 blur-xl animate-pulse" />
              <Lightbulb className="w-12 h-12 text-accent relative" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Bienvenue sur LUMA</h1>
              <p className="text-muted-foreground mt-1">
                Configurons votre expérience en quelques étapes
              </p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="relative flex items-center gap-2 mt-6">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-accent' : 'bg-accent/20'} transition-all`} />
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-accent' : 'bg-accent/20'} transition-all`} />
          </div>
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span className={step === 1 ? 'text-accent font-medium' : ''}>Zone géographique</span>
            <span className={step === 2 ? 'text-accent font-medium' : ''}>Secteurs d'activité</span>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="h-[60vh]">
          <div className="p-8">
            {step === 1 ? (
              <div className="space-y-6">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <MapPin className="w-6 h-6 text-accent shrink-0 mt-1" />
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Dans quelles régions ? <span className="text-destructive">*</span></h2>
                    <p className="text-muted-foreground">
                      Sélectionnez les régions où vous souhaitez trouver des entreprises. Cette étape est obligatoire.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {Object.entries(REGIONS_DATA).map(([regionKey, regionData]) => {
                    const isSelected = selectedRegions.includes(regionKey);
                    const isExpanded = expandedRegions.includes(regionKey);
                    const selectedDeptCount = regionData.departments.filter(d => 
                      selectedDepartments.includes(d)
                    ).length;
                    
                    return (
                      <div
                        key={regionKey}
                        className="rounded-lg border-2 transition-all"
                        style={{
                          borderColor: isSelected 
                            ? 'hsl(var(--accent))' 
                            : 'hsl(var(--accent) / 0.2)',
                          backgroundColor: isSelected 
                            ? 'hsl(var(--accent) / 0.05)' 
                            : 'transparent'
                        }}
                      >
                        <div className="flex items-center gap-3 p-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleRegionToggle(regionKey)}
                            className="border-accent/50 shrink-0"
                          />
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => toggleRegionExpansion(regionKey)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{regionKey}</span>
                              <ChevronDown 
                                className={`w-4 h-4 text-accent transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              />
                            </div>
                            {selectedDeptCount > 0 && (
                              <span className="text-sm text-muted-foreground">
                                {selectedDeptCount} département{selectedDeptCount > 1 ? 's' : ''} sélectionné{selectedDeptCount > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-3 gap-2 border-t border-accent/20 pt-3">
                            {regionData.departments.map((deptCode) => (
                              <label
                                key={deptCode}
                                className="flex items-center gap-2 p-2 rounded hover:bg-accent/5 cursor-pointer"
                              >
                                <Checkbox
                                  checked={selectedDepartments.includes(deptCode)}
                                  onCheckedChange={() => handleDepartmentToggle(deptCode, regionKey)}
                                  className="border-accent/50 h-4 w-4"
                                />
                                <span className="text-sm font-medium">
                                  {deptCode} - {DEPARTMENT_NAMES[deptCode]}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <Building2 className="w-6 h-6 text-accent shrink-0 mt-1" />
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Quels secteurs vous intéressent ? <span className="text-muted-foreground text-sm">(optionnel)</span></h2>
                    <p className="text-muted-foreground">
                      Sélectionnez un ou plusieurs secteurs d'activité pour affiner votre recherche.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Option "Tous les secteurs" */}
                  <button
                    onClick={handleFinish}
                    className="flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-accent/5 hover:border-accent/40 bg-accent/10 border-accent"
                  >
                    <Sparkles className="w-5 h-5 text-accent shrink-0" />
                    <span className="font-medium text-left">✨ Tous les secteurs m'intéressent</span>
                  </button>

                  {/* Secteurs spécifiques */}
                  {Object.entries(ACTIVITY_CATEGORIES).map(([key, category]) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-accent/5 hover:border-accent/40"
                      style={{
                        borderColor: selectedCategories.includes(key) 
                          ? 'hsl(var(--accent))' 
                          : 'hsl(var(--accent) / 0.2)',
                        backgroundColor: selectedCategories.includes(key) 
                          ? 'hsl(var(--accent) / 0.1)' 
                          : 'transparent'
                      }}
                    >
                      <Checkbox
                        checked={selectedCategories.includes(key)}
                        onCheckedChange={() => handleCategoryToggle(key)}
                        className="border-accent/50"
                      />
                      <span className="font-medium">{category.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-6 border-t border-accent/20 bg-accent/5 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {step === 1 ? (
              <span>
                {selectedDepartments.length} département{selectedDepartments.length > 1 ? 's' : ''} sélectionné{selectedDepartments.length > 1 ? 's' : ''}
              </span>
            ) : (
              <span>
                {selectedCategories.length > 0 ? (
                  `${selectedCategories.length} secteur${selectedCategories.length > 1 ? 's' : ''} sélectionné${selectedCategories.length > 1 ? 's' : ''}`
                ) : (
                  'Aucun secteur sélectionné (optionnel)'
                )}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {step === 2 && (
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="border-accent/50 hover:bg-accent/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            )}
            
            <Button
              onClick={() => {
                if (step === 1) {
                  setStep(2);
                } else {
                  handleFinish();
                }
              }}
              disabled={!canProceed}
              className="bg-accent hover:bg-accent/90 text-primary"
            >
              {step === 1 ? (
                <>
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : selectedCategories.length > 0 ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Découvrir les entreprises
                </>
              ) : null}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
