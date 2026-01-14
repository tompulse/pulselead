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
import { AddressSearchInput } from "./AddressSearchInput";

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
  startAddress?: string;
  startLat?: number;
  startLng?: number;
  onStartPointChange?: (address: string, lat: number, lng: number) => void;
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
  isOptimizing = false,
  startAddress,
  startLat,
  startLng,
  onStartPointChange
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
    (filters.taillesEntreprise?.length || 0) +
    (filters.categoriesJuridiques?.length || 0) +
    (filters.typesEtablissement?.length || 0);

  return (
    <div className="lg:hidden space-y-1.5 p-2 bg-card/80 backdrop-blur-sm border-b border-accent/20">
      {/* Bouton création tournée - Mobile - Plus compact */}
      {onToggleTournee && (
        <div className="space-y-1.5">
          <Button
            onClick={onToggleTournee}
            variant={tourneeActive ? "default" : "outline"}
            className={`w-full ${
              tourneeActive 
                ? "bg-gradient-to-r from-accent to-accent/80 hover:shadow-md hover:shadow-accent/30 text-primary" 
                : "border-accent/30 hover:bg-accent/10 hover:border-accent/50"
            } transition-all h-8 text-xs`}
            size="sm"
          >
            <Route className="w-3.5 h-3.5 mr-1.5" />
            {tourneeActive ? "Mode tournée actif" : "Créer une tournée"}
          </Button>
          
          {/* Formulaire tournée - Mobile - Plus compact */}
          {tourneeActive && setTourneeName && setTourneeDate && onOptimize && (
            <div className="space-y-2 p-2 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent rounded-lg border border-accent/30">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Nom tournée"
                  value={tourneeName}
                  onChange={(e) => setTourneeName(e.target.value)}
                  className="flex-1 h-7 text-xs border-accent/30"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-7 text-xs px-2 font-normal border-accent/30"
                    >
                      <CalendarIcon className="h-3 w-3 mr-1" />
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
              
              {/* Point de départ - Mobile */}
              {onStartPointChange && (
                <AddressSearchInput
                  onAddressSelect={onStartPointChange}
                  selectedAddress={startAddress}
                  selectedLat={startLat}
                  selectedLng={startLng}
                />
              )}
              
              <div className="flex items-center gap-1.5">
                {selectedCount > 0 && (
                  <div className="text-xs bg-accent/10 text-accent font-semibold rounded px-1.5 py-0.5 border border-accent/20">
                    {selectedCount} site(s)
                  </div>
                )}
                <Button
                  onClick={onOptimize}
                  disabled={selectedCount < 2 || isOptimizing}
                  className="flex-1 h-7 text-xs bg-gradient-to-r from-accent to-accent/80 disabled:opacity-50"
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
