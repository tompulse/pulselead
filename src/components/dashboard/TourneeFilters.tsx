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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="text-xs bg-accent/20 text-accent border-accent/30">
            {activeFiltersCount} filtre(s) actif(s)
          </Badge>
        )}
        <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs hover:bg-accent/10 hover:text-accent" onClick={clearFilters}>
          Effacer
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Catégories */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-accent to-accent/50 rounded-full" />
            Catégories
          </Label>
          <ScrollArea className="h-32 rounded-lg border border-accent/30 bg-gradient-to-br from-card/80 to-card/40 shadow-sm">
            <div className="p-3 flex flex-wrap gap-2">
              {allCategories.map((categoryKey) => {
                const selected = filters.categories?.includes(categoryKey);
                return (
                  <Button
                    key={categoryKey}
                    type="button"
                    size="sm"
                    variant={selected ? "default" : "outline"}
                    className={selected 
                      ? "h-8 px-3 text-xs bg-gradient-to-r from-accent via-accent to-accent/80 hover:shadow-md hover:shadow-accent/30 border-accent/30 transition-all" 
                      : "h-8 px-3 text-xs border-accent/20 hover:bg-accent/10 hover:border-accent/30 hover:text-accent transition-all"
                    }
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
          <Label className="text-sm font-semibold flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-accent to-accent/50 rounded-full" />
            Départements
          </Label>
          <ScrollArea className="h-32 rounded-lg border border-accent/30 bg-gradient-to-br from-card/80 to-card/40 shadow-sm">
            <div className="p-3 flex flex-wrap gap-2">
              {allDepartments.map((deptCode) => {
                const selected = filters.departments?.includes(deptCode);
                return (
                  <Button
                    key={deptCode}
                    type="button"
                    size="sm"
                    variant={selected ? "default" : "outline"}
                    className={selected 
                      ? "h-8 px-3 text-xs bg-gradient-to-r from-accent via-accent to-accent/80 hover:shadow-md hover:shadow-accent/30 border-accent/30 transition-all" 
                      : "h-8 px-3 text-xs border-accent/20 hover:bg-accent/10 hover:border-accent/30 hover:text-accent transition-all"
                    }
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

