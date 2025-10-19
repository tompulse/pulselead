import { Filter, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ACTIVITY_CATEGORIES } from "@/utils/activityCategories";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

// Convert ACTIVITY_CATEGORIES object to array for easier rendering
const activityCategories = Object.entries(ACTIVITY_CATEGORIES).map(([id, data]) => ({
  id,
  label: data.label,
  icon: data.label.split(' ')[0], // Extract emoji from label
}));

interface FilterBarProps {
  filters: {
    dateFrom: string;
    dateTo: string;
    categories: string[];
  };
  setFilters: (filters: any) => void;
}

export const FilterBar = ({ filters, setFilters }: FilterBarProps) => {
  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleCategoryToggle = (categoryId: string) => {
    const updatedCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((c) => c !== categoryId)
      : [...filters.categories, categoryId];
    setFilters({ ...filters, categories: updatedCategories });
  };

  const handleReset = () => {
    setFilters({
      dateFrom: "2025-09-01",
      dateTo: "",
      categories: [],
    });
  };

  const activeFiltersCount = filters.categories.length + 
    (filters.dateFrom ? 1 : 0) + 
    (filters.dateTo ? 1 : 0);

  return (
    <div className="glass-card border-b border-accent/20 px-6 py-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Categories Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="border-accent/50 hover:bg-accent/10"
              >
                <Filter className="w-4 h-4 mr-2" />
                Catégories d'activité
                {filters.categories.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-accent text-primary">
                    {filters.categories.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 max-h-96 overflow-y-auto glass-card border-accent/20">
              <div className="space-y-4">
                <h4 className="font-semibold text-sm mb-3">Filtrer par catégorie</h4>
                <div className="space-y-3">
                  {activityCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center space-x-3 hover:bg-accent/5 p-2 rounded-lg transition-colors"
                    >
                      <Checkbox
                        id={category.id}
                        checked={filters.categories.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                        className="border-accent/50"
                      />
                      <label
                        htmlFor={category.id}
                        className="flex items-center gap-2 text-sm cursor-pointer flex-1"
                      >
                        <span className="text-lg">{category.icon}</span>
                        <span>{category.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Date Filters */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="border-accent/50 hover:bg-accent/10"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Date de début
                {filters.dateFrom && (
                  <Badge variant="secondary" className="ml-2 bg-accent/20 text-foreground">
                    {new Date(filters.dateFrom).toLocaleDateString('fr-FR')}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto glass-card border-accent/20">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Date de début</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-accent/20 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="border-accent/50 hover:bg-accent/10"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Date de fin
                {filters.dateTo && (
                  <Badge variant="secondary" className="ml-2 bg-accent/20 text-foreground">
                    {new Date(filters.dateTo).toLocaleDateString('fr-FR')}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto glass-card border-accent/20">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Date de fin</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-accent/20 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Reset Button */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-accent hover:bg-accent/10"
          >
            <X className="w-4 h-4 mr-2" />
            Réinitialiser ({activeFiltersCount})
          </Button>
        )}
      </div>
    </div>
  );
};
