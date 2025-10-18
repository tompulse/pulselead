import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SidebarProps {
  filters: {
    department: string;
    postalCode: string;
    naf: string;
    status: string;
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
        {/* Department */}
        <div className="space-y-2">
          <Label htmlFor="department">Département</Label>
          <Input
            id="department"
            placeholder="Ex: 75, 69, 13"
            value={filters.department}
            onChange={(e) => handleFilterChange("department", e.target.value)}
            className="bg-background/50 border-border focus:border-accent"
          />
        </div>

        {/* Postal Code */}
        <div className="space-y-2">
          <Label htmlFor="postalCode">Code postal</Label>
          <Input
            id="postalCode"
            placeholder="Ex: 75001"
            value={filters.postalCode}
            onChange={(e) => handleFilterChange("postalCode", e.target.value)}
            className="bg-background/50 border-border focus:border-accent"
          />
        </div>

        {/* NAF Code */}
        <div className="space-y-2">
          <Label htmlFor="naf">Code NAF</Label>
          <Input
            id="naf"
            placeholder="Ex: 6201Z"
            value={filters.naf}
            onChange={(e) => handleFilterChange("naf", e.target.value)}
            className="bg-background/50 border-border focus:border-accent"
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Statut</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="bg-background/50 border-border focus:border-accent">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="creation">Création</SelectItem>
              <SelectItem value="cession">Cession</SelectItem>
              <SelectItem value="fermeture">Fermeture</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date From */}
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

        {/* Date To */}
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
            // Filter logic will be implemented when connecting to database
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
              department: "",
              postalCode: "",
              naf: "",
              status: "",
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
