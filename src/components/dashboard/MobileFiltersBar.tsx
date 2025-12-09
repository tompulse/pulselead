import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Filter, ChevronDown, Route, Calendar as CalendarIcon } from "lucide-react";
import { NafFilters } from "./NafFilters";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface MobileFiltersBarProps {
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
}

export const MobileFiltersBar = ({
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
  isOptimizing = false
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
    <div className="lg:hidden space-y-2 p-3 bg-card/80 backdrop-blur-sm border-b border-accent/20">
      {/* Bouton création tournée - Mobile */}
      {onToggleTournee && (
        <div className="space-y-2">
          <Button
            onClick={onToggleTournee}
            variant={tourneeActive ? "default" : "outline"}
            className={`w-full ${
              tourneeActive 
                ? "bg-gradient-to-r from-accent to-accent/80 hover:shadow-md hover:shadow-accent/30 text-primary" 
                : "border-accent/30 hover:bg-accent/10 hover:border-accent/50"
            } transition-all h-9`}
            size="sm"
          >
            <Route className="w-4 h-4 mr-2" />
            {tourneeActive ? "Mode tournée actif" : "Créer une tournée"}
          </Button>
          
          {/* Formulaire tournée - Mobile */}
          {tourneeActive && setTourneeName && setTourneeDate && onOptimize && (
            <div className="space-y-2 p-3 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent rounded-lg border border-accent/30">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="mobile-tournee-name" className="text-xs font-semibold text-accent">Nom</Label>
                  <Input
                    id="mobile-tournee-name"
                    placeholder="Ex: Tournée Sud"
                    value={tourneeName}
                    onChange={(e) => setTourneeName(e.target.value)}
                    className="h-8 text-xs border-accent/30"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="mobile-tournee-date" className="text-xs font-semibold text-accent">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-8 text-xs justify-start font-normal border-accent/30"
                      >
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {tourneeDate ? format(new Date(tourneeDate), "dd/MM") : "Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={tourneeDate ? new Date(tourneeDate) : undefined}
                        onSelect={(date) => setTourneeDate(date ? format(date, "yyyy-MM-dd") : "")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedCount > 0 && (
                  <div className="text-xs bg-accent/10 text-accent font-semibold rounded px-2 py-1 border border-accent/20">
                    {selectedCount} sélectionné(s)
                  </div>
                )}
                <Button
                  onClick={onOptimize}
                  disabled={selectedCount < 2 || isOptimizing}
                  className="flex-1 h-8 text-xs bg-gradient-to-r from-accent to-accent/80 disabled:opacity-50"
                  size="sm"
                >
                  <Route className="w-3 h-3 mr-1" />
                  {isOptimizing ? "..." : "Optimiser"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Barre filtres */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-between border-accent/30 hover:bg-accent/10 hover:border-accent/50"
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
    </div>
  );
};
