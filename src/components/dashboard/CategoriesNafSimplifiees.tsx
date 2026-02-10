import { useState, useMemo } from 'react';
import { ChevronDown, Layers, Search, X } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { DETAILED_CATEGORIES } from '@/utils/detailedCategories';

// Emojis pour les grands secteurs
const SECTOR_EMOJIS: Record<string, string> = {
  'Agriculture': '🌾',
  'Alimentaire': '🍞',
  'Textile & Mode': '👕',
  'BTP & Construction': '🏗️',
  'Automobile': '🚗',
  'Commerce & Distribution': '🛒',
  'Hôtellerie & Restauration': '🍽️',
  'Transport & Logistique': '🚚',
  'Informatique & Digital': '💻',
  'Finance & Immobilier': '💰',
  'Juridique & Conseil': '⚖️',
  'Architecture & Ingénierie': '📐',
  'Enseignement & Formation': '🎓',
  'Santé & Médical': '🏥',
  'Services personnels': '💇',
  'Sport & Loisirs': '🏋️',
  'Culture & Spectacle': '🎭',
  'Énergie': '⚡',
  'Services aux Entreprises': '💼',
  'Industrie & Production': '🏭',
  'Autres': '🔄'
};

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
  const [open, setOpen] = useState(false); // FERMÉ par défaut
  const [searchQuery, setSearchQuery] = useState("");

  // Grouper les catégories par secteur
  const groupedCategories = useMemo(() => {
    const groups: Record<string, typeof DETAILED_CATEGORIES> = {
      'Agriculture': [],
      'Alimentaire': [],
      'Textile & Mode': [],
      'BTP & Construction': [],
      'Automobile': [],
      'Commerce & Distribution': [],
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
      'Services aux Entreprises': [],
      'Industrie & Production': [],
      'Autres': []
    };

    DETAILED_CATEGORIES.forEach(cat => {
      if (cat.key.startsWith('agriculture-')) groups['Agriculture'].push(cat);
      else if (cat.key.startsWith('alimentaire-')) groups['Alimentaire'].push(cat);
      else if (cat.key.startsWith('textile-')) groups['Textile & Mode'].push(cat);
      else if (cat.key.startsWith('btp-')) groups['BTP & Construction'].push(cat);
      else if (cat.key.startsWith('auto-')) groups['Automobile'].push(cat);
      else if (cat.key.startsWith('commerce-') || cat.key.startsWith('gros-')) groups['Commerce & Distribution'].push(cat);
      else if (cat.key.startsWith('resto-') || cat.key.startsWith('hotellerie-')) groups['Hôtellerie & Restauration'].push(cat);
      else if (cat.key.startsWith('transport-')) groups['Transport & Logistique'].push(cat);
      else if (cat.key.startsWith('info-')) groups['Informatique & Digital'].push(cat);
      else if (cat.key.startsWith('finance-') || cat.key.startsWith('immo-')) groups['Finance & Immobilier'].push(cat);
      else if (cat.key.startsWith('juridique-') || cat.key.startsWith('conseil-')) groups['Juridique & Conseil'].push(cat);
      else if (cat.key.startsWith('archi-')) groups['Architecture & Ingénierie'].push(cat);
      else if (cat.key.startsWith('formation-')) groups['Enseignement & Formation'].push(cat);
      else if (cat.key.startsWith('sante-')) groups['Santé & Médical'].push(cat);
      else if (cat.key.startsWith('service-coiffeur') || cat.key.startsWith('service-esthetique') || cat.key.startsWith('service-pressing') || cat.key.startsWith('service-reparation')) {
        groups['Services personnels'].push(cat);
      }
      else if (cat.key.startsWith('sport-') || cat.key.startsWith('loisirs-')) groups['Sport & Loisirs'].push(cat);
      else if (cat.key.startsWith('culture-')) groups['Culture & Spectacle'].push(cat);
      else if (cat.key.startsWith('energie-')) groups['Énergie'].push(cat);
      else if (cat.key === 'service-interim' || cat.key === 'service-nettoyage' || cat.key === 'service-securite' || cat.key === 'service-publicite') {
        groups['Services aux Entreprises'].push(cat);
      }
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
      if (groupName.toLowerCase().includes(query)) {
        filtered[groupName] = categories;
      }
    });

    return filtered;
  }, [groupedCategories, searchQuery]);

  // Toggle tout un secteur (toutes les sous-catégories)
  const handleToggleSector = (categories: typeof DETAILED_CATEGORIES) => {
    const categoryKeys = categories.map(c => c.key);
    const allSelected = categoryKeys.every(key => selectedCategories.includes(key));

    if (allSelected) {
      // Désélectionner toutes les catégories de ce secteur
      onCategoriesChange(selectedCategories.filter(c => !categoryKeys.includes(c)));
    } else {
      // Sélectionner toutes les catégories de ce secteur
      const newSelected = [...selectedCategories];
      categoryKeys.forEach(key => {
        if (!newSelected.includes(key)) {
          newSelected.push(key);
        }
      });
      onCategoriesChange(newSelected);
    }
  };

  // Compter combien de secteurs sont sélectionnés
  const selectedSectorsCount = Object.entries(groupedCategories).filter(([_, categories]) => {
    const categoryKeys = categories.map(c => c.key);
    return categoryKeys.some(key => selectedCategories.includes(key));
  }).length;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b border-accent/20">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent" />
          <div className="flex flex-col items-start">
            <span className="font-medium text-sm">Secteur d'activité</span>
            {selectedSectorsCount > 0 && (
              <span className="text-xs text-accent">
                {selectedSectorsCount} secteur{selectedSectorsCount > 1 ? 's' : ''} sélectionné{selectedSectorsCount > 1 ? 's' : ''}
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
              placeholder="Rechercher un secteur..."
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

          {/* Grands secteurs UNIQUEMENT */}
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(filteredGroups).map(([groupName, categories]) => {
              const groupCount = categories.reduce((sum, cat) => sum + (categoryCounts[cat.key] || 0), 0);
              const categoryKeys = categories.map(c => c.key);
              const allSelected = categoryKeys.every(key => selectedCategories.includes(key));
              const someSelected = categoryKeys.some(key => selectedCategories.includes(key));
              const isSelected = someSelected;

              return (
                <div
                  key={groupName}
                  onClick={() => handleToggleSector(categories)}
                  className={`
                    group relative cursor-pointer rounded-lg p-3 transition-all duration-200
                    ${isSelected 
                      ? 'bg-gradient-to-r from-accent/20 to-accent/10 border-2 border-accent/50 shadow-sm' 
                      : 'bg-muted/30 hover:bg-accent/10 border-2 border-transparent hover:border-accent/30'
                    }
                  `}
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Emoji */}
                    <div className={`
                      text-2xl transition-transform group-hover:scale-110 shrink-0
                      ${isSelected ? 'animate-pulse' : ''}
                    `}>
                      {SECTOR_EMOJIS[groupName] || '📊'}
                    </div>
                    
                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`
                          font-semibold text-sm leading-tight
                          ${isSelected ? 'text-accent' : 'text-foreground'}
                        `}>
                          {groupName}
                        </h4>
                        
                        {/* Compteur masqué */}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1 leading-tight">
                        {categories.length} catégorie{categories.length > 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Checkbox visuel */}
                    <div className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all
                      ${isSelected 
                        ? 'bg-accent border-accent' 
                        : 'border-muted-foreground/30 group-hover:border-accent/50'
                      }
                    `}>
                      {allSelected && (
                        <div className="w-2.5 h-2.5 bg-white rounded-sm" />
                      )}
                      {someSelected && !allSelected && (
                        <div className="w-2.5 h-0.5 bg-white rounded-sm" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {Object.keys(filteredGroups).length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Aucun secteur trouvé
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
