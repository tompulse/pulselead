import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FilterCounts {
  categories: Record<string, number>;
  departments: Record<string, number>;
  nafCodes: Record<string, number>;
  formesJuridiques: Record<string, number>;
  taillesEntreprise: Record<string, number>;
}

export function useAvailableNouveauxSitesFilters(currentFilters: {
  categories?: string[];
  departments?: string[];
  codesNaf?: string[];
  formesJuridiques?: string[];
  taillesEntreprise?: string[];
  searchQuery?: string;
}) {
  return useQuery({
    queryKey: ['nouveaux-sites-available-filters', currentFilters],
    queryFn: async (): Promise<FilterCounts> => {
      // Get categories count
      const categoriesPromise = supabase
        .from('nouveaux_sites')
        .select('categorie_detaillee')
        .not('categorie_detaillee', 'is', null);

      // Get departments count  
      const departmentsPromise = supabase
        .from('nouveaux_sites')
        .select('code_postal')
        .not('code_postal', 'is', null);

      // Get tailles count
      const taillesPromise = supabase
        .from('nouveaux_sites')
        .select('categorie_entreprise')
        .not('categorie_entreprise', 'is', null);

      const [categoriesResult, departmentsResult, taillesResult] = await Promise.all([
        categoriesPromise,
        departmentsPromise,
        taillesPromise
      ]);

      // Count categories
      const categories: Record<string, number> = {};
      (categoriesResult.data || []).forEach((row) => {
        if (row.categorie_detaillee) {
          categories[row.categorie_detaillee] = (categories[row.categorie_detaillee] || 0) + 1;
        }
      });

      // Count departments (first 2 digits of postal code)
      const departments: Record<string, number> = {};
      (departmentsResult.data || []).forEach((row) => {
        if (row.code_postal) {
          const dept = row.code_postal.substring(0, 2);
          departments[dept] = (departments[dept] || 0) + 1;
        }
      });

      // Count tailles
      const taillesEntreprise: Record<string, number> = {};
      (taillesResult.data || []).forEach((row) => {
        if (row.categorie_entreprise) {
          taillesEntreprise[row.categorie_entreprise] = (taillesEntreprise[row.categorie_entreprise] || 0) + 1;
        }
      });

      return {
        categories,
        departments,
        nafCodes: {},
        formesJuridiques: {},
        taillesEntreprise
      };
    },
    staleTime: 60000, // 1 minute cache
    gcTime: 120000,
  });
}
