import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ACTIVITY_CATEGORIES, getCategoryLabel } from "@/utils/activityCategories";

interface SidebarProps {
  filters: {
    dateFrom: string;
    dateTo: string;
    categories: string[];
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

export const Sidebar = ({ filters, setFilters }: SidebarProps) => {
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

  return (
    <aside className="w-80 glass-card border-r border-accent/20 p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-accent" />
        <h2 className="text-xl font-semibold">Filtres</h2>
      </div>

      <div className="space-y-4">
        {/* Categories */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Catégories d'activité</Label>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {allCategories.map((categoryKey) => (
              <div key={categoryKey} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${categoryKey}`}
                  checked={filters.categories?.includes(categoryKey)}
                  onCheckedChange={() => handleCategoryToggle(categoryKey)}
                  className="border-accent data-[state=checked]:bg-accent data-[state=checked]:text-primary"
                />
                <label
                  htmlFor={`cat-${categoryKey}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {getCategoryLabel(categoryKey)}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-2">
          <Label htmlFor="dateFrom">Date de début</Label>
          <Input
            id="dateFrom"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            className="bg-background/50 border-border focus:border-accent"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateTo">Date de fin</Label>
          <Input
            id="dateTo"
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            className="bg-background/50 border-border focus:border-accent"
          />
        </div>

        {/* Reset Filters */}
        <Button
          variant="outline"
          className="w-full border-accent/50 hover:bg-accent/10"
          onClick={() => {
            setFilters({
              dateFrom: "",
              dateTo: "",
              categories: [],
            });
          }}
        >
          Réinitialiser
        </Button>
      </div>
    </aside>
  );
};
