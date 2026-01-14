import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FilterCounts {
  nafSections: Record<string, number>;
  nafDivisions: Record<string, number>;
  nafGroupes: Record<string, number>;
  nafClasses: Record<string, number>;
  nafSousClasses: Record<string, number>;
  departments: Record<string, number>;
  taillesEntreprise: Record<string, number>;
  categoriesJuridiques: Record<string, number>;
  typesEtablissement: Record<string, number>;
}

interface FiltersInput {
  nafSections?: string[];
  nafDivisions?: string[];
  departments?: string[];
  taillesEntreprise?: string[];
  categoriesJuridiques?: string[];
  typesEtablissement?: string[];
  searchQuery?: string;
}

export function useAvailableNouveauxSitesFilters(filters: FiltersInput = {}) {
  return useQuery({
    queryKey: [
      'nouveaux-sites-available-filters-dynamic',
      filters.nafSections || [],
      filters.nafDivisions || [],
      filters.departments || [],
      filters.taillesEntreprise || [],
      filters.categoriesJuridiques || [],
      filters.typesEtablissement || [],
      filters.searchQuery || ''
    ],
    queryFn: async (): Promise<FilterCounts> => {
      // Use the dynamic PostgreSQL function for contextual counts
      const { data, error } = await supabase.rpc('get_nouveaux_sites_filter_counts_dynamic', {
        p_naf_sections: filters.nafSections?.length ? filters.nafSections : null,
        p_naf_divisions: filters.nafDivisions?.length ? filters.nafDivisions : null,
        p_departments: filters.departments?.length ? filters.departments : null,
        p_tailles: filters.taillesEntreprise?.length ? filters.taillesEntreprise : null,
        p_categories_juridiques: filters.categoriesJuridiques?.length ? filters.categoriesJuridiques : null,
        p_types_etablissement: filters.typesEtablissement?.length ? filters.typesEtablissement : null,
        p_search_query: filters.searchQuery?.trim() || null
      });
      
      if (error) {
        console.error('Error fetching dynamic filter counts:', error);
        throw error;
      }

      return {
        nafSections: (data as any)?.nafSections || {},
        nafDivisions: (data as any)?.nafDivisions || {},
        nafGroupes: (data as any)?.nafGroupes || {},
        nafClasses: (data as any)?.nafClasses || {},
        nafSousClasses: (data as any)?.nafSousClasses || {},
        departments: (data as any)?.departments || {},
        taillesEntreprise: (data as any)?.taillesEntreprise || {},
        categoriesJuridiques: (data as any)?.categoriesJuridiques || {},
        typesEtablissement: (data as any)?.typesEtablissement || {},
      };
    },
    staleTime: 30000, // 30 secondes
    gcTime: 60000,
  });
}
