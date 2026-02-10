import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DETAILED_CATEGORIES } from "@/utils/detailedCategories";

interface CategoryFiltersProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  categoryCounts?: Record<string, number>;
  totalCount?: number;
}

export const CategoryFilters = ({
  selectedCategories,
  onCategoriesChange,
  categoryCounts = {},
  totalCount = 0
}: CategoryFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Grouper les catégories par secteur (basé sur l'emoji et le contexte)
  const groupedCategories = useMemo(() => {
    const groups: Record<string, typeof DETAILED_CATEGORIES> = {
      'Agriculture': [],
      'Alimentaire': [],
      'Textile & Mode': [],
      'BTP & Construction': [],
      'Automobile': [],
      'Commerce': [],
      'Hôtellerie & Restauration': [],
      'Transport & Logistique': [],
      'Informatique & Digital': [],
      'Finance & Immobilier': [],
      'Juridique & Conseil': [],
      'Architecture & Ingénierie': [],
      'Enseignement & Formation': [],
      'Santé & Médical': [],
      'Services personnels': [],
      'Sport & Loisirs': [],
      'Culture & Spectacle': [],
      'Énergie': [],
      'Services aux entreprises': [],
      'Industrie': [],
      'Autres': []
    };

    DETAILED_CATEGORIES.forEach(cat => {
      // Déterminer le groupe basé sur la clé
      if (cat.key.startsWith('agriculture-')) {
        groups['Agriculture'].push(cat);
      } else if (cat.key.startsWith('alimentaire-')) {
        groups['Alimentaire'].push(cat);
      } else if (cat.key.startsWith('textile-')) {
        groups['Textile & Mode'].push(cat);
      } else if (cat.key.startsWith('btp-')) {
        groups['BTP & Construction'].push(cat);
      } else if (cat.key.startsWith('auto-')) {
        groups['Automobile'].push(cat);
      } else if (cat.key.startsWith('commerce-') || cat.key.startsWith('gros-')) {
        groups['Commerce'].push(cat);
      } else if (cat.key.startsWith('resto-') || cat.key.startsWith('hotellerie-')) {
        groups['Hôtellerie & Restauration'].push(cat);
      } else if (cat.key.startsWith('transport-')) {
        groups['Transport & Logistique'].push(cat);
      } else if (cat.key.startsWith('info-')) {
        groups['Informatique & Digital'].push(cat);
      } else if (cat.key.startsWith('finance-') || cat.key.startsWith('immo-')) {
        groups['Finance & Immobilier'].push(cat);
      } else if (cat.key.startsWith('juridique-') || cat.key.startsWith('conseil-')) {
        groups['Juridique & Conseil'].push(cat);
      } else if (cat.key.startsWith('archi-')) {
        groups['Architecture & Ingénierie'].push(cat);
      } else if (cat.key.startsWith('formation-')) {
        groups['Enseignement & Formation'].push(cat);
      } else if (cat.key.startsWith('sante-')) {
        groups['Santé & Médical'].push(cat);
      } else if (cat.key.startsWith('service-')) {
        groups['Services personnels'].push(cat);
      } else if (cat.key.startsWith('sport-') || cat.key.startsWith('loisirs-')) {
        groups['Sport & Loisirs'].push(cat);
      } else if (cat.key.startsWith('culture-')) {
        groups['Culture & Spectacle'].push(cat);
      } else if (cat.key.startsWith('energie-')) {
        groups['Énergie'].push(cat);
      } else if (cat.key === 'service-interim' || cat.key === 'service-nettoyage' || cat.key === 'service-securite' || cat.key === 'service-publicite') {
        groups['Services aux entreprises'].push(cat);
      } else if (cat.key.startsWith('industrie-')) {
        groups['Industrie'].push(cat);
      } else {
        groups['Autres'].push(cat);
      }
    });

    // Supprimer les groupes vides
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });

    return groups;
  }, []);

  // Filtrer par recherche
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return groupedCategories;
    }

    const query = searchQuery.toLowerCase();
    const filtered: typeof groupedCategories = {};

    Object.entries(groupedCategories).forEach(([groupName, categories]) => {
      const matchingCategories = categories.filter(cat => 
        cat.label.toLowerCase().includes(query) ||
        cat.keywords.some(keyword => keyword.toLowerCase().includes(query)) ||
        groupName.toLowerCase().includes(query)
      );

      if (matchingCategories.length > 0) {
        filtered[groupName] = matchingCategories;
      }
    });

    return filtered;
  }, [groupedCategories, searchQuery]);

  const handleToggleCategory = (categoryKey: string) => {
    if (selectedCategories.includes(categoryKey)) {
      onCategoriesChange(selectedCategories.filter(c => c !== categoryKey));
    } else {
      onCategoriesChange([...selectedCategories, categoryKey]);
    }
  };

  const handleSelectAllInGroup = (categories: typeof DETAILED_CATEGORIES) => {
    const categoryKeys = categories.map(c => c.key);
    const allSelected = categoryKeys.every(key => selectedCategories.includes(key));

    if (allSelected) {
      // Désélectionner tous
      onCategoriesChange(selectedCategories.filter(c => !categoryKeys.includes(c)));
    } else {
      // Sélectionner tous
      const newSelected = [...selectedCategories];
      categoryKeys.forEach(key => {
        if (!newSelected.includes(key)) {
          newSelected.push(key);
        }
      });
      onCategoriesChange(newSelected);
    }
  };

  const handleClearAll = () => {
    onCategoriesChange([]);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold flex items-center gap-2">
          🏷️ Catégories d'activité
          {selectedCategories.length > 0 && (
            <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              {selectedCategories.length}
            </span>
          )}
        </Label>
        {selectedCategories.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-6 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Effacer
          </Button>
        )}
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Rechercher une catégorie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-9 text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Liste des catégories groupées */}
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-4 pr-3">
          {Object.entries(filteredGroups).map(([groupName, categories]) => {
            const groupCount = categories.reduce((sum, cat) => sum + (categoryCounts[cat.key] || 0), 0);
            const allSelected = categories.every(cat => selectedCategories.includes(cat.key));
            const someSelected = categories.some(cat => selectedCategories.includes(cat.key));

            return (
              <div key={groupName} className="space-y-2">
                {/* En-tête du groupe */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleSelectAllInGroup(categories)}
                    className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wide hover:text-accent/80 transition-colors"
                  >
                    <div className={`w-3.5 h-3.5 rounded border-2 transition-all ${
                      allSelected 
                        ? 'bg-accent border-accent' 
                        : someSelected
                        ? 'bg-accent/50 border-accent'
                        : 'border-accent/50'
                    } flex items-center justify-center`}>
                      {allSelected && <span className="text-primary text-[8px] font-bold">✓</span>}
                      {someSelected && !allSelected && <span className="text-primary text-[8px] font-bold">-</span>}
                    </div>
                    {groupName}
                  </button>
                  {groupCount > 0 && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {groupCount}
                    </span>
                  )}
                </div>

                {/* Catégories du groupe */}
                <div className="space-y-1.5 pl-5">
                  {categories.map(category => {
                    const count = categoryCounts[category.key] || 0;
                    const isSelected = selectedCategories.includes(category.key);

                    return (
                      <div
                        key={category.key}
                        className={`flex items-center justify-between gap-2 p-2 rounded-lg transition-colors cursor-pointer ${
                          isSelected 
                            ? 'bg-accent/10 border border-accent/20' 
                            : 'hover:bg-accent/5 border border-transparent'
                        }`}
                        onClick={() => handleToggleCategory(category.key)}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleCategory(category.key)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-sm shrink-0">{category.emoji}</span>
                          <span className="text-sm truncate">{category.label}</span>
                        </div>
                        {count > 0 && (
                          <span className="text-xs text-muted-foreground font-mono shrink-0">
                            {count}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {Object.keys(filteredGroups).length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Aucune catégorie trouvée
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
