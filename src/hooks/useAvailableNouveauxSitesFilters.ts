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
}

export function useAvailableNouveauxSitesFilters() {
  return useQuery({
    queryKey: ['nouveaux-sites-available-filters-v2'],
    queryFn: async (): Promise<FilterCounts> => {
      // Use the PostgreSQL function for server-side aggregation
      const { data, error } = await supabase.rpc('get_nouveaux_sites_filter_counts_v2');
      
      if (error) {
        console.error('Error fetching filter counts:', error);
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
      };
    },
    staleTime: 60000,
    gcTime: 120000,
  });
}
