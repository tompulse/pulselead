import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { BUILDING_TYPES, ZONE_TYPES, getBuildingTypeLabel, getZoneTypeLabel } from "@/utils/buildingTypes";
import { DEPARTMENT_NAMES } from "@/utils/regionsData";
import { Route, ChevronDown, Search, Building2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TourneeFiltersProps {
  filters: {
    dateFrom: string;
    dateTo: string;
    buildingTypes?: string[];
    zoneTypes?: string[];
    departments: string[];
    searchQuery?: string;
    typeEvenement?: string[];
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  // Tournée props
  tourneeActive?: boolean;
  onToggleTournee?: () => void;
  tourneeName?: string;
  setTourneeName?: (name: string) => void;
  tourneeDate?: string;
  setTourneeDate?: (date: string) => void;
  selectedCount?: number;
  onOptimize?: () => void;
  isOptimizing?: boolean;
  // Results count
  resultsCount?: number;
}

export const TourneeFilters = ({ 
  filters, 
  setFilters,
  tourneeActive = false,
  onToggleTournee,
  tourneeName = "",
  setTourneeName,
  tourneeDate = "",
  setTourneeDate,
  selectedCount = 0,
  onOptimize,
  isOptimizing = false,
  resultsCount = 0
}: TourneeFiltersProps) => {
  const [buildingTypesOpen, setBuildingTypesOpen] = useState(false);
  const [zoneTypesOpen, setZoneTypesOpen] = useState(false);
  const [departmentsOpen, setDepartmentsOpen] = useState(false);
  const [datesOpen, setDatesOpen] = useState(false);
  const [typeEvenementOpen, setTypeEvenementOpen] = useState(false);
  
  const handleBuildingTypeToggle = (typeKey: string) => {
    setFilters((prev: any) => {
      const currentTypes = prev.buildingTypes || [];
      const isSelected = currentTypes.includes(typeKey);
      
      return {
        ...prev,
        buildingTypes: isSelected
          ? currentTypes.filter((t: string) => t !== typeKey)
          : [...currentTypes, typeKey]
      };
    });
  };

  const handleZoneTypeToggle = (zoneKey: string) => {
    setFilters((prev: any) => {
      const currentZones = prev.zoneTypes || [];
      const isSelected = currentZones.includes(zoneKey);
      
      return {
        ...prev,
        zoneTypes: isSelected
          ? currentZones.filter((z: string) => z !== zoneKey)
          : [...currentZones, zoneKey]
      };
    });
  };

  const handleDepartmentToggle = (deptCode: string) => {
    setFilters((prev: any) => {
      const currentDepartments = prev.departments || [];
      const isSelected = currentDepartments.includes(deptCode);
      
      return {
        ...prev,
        departments: isSelected
          ? currentDepartments.filter((d: string) => d !== deptCode)
          : [...currentDepartments, deptCode]
      };
    });
  };

  const handleTypeEvenementToggle = (type: string) => {
    setFilters((prev: any) => {
      const currentTypes = prev.typeEvenement || [];
      const isSelected = currentTypes.includes(type);
      
      return {
        ...prev,
        typeEvenement: isSelected
          ? currentTypes.filter((t: string) => t !== type)
          : [...currentTypes, type]
      };
    });
  };

  const clearFilters = () => setFilters((prev: any) => ({ 
    ...prev, 
    buildingTypes: [],
    zoneTypes: [],
    departments: [], 
    typeEvenement: [],
    searchQuery: ""
  }));

  const allDepartments = Object.keys(DEPARTMENT_NAMES).sort();

  const activeFiltersCount = 
    (filters.buildingTypes?.length || 0) + 
    (filters.zoneTypes?.length || 0) +
    (filters.departments?.length || 0) +
    (filters.typeEvenement?.length || 0);

  return (
    <div className="space-y-0">
        {/* Barre de recherche */}
        <div className="p-4 border-b border-accent/20 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              value={filters.searchQuery || ""}
              onChange={(e) => setFilters((prev: any) => ({ ...prev, searchQuery: e.target.value }))}
              className="pl-9 h-9 bg-background/50 border-accent/20 focus:border-accent/40"
            />
          </div>
          {resultsCount !== undefined && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4 text-accent" />
              <span className="font-medium text-foreground">{resultsCount.toLocaleString('fr-FR')}</span>
              <span>local{resultsCount > 1 ? 'aux' : ''} qualifié{resultsCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Création de tournée */}
        {onToggleTournee && (
          <Collapsible open={tourneeActive} onOpenChange={onToggleTournee} className="border-b border-accent/20">
            <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors group">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-accent" />
                <span className="font-medium text-sm">Créer une tournée</span>
                {selectedCount > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-accent/20 text-accent border-accent/30 text-xs">
                    {selectedCount}
                  </Badge>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 text-accent transition-transform ${tourneeActive ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            
            <CollapsibleContent className="px-4 pb-4">
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="tournee-name" className="text-xs">
                    Nom de la tournée
                  </Label>
                  <Input
                    id="tournee-name"
                    value={tourneeName}
                    onChange={(e) => setTourneeName?.(e.target.value)}
                    placeholder="Ex: Tournée Paris"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tournee-date" className="text-xs">
                    Date
                  </Label>
                  <DatePicker
                    date={tourneeDate ? new Date(tourneeDate) : undefined}
                    onSelect={(date) => setTourneeDate?.(date ? date.toISOString().split('T')[0] : "")}
                    placeholder="Sélectionner"
                    className="h-9"
                  />
                </div>

                {selectedCount > 0 && (
                  <Button
                    onClick={onOptimize}
                    disabled={selectedCount < 2 || !tourneeName.trim() || isOptimizing}
                    className="w-full bg-gradient-to-r from-accent to-accent/80"
                    size="sm"
                  >
                    {isOptimizing ? "Optimisation..." : `Optimiser (${selectedCount})`}
                  </Button>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Type de bâtiment */}
        <Collapsible open={buildingTypesOpen} onOpenChange={setBuildingTypesOpen} className="border-b border-accent/20">
          <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
            <span className="font-medium text-sm">🏗️ Type de bâtiment</span>
            <ChevronDown className={`h-4 w-4 text-accent transition-transform ${buildingTypesOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="px-4 pb-4">
            <ScrollArea className="h-64 mt-2 overscroll-contain">
              <div className="space-y-1 pr-4">
                {Object.keys(BUILDING_TYPES).map((typeKey) => {
                  const selected = filters.buildingTypes?.includes(typeKey);
                  return (
                    <div
                      key={typeKey}
                      onClick={() => handleBuildingTypeToggle(typeKey)}
                      className="flex items-center gap-3 cursor-pointer hover:bg-accent/10 p-2.5 rounded transition-colors active:scale-[0.98]"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                        selected ? 'bg-accent border-accent' : 'border-accent/30'
                      }`}>
                        {selected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                      </div>
                      <span className="text-sm leading-tight">
                        {getBuildingTypeLabel(typeKey)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>

        {/* Zone géographique */}
        <Collapsible open={zoneTypesOpen} onOpenChange={setZoneTypesOpen} className="border-b border-accent/20">
          <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
            <span className="font-medium text-sm">🗺️ Zone géographique</span>
            <ChevronDown className={`h-4 w-4 text-accent transition-transform ${zoneTypesOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="px-4 pb-4">
            <div className="space-y-1 mt-2 pr-4">
              {Object.keys(ZONE_TYPES).map((zoneKey) => {
                const selected = filters.zoneTypes?.includes(zoneKey);
                return (
                  <div
                    key={zoneKey}
                    onClick={() => handleZoneTypeToggle(zoneKey)}
                    className="flex items-center gap-3 cursor-pointer hover:bg-accent/10 p-2.5 rounded transition-colors active:scale-[0.98]"
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                      selected ? 'bg-accent border-accent' : 'border-accent/30'
                    }`}>
                      {selected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                    </div>
                    <span className="text-sm leading-tight">
                      {getZoneTypeLabel(zoneKey)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Départements */}
        <Collapsible open={departmentsOpen} onOpenChange={setDepartmentsOpen} className="border-b border-accent/20">
          <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
            <span className="font-medium text-sm">📍 Départements</span>
            <ChevronDown className={`h-4 w-4 text-accent transition-transform ${departmentsOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="px-4 pb-4">
            <ScrollArea className="h-64 mt-2 overscroll-contain">
              <div className="space-y-1 pr-4">
                {allDepartments.map((deptCode) => {
                  const selected = filters.departments?.includes(deptCode);
                  return (
                    <div
                      key={deptCode}
                      onClick={() => handleDepartmentToggle(deptCode)}
                      className="flex items-center gap-3 cursor-pointer hover:bg-accent/10 p-2.5 rounded transition-colors active:scale-[0.98]"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                        selected ? 'bg-accent border-accent' : 'border-accent/30'
                      }`}>
                        {selected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                      </div>
                      <span className="text-sm leading-tight">
                        {deptCode} - {DEPARTMENT_NAMES[deptCode]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>

        {/* Type d'événement */}
        <Collapsible open={typeEvenementOpen} onOpenChange={setTypeEvenementOpen} className="border-b border-accent/20">
          <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
            <span className="font-medium text-sm">📋 Type d'événement</span>
            <ChevronDown className={`h-4 w-4 text-accent transition-transform ${typeEvenementOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="px-4 pb-4">
            <div className="space-y-1 mt-2">
              {[
                { key: 'immatriculation', label: '📋 Immatriculation (transfert de siège)' },
                { key: 'creation', label: '🆕 Création d\'entreprise' },
                { key: 'cession', label: '💼 Vente / Cession de fonds' }
              ].map(({ key, label }) => {
                const selected = filters.typeEvenement?.includes(key);
                return (
                  <div
                    key={key}
                    onClick={() => handleTypeEvenementToggle(key)}
                    className="flex items-center gap-3 cursor-pointer hover:bg-accent/10 p-2.5 rounded transition-colors active:scale-[0.98]"
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                      selected ? 'bg-accent border-accent' : 'border-accent/30'
                    }`}>
                      {selected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                    </div>
                    <span className="text-sm leading-tight">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Dates */}
        <Collapsible open={datesOpen} onOpenChange={setDatesOpen} className="border-b border-accent/20">
          <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
            <span className="font-medium text-sm">📅 Dates</span>
            <ChevronDown className={`h-4 w-4 text-accent transition-transform ${datesOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="px-4 pb-4">
            <div className="space-y-3 mt-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Du</Label>
                <DatePicker
                  date={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                  onSelect={(date) => setFilters((prev: any) => ({ ...prev, dateFrom: date?.toISOString().split('T')[0] || '' }))}
                  placeholder="Date début"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Au</Label>
                <DatePicker
                  date={filters.dateTo ? new Date(filters.dateTo) : undefined}
                  onSelect={(date) => setFilters((prev: any) => ({ ...prev, dateTo: date?.toISOString().split('T')[0] || '' }))}
                  placeholder="Date fin"
                  className="h-9"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

      {/* Footer with reset button */}
      {activeFiltersCount > 0 && (
        <div className="p-4 border-t border-accent/20">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters}
            className="w-full border-accent/30 hover:bg-accent/10"
          >
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
};
