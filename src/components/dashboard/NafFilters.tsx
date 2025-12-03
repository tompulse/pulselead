import { useState } from "react";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building2, ChevronDown, ChevronRight, Route, Calendar as CalendarIcon, Users, Scale, MapPin } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useAvailableNouveauxSitesFilters } from "@/hooks/useAvailableNouveauxSitesFilters";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { NAF_SECTIONS } from "@/utils/nafNomenclature";
import { REGIONS, getDepartmentInfo } from "@/utils/departmentsRegions";
import { LEGAL_FORM_CATEGORIES, getLegalFormLabel } from "@/utils/legalFormCategories";
import { COMPANY_SIZES } from "@/utils/companySizes";

interface NafFiltersProps {
  filters: {
    searchQuery?: string;
    codesNaf?: string[];
    departments?: string[];
    categories?: string[];
    formesJuridiques?: string[];
    taillesEntreprise?: string[];
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  resultsCount?: number;
  totalCount?: number;
  tourneeActive?: boolean;
  onToggleTournee?: () => void;
  tourneeName?: string;
  setTourneeName?: (name: string) => void;
  tourneeDate?: string;
  setTourneeDate?: (date: string) => void;
  selectedCount?: number;
  onOptimize?: () => void;
  isOptimizing?: boolean;
}

export const NafFilters = ({ 
  filters, 
  setFilters,
  resultsCount = 0,
  totalCount = 0,
  tourneeActive,
  onToggleTournee,
  tourneeName,
  setTourneeName,
  tourneeDate,
  setTourneeDate,
  selectedCount = 0,
  onOptimize,
  isOptimizing = false
}: NafFiltersProps) => {
  const [nafSectionsOpen, setNafSectionsOpen] = useState(false);
  const [departmentsOpen, setDepartmentsOpen] = useState(false);
  const [formesJuridiquesOpen, setFormesJuridiquesOpen] = useState(false);
  const [taillesEntrepriseOpen, setTaillesEntrepriseOpen] = useState(false);
  
  // Track expanded sections/regions
  const [expandedNafSections, setExpandedNafSections] = useState<string[]>([]);
  const [expandedRegions, setExpandedRegions] = useState<string[]>([]);
  const [expandedLegalCategories, setExpandedLegalCategories] = useState<string[]>([]);
  
  const { isAdmin } = useAdminStatus();
  const { data: availableFilters, isLoading } = useAvailableNouveauxSitesFilters({
    categories: filters.categories,
    departments: filters.departments,
    codesNaf: filters.codesNaf,
    searchQuery: filters.searchQuery
  });

  // Compute NAF counts by section
  const nafCountsBySection = NAF_SECTIONS.map(section => {
    const divisionCounts = section.divisions.map(div => ({
      code: div.code,
      label: div.label,
      count: availableFilters?.nafCodes[div.code] || 0
    })).filter(d => d.count > 0);
    
    const totalCount = divisionCounts.reduce((sum, d) => sum + d.count, 0);
    
    return {
      ...section,
      totalCount,
      divisions: divisionCounts
    };
  }).filter(s => s.totalCount > 0);

  // Compute department counts by region
  const departmentsByRegion = REGIONS.map(region => {
    const deptCounts = region.departments.map(dept => ({
      code: dept.code,
      label: dept.label,
      count: availableFilters?.departments[dept.code] || 0
    })).filter(d => d.count > 0);
    
    const totalCount = deptCounts.reduce((sum, d) => sum + d.count, 0);
    
    return {
      ...region,
      totalCount,
      departments: deptCounts
    };
  }).filter(r => r.totalCount > 0);

  // Compute legal form counts by category
  const legalFormsByCategory = LEGAL_FORM_CATEGORIES.map(category => {
    const formCounts = category.forms.map(form => ({
      code: form.code,
      label: form.shortLabel || form.label,
      fullLabel: form.label,
      count: availableFilters?.formesJuridiques?.[form.code] || 0
    })).filter(f => f.count > 0);
    
    const totalCount = formCounts.reduce((sum, f) => sum + f.count, 0);
    
    return {
      ...category,
      totalCount,
      forms: formCounts
    };
  }).filter(c => c.totalCount > 0);

  const handleNafDivisionToggle = (divisionCode: string) => {
    setFilters((prev: any) => {
      const current = prev.codesNaf || [];
      const isSelected = current.includes(divisionCode);
      
      return {
        ...prev,
        codesNaf: isSelected
          ? current.filter((c: string) => c !== divisionCode)
          : [...current, divisionCode]
      };
    });
  };

  const handleDepartmentToggle = (dept: string) => {
    setFilters((prev: any) => {
      const current = prev.departments || [];
      const isSelected = current.includes(dept);
      
      return {
        ...prev,
        departments: isSelected
          ? current.filter((d: string) => d !== dept)
          : [...current, dept]
      };
    });
  };

  const handleFormeJuridiqueToggle = (code: string) => {
    setFilters((prev: any) => {
      const current = prev.formesJuridiques || [];
      const isSelected = current.includes(code);
      
      return {
        ...prev,
        formesJuridiques: isSelected
          ? current.filter((f: string) => f !== code)
          : [...current, code]
      };
    });
  };

  const handleTailleEntrepriseToggle = (taille: string) => {
    setFilters((prev: any) => {
      const current = prev.taillesEntreprise || [];
      const isSelected = current.includes(taille);
      
      return {
        ...prev,
        taillesEntreprise: isSelected
          ? current.filter((t: string) => t !== taille)
          : [...current, taille]
      };
    });
  };

  const toggleNafSection = (sectionCode: string) => {
    setExpandedNafSections(prev => 
      prev.includes(sectionCode) 
        ? prev.filter(c => c !== sectionCode)
        : [...prev, sectionCode]
    );
  };

  const toggleRegion = (regionCode: string) => {
    setExpandedRegions(prev => 
      prev.includes(regionCode) 
        ? prev.filter(c => c !== regionCode)
        : [...prev, regionCode]
    );
  };

  const toggleLegalCategory = (categoryCode: string) => {
    setExpandedLegalCategories(prev => 
      prev.includes(categoryCode) 
        ? prev.filter(c => c !== categoryCode)
        : [...prev, categoryCode]
    );
  };

  const clearFilters = () => setFilters((prev: any) => ({ 
    ...prev, 
    categories: [], 
    departments: [],
    codesNaf: [],
    formesJuridiques: [],
    taillesEntreprise: [],
    searchQuery: ""
  }));

  const activeFiltersCount = 
    (filters.categories?.length || 0) + 
    (filters.departments?.length || 0) +
    (filters.codesNaf?.length || 0) +
    (filters.formesJuridiques?.length || 0) +
    (filters.taillesEntreprise?.length || 0);

  return (
    <div className="space-y-0">
      {/* Panneau de création de tournée */}
      {onToggleTournee && (
        <div className="p-4 border-b border-accent/20">
          <Button
            onClick={onToggleTournee}
            variant={tourneeActive ? "default" : "outline"}
            className={`w-full ${
              tourneeActive 
                ? "bg-gradient-to-r from-accent to-accent/80 hover:shadow-md hover:shadow-accent/30 text-primary" 
                : "border-accent/30 hover:bg-accent/10 hover:border-accent/50"
            } transition-all h-9`}
            size="sm"
          >
            <Route className="w-4 h-4 mr-2" />
            {tourneeActive ? "Mode tournée actif" : "Créer une tournée"}
          </Button>
          
          {tourneeActive && setTourneeName && setTourneeDate && onOptimize && (
            <div className="space-y-3 p-3 mt-3 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent rounded-lg border border-accent/30 shadow-sm">
              <div className="space-y-2">
                <Label htmlFor="tournee-name" className="text-xs font-semibold text-accent">Nom de la tournée</Label>
                <Input
                  id="tournee-name"
                  placeholder="Ex: Tournée Sud"
                  value={tourneeName}
                  onChange={(e) => setTourneeName(e.target.value)}
                  className="h-9 text-sm border-accent/30 focus:border-accent focus:ring-accent/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tournee-date" className="text-xs font-semibold text-accent">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-9 text-sm justify-start text-left font-normal border-accent/30 hover:bg-accent/10 hover:border-accent/50"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tourneeDate ? format(new Date(tourneeDate), "dd/MM/yyyy") : "Choisir une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tourneeDate ? new Date(tourneeDate) : undefined}
                      onSelect={(date) => setTourneeDate(date ? format(date, "yyyy-MM-dd") : "")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {selectedCount > 0 && (
                <div className="text-xs bg-accent/10 text-accent font-semibold rounded-lg px-3 py-2 border border-accent/20">
                  {selectedCount} site(s) sélectionné(s)
                </div>
              )}
              <Button
                onClick={onOptimize}
                disabled={selectedCount < 2 || isOptimizing}
                className="w-full h-9 text-xs bg-gradient-to-r from-accent via-accent to-accent/80 transition-colors disabled:opacity-50"
                size="sm"
              >
                <Route className="w-3.5 h-3.5 mr-2" />
                {isOptimizing ? "Optimisation..." : "Optimiser la tournée"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Barre de recherche */}
      <div className="p-4 border-b border-accent/20 space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher..."
            value={filters.searchQuery || ""}
            onChange={(e) => setFilters((prev: any) => ({ ...prev, searchQuery: e.target.value }))}
            className="pl-8 h-8 text-xs bg-background/50 border-accent/20 focus:border-accent/40"
          />
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="w-4 h-4 text-accent" />
            <span className="font-medium text-foreground">{resultsCount.toLocaleString('fr-FR')}</span>
            <span>/ {totalCount.toLocaleString('fr-FR')} site{totalCount > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Secteurs d'activité NAF */}
      <Collapsible open={nafSectionsOpen} onOpenChange={setNafSectionsOpen} className="border-b border-accent/20">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
          <span className="font-medium text-sm">Secteurs d'activité (NAF)</span>
          <ChevronDown className={`h-4 w-4 text-accent transition-transform ${nafSectionsOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <ScrollArea className="h-[400px]">
            <div className="px-4 pb-4 space-y-1">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))
              ) : nafCountsBySection.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Aucun secteur disponible
                </div>
              ) : (
                nafCountsBySection.map((section) => {
                  const isExpanded = expandedNafSections.includes(section.code);
                  const selectedDivisions = section.divisions.filter(d => 
                    filters.codesNaf?.includes(d.code)
                  );
                  
                  return (
                    <div key={section.code} className="border border-accent/10 rounded-lg overflow-hidden">
                      <div
                        onClick={() => toggleNafSection(section.code)}
                        className="flex items-center gap-2 cursor-pointer hover:bg-accent/5 p-2.5 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-accent" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-accent" />
                        )}
                        <span className="text-lg">{section.emoji}</span>
                        <span className="text-sm font-medium flex-1 break-words leading-tight">{section.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {section.totalCount.toLocaleString('fr-FR')}
                        </span>
                        {selectedDivisions.length > 0 && (
                          <span className="text-xs bg-accent text-white px-1.5 py-0.5 rounded">
                            {selectedDivisions.length}
                          </span>
                        )}
                      </div>
                      
                      {isExpanded && (
                        <div className="bg-accent/5 px-2 pb-2 space-y-0.5">
                          {section.divisions.map((div) => {
                            const selected = filters.codesNaf?.includes(div.code);
                            return (
                              <div
                                key={div.code}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNafDivisionToggle(div.code);
                                }}
                                className="flex items-center gap-2 cursor-pointer hover:bg-accent/10 p-2 rounded transition-colors ml-4"
                              >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                                  selected ? 'bg-accent border-accent' : 'border-accent/30'
                                }`}>
                                  {selected && <div className="w-2 h-2 bg-white rounded-sm" />}
                                </div>
                                <span className="text-xs text-muted-foreground">{div.code}</span>
                                <span className="text-xs flex-1 break-words leading-tight">{div.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  {div.count.toLocaleString('fr-FR')}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      {/* Départements par région */}
      <Collapsible open={departmentsOpen} onOpenChange={setDepartmentsOpen} className="border-b border-accent/20">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
          <span className="font-medium text-sm">Départements</span>
          <ChevronDown className={`h-4 w-4 text-accent transition-transform ${departmentsOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <ScrollArea className="h-[400px]">
            <div className="px-4 pb-4 space-y-1">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))
              ) : departmentsByRegion.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Aucun département disponible
                </div>
              ) : (
                departmentsByRegion.map((region) => {
                  const isExpanded = expandedRegions.includes(region.code);
                  const selectedDepts = region.departments.filter(d => 
                    filters.departments?.includes(d.code)
                  );
                  
                  return (
                    <div key={region.code} className="border border-accent/10 rounded-lg overflow-hidden">
                      <div
                        onClick={() => toggleRegion(region.code)}
                        className="flex items-center gap-2 cursor-pointer hover:bg-accent/5 p-2.5 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-accent" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-accent" />
                        )}
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium flex-1">{region.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {region.totalCount.toLocaleString('fr-FR')}
                        </span>
                        {selectedDepts.length > 0 && (
                          <span className="text-xs bg-accent text-white px-1.5 py-0.5 rounded">
                            {selectedDepts.length}
                          </span>
                        )}
                      </div>
                      
                      {isExpanded && (
                        <div className="bg-accent/5 px-2 pb-2 space-y-0.5">
                          {region.departments.map((dept) => {
                            const selected = filters.departments?.includes(dept.code);
                            return (
                              <div
                                key={dept.code}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDepartmentToggle(dept.code);
                                }}
                                className="flex items-center gap-2 cursor-pointer hover:bg-accent/10 p-2 rounded transition-colors ml-4"
                              >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                                  selected ? 'bg-accent border-accent' : 'border-accent/30'
                                }`}>
                                  {selected && <div className="w-2 h-2 bg-white rounded-sm" />}
                                </div>
                                <span className="text-xs font-mono text-muted-foreground">{dept.code}</span>
                                <span className="text-xs flex-1">{dept.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  {dept.count.toLocaleString('fr-FR')}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      {/* Formes juridiques par catégorie */}
      <Collapsible open={formesJuridiquesOpen} onOpenChange={setFormesJuridiquesOpen} className="border-b border-accent/20">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
          <span className="font-medium text-sm">Formes juridiques</span>
          <ChevronDown className={`h-4 w-4 text-accent transition-transform ${formesJuridiquesOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <ScrollArea className="h-[400px]">
            <div className="px-4 pb-4 space-y-1">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))
              ) : legalFormsByCategory.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Aucune forme juridique disponible
                </div>
              ) : (
                legalFormsByCategory.map((category) => {
                  const isExpanded = expandedLegalCategories.includes(category.code);
                  const selectedForms = category.forms.filter(f => 
                    filters.formesJuridiques?.includes(f.code)
                  );
                  
                  return (
                    <div key={category.code} className="border border-accent/10 rounded-lg overflow-hidden">
                      <div
                        onClick={() => toggleLegalCategory(category.code)}
                        className="flex items-center gap-2 cursor-pointer hover:bg-accent/5 p-2.5 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-accent" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-accent" />
                        )}
                        <span className="text-lg">{category.emoji}</span>
                        <span className="text-sm font-medium flex-1 truncate">{category.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {category.totalCount.toLocaleString('fr-FR')}
                        </span>
                        {selectedForms.length > 0 && (
                          <span className="text-xs bg-accent text-white px-1.5 py-0.5 rounded">
                            {selectedForms.length}
                          </span>
                        )}
                      </div>
                      
                      {isExpanded && (
                        <div className="bg-accent/5 px-2 pb-2 space-y-0.5">
                          {category.forms.map((form) => {
                            const selected = filters.formesJuridiques?.includes(form.code);
                            return (
                              <div
                                key={form.code}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFormeJuridiqueToggle(form.code);
                                }}
                                className="flex items-center gap-2 cursor-pointer hover:bg-accent/10 p-2 rounded transition-colors ml-4"
                              >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                                  selected ? 'bg-accent border-accent' : 'border-accent/30'
                                }`}>
                                  {selected && <div className="w-2 h-2 bg-white rounded-sm" />}
                                </div>
                                <span className="text-xs font-semibold text-accent">{form.label}</span>
                                <span className="text-xs flex-1 truncate text-muted-foreground" title={form.fullLabel}>
                                  {form.fullLabel !== form.label ? form.fullLabel : ''}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {form.count.toLocaleString('fr-FR')}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      {/* Taille d'entreprise */}
      <Collapsible open={taillesEntrepriseOpen} onOpenChange={setTaillesEntrepriseOpen} className="border-b border-accent/20">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
          <span className="font-medium text-sm">Taille d'entreprise</span>
          <ChevronDown className={`h-4 w-4 text-accent transition-transform ${taillesEntrepriseOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-1">
            {COMPANY_SIZES.map((size) => {
              const selected = filters.taillesEntreprise?.includes(size.code);
              return (
                <div
                  key={size.code}
                  onClick={() => handleTailleEntrepriseToggle(size.code)}
                  className="flex items-center gap-3 cursor-pointer hover:bg-accent/10 p-2.5 rounded transition-colors active:scale-[0.98]"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                    selected ? 'bg-accent border-accent' : 'border-accent/30'
                  }`}>
                    {selected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                  </div>
                  <span className="text-lg">{size.emoji}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{size.label}</div>
                    <div className="text-xs text-muted-foreground">{size.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Footer with reset button */}
      <div className="p-4 border-t border-accent/20">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearFilters}
          disabled={activeFiltersCount === 0}
          className="w-full border-accent/30 hover:bg-accent/10"
        >
          Réinitialiser les filtres
        </Button>
      </div>
    </div>
  );
};
