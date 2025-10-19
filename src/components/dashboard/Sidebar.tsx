import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SidebarProps {
  filters: {
    dateFrom: string;
    dateTo: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

export const Sidebar = ({ filters, setFilters }: SidebarProps) => {
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <aside className="w-80 glass-card border-r border-accent/20 p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-accent" />
        <h2 className="text-xl font-semibold">Filtres</h2>
      </div>

      <div className="space-y-4">
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

        {/* Apply Filters Button */}
        <Button
          className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold"
          onClick={() => {
            console.log("Applying filters:", filters);
          }}
        >
          Appliquer les filtres
        </Button>

        {/* Reset Filters */}
        <Button
          variant="outline"
          className="w-full border-accent/50 hover:bg-accent/10"
          onClick={() => {
            setFilters({
              dateFrom: "",
              dateTo: "",
            });
          }}
        >
          Réinitialiser
        </Button>
      </div>
    </aside>
  );
};
