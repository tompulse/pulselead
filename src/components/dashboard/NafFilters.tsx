import { useState } from "react";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building2, ChevronDown, ChevronRight, X, Route, Calendar as CalendarIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useAvailableNouveauxSitesFilters } from "@/hooks/useAvailableNouveauxSitesFilters";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { NAF_SECTIONS, NAF_DIVISIONS, getSectionEmoji } from "@/utils/nafNomenclature";

// Labels pour les tailles d'entreprise
const TAILLE_LABELS: Record<string, string> = {
  'GE': 'Grande Entreprise (GE)',
  'ETI': 'Entreprise Taille Intermédiaire (ETI)',
  'PME': 'Petite/Moyenne Entreprise (PME)',
  'Non spécifié': 'Non spécifié'
};

interface NafFiltersProps {
  filters: {
    searchQuery?: string;
    nafSections?: string[];
    nafDivisions?: string[];
    departments?: string[];
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
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [departmentsOpen, setDepartmentsOpen] = useState(false);
  const [taillesEntrepriseOpen, setTaillesEntrepriseOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  
  const { isAdmin } = useAdminStatus();
  const { data: availableFilters, isLoading } = useAvailableNouveauxSitesFilters();

  // Construire les sections NAF avec leurs compteurs
  const availableSections = Object.entries(NAF_SECTIONS)
    .map(([code, info]) => ({
      code,
      label: info.label,
      emoji: info.emoji,
      count: availableFilters?.nafSections?.[code] || 0
    }))
    .filter(section => section.count > 0)
    .sort((a, b) => b.count - a.count);

  // Construire les divisions groupées par section
  const divisionsBySection = Object.entries(NAF_DIVISIONS).reduce((acc, [code, info]) => {
    if (!acc[info.section]) {
      acc[info.section] = [];
    }
    acc[info.section].push({
      code,
      label: info.label,
      count: availableFilters?.nafDivisions?.[code] || 0
    });
    return acc;
  }, {} as Record<string, { code: string; label: string; count: number }[]>);

  const availableDepartments = Object.entries(availableFilters?.departments || {})
    .map(([dept, count]) => ({ dept, count: count as number }))
    .filter(d => d.count > 0)
    .sort((a, b) => {
      const numA = parseInt(a.dept);
      const numB = parseInt(b.dept);
      return numA - numB;
    });

  const availableTailles = Object.entries(availableFilters?.taillesEntreprise || {})
    .map(([taille, count]) => ({
      taille,
      label: TAILLE_LABELS[taille] || taille,
      count: count as number
    }))
    .filter(t => t.count > 0)
    .sort((a, b) => b.count - a.count);

  const handleSectionToggle = (sectionCode: string) => {
    setFilters((prev: any) => {
      const currentSections = prev.nafSections || [];
      const isSelected = currentSections.includes(sectionCode);
      
      // Si on désélectionne la section, retirer aussi les divisions de cette section
      let newDivisions = prev.nafDivisions || [];
      if (isSelected) {
        const sectionDivisions = divisionsBySection[sectionCode]?.map(d => d.code) || [];
        newDivisions = newDivisions.filter((d: string) => !sectionDivisions.includes(d));
      }
      
      return {
        ...prev,
        nafSections: isSelected
          ? currentSections.filter((c: string) => c !== sectionCode)
          : [...currentSections, sectionCode],
        nafDivisions: newDivisions
      };
    });
  };

  const handleDivisionToggle = (divisionCode: string) => {
    setFilters((prev: any) => {
      const current = prev.nafDivisions || [];
      const isSelected = current.includes(divisionCode);
      
      return {
        ...prev,
        nafDivisions: isSelected
          ? current.filter((d: string) => d !== divisionCode)
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

  const toggleExpandedSection = (sectionCode: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionCode) 
        ? prev.filter(s => s !== sectionCode)
        : [...prev, sectionCode]
    );
  };

  const clearFilters = () => setFilters((prev: any) => ({ 
    ...prev, 
    nafSections: [], 
    nafDivisions: [],
    departments: [],
    taillesEntreprise: [],
    searchQuery: ""
  }));

  const activeFiltersCount = 
    (filters.nafSections?.length || 0) + 
    (filters.nafDivisions?.length || 0) +
    (filters.departments?.length || 0) +
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

      {/* Sections NAF avec Divisions */}
      <Collapsible open={sectionsOpen} onOpenChange={setSectionsOpen} className="border-b border-accent/20">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
          <span className="font-medium text-sm">Secteurs d'activité (NAF)</span>
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
                  const sectionSelected = filters.nafSections?.includes(section.code);
                  const sectionExpanded = expandedSections.includes(section.code);
                  const sectionDivisions = (divisionsBySection[section.code] || []).filter(d => d.count > 0);
                  
                  return (
                    <div key={section.code} className="space-y-1">
                      <div className="flex items-center gap-1">
                        {/* Bouton expand pour voir les divisions */}
                        {sectionDivisions.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpandedSection(section.code);
                            }}
                            className="p-1 hover:bg-accent/10 rounded"
                          >
                            {sectionExpanded ? (
                              <ChevronDown className="w-3 h-3 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-muted-foreground" />
                            )}
                          </button>
                        )}
                        
                        {/* Section checkbox */}
                        <div
                          onClick={() => handleSectionToggle(section.code)}
                          className="flex items-center gap-3 cursor-pointer hover:bg-accent/10 p-2.5 rounded transition-colors active:scale-[0.98] flex-1"
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                            sectionSelected ? 'bg-accent border-accent' : 'border-accent/30'
                          }`}>
                            {sectionSelected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                          </div>
                          <span className="text-lg mr-1">{section.emoji}</span>
                          <span className="text-xs font-semibold text-accent mr-1">{section.code}</span>
                          <span className="text-sm leading-tight flex-1 truncate">{section.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {section.count.toLocaleString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Divisions (sous-catégories) */}
                      {sectionExpanded && sectionDivisions.length > 0 && (
                        <div className="ml-8 pl-2 border-l-2 border-accent/20 space-y-0.5">
                          {sectionDivisions
                            .sort((a, b) => b.count - a.count)
                            .map((division) => {
                              const divisionSelected = filters.nafDivisions?.includes(division.code);
                              return (
                                <div
                                  key={division.code}
                                  onClick={() => handleDivisionToggle(division.code)}
                                  className="flex items-center gap-3 cursor-pointer hover:bg-accent/10 p-2 rounded transition-colors active:scale-[0.98]"
                                >
                                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                                    divisionSelected ? 'bg-accent/80 border-accent/80' : 'border-accent/20'
                                  }`}>
                                    {divisionSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                                  </div>
                                  <span className="text-xs font-mono text-muted-foreground">{division.code}</span>
                                  <span className="text-xs leading-tight flex-1 truncate">{division.label}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {division.count.toLocaleString('fr-FR')}
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
          <span className="font-medium text-sm">Départements</span>
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
                      <span className="text-sm flex-1">Département {dept}</span>
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

      {/* Taille d'entreprise */}
      <Collapsible open={taillesEntrepriseOpen} onOpenChange={setTaillesEntrepriseOpen} className="border-b border-accent/20">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
          <span className="font-medium text-sm">Taille d'entreprise</span>
          <ChevronDown className={`h-4 w-4 text-accent transition-transform ${taillesEntrepriseOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <ScrollArea className="h-[200px]">
            <div className="px-4 pb-4 space-y-1">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))
              ) : availableTailles.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Aucune taille disponible
                </div>
              ) : (
                availableTailles.map(({ taille, label, count }) => {
                  const selected = filters.taillesEntreprise?.includes(taille);
                  return (
                    <div
                      key={taille}
                      onClick={() => handleTailleEntrepriseToggle(taille)}
                      className="flex items-center gap-3 cursor-pointer hover:bg-accent/10 p-2.5 rounded transition-colors active:scale-[0.98]"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                        selected ? 'bg-accent border-accent' : 'border-accent/30'
                      }`}>
                        {selected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                      </div>
                      <span className="text-sm flex-1">{label}</span>
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

      {/* Bouton réinitialiser */}
      {activeFiltersCount > 0 && (
        <div className="p-4">
          <Button
            onClick={clearFilters}
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs text-muted-foreground hover:text-destructive"
          >
            <X className="w-3 h-3 mr-1" />
            Réinitialiser les filtres ({activeFiltersCount})
          </Button>
        </div>
      )}
    </div>
  );
};
