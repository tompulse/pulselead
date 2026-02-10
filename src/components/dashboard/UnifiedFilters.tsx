import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CategoryFilters } from "./CategoryFilters";
import { NafFilters } from "./NafFilters";
import { useCategoryCounts } from "@/hooks/useCategoryCounts";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UnifiedFiltersProps {
  filters: any;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  resultsCount?: number;
  totalCount?: number;
  tourneeActive?: boolean;
  onToggleTournee?: () => void;
  tourneeName?: string;
  setTourneeName?: (name: string) => void;
  tourneeDate?: string;
  setTourneeDate?: (date: string) => void;
  selectedCount?: number;
  onOptimize?: () => void;
  isOptimizing?: boolean;
  startAddress?: string;
  startLat?: number;
  startLng?: number;
  onStartPointChange?: (address: string, lat: number, lng: number) => void;
}

export const UnifiedFilters = ({
  filters,
  setFilters,
  resultsCount = 0,
  totalCount = 0,
  tourneeActive,
  onToggleTournee,
  tourneeName,
  setTourneeName,
  tourneeDate,
  setTourneeDate,
  selectedCount = 0,
  onOptimize,
  isOptimizing = false,
  startAddress,
  startLat,
  startLng,
  onStartPointChange
}: UnifiedFiltersProps) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'naf'>('categories');

  // Compter les prospects par catégorie (en excluant le filtre categories lui-même)
  const { data: categoryCounts = {} } = useCategoryCounts({
    ...filters,
    categories: undefined // Exclure pour avoir le compteur global par catégorie
  });

  const handleCategoriesChange = (categories: string[]) => {
    setFilters((prev: any) => ({
      ...prev,
      categories: categories.length > 0 ? categories : undefined,
      // Réinitialiser les filtres NAF quand on utilise les catégories
      nafSections: undefined,
      nafDivisions: undefined,
      nafGroupes: undefined,
      nafClasses: undefined,
      nafSousClasses: undefined
    }));
  };

  const selectedCategories = filters.categories || [];
  const hasNafFilters = 
    (filters.nafSections?.length || 0) > 0 ||
    (filters.nafDivisions?.length || 0) > 0 ||
    (filters.nafGroupes?.length || 0) > 0 ||
    (filters.nafClasses?.length || 0) > 0 ||
    (filters.nafSousClasses?.length || 0) > 0;

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center justify-between mb-3">
        <Label className="text-sm font-semibold">Filtres d'activité</Label>
        <div className="text-xs text-muted-foreground">
          {resultsCount} résultat{resultsCount > 1 ? 's' : ''}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'categories' | 'naf')} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-3 shrink-0">
          <TabsTrigger value="categories" className="text-xs">
            Catégories
            {selectedCategories.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                {selectedCategories.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="naf" className="text-xs">
            Codes NAF avancés
            {hasNafFilters && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                •
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="m-0 flex-1 overflow-hidden">
          <CategoryFilters
            selectedCategories={selectedCategories}
            onCategoriesChange={handleCategoriesChange}
            categoryCounts={categoryCounts}
            totalCount={totalCount}
          />
        </TabsContent>

        <TabsContent value="naf" className="m-0 flex-1 overflow-hidden">
          <div className="h-full">
            <NafFilters
              filters={filters}
              setFilters={setFilters}
              resultsCount={resultsCount}
              totalCount={totalCount}
              tourneeActive={tourneeActive}
              onToggleTournee={onToggleTournee}
              tourneeName={tourneeName}
              setTourneeName={setTourneeName}
              tourneeDate={tourneeDate}
              setTourneeDate={setTourneeDate}
              selectedCount={selectedCount}
              onOptimize={onOptimize}
              isOptimizing={isOptimizing}
              startAddress={startAddress}
              startLat={startLat}
              startLng={startLng}
              onStartPointChange={onStartPointChange}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
