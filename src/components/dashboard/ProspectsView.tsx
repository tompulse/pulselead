import { List } from "lucide-react";
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
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="glass-card border-b border-accent/20 px-4 py-2.5 shrink-0 flex items-center">
        <h2 className="text-base font-bold gradient-text flex items-center gap-2">
          <div className="p-1.5 bg-accent/10 rounded-lg">
            <List className="h-4 w-4 text-accent" />
          </div>
          Prospects
        </h2>
      </div>

      {/* Content - Liste uniquement */}
      <div className="flex-1 overflow-hidden min-h-0">
        <ListView
          filters={filters}
          onEntrepriseSelect={onEntrepriseSelect}
          selectionMode={selectionMode}
          selectedEntreprises={selectedEntreprises}
          onToggleSelection={onToggleSelection}
        />
      </div>
    </div>
  );
};
