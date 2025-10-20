import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ACTIVITY_CATEGORIES, getCategoryLabel } from "@/utils/activityCategories";
import { DEPARTMENT_NAMES } from "@/utils/regionsData";

interface TourneeFiltersProps {
  filters: {
    dateFrom: string;
    dateTo: string;
    categories: string[];
    departments: string[];
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

export const TourneeFilters = ({ filters, setFilters }: TourneeFiltersProps) => {
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

  const clearFilters = () => setFilters((prev: any) => ({ ...prev, categories: [], departments: [] }));

  const allCategories = Object.keys(ACTIVITY_CATEGORIES);
  const allDepartments = Object.keys(DEPARTMENT_NAMES).sort();

  const activeFiltersCount = 
    (filters.categories?.length || 0) + 
    (filters.departments?.length || 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activeFiltersCount} filtre(s) actif(s)
          </Badge>
        )}
        <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs" onClick={clearFilters}>
          Effacer
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {/* Catégories */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Catégories</Label>
          <ScrollArea className="h-28 rounded border border-accent/20 bg-muted/30">
            <div className="p-2 flex flex-wrap gap-1.5">
              {allCategories.map((categoryKey) => {
                const selected = filters.categories?.includes(categoryKey);
                return (
                  <Button
                    key={categoryKey}
                    type="button"
                    size="sm"
                    variant={selected ? "secondary" : "outline"}
                    className="h-7 px-2 text-xs"
                    onClick={() => handleCategoryToggle(categoryKey)}
                  >
                    {getCategoryLabel(categoryKey)}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Départements */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Départements</Label>
          <ScrollArea className="h-28 rounded border border-accent/20 bg-muted/30">
            <div className="p-2 flex flex-wrap gap-1.5">
              {allDepartments.map((deptCode) => {
                const selected = filters.departments?.includes(deptCode);
                return (
                  <Button
                    key={deptCode}
                    type="button"
                    size="sm"
                    variant={selected ? "secondary" : "outline"}
                    className="h-7 px-2 text-xs"
                    onClick={() => handleDepartmentToggle(deptCode)}
                  >
                    {deptCode} - {DEPARTMENT_NAMES[deptCode]}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

