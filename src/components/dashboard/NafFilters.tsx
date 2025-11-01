import { useState } from "react";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NAF_CATEGORIES } from "@/utils/nafCategories";
import { Search, Building2, ChevronDown, X } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAdminStatus } from "@/hooks/useAdminStatus";

interface NafFiltersProps {
  filters: {
    searchQuery?: string;
    codesNaf?: string[];
    departments?: string[];
    categoriesEntreprise?: string[];
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  resultsCount?: number;
  totalCount?: number;
}

export const NafFilters = ({ 
  filters, 
  setFilters,
  resultsCount = 0,
  totalCount = 0
}: NafFiltersProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [categoriesEntrepriseOpen, setCategoriesEntrepriseOpen] = useState(false);
  const [departmentsOpen, setDepartmentsOpen] = useState(false);
  
  const { isAdmin } = useAdminStatus();

  const handleNafToggle = (codePrefix: string) => {
    setFilters((prev: any) => {
      const currentCodes = prev.codesNaf || [];
      const isSelected = currentCodes.includes(codePrefix);
      
      return {
        ...prev,
        codesNaf: isSelected
          ? currentCodes.filter((c: string) => c !== codePrefix)
          : [...currentCodes, codePrefix]
      };
    });
  };

  const handleCategorieEntrepriseToggle = (categorie: string) => {
    setFilters((prev: any) => {
      const current = prev.categoriesEntreprise || [];
      const isSelected = current.includes(categorie);
      
      return {
        ...prev,
        categoriesEntreprise: isSelected
          ? current.filter((c: string) => c !== categorie)
          : [...current, categorie]
      };
    });
  };

  const handleDepartmentToggle = (dept: string) => {
    setFilters((prev: any) => {
      const current = prev.departments || [];
      const isSelected = current.includes(dept);
      
      return {
        ...prev,
        departments: isSelected
          ? current.filter((d: string) => d !== dept)
          : [...current, dept]
      };
    });
  };

  const clearFilters = () => setFilters((prev: any) => ({ 
    ...prev, 
    codesNaf: [], 
    departments: [],
    categoriesEntreprise: [],
    searchQuery: ""
  }));

  const activeFiltersCount = 
    (filters.codesNaf?.length || 0) + 
    (filters.departments?.length || 0) +
    (filters.categoriesEntreprise?.length || 0);

  return (
    <div className="space-y-0">
      {/* Barre de recherche */}
      <div className="p-4 border-b border-accent/20 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un site..."
            value={filters.searchQuery || ""}
            onChange={(e) => setFilters((prev: any) => ({ ...prev, searchQuery: e.target.value }))}
            className="pl-9 h-9 bg-background/50 border-accent/20 focus:border-accent/40"
          />
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="w-4 h-4 text-accent" />
            <span className="font-medium text-foreground">{resultsCount.toLocaleString('fr-FR')}</span>
            <span>/ {totalCount.toLocaleString('fr-FR')} site{totalCount > 1 ? 's' : ''}</span>
          </div>
        )}
        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="w-full h-8 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Effacer les filtres ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Catégories d'entreprise (GE/PME/ETI) */}
      <Collapsible open={categoriesEntrepriseOpen} onOpenChange={setCategoriesEntrepriseOpen} className="border-b border-accent/20">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
          <span className="font-medium text-sm">Taille entreprise</span>
          <ChevronDown className={`h-4 w-4 text-accent transition-transform ${categoriesEntrepriseOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4">
          <div className="space-y-1 mt-2">
            {[
              { key: 'GE', label: '🏢 Grande Entreprise (GE)' },
              { key: 'ETI', label: '🏭 ETI (Entreprise de Taille Intermédiaire)' },
              { key: 'PME', label: '🏪 PME (Petite et Moyenne Entreprise)' }
            ].map(({ key, label }) => {
              const selected = filters.categoriesEntreprise?.includes(key);
              return (
                <div
                  key={key}
                  onClick={() => handleCategorieEntrepriseToggle(key)}
                  className="flex items-center gap-3 cursor-pointer hover:bg-accent/10 p-2.5 rounded transition-colors active:scale-[0.98]"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                    selected ? 'bg-accent border-accent' : 'border-accent/30'
                  }`}>
                    {selected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                  </div>
                  <span className="text-sm leading-tight">{label}</span>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Secteurs d'activité NAF */}
      <div className="border-b border-accent/20">
        <div className="px-4 py-3">
          <Label className="font-medium text-sm">Secteurs d'activité NAF</Label>
        </div>
        <ScrollArea className="h-[calc(100vh-400px)] overscroll-contain">
          <div className="px-4 pb-4 space-y-1">
            {Object.entries(NAF_CATEGORIES).map(([categoryKey, category]) => {
              const isExpanded = expandedCategories[categoryKey];
              const selectedInCategory = category.codes.filter(code => 
                filters.codesNaf?.includes(code.code)
              ).length;

              return (
                <div key={categoryKey} className="border-b border-accent/10 last:border-0 pb-2">
                  {/* En-tête de catégorie */}
                  <div
                    onClick={() => setExpandedCategories(prev => ({ ...prev, [categoryKey]: !isExpanded }))}
                    className="flex items-center gap-2 cursor-pointer hover:bg-accent/5 p-2 rounded transition-colors"
                  >
                    <ChevronDown className={`h-4 w-4 text-accent transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                    <span className="text-lg">{category.emoji}</span>
                    <span className="text-sm font-medium flex-1">{category.label}</span>
                    {selectedInCategory > 0 && (
                      <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                        {selectedInCategory}
                      </span>
                    )}
                  </div>

                  {/* Codes NAF de la catégorie */}
                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {category.codes.map((code) => {
                        const selected = filters.codesNaf?.includes(code.code);
                        return (
                          <div
                            key={code.code}
                            onClick={() => handleNafToggle(code.code)}
                            className="flex items-start gap-2 cursor-pointer hover:bg-accent/10 p-2 rounded transition-colors active:scale-[0.98]"
                          >
                            <div className={`w-4 h-4 mt-0.5 rounded border-2 flex items-center justify-center shrink-0 ${
                              selected ? 'bg-accent border-accent' : 'border-accent/30'
                            }`}>
                              {selected && <div className="w-2 h-2 bg-white rounded-sm" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-mono text-accent">{code.code}</div>
                              <div className="text-xs text-muted-foreground leading-tight">{code.label}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
