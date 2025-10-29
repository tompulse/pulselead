import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FilterCounts {
  categories: Record<string, number>;
  departments: Record<string, number>;
  formes: Record<string, number>;
}

export function useAvailableFilters(currentFilters: {
  categories?: string[];
  departments?: string[];
  formesJuridiques?: string[];
  searchQuery?: string;
}) {
  return useQuery({
    queryKey: ['available-filters', currentFilters],
    queryFn: async (): Promise<FilterCounts> => {
      // Call the RPC function with current filters
      const { data, error } = await supabase.rpc('get_filter_counts', {
        p_categories: currentFilters.categories?.length ? currentFilters.categories : null,
        p_departments: currentFilters.departments?.length ? currentFilters.departments : null,
        p_formes: currentFilters.formesJuridiques?.length ? currentFilters.formesJuridiques : null,
        p_search_query: currentFilters.searchQuery?.trim() || null
      });

      if (error) throw error;

      const result = data as unknown as {
        categories: Record<string, number>;
        departments: Record<string, number>;
        formes: Record<string, number>;
      };

      return {
        categories: result?.categories || {},
        departments: result?.departments || {},
        formes: result?.formes || {}
      };
    },
    staleTime: 30000, // 30 seconds cache
    gcTime: 60000, // 1 minute garbage collection time
  });
}
