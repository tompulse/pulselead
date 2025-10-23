import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { getCategoryLabel } from "@/utils/activityCategories";
import { DEPARTMENT_NAMES } from "@/utils/regionsData";
import { Route, Calendar, ChevronDown, Filter, Search, Building2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";

interface TourneeFiltersProps {
  filters: {
    dateFrom: string;
    dateTo: string;
    categories: string[];
    departments: string[];
    formesJuridiques?: string[];
    searchQuery?: string;
    typeEvenement?: string[];
    activiteDefinie?: boolean | null;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  // Tournée props
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

export const TourneeFilters = ({ 
  filters, 
  setFilters,
  tourneeActive = false,
  onToggleTournee,
  tourneeName = "",
  setTourneeName,
  tourneeDate = "",
  setTourneeDate,
  selectedCount = 0,
  onOptimize,
  isOptimizing = false
}: TourneeFiltersProps) => {
  const [departmentsOpen, setDepartmentsOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [formesOpen, setFormesOpen] = useState(false);
  const [datesOpen, setDatesOpen] = useState(false);
  const [typeEvenementOpen, setTypeEvenementOpen] = useState(false);
  const [activiteOpen, setActiviteOpen] = useState(false);
  
  // Récupération dynamique des valeurs depuis la base de données
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableFormes, setAvailableFormes] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    const fetchDistinctValues = async () => {
      setLoadingOptions(true);
      
      // Récupérer les catégories distinctes
      const { data: categoriesData } = await supabase
        .from('entreprises')
        .select('categorie_qualifiee')
        .not('categorie_qualifiee', 'is', null);
      
      const uniqueCategories = Array.from(
        new Set(categoriesData?.map(e => e.categorie_qualifiee).filter(Boolean))
      ).sort();
      
      // Récupérer les formes juridiques distinctes
      const { data: formesData } = await supabase
        .from('entreprises')
        .select('forme_juridique')
        .not('forme_juridique', 'is', null);
      
      const uniqueFormes = Array.from(
        new Set(formesData?.map(e => e.forme_juridique).filter(Boolean))
      ).sort();
      
      setAvailableCategories(uniqueCategories);
      setAvailableFormes(uniqueFormes);
      setLoadingOptions(false);
    };
    
    fetchDistinctValues();
  }, []);
  
  const handleCategoryToggle = (categoryKey: string) => {
    setFilters((prev: any) => {
      const currentCategories = prev.categories || [];
      const isSelected = currentCategories.includes(categoryKey);
      
      return {
        ...prev,
        categories: isSelected
          ? currentCategories.filter((c: string) => c !== categoryKey)
          : [...currentCategories, categoryKey]
      };
    });
  };

  const handleFormeToggle = (formeValue: string) => {
    setFilters((prev: any) => {
      const currentFormes = prev.formesJuridiques || [];
      const isSelected = currentFormes.includes(formeValue);
      
      return {
        ...prev,
        formesJuridiques: isSelected
          ? currentFormes.filter((f: string) => f !== formeValue)
          : [...currentFormes, formeValue]
      };
    });
  };

  const handleDepartmentToggle = (deptCode: string) => {
    setFilters((prev: any) => {
      const currentDepartments = prev.departments || [];
      const isSelected = currentDepartments.includes(deptCode);
      
      return {
        ...prev,
        departments: isSelected
          ? currentDepartments.filter((d: string) => d !== deptCode)
          : [...currentDepartments, deptCode]
      };
    });
  };

  const handleTypeEvenementToggle = (type: string) => {
    setFilters((prev: any) => {
      const currentTypes = prev.typeEvenement || [];
      const isSelected = currentTypes.includes(type);
      
      return {
        ...prev,
        typeEvenement: isSelected
          ? currentTypes.filter((t: string) => t !== type)
          : [...currentTypes, type]
      };
    });
  };

  const handleActiviteToggle = (value: boolean) => {
    setFilters((prev: any) => ({
      ...prev,
      activiteDefinie: prev.activiteDefinie === value ? null : value
    }));
  };

  const clearFilters = () => setFilters((prev: any) => ({ 
    ...prev, 
    categories: [], 
    departments: [], 
    formesJuridiques: [],
    typeEvenement: [],
    activiteDefinie: null,
    searchQuery: ""
  }));

  const allDepartments = Object.keys(DEPARTMENT_NAMES).sort();

  const activeFiltersCount = 
    (filters.categories?.length || 0) + 
    (filters.departments?.length || 0) +
    (filters.formesJuridiques?.length || 0) +
    (filters.typeEvenement?.length || 0) +
    (filters.activiteDefinie !== null && filters.activiteDefinie !== undefined ? 1 : 0);

  return (
    <div className="space-y-0">
        {/* Barre de recherche */}
        <div className="p-4 border-b border-accent/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher une entreprise..."
              value={filters.searchQuery || ""}
              onChange={(e) => setFilters((prev: any) => ({ ...prev, searchQuery: e.target.value }))}
              className="pl-9 h-9 bg-background/50 border-accent/20 focus:border-accent/40"
            />
          </div>
        </div>

        {/* Création de tournée */}
        {onToggleTournee && (
          <Collapsible open={tourneeActive} onOpenChange={onToggleTournee} className="border-b border-accent/20">
            <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors group">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-accent" />
                <span className="font-medium text-sm">Créer une tournée</span>
                {selectedCount > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-accent/20 text-accent border-accent/30 text-xs">
                    {selectedCount}
                  </Badge>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 text-accent transition-transform ${tourneeActive ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            
            <CollapsibleContent className="px-4 pb-4">
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="tournee-name" className="text-xs">
                    Nom de la tournée
                  </Label>
                  <Input
                    id="tournee-name"
                    value={tourneeName}
                    onChange={(e) => setTourneeName?.(e.target.value)}
                    placeholder="Ex: Tournée Paris"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tournee-date" className="text-xs">
                    Date
                  </Label>
                  <DatePicker
                    date={tourneeDate ? new Date(tourneeDate) : undefined}
                    onSelect={(date) => setTourneeDate?.(date ? date.toISOString().split('T')[0] : "")}
                    placeholder="Sélectionner"
                    className="h-9"
                  />
                </div>

                {selectedCount > 0 && (
                  <Button
                    onClick={onOptimize}
                    disabled={selectedCount < 2 || !tourneeName.trim() || isOptimizing}
                    className="w-full bg-gradient-to-r from-accent to-accent/80"
                    size="sm"
                  >
                    {isOptimizing ? "Optimisation..." : `Optimiser (${selectedCount})`}
                  </Button>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Départements */}
        <Collapsible open={departmentsOpen} onOpenChange={setDepartmentsOpen} className="border-b border-accent/20">
          <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
            <span className="font-medium text-sm">Départements</span>
            <ChevronDown className={`h-4 w-4 text-accent transition-transform ${departmentsOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="px-4 pb-4">
            <ScrollArea className="h-64 mt-2 overscroll-contain">
              <div className="space-y-1 pr-4">
                {allDepartments.map((deptCode) => {
                  const selected = filters.departments?.includes(deptCode);
                  return (
                    <div
                      key={deptCode}
                      onClick={() => handleDepartmentToggle(deptCode)}
                      className="flex items-center gap-3 cursor-pointer hover:bg-accent/10 p-2.5 rounded transition-colors active:scale-[0.98]"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                        selected ? 'bg-accent border-accent' : 'border-accent/30'
                      }`}>
                        {selected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                      </div>
                      <span className="text-sm leading-tight">
                        {deptCode} - {DEPARTMENT_NAMES[deptCode]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>

        {/* Catégories d'activité */}
        <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen} className="border-b border-accent/20">
          <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
            <span className="font-medium text-sm">Catégories d'activité</span>
            <ChevronDown className={`h-4 w-4 text-accent transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="px-4 pb-4">
            {loadingOptions ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Chargement...
              </div>
            ) : availableCategories.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Aucune catégorie disponible
              </div>
            ) : (
              <ScrollArea className="h-64 mt-2 overscroll-contain">
                <div className="space-y-1 pr-4">
                  {availableCategories.map((categoryKey) => {
                    const selected = filters.categories?.includes(categoryKey);
                    return (
                      <div
                        key={categoryKey}
                        onClick={() => handleCategoryToggle(categoryKey)}
                        className="flex items-center gap-3 cursor-pointer hover:bg-accent/10 p-2.5 rounded transition-colors active:scale-[0.98]"
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                          selected ? 'bg-accent border-accent' : 'border-accent/30'
                        }`}>
                          {selected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                        </div>
                        <span className="text-sm leading-tight">
                          {getCategoryLabel(categoryKey)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Formes juridiques */}
        <Collapsible open={formesOpen} onOpenChange={setFormesOpen} className="border-b border-accent/20">
          <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
            <span className="font-medium text-sm">Formes juridiques</span>
            <ChevronDown className={`h-4 w-4 text-accent transition-transform ${formesOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="px-4 pb-4">
            {loadingOptions ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Chargement...
              </div>
            ) : availableFormes.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Aucune forme juridique disponible
              </div>
            ) : (
              <ScrollArea className="h-64 mt-2 overscroll-contain">
                <div className="space-y-1 pr-4">
                  {availableFormes.map((forme) => {
                    const selected = filters.formesJuridiques?.includes(forme);
                    return (
                      <div
                        key={forme}
                        onClick={() => handleFormeToggle(forme)}
                        className="flex items-center gap-3 cursor-pointer hover:bg-accent/10 p-2.5 rounded transition-colors active:scale-[0.98]"
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                          selected ? 'bg-accent border-accent' : 'border-accent/30'
                        }`}>
                          {selected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                        </div>
                        <span className="text-sm leading-tight">
                          {forme}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Type d'événement */}
        <Collapsible open={typeEvenementOpen} onOpenChange={setTypeEvenementOpen} className="border-b border-accent/20">
          <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
            <span className="font-medium text-sm">Type d'événement</span>
            <ChevronDown className={`h-4 w-4 text-accent transition-transform ${typeEvenementOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="px-4 pb-4">
            <div className="space-y-1 mt-2">
              {[
                { key: 'immatriculation', label: '📋 Immatriculation (transfert de siège)' },
                { key: 'creation', label: '🆕 Création d\'entreprise' },
                { key: 'cession', label: '💼 Vente / Cession de fonds' }
              ].map(({ key, label }) => {
                const selected = filters.typeEvenement?.includes(key);
                return (
                  <div
                    key={key}
                    onClick={() => handleTypeEvenementToggle(key)}
                    className="flex items-center gap-3 cursor-pointer hover:bg-accent/10 p-2.5 rounded transition-colors active:scale-[0.98]"
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                      selected ? 'bg-accent border-accent' : 'border-accent/30'
                    }`}>
                      {selected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                    </div>
                    <span className="text-sm leading-tight">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Statut de l'activité */}
        <Collapsible open={activiteOpen} onOpenChange={setActiviteOpen} className="border-b border-accent/20">
          <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
            <span className="font-medium text-sm">Statut de l'activité</span>
            <ChevronDown className={`h-4 w-4 text-accent transition-transform ${activiteOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="px-4 pb-4">
            <div className="space-y-1 mt-2">
              {[
                { key: true, label: '✅ Activité définie' },
                { key: false, label: '⚠️ Activité non définie' }
              ].map(({ key, label }) => {
                const selected = filters.activiteDefinie === key;
                return (
                  <div
                    key={String(key)}
                    onClick={() => handleActiviteToggle(key)}
                    className="flex items-center gap-3 cursor-pointer hover:bg-accent/10 p-2.5 rounded transition-colors active:scale-[0.98]"
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                      selected ? 'bg-accent border-accent' : 'border-accent/30'
                    }`}>
                      {selected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                    </div>
                    <span className="text-sm leading-tight">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Dates */}
        <Collapsible open={datesOpen} onOpenChange={setDatesOpen} className="border-b border-accent/20">
          <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
            <span className="font-medium text-sm">Dates</span>
            <ChevronDown className={`h-4 w-4 text-accent transition-transform ${datesOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="px-4 pb-4">
            <div className="space-y-3 mt-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Du</Label>
                <DatePicker
                  date={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                  onSelect={(date) => setFilters((prev: any) => ({ ...prev, dateFrom: date?.toISOString().split('T')[0] || '' }))}
                  placeholder="Date début"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Au</Label>
                <DatePicker
                  date={filters.dateTo ? new Date(filters.dateTo) : undefined}
                  onSelect={(date) => setFilters((prev: any) => ({ ...prev, dateTo: date?.toISOString().split('T')[0] || '' }))}
                  placeholder="Date fin"
                  className="h-9"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

      {/* Footer with reset button */}
      {activeFiltersCount > 0 && (
        <div className="p-4 border-t border-accent/20">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters}
            className="w-full border-accent/30 hover:bg-accent/10"
          >
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
};

