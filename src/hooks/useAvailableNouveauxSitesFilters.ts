import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FilterCounts {
  nafSections: Record<string, number>;
  nafDivisions: Record<string, number>;
  departments: Record<string, number>;
  taillesEntreprise: Record<string, number>;
}

export function useAvailableNouveauxSitesFilters(currentFilters: {
  nafSections?: string[];
  nafDivisions?: string[];
  departments?: string[];
  taillesEntreprise?: string[];
  searchQuery?: string;
}) {
  return useQuery({
    queryKey: ['nouveaux-sites-available-filters', currentFilters],
    queryFn: async (): Promise<FilterCounts> => {
      // Get NAF sections count
      const sectionsPromise = supabase
        .from('nouveaux_sites')
        .select('naf_section')
        .not('naf_section', 'is', null);

      // Get NAF divisions count
      const divisionsPromise = supabase
        .from('nouveaux_sites')
        .select('naf_division')
        .not('naf_division', 'is', null);

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

      const [sectionsResult, divisionsResult, departmentsResult, taillesResult] = await Promise.all([
        sectionsPromise,
        divisionsPromise,
        departmentsPromise,
        taillesPromise
      ]);

      // Count NAF sections
      const nafSections: Record<string, number> = {};
      (sectionsResult.data || []).forEach((row: any) => {
        if (row.naf_section) {
          nafSections[row.naf_section] = (nafSections[row.naf_section] || 0) + 1;
        }
      });

      // Count NAF divisions
      const nafDivisions: Record<string, number> = {};
      (divisionsResult.data || []).forEach((row: any) => {
        if (row.naf_division) {
          nafDivisions[row.naf_division] = (nafDivisions[row.naf_division] || 0) + 1;
        }
      });

      // Count departments (first 2 digits of postal code)
      const departments: Record<string, number> = {};
      (departmentsResult.data || []).forEach((row: any) => {
        if (row.code_postal) {
          const dept = row.code_postal.substring(0, 2);
          departments[dept] = (departments[dept] || 0) + 1;
        }
      });

      // Count tailles
      const taillesEntreprise: Record<string, number> = {};
      (taillesResult.data || []).forEach((row: any) => {
        if (row.categorie_entreprise) {
          taillesEntreprise[row.categorie_entreprise] = (taillesEntreprise[row.categorie_entreprise] || 0) + 1;
        }
      });

      return {
        nafSections,
        nafDivisions,
        departments,
        taillesEntreprise
      };
    },
    staleTime: 60000,
    gcTime: 120000,
  });
}
