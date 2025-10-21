import { useState } from "react";
import { MapIcon, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapView } from "./MapView";
import { ListView } from "./ListView";

interface ProspectsViewProps {
  filters: {
    dateFrom: string;
    dateTo: string;
    categories: string[];
    departments: string[];
  };
  userId: string;
  onEntrepriseSelect?: (entreprise: any) => void;
  selectionMode?: boolean;
  selectedEntreprises?: any[];
  onToggleSelection?: (entreprise: any) => void;
}

export const ProspectsView = ({
  filters,
  userId,
  onEntrepriseSelect,
  selectionMode = false,
  selectedEntreprises = [],
  onToggleSelection,
}: ProspectsViewProps) => {
  const [viewMode, setViewMode] = useState<'carte' | 'liste'>('carte');

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toggle Bar */}
      <div className="glass-card border-b border-accent/20 px-4 py-2.5 shrink-0 flex items-center justify-between">
        <h2 className="text-base font-bold gradient-text flex items-center gap-2">
          <div className="p-1.5 bg-accent/10 rounded-lg">
            {viewMode === 'carte' ? <MapIcon className="h-4 w-4 text-accent" /> : <List className="h-4 w-4 text-accent" />}
          </div>
          Prospects
        </h2>
        
        <div className="flex gap-1 p-0.5 bg-card/50 rounded-lg border border-accent/20">
          <Button
            variant={viewMode === "carte" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("carte")}
            className={`h-7 px-3 text-xs ${viewMode === "carte" ? "bg-accent text-primary hover:bg-accent/90" : "hover:bg-accent/10"}`}
          >
            <MapIcon className="w-3.5 h-3.5 mr-1.5" />
            Carte
          </Button>
          <Button
            variant={viewMode === "liste" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("liste")}
            className={`h-7 px-3 text-xs ${viewMode === "liste" ? "bg-accent text-primary hover:bg-accent/90" : "hover:bg-accent/10"}`}
          >
            <List className="w-3.5 h-3.5 mr-1.5" />
            Liste
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'carte' ? (
          <MapView
            filters={filters}
            onEntrepriseSelect={onEntrepriseSelect}
            selectionMode={selectionMode}
            selectedEntreprises={selectedEntreprises}
            onToggleSelection={onToggleSelection}
          />
        ) : (
          <ListView
            filters={filters}
            onEntrepriseSelect={onEntrepriseSelect}
            selectionMode={selectionMode}
            selectedEntreprises={selectedEntreprises}
            onToggleSelection={onToggleSelection}
          />
        )}
      </div>
    </div>
  );
};
