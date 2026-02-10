import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CATEGORIES_NAF_SIMPLIFIEES, getDivisionsForCategorie } from '@/utils/nafCategoriesSimplifiees';

interface CategoriesNafSimplifiedProps {
  selectedDivisions: string[];
  onDivisionsChange: (divisions: string[]) => void;
}

export const CategoriesNafSimplifiees = ({
  selectedDivisions,
  onDivisionsChange
}: CategoriesNafSimplifiedProps) => {
  const [open, setOpen] = useState(false);

  const handleCategorieToggle = (categorieId: string) => {
    const categorieDivisions = getDivisionsForCategorie(categorieId);
    
    // Vérifier si toutes les divisions de cette catégorie sont déjà sélectionnées
    const allSelected = categorieDivisions.every(div => selectedDivisions.includes(div));
    
    if (allSelected) {
      // Désélectionner toutes les divisions de cette catégorie
      const newDivisions = selectedDivisions.filter(div => !categorieDivisions.includes(div));
      onDivisionsChange(newDivisions);
    } else {
      // Sélectionner toutes les divisions de cette catégorie
      const newDivisions = [...new Set([...selectedDivisions, ...categorieDivisions])];
      onDivisionsChange(newDivisions);
    }
  };

  const isCategorieSelected = (categorieId: string) => {
    const categorieDivisions = getDivisionsForCategorie(categorieId);
    return categorieDivisions.some(div => selectedDivisions.includes(div));
  };

  const selectedCategoriesCount = CATEGORIES_NAF_SIMPLIFIEES.filter(cat => 
    isCategorieSelected(cat.id)
  ).length;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b border-accent/20">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/5 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏢</span>
          <div className="flex flex-col items-start">
            <span className="font-medium text-sm">Secteur d'activité</span>
            {selectedCategoriesCount > 0 && (
              <span className="text-xs text-accent">
                {selectedCategoriesCount} {selectedCategoriesCount > 1 ? 'sélectionnés' : 'sélectionné'}
              </span>
            )}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-accent transition-transform ${open ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="px-4 pb-4 pt-2">
          <div className="grid grid-cols-1 gap-2">
            {CATEGORIES_NAF_SIMPLIFIEES.map((categorie) => {
              const isSelected = isCategorieSelected(categorie.id);
              const categorieDivisions = getDivisionsForCategorie(categorie.id);
              const selectedCount = categorieDivisions.filter(div => 
                selectedDivisions.includes(div)
              ).length;
              const isPartiallySelected = selectedCount > 0 && selectedCount < categorieDivisions.length;
              
              return (
                <div
                  key={categorie.id}
                  onClick={() => handleCategorieToggle(categorie.id)}
                  className={`
                    group relative cursor-pointer rounded-lg p-3 transition-all duration-200
                    ${isSelected 
                      ? 'bg-gradient-to-r from-accent/20 to-accent/10 border-2 border-accent/50 shadow-sm' 
                      : 'bg-muted/30 hover:bg-accent/10 border-2 border-transparent hover:border-accent/30'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Emoji */}
                    <div className={`
                      text-2xl transition-transform group-hover:scale-110
                      ${isSelected ? 'animate-pulse' : ''}
                    `}>
                      {categorie.emoji}
                    </div>
                    
                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`
                          font-semibold text-sm leading-tight
                          ${isSelected ? 'text-accent' : 'text-foreground'}
                        `}>
                          {categorie.label}
                        </h4>
                        
                        {/* Checkbox visuel */}
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all
                          ${isSelected 
                            ? 'bg-accent border-accent' 
                            : isPartiallySelected
                            ? 'bg-accent/30 border-accent'
                            : 'border-muted-foreground/30 group-hover:border-accent/50'
                          }
                        `}>
                          {isSelected && (
                            <div className="w-2.5 h-2.5 bg-white rounded-sm" />
                          )}
                          {isPartiallySelected && !isSelected && (
                            <div className="w-2.5 h-0.5 bg-accent rounded-sm" />
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1 leading-tight">
                        {categorie.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
