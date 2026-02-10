import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FilterCounts {
  nafSections: Record<string, number>;
  nafDivisions: Record<string, number>;
  nafGroupes: Record<string, number>;
  nafClasses: Record<string, number>;
  nafSousClasses: Record<string, number>;
  departments: Record<string, number>;
  categoriesJuridiques: Record<string, number>;
  typesEtablissement: Record<string, number>;
}

interface DualFilterCounts {
  contextual: FilterCounts;
  global: FilterCounts;
}

interface FiltersInput {
  nafSections?: string[];
  nafDivisions?: string[];
  departments?: string[];
  categoriesJuridiques?: string[];
  typesEtablissement?: string[];
  searchQuery?: string;
}

const emptyFilterCounts: FilterCounts = {
  nafSections: {},
  nafDivisions: {},
  nafGroupes: {},
  nafClasses: {},
  nafSousClasses: {},
  departments: {},
  categoriesJuridiques: {},
  typesEtablissement: {},
};

export function useAvailableNouveauxSitesFilters(filters: FiltersInput = {}) {
  return useQuery({
    queryKey: [
      'nouveaux-sites-available-filters-dual',
      filters.nafSections || [],
      filters.nafDivisions || [],
      filters.departments || [],
      filters.categoriesJuridiques || [],
      filters.typesEtablissement || [],
      filters.searchQuery || ''
    ],
    queryFn: async (): Promise<DualFilterCounts> => {
      const emptyDual: DualFilterCounts = { contextual: emptyFilterCounts, global: emptyFilterCounts };
      try {
      // Fetch both contextual (with filters) and global (without filters) counts in parallel
      const hasActiveFilters = 
        (filters.nafSections?.length || 0) > 0 ||
        (filters.nafDivisions?.length || 0) > 0 ||
        (filters.departments?.length || 0) > 0 ||
        (filters.categoriesJuridiques?.length || 0) > 0 ||
        (filters.typesEtablissement?.length || 0) > 0 ||
        (filters.searchQuery?.trim() || '').length > 0;

      const [contextualResult, globalResult] = await Promise.all([
        // Contextual counts (with all filters applied)
        supabase.rpc('get_nouveaux_sites_filter_counts_dynamic', {
          p_naf_sections: filters.nafSections?.length ? filters.nafSections : null,
          p_naf_divisions: filters.nafDivisions?.length ? filters.nafDivisions : null,
          p_departments: filters.departments?.length ? filters.departments : null,
          p_categories_juridiques: filters.categoriesJuridiques?.length ? filters.categoriesJuridiques : null,
          p_types_etablissement: filters.typesEtablissement?.length ? filters.typesEtablissement : null,
          p_search_query: filters.searchQuery?.trim() || null
        }),
        // Global counts (no filters) - only fetch if we have active filters
        hasActiveFilters 
          ? supabase.rpc('get_nouveaux_sites_filter_counts_dynamic', {
              p_naf_sections: null,
              p_naf_divisions: null,
              p_departments: null,
              p_tailles: null,
              p_categories_juridiques: null,
              p_types_etablissement: null,
              p_search_query: null
            })
          : Promise.resolve({ data: null, error: null })
      ]);
      
      if (contextualResult.error) {
        console.warn('RPC get_nouveaux_sites_filter_counts_dynamic non disponible:', contextualResult.error.message);
        return { contextual: emptyFilterCounts, global: emptyFilterCounts };
      }

      const contextual: FilterCounts = {
        nafSections: (contextualResult.data as any)?.nafSections || {},
        nafDivisions: (contextualResult.data as any)?.nafDivisions || {},
        nafGroupes: (contextualResult.data as any)?.nafGroupes || {},
        nafClasses: (contextualResult.data as any)?.nafClasses || {},
        nafSousClasses: (contextualResult.data as any)?.nafSousClasses || {},
        departments: (contextualResult.data as any)?.departments || {},
        categoriesJuridiques: (contextualResult.data as any)?.categoriesJuridiques || {},
        typesEtablissement: (contextualResult.data as any)?.typesEtablissement || {},
      };

      // If no active filters, global = contextual
      const global: FilterCounts = hasActiveFilters && globalResult?.data ? {
        nafSections: (globalResult.data as any)?.nafSections || {},
        nafDivisions: (globalResult.data as any)?.nafDivisions || {},
        nafGroupes: (globalResult.data as any)?.nafGroupes || {},
        nafClasses: (globalResult.data as any)?.nafClasses || {},
        nafSousClasses: (globalResult.data as any)?.nafSousClasses || {},
        departments: (globalResult.data as any)?.departments || {},
        categoriesJuridiques: (globalResult.data as any)?.categoriesJuridiques || {},
        typesEtablissement: (globalResult.data as any)?.typesEtablissement || {},
      } : contextual;

      return { contextual, global };
      } catch {
        return emptyDual;
      }
    },
    staleTime: 0, // Force refresh immediately
    gcTime: 0,
  });
}
