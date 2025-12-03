import { useState } from "react";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building2, ChevronDown, ChevronRight, Route, Calendar as CalendarIcon, Scale } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useAvailableNouveauxSitesFilters } from "@/hooks/useAvailableNouveauxSitesFilters";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { NAF_SECTIONS, NAF_DIVISIONS } from "@/utils/nafOfficiel";
import { FORMES_JURIDIQUES } from "@/utils/formesJuridiques";
import { Skeleton } from "@/components/ui/skeleton";

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

// Mapping des sections vers les catégories en base
const SECTION_TO_CATEGORY: Record<string, string> = {
  "A": "A - Agriculture, sylviculture et pêche",
  "B": "B - Industries extractives",
  "C": "C - Industrie manufacturière",
  "D": "D - Production électricité, gaz, vapeur",
  "E": "E - Eau, déchets, dépollution",
  "F": "F - Construction",
  "G": "G - Commerce, réparation auto/moto",
  "H": "H - Transports et entreposage",
  "I": "I - Hébergement et restauration",
  "J": "J - Information et communication",
  "K": "K - Activités financières et assurance",
  "L": "L - Activités immobilières",
  "M": "M - Activités scientifiques et techniques",
  "N": "N - Services administratifs et soutien",
  "O": "O - Administration publique",
  "P": "P - Enseignement",
  "Q": "Q - Santé humaine et action sociale",
  "R": "R - Arts, spectacles, loisirs",
  "S": "S - Autres activités de services",
  "T": "T - Activités des ménages employeurs",
  "U": "U - Activités extra-territoriales"
};

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
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [divisionsOpen, setDivisionsOpen] = useState(false);
  const [departmentsOpen, setDepartmentsOpen] = useState(false);
  const [formesJuridiquesOpen, setFormesJuridiquesOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  
  const { isAdmin } = useAdminStatus();
  const { data: availableFilters, isLoading } = useAvailableNouveauxSitesFilters({
    categories: filters.categories,
    departments: filters.departments,
    codesNaf: filters.codesNaf,
    searchQuery: filters.searchQuery
  });

  // Calculer les compteurs par section NAF
  const sectionCounts: Record<string, number> = {};
  NAF_SECTIONS.forEach(section => {
    const categoryKey = SECTION_TO_CATEGORY[section.code];
    sectionCounts[section.code] = availableFilters?.categories[categoryKey] || 0;
  });

  // Calculer les compteurs par division NAF
  const divisionCounts = availableFilters?.nafCodes || {};

  const availableDepartments = Object.entries(availableFilters?.departments || {})
    .map(([dept, count]) => ({ dept, count: count as number }))
    .filter(d => d.count > 0)
    .sort((a, b) => {
      const numA = parseInt(a.dept);
      const numB = parseInt(b.dept);
      return numA - numB;
    });

  const handleSectionToggle = (sectionCode: string) => {
    const categoryKey = SECTION_TO_CATEGORY[sectionCode];
    setFilters((prev: any) => {
      const current = prev.categories || [];
      const isSelected = current.includes(categoryKey);
      
      return {
        ...prev,
        categories: isSelected
          ? current.filter((c: string) => c !== categoryKey)
          : [...current, categoryKey]
      };
    });
  };

  const handleDivisionToggle = (divisionCode: string) => {
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

  const handleFormeJuridiqueToggle = (forme: string) => {
    setFilters((prev: any) => {
      const current = prev.formesJuridiques || [];
      const isSelected = current.includes(forme);
      
      return {
        ...prev,
        formesJuridiques: isSelected
          ? current.filter((f: string) => f !== forme)
          : [...current, forme]
      };
    });
  };

  const toggleSectionExpand = (sectionCode: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionCode) 
        ? prev.filter(s => s !== sectionCode)
        : [...prev, sectionCode]
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
    (filters.formesJuridiques?.length || 0);

  // Sections avec des données disponibles, triées par count
  const availableSections = NAF_SECTIONS
    .filter(section => sectionCounts[section.code] > 0)
    .sort((a, b) => sectionCounts[b.code] - sectionCounts[a.code]);

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

      {/* Sections NAF (niveau 1) */}
      <Collapsible open={sectionsOpen} onOpenChange={setSectionsOpen} className="border-b border-accent/20">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Secteurs d'activité (NAF)</span>
            {(filters.categories?.length || 0) > 0 && (
              <span className="bg-accent/20 text-accent text-xs px-1.5 py-0.5 rounded-full">
                {filters.categories?.length}
              </span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-accent transition-transform ${sectionsOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <ScrollArea className="h-[400px]">
            <div className="px-4 pb-4 space-y-1">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))
              ) : availableSections.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Aucun secteur disponible
                </div>
              ) : (
                availableSections.map((section) => {
                  const categoryKey = SECTION_TO_CATEGORY[section.code];
                  const selected = filters.categories?.includes(categoryKey);
                  const count = sectionCounts[section.code];
                  const isExpanded = expandedSections.includes(section.code);
                  const sectionDivisions = section.divisions
                    .map(div => ({ code: div, ...NAF_DIVISIONS[div], count: divisionCounts[div] || 0 }))
                    .filter(d => d.count > 0);
                  
                  return (
                    <div key={section.code} className="space-y-1">
                      <div className="flex items-center gap-2">
                        {sectionDivisions.length > 0 && (
                          <button
                            onClick={() => toggleSectionExpand(section.code)}
                            className="p-1 hover:bg-accent/10 rounded"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3 h-3 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-muted-foreground" />
                            )}
                          </button>
                        )}
                        <div
                          onClick={() => handleSectionToggle(section.code)}
                          className={`flex items-center gap-3 cursor-pointer hover:bg-accent/10 p-2.5 rounded transition-colors active:scale-[0.98] flex-1 ${
                            sectionDivisions.length === 0 ? 'ml-5' : ''
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                            selected ? 'bg-accent border-accent' : 'border-accent/30'
                          }`}>
                            {selected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                          </div>
                          <span className="text-lg">{section.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-accent mr-1">{section.code}</span>
                            <span className="text-sm">{section.label}</span>
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">
                            {count.toLocaleString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Sous-divisions */}
                      {isExpanded && sectionDivisions.length > 0 && (
                        <div className="ml-8 space-y-1 border-l-2 border-accent/20 pl-3">
                          {sectionDivisions.map(div => {
                            const divSelected = filters.codesNaf?.includes(div.code);
                            return (
                              <div
                                key={div.code}
                                onClick={() => handleDivisionToggle(div.code)}
                                className="flex items-center gap-3 cursor-pointer hover:bg-accent/10 p-2 rounded transition-colors active:scale-[0.98]"
                              >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                                  divSelected ? 'bg-accent border-accent' : 'border-accent/30'
                                }`}>
                                  {divSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                                </div>
                                <span className="text-xs font-mono text-accent">{div.code}</span>
                                <span className="text-xs flex-1 truncate">{div.label}</span>
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

      {/* Départements */}
      <Collapsible open={departmentsOpen} onOpenChange={setDepartmentsOpen} className="border-b border-accent/20">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Départements</span>
            {(filters.departments?.length || 0) > 0 && (
              <span className="bg-accent/20 text-accent text-xs px-1.5 py-0.5 rounded-full">
                {filters.departments?.length}
              </span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-accent transition-transform ${departmentsOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <ScrollArea className="h-[300px]">
            <div className="px-4 pb-4 space-y-1">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))
              ) : availableDepartments.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Aucun département disponible
                </div>
              ) : (
                availableDepartments.map(({ dept, count }) => {
                  const selected = filters.departments?.includes(dept);
                  return (
                    <div
                      key={dept}
                      onClick={() => handleDepartmentToggle(dept)}
                      className="flex items-center gap-3 cursor-pointer hover:bg-accent/10 p-2.5 rounded transition-colors active:scale-[0.98]"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                        selected ? 'bg-accent border-accent' : 'border-accent/30'
                      }`}>
                        {selected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                      </div>
                      <span className="text-sm leading-tight flex-1">{dept}</span>
                      <span className="text-xs text-muted-foreground">
                        {count.toLocaleString('fr-FR')}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      {/* Formes juridiques */}
      <Collapsible open={formesJuridiquesOpen} onOpenChange={setFormesJuridiquesOpen} className="border-b border-accent/20">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Formes juridiques</span>
            {(filters.formesJuridiques?.length || 0) > 0 && (
              <span className="bg-accent/20 text-accent text-xs px-1.5 py-0.5 rounded-full">
                {filters.formesJuridiques?.length}
              </span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-accent transition-transform ${formesJuridiquesOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <ScrollArea className="h-[300px]">
            <div className="px-4 pb-4 space-y-1">
              {FORMES_JURIDIQUES.map((forme) => {
                const selected = filters.formesJuridiques?.includes(forme.value);
                return (
                  <div
                    key={forme.value}
                    onClick={() => handleFormeJuridiqueToggle(forme.value)}
                    className="flex items-center gap-3 cursor-pointer hover:bg-accent/10 p-2.5 rounded transition-colors active:scale-[0.98]"
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                      selected ? 'bg-accent border-accent' : 'border-accent/30'
                    }`}>
                      {selected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                    </div>
                    <Scale className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm leading-tight flex-1">{forme.label}</span>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
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
