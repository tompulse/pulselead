import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ACTIVITY_HIERARCHY } from "@/utils/activitySubcategories";
import { normalizeSubcategoryId } from "@/utils/activitySubcategories";

export interface AvailableSubcategory {
  id: string;
  label: string;
  emoji: string;
  categoryKey: string;
  categoryLabel: string;
}

export function useAvailableSubcategories() {
  const [availableSubcategories, setAvailableSubcategories] = useState<AvailableSubcategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAvailableSubcategories() {
      try {
        // Récupérer toutes les sous-catégories uniques de la base de données
        const { data, error } = await supabase
          .from('entreprises')
          .select('sous_categorie')
          .not('sous_categorie', 'is', null);

        if (error) throw error;

        // Extraire les sous-catégories uniques et les normaliser
        const uniqueSubcategories = new Set<string>();
        data?.forEach((row) => {
          if (row.sous_categorie) {
            const normalized = normalizeSubcategoryId(row.sous_categorie);
            if (normalized) {
              uniqueSubcategories.add(normalized);
            }
          }
        });

        // Mapper avec les données de ACTIVITY_HIERARCHY
        const subcategoriesWithDetails: AvailableSubcategory[] = [];
        
        Object.entries(ACTIVITY_HIERARCHY).forEach(([categoryKey, categoryData]) => {
          categoryData.subcategories.forEach((subcategory) => {
            if (uniqueSubcategories.has(subcategory.id)) {
              subcategoriesWithDetails.push({
                id: subcategory.id,
                label: subcategory.label,
                emoji: subcategory.emoji,
                categoryKey,
                categoryLabel: categoryData.label,
              });
            }
          });
        });

        setAvailableSubcategories(subcategoriesWithDetails);
      } catch (error) {
        console.error('Error fetching available subcategories:', error);
        setAvailableSubcategories([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAvailableSubcategories();
  }, []);

  // Grouper par catégorie pour l'affichage
  const groupedByCategory = availableSubcategories.reduce((acc, subcategory) => {
    if (!acc[subcategory.categoryKey]) {
      acc[subcategory.categoryKey] = {
        label: subcategory.categoryLabel,
        subcategories: [],
      };
    }
    acc[subcategory.categoryKey].subcategories.push(subcategory);
    return acc;
  }, {} as Record<string, { label: string; subcategories: AvailableSubcategory[] }>);

  return { 
    availableSubcategories, 
    groupedByCategory, 
    loading 
  };
}
