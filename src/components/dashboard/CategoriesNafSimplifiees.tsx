import { useState, useMemo } from 'react';
import { ChevronDown, Layers, Search, X } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DETAILED_CATEGORIES } from '@/utils/detailedCategories';

interface CategoriesNafSimplifiedProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  categoryCounts?: Record<string, number>;
}

export const CategoriesNafSimplifiees = ({
  selectedCategories,
  onCategoriesChange,
  categoryCounts = {}
}: CategoriesNafSimplifiedProps) => {
  const [open, setOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Grouper les catégories par secteur
  const groupedCategories = useMemo(() => {
    const groups: Record<string, typeof DETAILED_CATEGORIES> = {
      'Agriculture': [],
      'Alimentaire': [],
      'BTP & Construction': [],
      'Commerce & Distribution': [],
      'Hôtellerie & Restauration': [],
      'Transport & Logistique': [],
      'Informatique & Digital': [],
      'Services aux Entreprises': [],
      'Santé & Médical': [],
      'Industrie & Production': [],
      'Autres': []
    };

    DETAILED_CATEGORIES.forEach(cat => {
      if (cat.key.startsWith('agriculture-')) groups['Agriculture'].push(cat);
      else if (cat.key.startsWith('alimentaire-')) groups['Alimentaire'].push(cat);
      else if (cat.key.startsWith('btp-')) groups['BTP & Construction'].push(cat);
      else if (cat.key.startsWith('commerce-') || cat.key.startsWith('gros-')) groups['Commerce & Distribution'].push(cat);
      else if (cat.key.startsWith('resto-') || cat.key.startsWith('hotellerie-')) groups['Hôtellerie & Restauration'].push(cat);
      else if (cat.key.startsWith('transport-')) groups['Transport & Logistique'].push(cat);
      else if (cat.key.startsWith('info-')) groups['Informatique & Digital'].push(cat);
      else if (cat.key === 'service-interim' || cat.key === 'service-nettoyage' || cat.key === 'service-securite' || cat.key === 'service-publicite') {
        groups['Services aux Entreprises'].push(cat);
      }
      else if (cat.key.startsWith('sante-')) groups['Santé & Médical'].push(cat);
      else if (cat.key.startsWith('industrie-')) groups['Industrie & Production'].push(cat);
      else groups['Autres'].push(cat);
    });

    // Supprimer les groupes vides
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) delete groups[key];
    });

    return groups;
  }, []);

  // Filtrer par recherche
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupedCategories;

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
      onCategoriesChange(selectedCategories.filter(c => !categoryKeys.includes(c)));
    } else {
      const newSelected = [...selectedCategories];
      categoryKeys.forEach(key => {
        if (!newSelected.includes(key)) {
          newSelected.push(key);
        }
      });
      onCategoriesChange(newSelected);
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b border-accent/20">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent" />
          <div className="flex flex-col items-start">
            <span className="font-medium text-sm">Secteur d'activité</span>
            {selectedCategories.length > 0 && (
              <span className="text-xs text-accent">
                {selectedCategories.length} {selectedCategories.length > 1 ? 'sélectionnées' : 'sélectionnée'}
              </span>
            )}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-accent transition-transform ${open ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="px-4 pb-4 pt-2 space-y-3">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher..."
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

          {/* Groupes de catégories */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {Object.entries(filteredGroups).map(([groupName, categories]) => {
              const groupCount = categories.reduce((sum, cat) => sum + (categoryCounts[cat.key] || 0), 0);
              const allSelected = categories.every(cat => selectedCategories.includes(cat.key));
              const someSelected = categories.some(cat => selectedCategories.includes(cat.key));

              return (
                <div key={groupName} className="space-y-2">
                  {/* En-tête du groupe */}
                  <button
                    onClick={() => handleSelectAllInGroup(categories)}
                    className="flex items-center justify-between w-full text-left hover:bg-accent/5 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
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
                      <span className="text-xs font-semibold text-accent uppercase tracking-wide">{groupName}</span>
                    </div>
                    {groupCount > 0 && (
                      <span className="text-xs text-muted-foreground font-mono">{groupCount}</span>
                    )}
                  </button>

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
                            <span className="text-xs text-muted-foreground font-mono shrink-0">{count}</span>
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
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
