import { useState } from "react";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building2, ChevronDown, X, Route, Calendar as CalendarIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useAvailableNouveauxSitesFilters } from "@/hooks/useAvailableNouveauxSitesFilters";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { getAllCategories } from "@/utils/detailedCategories";
import { Skeleton } from "@/components/ui/skeleton";

interface NafFiltersProps {
  filters: {
    searchQuery?: string;
    codesNaf?: string[];
    departments?: string[];
    categories?: string[];
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
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [departmentsOpen, setDepartmentsOpen] = useState(false);
  
  const { isAdmin } = useAdminStatus();
  const { data: availableFilters, isLoading } = useAvailableNouveauxSitesFilters({
    categories: filters.categories,
    departments: filters.departments,
    codesNaf: filters.codesNaf,
    searchQuery: filters.searchQuery
  });

  const allCategories = getAllCategories();
  const availableCategories = Object.entries(allCategories)
    .map(([key, cat]) => ({
      key,
      label: cat.label,
      emoji: cat.emoji,
      count: availableFilters?.categories[key] || 0
    }))
    .filter(cat => cat.count > 0)
    .sort((a, b) => b.count - a.count);

  const availableDepartments = Object.entries(availableFilters?.departments || {})
    .map(([dept, count]) => ({ dept, count: count as number }))
    .filter(d => d.count > 0)
    .sort((a, b) => {
      const numA = parseInt(a.dept);
      const numB = parseInt(b.dept);
      return numA - numB;
    });

  const handleCategoryToggle = (categoryKey: string) => {
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

  const clearFilters = () => setFilters((prev: any) => ({ 
    ...prev, 
    categories: [], 
    departments: [],
    codesNaf: [],
    searchQuery: ""
  }));

  const activeFiltersCount = 
    (filters.categories?.length || 0) + 
    (filters.departments?.length || 0) +
    (filters.codesNaf?.length || 0);

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
        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="w-full h-8 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Effacer les filtres ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Catégories d'activité */}
      <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen} className="border-b border-accent/20">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
          <span className="font-medium text-sm">Catégories d'activité</span>
          <ChevronDown className={`h-4 w-4 text-accent transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <ScrollArea className="h-[400px]">
            <div className="px-4 pb-4 space-y-1">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))
              ) : availableCategories.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Aucune catégorie disponible
                </div>
              ) : (
                availableCategories.map((cat) => {
                  const selected = filters.categories?.includes(cat.key);
                  return (
                    <div
                      key={cat.key}
                      onClick={() => handleCategoryToggle(cat.key)}
                      className="flex items-center gap-3 cursor-pointer hover:bg-accent/10 p-2.5 rounded transition-colors active:scale-[0.98]"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                        selected ? 'bg-accent border-accent' : 'border-accent/30'
                      }`}>
                        {selected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                      </div>
                      <span className="text-lg mr-2">{cat.emoji}</span>
                      <span className="text-sm leading-tight flex-1">{cat.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {cat.count.toLocaleString('fr-FR')}
                      </span>
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
    </div>
  );
};
