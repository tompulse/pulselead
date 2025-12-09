import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Filter, ChevronDown } from "lucide-react";
import { NafFilters } from "./NafFilters";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MobileFiltersBarProps {
  filters: any;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  resultsCount?: number;
  totalCount?: number;
}

export const MobileFiltersBar = ({
  filters,
  setFilters,
  resultsCount = 0,
  totalCount = 0
}: MobileFiltersBarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Compter les filtres actifs
  const activeFiltersCount = 
    (filters.nafSections?.length || 0) + 
    (filters.nafDivisions?.length || 0) +
    (filters.nafGroupes?.length || 0) +
    (filters.nafClasses?.length || 0) +
    (filters.nafSousClasses?.length || 0) +
    (filters.departments?.length || 0) +
    (filters.taillesEntreprise?.length || 0);

  return (
    <div className="lg:hidden flex items-center gap-2 p-3 bg-card/80 backdrop-blur-sm border-b border-accent/20">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 justify-between border-accent/30 hover:bg-accent/10 hover:border-accent/50"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-accent" />
              <span>Filtres</span>
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="bg-accent text-primary text-xs px-1.5 py-0 h-5 min-w-[20px]"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-2xl">
          <SheetHeader className="p-4 pb-2 border-b border-accent/20">
            <SheetTitle className="text-lg font-bold gradient-text">
              Filtres
            </SheetTitle>
            <p className="text-sm text-muted-foreground">
              {resultsCount.toLocaleString()} résultats sur {totalCount.toLocaleString()}
            </p>
          </SheetHeader>
          <ScrollArea className="h-[calc(85vh-80px)]">
            <NafFilters
              filters={filters}
              setFilters={setFilters}
              resultsCount={resultsCount}
              totalCount={totalCount}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
      
      {/* Afficher le nombre de résultats */}
      <div className="text-xs text-muted-foreground whitespace-nowrap">
        {resultsCount.toLocaleString()} sites
      </div>
    </div>
  );
};
