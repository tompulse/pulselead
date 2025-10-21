import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Building2, ArrowRight, ArrowLeft, Sparkles, Lightbulb, ChevronDown, TrendingUp } from "lucide-react";
import { ACTIVITY_CATEGORIES, categorizeActivity } from "@/utils/activityCategories";
import { REGIONS_DATA, DEPARTMENT_NAMES } from "@/utils/regionsData";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useSmartSuggestions } from "@/hooks/useSmartSuggestions";

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
  const [entrepriseCount, setEntrepriseCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState(false);
  const { suggestions, loading: suggestionsLoading } = useSmartSuggestions();

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

  // Compter les entreprises en fonction des critères
  useEffect(() => {
    const fetchCount = async () => {
      if (selectedDepartments.length === 0) {
        setEntrepriseCount(0);
        return;
      }

      setLoadingCount(true);
      try {
        let query = supabase
          .from('entreprises')
          .select('*', { count: 'exact', head: false })
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        // Aligner avec le dashboard: inclure dates nulles ou démarrées après 2025-09-01
        query = query.or(`date_demarrage.is.null,and(date_demarrage.gte.2025-09-01,date_demarrage.lte.2100-12-31)`);

        // Le filtrage par départements est fait côté client pour permettre une logique cohérente (et gérer la Corse)
        // Ancien filtre SQL supprimé pour éviter les conflits avec le filtre de date.

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching count:', error);
          setEntrepriseCount(0);
          return;
        }

        let filteredData = data || [];

        // Filtre par départements (client-side, gère la Corse)
        if (selectedDepartments.length > 0) {
          filteredData = filteredData.filter((entreprise: any) => {
            const cp = entreprise.code_postal as string | null;
            if (!cp) return false;
            const normalized = cp.length === 4 ? '0' + cp : cp;
            if (normalized.startsWith('20')) {
              // Corse: impossible de distinguer 2A vs 2B via le code postal => on inclut si l'un des deux est sélectionné
              return selectedDepartments.includes('2A') || selectedDepartments.includes('2B');
            }
            const dept = normalized.substring(0, 2);
            return selectedDepartments.includes(dept);
          });
        }

        // Filtre par catégories si sélectionnées
        if (selectedCategories.length > 0) {
          filteredData = filteredData.filter((entreprise: any) => {
            const category = categorizeActivity(entreprise.activite);
            return selectedCategories.includes(category);
          });
        }

        setEntrepriseCount(filteredData.length);
      } catch (error) {
        console.error('Error:', error);
        setEntrepriseCount(0);
      } finally {
        setLoadingCount(false);
      }
    };

    fetchCount();
  }, [selectedDepartments, selectedCategories]);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl glass-card border-accent/30 overflow-hidden max-h-[95vh] flex flex-col shadow-2xl shadow-accent/20">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-accent/30 via-accent/15 to-transparent p-3 md:p-4 border-b border-accent/30 shrink-0">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="relative flex items-center gap-2 md:gap-3 mb-2">
            <div className="relative">
              <div className="p-2 bg-gradient-to-br from-accent/30 to-accent/10 rounded-xl shadow-lg">
                <Lightbulb className="w-6 h-6 md:w-8 md:h-8 text-accent relative" />
              </div>
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold gradient-text">Bienvenue sur LUMA</h1>
              <p className="text-muted-foreground text-xs md:text-sm font-medium">
                Configurons votre expérience en quelques étapes
              </p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="relative flex items-center gap-2 mt-2 md:mt-3">
            <div className={`flex-1 h-2 rounded-full transition-all duration-500 shadow-sm ${step >= 1 ? 'bg-gradient-to-r from-accent to-accent/80 shadow-accent/30' : 'bg-accent/20'}`} />
            <div className={`flex-1 h-2 rounded-full transition-all duration-500 shadow-sm ${step >= 2 ? 'bg-gradient-to-r from-accent to-accent/80 shadow-accent/30' : 'bg-accent/20'}`} />
          </div>
          <div className="flex justify-between mt-1.5 text-xs font-medium">
            <span className={step === 1 ? 'text-accent font-bold' : 'text-muted-foreground'}>Zone géographique</span>
            <span className={step === 2 ? 'text-accent font-bold' : 'text-muted-foreground'}>Secteurs d'activité</span>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-3 md:p-5">
            {step === 1 ? (
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-lg bg-gradient-to-br from-accent/15 via-accent/10 to-accent/5 border border-accent/30 shadow-lg shadow-accent/5">
                  <div className="p-1.5 bg-gradient-to-br from-accent/30 to-accent/10 rounded-lg shadow-sm">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 text-accent shrink-0" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold gradient-text">Dans quelles régions ? <span className="text-destructive">*</span></h2>
                    <p className="text-muted-foreground text-xs md:text-sm font-medium">
                      Sélectionnez les régions où vous souhaitez trouver des entreprises.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.entries(REGIONS_DATA).map(([regionKey, regionData]) => {
                    const isSelected = selectedRegions.includes(regionKey);
                    const isExpanded = expandedRegions.includes(regionKey);
                    const selectedDeptCount = regionData.departments.filter(d => 
                      selectedDepartments.includes(d)
                    ).length;
                    
                    return (
                      <div
                        key={regionKey}
                        className="rounded-xl border-2 transition-all hover:shadow-lg hover:shadow-accent/10"
                        style={{
                          borderColor: isSelected 
                            ? 'hsl(var(--accent))' 
                            : 'hsl(var(--accent) / 0.2)',
                          backgroundColor: isSelected 
                            ? 'hsl(var(--accent) / 0.08)' 
                            : 'transparent'
                        }}
                      >
                        <div className="flex items-center gap-3 md:gap-4 p-4 md:p-5">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleRegionToggle(regionKey)}
                            className="border-accent/50 shrink-0 data-[state=checked]:bg-accent data-[state=checked]:border-accent data-[state=checked]:text-primary h-6 w-6"
                          />
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => toggleRegionExpansion(regionKey)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-base md:text-lg">{regionKey}</span>
                              <ChevronDown 
                                className={`w-5 h-5 text-accent transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              />
                            </div>
                            {selectedDeptCount > 0 && (
                              <span className="text-sm text-accent font-medium mt-1 inline-block">
                                {selectedDeptCount} département{selectedDeptCount > 1 ? 's' : ''} sélectionné{selectedDeptCount > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="px-4 md:px-5 pb-4 md:pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border-t border-accent/20 pt-4 bg-accent/5">
                            {regionData.departments.map((deptCode) => (
                              <label
                                key={deptCode}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 cursor-pointer transition-all border border-transparent hover:border-accent/30"
                              >
                                <Checkbox
                                  checked={selectedDepartments.includes(deptCode)}
                                  onCheckedChange={() => handleDepartmentToggle(deptCode, regionKey)}
                                  className="border-accent/50 h-5 w-5 data-[state=checked]:bg-accent data-[state=checked]:border-accent data-[state=checked]:text-primary"
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
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-lg bg-gradient-to-br from-accent/15 via-accent/10 to-accent/5 border border-accent/30 shadow-lg shadow-accent/5">
                  <div className="p-1.5 bg-gradient-to-br from-accent/30 to-accent/10 rounded-lg shadow-sm">
                    <Building2 className="w-4 h-4 md:w-5 md:h-5 text-accent shrink-0" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold gradient-text">Quels secteurs vous intéressent ? <span className="text-muted-foreground text-xs font-medium">(optionnel)</span></h2>
                    <p className="text-muted-foreground text-xs md:text-sm font-medium">
                      Sélectionnez un ou plusieurs secteurs d'activité pour affiner votre recherche.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {/* Option "Tous les secteurs" */}
                  <button
                    onClick={handleFinish}
                    className="flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg hover:shadow-accent/20 bg-gradient-to-br from-accent/15 to-accent/10 border-accent"
                  >
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-accent shrink-0" />
                    <span className="font-semibold text-left text-base md:text-lg">✨ Tous les secteurs m'intéressent</span>
                  </button>

                  {/* Secteurs spécifiques */}
                  {Object.entries(ACTIVITY_CATEGORIES).map(([key, category]) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg hover:shadow-accent/10"
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
                        className="border-accent/50 data-[state=checked]:bg-accent data-[state=checked]:border-accent data-[state=checked]:text-primary h-5 w-5 md:h-6 md:w-6"
                      />
                      <span className="font-semibold text-base md:text-lg">{category.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 md:p-4 border-t border-accent/30 bg-gradient-to-br from-accent/15 via-accent/10 to-accent/5 shrink-0">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 md:mb-3 gap-2">
            <div className="text-xs font-semibold text-muted-foreground">
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
            
            {/* Compteur d'entreprises */}
            {selectedDepartments.length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent/30 to-accent/20 border border-accent/40 shadow-lg shadow-accent/20">
                <TrendingUp className="w-3.5 h-3.5 text-accent" />
                <span className="font-bold text-accent text-xs md:text-sm">
                  {loadingCount ? (
                    <span className="animate-pulse">Calcul...</span>
                  ) : (
                    `${entrepriseCount.toLocaleString('fr-FR')} entreprise${entrepriseCount > 1 ? 's' : ''}`
                  )}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
            {step === 2 && (
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="border-accent/50 hover:bg-accent/10 hover:border-accent text-sm h-10 font-bold rounded-full"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
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
              className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-primary flex-1 text-sm h-10 font-bold rounded-full shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 1 ? (
                <>
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              ) : selectedCategories.length > 0 ? (
                <>
                  <Sparkles className="w-4 h-4 mr-1.5" />
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
