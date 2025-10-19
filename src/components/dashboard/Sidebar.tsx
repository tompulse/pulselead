import { Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ACTIVITY_CATEGORIES, getCategoryLabel } from "@/utils/activityCategories";
import { DEPARTMENT_NAMES } from "@/utils/regionsData";
import { useState } from "react";

interface SidebarProps {
  filters: {
    dateFrom: string;
    dateTo: string;
    categories: string[];
    departments: string[];
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

export const Sidebar = ({ filters, setFilters }: SidebarProps) => {
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
  };

  return (
    <aside className="w-80 glass-card border-r border-accent/20 p-4 space-y-3 overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-accent" />
        <h2 className="text-xl font-semibold">Filtres</h2>
      </div>

      <div className="space-y-3">
        {/* Geographic Filters - Departments Only */}
        <Collapsible open={isDepartmentsOpen} onOpenChange={setIsDepartmentsOpen}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg border border-accent/20 hover:bg-accent/10 transition-colors">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold cursor-pointer">Départements</Label>
                {filters.departments.length > 0 && (
                  <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                    {filters.departments.length}
                  </span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-accent transition-transform ${isDepartmentsOpen ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-1.5 px-2">
            <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar space-y-1.5">
              {allDepartments.map((deptCode) => (
                <div key={deptCode} className="flex items-center space-x-2 p-1.5 rounded hover:bg-accent/5">
                  <Checkbox
                    id={`dept-${deptCode}`}
                    checked={filters.departments?.includes(deptCode)}
                    onCheckedChange={() => handleDepartmentToggle(deptCode)}
                    className="border-accent data-[state=checked]:bg-accent data-[state=checked]:text-primary h-4 w-4"
                  />
                  <label
                    htmlFor={`dept-${deptCode}`}
                    className="text-xs font-medium leading-none cursor-pointer flex-1"
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
            <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg border border-accent/20 hover:bg-accent/10 transition-colors">
              <Label className="text-sm font-semibold cursor-pointer">Catégories d'activité</Label>
              <ChevronDown className={`w-4 h-4 text-accent transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-2 px-2 custom-scrollbar">
              {allCategories.map((categoryKey) => (
                <div key={categoryKey} className="flex items-center space-x-2 p-1.5 rounded hover:bg-accent/5">
                  <Checkbox
                    id={`cat-${categoryKey}`}
                    checked={filters.categories?.includes(categoryKey)}
                    onCheckedChange={() => handleCategoryToggle(categoryKey)}
                    className="border-accent data-[state=checked]:bg-accent data-[state=checked]:text-primary h-4 w-4"
                  />
                  <label
                    htmlFor={`cat-${categoryKey}`}
                    className="text-xs font-medium leading-none cursor-pointer flex-1"
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
            <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg border border-accent/20 hover:bg-accent/10 transition-colors">
              <Label className="text-sm font-semibold cursor-pointer">Dates</Label>
              <ChevronDown className={`w-4 h-4 text-accent transition-transform ${isDatesOpen ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-3 px-2">
            <div className="space-y-2">
              <Label htmlFor="dateFrom" className="text-xs">Date de début</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="h-9 bg-background/50 border-border focus:border-accent text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo" className="text-xs">Date de fin</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="h-9 bg-background/50 border-border focus:border-accent text-sm"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Reset Filters */}
        <Button
          variant="outline"
          size="sm"
          className="w-full border-accent/50 hover:bg-accent/10 mt-4"
          onClick={() => {
            setFilters({
              dateFrom: "",
              dateTo: "",
              categories: [],
              departments: [],
            });
          }}
        >
          Réinitialiser les filtres
        </Button>
      </div>
    </aside>
  );
};
