import { useMemo } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDebounce } from "@/hooks/useDebounce";
import { OptimizedListView } from "./OptimizedListView";

interface ListViewProps {
  filters: {
    dateFrom: string;
    dateTo: string;
    categories: string[];
    departments: string[];
    formesJuridiques?: string[];
    searchQuery?: string;
    typeEvenement?: string[];
    activiteDefinie?: boolean | null;
  };
  onEntrepriseSelect?: (entreprise: any) => void;
  selectionMode?: boolean;
  selectedEntreprises?: any[];
  onToggleSelection?: (entreprise: any) => void;
}

export const ListView = ({ 
  filters, 
  onEntrepriseSelect,
  selectionMode = false,
  selectedEntreprises = [],
  onToggleSelection
}: ListViewProps) => {
  const { entreprises, isLoading: loading } = useDashboardData(filters);
  const debouncedSearchQuery = useDebounce(filters.searchQuery || "", 300);

  const filteredEntreprises = useMemo(() => {
    if (!debouncedSearchQuery) return entreprises;
    
    const query = debouncedSearchQuery.toLowerCase();
    return entreprises.filter((ent) => 
      ent.nom?.toLowerCase().includes(query) ||
      ent.ville?.toLowerCase().includes(query) ||
      ent.code_postal?.includes(query) ||
      ent.activite?.toLowerCase().includes(query) ||
      ent.forme_juridique?.toLowerCase().includes(query)
    );
  }, [entreprises, debouncedSearchQuery]);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-12 flex items-center justify-center shadow-2xl border border-accent/20">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground font-medium">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <OptimizedListView
      entreprises={filteredEntreprises}
      onEntrepriseSelect={onEntrepriseSelect}
      selectionMode={selectionMode}
      selectedEntreprises={selectedEntreprises}
      onToggleSelection={onToggleSelection}
    />
  );
};
