import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FilterCounts {
  categories: Record<string, number>;
  departments: Record<string, number>;
  nafCodes: Record<string, number>;
}

export function useAvailableNouveauxSitesFilters(currentFilters: {
  categories?: string[];
  departments?: string[];
  codesNaf?: string[];
  searchQuery?: string;
}) {
  return useQuery({
    queryKey: ['nouveaux-sites-available-filters', currentFilters],
    queryFn: async (): Promise<FilterCounts> => {
      const { data, error } = await supabase.rpc('get_nouveaux_sites_filter_counts', {
        p_categories: currentFilters.categories?.length ? currentFilters.categories : null,
        p_departments: currentFilters.departments?.length ? currentFilters.departments : null,
        p_codes_naf: currentFilters.codesNaf?.length ? currentFilters.codesNaf : null,
        p_search_query: currentFilters.searchQuery?.trim() || null
      });

      if (error) throw error;

      const result = data as unknown as {
        categories: Record<string, number>;
        departments: Record<string, number>;
        nafCodes: Record<string, number>;
      };

      return {
        categories: result?.categories || {},
        departments: result?.departments || {},
        nafCodes: result?.nafCodes || {}
      };
    },
    staleTime: 30000,
    gcTime: 60000,
  });
}
