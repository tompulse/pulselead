import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  const allCategories = Object.keys(ACTIVITY_CATEGORIES);
  const allDepartments = Object.keys(DEPARTMENT_NAMES).sort();

  const activeFiltersCount = 
    (filters.categories?.length || 0) + 
    (filters.departments?.length || 0);

  return (
    <div className="space-y-2">
      {activeFiltersCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          {activeFiltersCount} filtre(s) actif(s)
        </Badge>
      )}
      
      <div className="grid grid-cols-2 gap-2">
        {/* Catégories */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Catégories</Label>
          <ScrollArea className="h-28 rounded border border-accent/20 bg-muted/30">
            <div className="p-2 space-y-1.5">
              {allCategories.map((categoryKey) => (
                <div key={categoryKey} className="flex items-center gap-2">
                  <Checkbox
                    id={`cat-${categoryKey}`}
                    checked={filters.categories?.includes(categoryKey)}
                    onCheckedChange={() => handleCategoryToggle(categoryKey)}
                    className="h-3 w-3"
                  />
                  <Label 
                    htmlFor={`cat-${categoryKey}`}
                    className="text-xs cursor-pointer leading-tight"
                  >
                    {getCategoryLabel(categoryKey)}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Départements */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Départements</Label>
          <ScrollArea className="h-28 rounded border border-accent/20 bg-muted/30">
            <div className="p-2 space-y-1.5">
              {allDepartments.map((deptCode) => (
                <div key={deptCode} className="flex items-center gap-2">
                  <Checkbox
                    id={`dept-${deptCode}`}
                    checked={filters.departments?.includes(deptCode)}
                    onCheckedChange={() => handleDepartmentToggle(deptCode)}
                    className="h-3 w-3"
                  />
                  <Label 
                    htmlFor={`dept-${deptCode}`}
                    className="text-xs cursor-pointer leading-tight"
                  >
                    {deptCode} - {DEPARTMENT_NAMES[deptCode]}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
