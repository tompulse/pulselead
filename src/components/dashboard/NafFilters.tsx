import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building2, ChevronDown, ChevronRight, X, Route, Calendar as CalendarIcon, Layers } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useAvailableNouveauxSitesFilters } from "@/hooks/useAvailableNouveauxSitesFilters";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  NAF_SECTIONS, 
  NAF_DIVISIONS, 
  NAF_GROUPES, 
  NAF_CLASSES,
  getSectionEmoji,
  getGroupeLabel,
  getClasseLabel
} from "@/utils/nafNomenclatureComplete";

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
    nafGroupes?: string[];
    nafClasses?: string[];
    nafSousClasses?: string[];
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

// Type pour les niveaux d'expansion
type ExpandedLevel = {
  sections: string[];
  divisions: string[];
  groupes: string[];
  classes: string[];
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
  const [departmentsOpen, setDepartmentsOpen] = useState(false);
  const [taillesEntrepriseOpen, setTaillesEntrepriseOpen] = useState(false);
  const [expanded, setExpanded] = useState<ExpandedLevel>({
    sections: [],
    divisions: [],
    groupes: [],
    classes: []
  });
  const [nafSearchQuery, setNafSearchQuery] = useState("");
  
  const { isAdmin } = useAdminStatus();
  const { data: availableFilters, isLoading } = useAvailableNouveauxSitesFilters();

  // Construire la hiérarchie NAF complète avec compteurs
  const nafHierarchy = useMemo(() => {
    if (!availableFilters) return [];

    const sections = Object.entries(NAF_SECTIONS)
      .map(([code, info]) => {
        const sectionCount = availableFilters.nafSections?.[code] || 0;
        
        // Divisions de cette section
        const divisions = Object.entries(NAF_DIVISIONS)
          .filter(([_, divInfo]) => divInfo.section === code)
          .map(([divCode, divInfo]) => {
            const divisionCount = availableFilters.nafDivisions?.[divCode] || 0;
            
            // Groupes de cette division
            const groupes = Object.entries(NAF_GROUPES)
              .filter(([_, grpInfo]) => grpInfo.division === divCode)
              .map(([grpCode, grpInfo]) => {
                const groupeCount = availableFilters.nafGroupes?.[grpCode] || 0;
                
                // Classes de ce groupe
                const classes = Object.entries(NAF_CLASSES)
                  .filter(([_, clsInfo]) => clsInfo.groupe === grpCode)
                  .map(([clsCode, clsInfo]) => {
                    const classeCount = availableFilters.nafClasses?.[clsCode] || 0;
                    
                    // Sous-classes de cette classe
                    const sousClasses = Object.entries(availableFilters.nafSousClasses || {})
                      .filter(([scCode]) => scCode.startsWith(clsCode))
                      .map(([scCode, count]) => ({
                        code: scCode,
                        label: scCode, // Le code complet est le label pour les sous-classes
                        count: count as number
                      }))
                      .filter(sc => sc.count > 0)
                      .sort((a, b) => b.count - a.count);
                    
                    return {
                      code: clsCode,
                      label: clsInfo.label,
                      count: classeCount,
                      sousClasses
                    };
                  })
                  .filter(cls => cls.count > 0)
                  .sort((a, b) => b.count - a.count);
                
                return {
                  code: grpCode,
                  label: grpInfo.label,
                  count: groupeCount,
                  classes
                };
              })
              .filter(grp => grp.count > 0)
              .sort((a, b) => b.count - a.count);
            
            return {
              code: divCode,
              label: divInfo.label,
              count: divisionCount,
              groupes
            };
          })
          .filter(div => div.count > 0)
          .sort((a, b) => b.count - a.count);
        
        return {
          code,
          label: info.label,
          emoji: info.emoji,
          count: sectionCount,
          divisions
        };
      })
      .filter(section => section.count > 0)
      .sort((a, b) => b.count - a.count);

    return sections;
  }, [availableFilters]);

  // Filtrer par recherche
  const filteredHierarchy = useMemo(() => {
    if (!nafSearchQuery.trim()) return nafHierarchy;
    
    const query = nafSearchQuery.toLowerCase();
    
    return nafHierarchy.filter(section => {
      const sectionMatch = section.code.toLowerCase().includes(query) || 
                          section.label.toLowerCase().includes(query);
      
      const hasMatchingDivision = section.divisions.some(div => 
        div.code.toLowerCase().includes(query) || 
        div.label.toLowerCase().includes(query) ||
        div.groupes.some(grp => 
          grp.code.toLowerCase().includes(query) || 
          grp.label.toLowerCase().includes(query) ||
          grp.classes.some(cls =>
            cls.code.toLowerCase().includes(query) ||
            cls.label.toLowerCase().includes(query) ||
            cls.sousClasses.some(sc => sc.code.toLowerCase().includes(query))
          )
        )
      );
      
      return sectionMatch || hasMatchingDivision;
    });
  }, [nafHierarchy, nafSearchQuery]);

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

  // Toggle functions pour l'expansion
  const toggleExpand = (level: keyof ExpandedLevel, code: string) => {
    setExpanded(prev => ({
      ...prev,
      [level]: prev[level].includes(code) 
        ? prev[level].filter(c => c !== code)
        : [...prev[level], code]
    }));
  };

  // Handlers pour la sélection des filtres
  const handleSectionToggle = (sectionCode: string) => {
    setFilters((prev: any) => {
      const currentSections = prev.nafSections || [];
      const isSelected = currentSections.includes(sectionCode);
      
      // Si on désélectionne, retirer aussi les niveaux inférieurs
      let newDivisions = prev.nafDivisions || [];
      let newGroupes = prev.nafGroupes || [];
      let newClasses = prev.nafClasses || [];
      let newSousClasses = prev.nafSousClasses || [];
      
      if (isSelected) {
        const sectionDivisions = Object.entries(NAF_DIVISIONS)
          .filter(([_, info]) => info.section === sectionCode)
          .map(([code]) => code);
        newDivisions = newDivisions.filter((d: string) => !sectionDivisions.includes(d));
        
        const sectionGroupes = Object.entries(NAF_GROUPES)
          .filter(([_, info]) => sectionDivisions.includes(info.division))
          .map(([code]) => code);
        newGroupes = newGroupes.filter((g: string) => !sectionGroupes.includes(g));
        
        const sectionClasses = Object.entries(NAF_CLASSES)
          .filter(([_, info]) => sectionGroupes.includes(info.groupe))
          .map(([code]) => code);
        newClasses = newClasses.filter((c: string) => !sectionClasses.includes(c));
        
        newSousClasses = newSousClasses.filter((sc: string) => 
          !sectionClasses.some(cls => sc.startsWith(cls))
        );
      }
      
      return {
        ...prev,
        nafSections: isSelected
          ? currentSections.filter((c: string) => c !== sectionCode)
          : [...currentSections, sectionCode],
        nafDivisions: newDivisions,
        nafGroupes: newGroupes,
        nafClasses: newClasses,
        nafSousClasses: newSousClasses
      };
    });
  };

  const handleDivisionToggle = (divisionCode: string) => {
    setFilters((prev: any) => {
      const current = prev.nafDivisions || [];
      const isSelected = current.includes(divisionCode);
      
      let newGroupes = prev.nafGroupes || [];
      let newClasses = prev.nafClasses || [];
      let newSousClasses = prev.nafSousClasses || [];
      
      if (isSelected) {
        const divGroupes = Object.entries(NAF_GROUPES)
          .filter(([_, info]) => info.division === divisionCode)
          .map(([code]) => code);
        newGroupes = newGroupes.filter((g: string) => !divGroupes.includes(g));
        
        const divClasses = Object.entries(NAF_CLASSES)
          .filter(([_, info]) => divGroupes.includes(info.groupe))
          .map(([code]) => code);
        newClasses = newClasses.filter((c: string) => !divClasses.includes(c));
        
        newSousClasses = newSousClasses.filter((sc: string) => 
          !divClasses.some(cls => sc.startsWith(cls))
        );
      }
      
      return {
        ...prev,
        nafDivisions: isSelected
          ? current.filter((d: string) => d !== divisionCode)
          : [...current, divisionCode],
        nafGroupes: newGroupes,
        nafClasses: newClasses,
        nafSousClasses: newSousClasses
      };
    });
  };

  const handleGroupeToggle = (groupeCode: string) => {
    setFilters((prev: any) => {
      const current = prev.nafGroupes || [];
      const isSelected = current.includes(groupeCode);
      
      let newClasses = prev.nafClasses || [];
      let newSousClasses = prev.nafSousClasses || [];
      
      if (isSelected) {
        const grpClasses = Object.entries(NAF_CLASSES)
          .filter(([_, info]) => info.groupe === groupeCode)
          .map(([code]) => code);
        newClasses = newClasses.filter((c: string) => !grpClasses.includes(c));
        newSousClasses = newSousClasses.filter((sc: string) => 
          !grpClasses.some(cls => sc.startsWith(cls))
        );
      }
      
      return {
        ...prev,
        nafGroupes: isSelected
          ? current.filter((g: string) => g !== groupeCode)
          : [...current, groupeCode],
        nafClasses: newClasses,
        nafSousClasses: newSousClasses
      };
    });
  };

  const handleClasseToggle = (classeCode: string) => {
    setFilters((prev: any) => {
      const current = prev.nafClasses || [];
      const isSelected = current.includes(classeCode);
      
      let newSousClasses = prev.nafSousClasses || [];
      if (isSelected) {
        newSousClasses = newSousClasses.filter((sc: string) => !sc.startsWith(classeCode));
      }
      
      return {
        ...prev,
        nafClasses: isSelected
          ? current.filter((c: string) => c !== classeCode)
          : [...current, classeCode],
        nafSousClasses: newSousClasses
      };
    });
  };

  const handleSousClasseToggle = (sousClasseCode: string) => {
    setFilters((prev: any) => {
      const current = prev.nafSousClasses || [];
      const isSelected = current.includes(sousClasseCode);
      
      return {
        ...prev,
        nafSousClasses: isSelected
          ? current.filter((sc: string) => sc !== sousClasseCode)
          : [...current, sousClasseCode]
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

  const clearFilters = () => setFilters((prev: any) => ({ 
    ...prev, 
    nafSections: [], 
    nafDivisions: [],
    nafGroupes: [],
    nafClasses: [],
    nafSousClasses: [],
    departments: [],
    taillesEntreprise: [],
    searchQuery: ""
  }));

  const activeFiltersCount = 
    (filters.nafSections?.length || 0) + 
    (filters.nafDivisions?.length || 0) +
    (filters.nafGroupes?.length || 0) +
    (filters.nafClasses?.length || 0) +
    (filters.nafSousClasses?.length || 0) +
    (filters.departments?.length || 0) +
    (filters.taillesEntreprise?.length || 0);

  // Composant pour afficher une checkbox
  const Checkbox = ({ selected, size = "md" }: { selected: boolean; size?: "sm" | "md" }) => {
    const sizeClasses = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
    const innerSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";
    return (
      <div className={`${sizeClasses} rounded border-2 flex items-center justify-center shrink-0 ${
        selected ? 'bg-accent border-accent' : 'border-accent/30'
      }`}>
        {selected && <div className={`${innerSize} bg-white rounded-sm`} />}
      </div>
    );
  };

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

      {/* Nomenclature NAF hiérarchique - 5 niveaux */}
      <Collapsible open={sectionsOpen} onOpenChange={setSectionsOpen} className="border-b border-accent/20">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            <span className="font-medium text-sm">Nomenclature NAF</span>
            <span className="text-xs text-muted-foreground">(5 niveaux)</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-accent transition-transform ${sectionsOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          {/* Recherche dans la nomenclature */}
          <div className="px-4 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Filtrer les codes NAF..."
                value={nafSearchQuery}
                onChange={(e) => setNafSearchQuery(e.target.value)}
                className="pl-7 h-7 text-xs bg-background/50 border-accent/20"
              />
            </div>
          </div>
          
          <ScrollArea className="h-[450px]">
            <div className="px-4 pb-4 space-y-0.5">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))
              ) : filteredHierarchy.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Aucun secteur trouvé
                </div>
              ) : (
                filteredHierarchy.map((section) => {
                  const sectionSelected = filters.nafSections?.includes(section.code);
                  const sectionExpanded = expanded.sections.includes(section.code);
                  
                  return (
                    <div key={section.code} className="space-y-0.5">
                      {/* Niveau 1: Section */}
                      <div className="flex items-start gap-1">
                        {section.divisions.length > 0 && (
                          <button
                            onClick={() => toggleExpand('sections', section.code)}
                            className="p-1 hover:bg-accent/10 rounded mt-1"
                          >
                            {sectionExpanded ? (
                              <ChevronDown className="w-3 h-3 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-muted-foreground" />
                            )}
                          </button>
                        )}
                        <div
                          onClick={() => handleSectionToggle(section.code)}
                          className="flex items-start gap-2 cursor-pointer hover:bg-accent/10 p-2 rounded transition-colors active:scale-[0.98] flex-1"
                        >
                          <Checkbox selected={sectionSelected} />
                          <span className="text-base shrink-0">{section.emoji}</span>
                          <span className="text-xs font-bold text-accent shrink-0">{section.code}</span>
                          <span className="text-sm leading-snug flex-1 break-words font-medium">{section.label}</span>
                          <span className="text-xs text-muted-foreground shrink-0 font-semibold">
                            {section.count.toLocaleString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Niveau 2: Divisions */}
                      {sectionExpanded && section.divisions.map((division) => {
                        const divisionSelected = filters.nafDivisions?.includes(division.code);
                        const divisionExpanded = expanded.divisions.includes(division.code);
                        
                        return (
                          <div key={division.code} className="ml-6 space-y-0.5">
                            <div className="flex items-start gap-1 border-l-2 border-accent/20 pl-2">
                              {division.groupes.length > 0 && (
                                <button
                                  onClick={() => toggleExpand('divisions', division.code)}
                                  className="p-0.5 hover:bg-accent/10 rounded mt-1"
                                >
                                  {divisionExpanded ? (
                                    <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="w-2.5 h-2.5 text-muted-foreground" />
                                  )}
                                </button>
                              )}
                              <div
                                onClick={() => handleDivisionToggle(division.code)}
                                className="flex items-start gap-2 cursor-pointer hover:bg-accent/10 p-1.5 rounded transition-colors active:scale-[0.98] flex-1"
                              >
                                <Checkbox selected={divisionSelected} size="sm" />
                                <span className="text-xs font-mono text-accent/80 shrink-0">{division.code}</span>
                                <span className="text-xs leading-snug flex-1 break-words">{division.label}</span>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {division.count.toLocaleString('fr-FR')}
                                </span>
                              </div>
                            </div>
                            
                            {/* Niveau 3: Groupes */}
                            {divisionExpanded && division.groupes.map((groupe) => {
                              const groupeSelected = filters.nafGroupes?.includes(groupe.code);
                              const groupeExpanded = expanded.groupes.includes(groupe.code);
                              
                              return (
                                <div key={groupe.code} className="ml-5 space-y-0.5">
                                  <div className="flex items-start gap-1 border-l-2 border-accent/15 pl-2">
                                    {groupe.classes.length > 0 && (
                                      <button
                                        onClick={() => toggleExpand('groupes', groupe.code)}
                                        className="p-0.5 hover:bg-accent/10 rounded mt-0.5"
                                      >
                                        {groupeExpanded ? (
                                          <ChevronDown className="w-2 h-2 text-muted-foreground" />
                                        ) : (
                                          <ChevronRight className="w-2 h-2 text-muted-foreground" />
                                        )}
                                      </button>
                                    )}
                                    <div
                                      onClick={() => handleGroupeToggle(groupe.code)}
                                      className="flex items-start gap-1.5 cursor-pointer hover:bg-accent/10 p-1 rounded transition-colors active:scale-[0.98] flex-1"
                                    >
                                      <Checkbox selected={groupeSelected} size="sm" />
                                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">{groupe.code}</span>
                                      <span className="text-[11px] leading-snug flex-1 break-words">{groupe.label}</span>
                                      <span className="text-[10px] text-muted-foreground shrink-0">
                                        {groupe.count.toLocaleString('fr-FR')}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Niveau 4: Classes */}
                                  {groupeExpanded && groupe.classes.map((classe) => {
                                    const classeSelected = filters.nafClasses?.includes(classe.code);
                                    const classeExpanded = expanded.classes.includes(classe.code);
                                    
                                    return (
                                      <div key={classe.code} className="ml-4 space-y-0.5">
                                        <div className="flex items-start gap-1 border-l border-accent/10 pl-2">
                                          {classe.sousClasses.length > 0 && (
                                            <button
                                              onClick={() => toggleExpand('classes', classe.code)}
                                              className="p-0.5 hover:bg-accent/10 rounded"
                                            >
                                              {classeExpanded ? (
                                                <ChevronDown className="w-2 h-2 text-muted-foreground" />
                                              ) : (
                                                <ChevronRight className="w-2 h-2 text-muted-foreground" />
                                              )}
                                            </button>
                                          )}
                                          <div
                                            onClick={() => handleClasseToggle(classe.code)}
                                            className="flex items-start gap-1.5 cursor-pointer hover:bg-accent/10 p-1 rounded transition-colors active:scale-[0.98] flex-1"
                                          >
                                            <Checkbox selected={classeSelected} size="sm" />
                                            <span className="text-[10px] font-mono text-muted-foreground/70 shrink-0">{classe.code}</span>
                                            <span className="text-[10px] leading-snug flex-1 break-words text-muted-foreground">{classe.label}</span>
                                            <span className="text-[10px] text-muted-foreground/70 shrink-0">
                                              {classe.count.toLocaleString('fr-FR')}
                                            </span>
                                          </div>
                                        </div>
                                        
                                        {/* Niveau 5: Sous-classes */}
                                        {classeExpanded && classe.sousClasses.map((sousClasse) => {
                                          const sousClasseSelected = filters.nafSousClasses?.includes(sousClasse.code);
                                          
                                          return (
                                            <div key={sousClasse.code} className="ml-4">
                                              <div
                                                onClick={() => handleSousClasseToggle(sousClasse.code)}
                                                className="flex items-center gap-1.5 cursor-pointer hover:bg-accent/10 p-1 rounded transition-colors active:scale-[0.98] border-l border-accent/5 pl-2"
                                              >
                                                <Checkbox selected={sousClasseSelected} size="sm" />
                                                <span className="text-[10px] font-mono text-accent/60 shrink-0">{sousClasse.code}</span>
                                                <span className="text-[10px] text-muted-foreground/70 shrink-0 ml-auto">
                                                  {sousClasse.count.toLocaleString('fr-FR')}
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
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
                      <Checkbox selected={selected} />
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
                      <Checkbox selected={selected} />
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
