import { Filter, ChevronDown } from "lucide-react";
import { Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DatePicker } from "@/components/ui/date-picker";
import { ACTIVITY_CATEGORIES, getCategoryLabel } from "@/utils/activityCategories";
import { DEPARTMENT_NAMES } from "@/utils/regionsData";
import { useState } from "react";
import { format } from "date-fns";

interface SidebarProps {
  filters: {
    dateFrom: string;
    dateTo: string;
    categories: string[];
    departments: string[];
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  onFilterChange?: () => void;
  isMobileSheet?: boolean;
  tourneeMode?: boolean;
  onCreateTournee?: () => void;
  tourneeActive?: boolean;
  tourneeName?: string;
  setTourneeName?: (name: string) => void;
  tourneeDate?: string;
  setTourneeDate?: (date: string) => void;
  selectedCount?: number;
}

export const Sidebar = ({ 
  filters, 
  setFilters, 
  onFilterChange, 
  isMobileSheet = false,
  tourneeMode = false,
  onCreateTournee,
  tourneeActive = false,
  tourneeName = "",
  setTourneeName,
  tourneeDate = "",
  setTourneeDate,
  selectedCount = 0
}: SidebarProps) => {
  const [isDepartmentsOpen, setIsDepartmentsOpen] = useState(true);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isDatesOpen, setIsDatesOpen] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

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
    onFilterChange?.();
  };

  const allCategories = Object.keys(ACTIVITY_CATEGORIES);
  const allDepartments = Object.keys(DEPARTMENT_NAMES).sort();

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
    onFilterChange?.();
  };

  return (
    <aside className={isMobileSheet 
      ? "w-full h-full flex flex-col p-4 space-y-4" 
      : "w-56 md:w-60 glass-card border-r border-accent/20 p-3 space-y-2 flex flex-col h-full overflow-hidden"
    }>
      {!isMobileSheet && (
        <>
          <div className="flex items-center gap-2 mb-2 shrink-0">
            <Filter className="w-4 h-4 text-accent" />
            <h2 className="text-base font-semibold">Filtres</h2>
          </div>
          
          {tourneeMode && onCreateTournee && (
            <>
              <Button
                onClick={onCreateTournee}
                variant={tourneeActive ? "default" : "outline"}
                className={`w-full mb-2 shrink-0 ${
                  tourneeActive 
                    ? "bg-accent hover:bg-accent/90 text-primary" 
                    : "border-accent/50 hover:bg-accent/10"
                }`}
                size="sm"
              >
                <Route className="w-4 h-4 mr-2" />
                {tourneeActive ? "Mode tournée actif" : "Créer une tournée"}
              </Button>
              
              {tourneeActive && setTourneeName && setTourneeDate && (
                <div className="mb-3 p-3 bg-accent/5 rounded-lg border border-accent/20 space-y-2 shrink-0">
                  <div className="space-y-1.5">
                    <Label htmlFor="tournee-name" className="text-xs">Nom de la tournée</Label>
                    <Input
                      id="tournee-name"
                      placeholder="Ex: Tournée Sud"
                      value={tourneeName}
                      onChange={(e) => setTourneeName(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tournee-date" className="text-xs">Date</Label>
                    <Input
                      id="tournee-date"
                      type="date"
                      value={tourneeDate}
                      onChange={(e) => setTourneeDate(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  {selectedCount > 0 && (
                    <div className="text-xs text-muted-foreground pt-1">
                      {selectedCount} entreprise(s) sélectionnée(s)
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

      <div className={isMobileSheet 
        ? "space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar"
        : "space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar"
      }>
        {/* Geographic Filters - Departments Only */}
        <Collapsible open={isDepartmentsOpen} onOpenChange={setIsDepartmentsOpen}>
          <CollapsibleTrigger className="w-full">
            <div className={`flex items-center justify-between rounded-lg border border-accent/20 hover:bg-accent/10 transition-colors ${
              isMobileSheet ? "p-4 bg-accent/5" : "p-2 bg-accent/5"
            }`}>
              <div className="flex items-center gap-2">
                <Label className={`font-semibold cursor-pointer ${isMobileSheet ? "text-base" : "text-xs"}`}>
                  Départements
                </Label>
                {filters.departments.length > 0 && (
                  <span className={`bg-accent/20 text-accent rounded-full font-medium ${
                    isMobileSheet ? "text-xs px-2 py-1" : "text-[10px] px-1.5 py-0.5"
                  }`}>
                    {filters.departments.length}
                  </span>
                )}
              </div>
              <ChevronDown className={`text-accent transition-transform ${
                isDepartmentsOpen ? 'rotate-180' : ''
              } ${isMobileSheet ? "w-5 h-5" : "w-3.5 h-3.5"}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className={isMobileSheet ? "mt-2 space-y-2 px-2" : "mt-1.5 space-y-1 px-1"}>
            <div className={`overflow-y-auto pr-1 custom-scrollbar ${
              isMobileSheet ? "max-h-48 space-y-2" : "max-h-40 space-y-1"
            }`}>
              {allDepartments.map((deptCode) => (
                <div key={deptCode} className={`flex items-center rounded hover:bg-accent/5 ${
                  isMobileSheet ? "space-x-3 p-3 min-h-[48px]" : "space-x-1.5 p-1"
                }`}>
                  <Checkbox
                    id={`dept-${deptCode}`}
                    checked={filters.departments?.includes(deptCode)}
                    onCheckedChange={() => handleDepartmentToggle(deptCode)}
                    className={`border-accent data-[state=checked]:bg-accent data-[state=checked]:text-primary shrink-0 ${
                      isMobileSheet ? "h-6 w-6" : "h-3.5 w-3.5"
                    }`}
                  />
                  <label
                    htmlFor={`dept-${deptCode}`}
                    className={`font-medium leading-none cursor-pointer flex-1 ${
                      isMobileSheet ? "text-base" : "text-[11px]"
                    }`}
                  >
                    {deptCode} - {DEPARTMENT_NAMES[deptCode]}
                  </label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Categories - Collapsible */}
        <Collapsible open={isCategoriesOpen} onOpenChange={setIsCategoriesOpen}>
          <CollapsibleTrigger className="w-full">
            <div className={`flex items-center justify-between rounded-lg border border-accent/20 hover:bg-accent/10 transition-colors ${
              isMobileSheet ? "p-4 bg-accent/5" : "p-2 bg-accent/5"
            }`}>
              <Label className={`font-semibold cursor-pointer ${isMobileSheet ? "text-base" : "text-xs"}`}>
                Catégories d'activité
              </Label>
              <ChevronDown className={`text-accent transition-transform ${
                isCategoriesOpen ? 'rotate-180' : ''
              } ${isMobileSheet ? "w-5 h-5" : "w-3.5 h-3.5"}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className={isMobileSheet ? "mt-2" : "mt-1.5"}>
            <div className={`overflow-y-auto pr-1 custom-scrollbar ${
              isMobileSheet ? "space-y-2 max-h-48 px-2" : "space-y-1 max-h-40 px-1"
            }`}>
              {allCategories.map((categoryKey) => (
                <div key={categoryKey} className={`flex items-center rounded hover:bg-accent/5 ${
                  isMobileSheet ? "space-x-3 p-3 min-h-[48px]" : "space-x-1.5 p-1"
                }`}>
                  <Checkbox
                    id={`cat-${categoryKey}`}
                    checked={filters.categories?.includes(categoryKey)}
                    onCheckedChange={() => handleCategoryToggle(categoryKey)}
                    className={`border-accent data-[state=checked]:bg-accent data-[state=checked]:text-primary shrink-0 ${
                      isMobileSheet ? "h-6 w-6" : "h-3.5 w-3.5"
                    }`}
                  />
                  <label
                    htmlFor={`cat-${categoryKey}`}
                    className={`font-medium leading-none cursor-pointer flex-1 ${
                      isMobileSheet ? "text-base" : "text-[11px]"
                    }`}
                  >
                    {getCategoryLabel(categoryKey)}
                  </label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Dates - Collapsible */}
        <Collapsible open={isDatesOpen} onOpenChange={setIsDatesOpen}>
          <CollapsibleTrigger className="w-full">
            <div className={`flex items-center justify-between rounded-lg border border-accent/20 hover:bg-accent/10 transition-colors ${
              isMobileSheet ? "p-4 bg-accent/5" : "p-2 bg-accent/5"
            }`}>
              <Label className={`font-semibold cursor-pointer ${isMobileSheet ? "text-base" : "text-xs"}`}>
                Dates
              </Label>
              <ChevronDown className={`text-accent transition-transform ${
                isDatesOpen ? 'rotate-180' : ''
              } ${isMobileSheet ? "w-5 h-5" : "w-3.5 h-3.5"}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className={isMobileSheet ? "mt-3 space-y-3 px-2" : "mt-2 space-y-2.5 px-1"}>
            <div className={isMobileSheet ? "space-y-2" : "space-y-1.5"}>
              <Label htmlFor="dateFrom" className={`font-medium text-cyan-electric/90 ${isMobileSheet ? "text-sm" : "text-[11px]"}`}>
                Date de début
              </Label>
              <DatePicker
                date={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                onSelect={(date) => handleFilterChange("dateFrom", date ? format(date, "yyyy-MM-dd") : "")}
                placeholder="Choisir une date"
                className={isMobileSheet ? "h-11" : "h-9 text-xs"}
              />
            </div>

            <div className={isMobileSheet ? "space-y-2" : "space-y-1.5"}>
              <Label htmlFor="dateTo" className={`font-medium text-cyan-electric/90 ${isMobileSheet ? "text-sm" : "text-[11px]"}`}>
                Date de fin
              </Label>
              <DatePicker
                date={filters.dateTo ? new Date(filters.dateTo) : undefined}
                onSelect={(date) => handleFilterChange("dateTo", date ? format(date, "yyyy-MM-dd") : "")}
                placeholder="Choisir une date"
                className={isMobileSheet ? "h-11" : "h-9 text-xs"}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

      </div>

      {/* Reset Filters */}
      <Button
        variant="outline"
        size="sm"
        className={`w-full border-accent/50 hover:bg-accent/10 shrink-0 ${
          isMobileSheet ? "h-11 text-sm mt-3" : "h-7 text-xs mt-2"
        }`}
        onClick={() => {
          // Supprimer l'onboarding et forcer le retour à l'écran de sélection
          localStorage.removeItem('luma_onboarding_complete');
          localStorage.removeItem('luma_initial_filters');
          window.location.reload();
        }}
      >
        Réinitialiser les filtres
      </Button>
    </aside>
  );
};
