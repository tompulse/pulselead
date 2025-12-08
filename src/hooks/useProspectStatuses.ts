import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProspectStatusMap {
  [entrepriseId: string]: string;
}

export const useProspectStatuses = (userId: string | null, entrepriseIds: string[]) => {
  return useQuery({
    queryKey: ['prospect-statuses', userId, entrepriseIds.slice(0, 100).join(',')],
    queryFn: async (): Promise<ProspectStatusMap> => {
      if (!userId || entrepriseIds.length === 0) {
        return {};
      }

      // Limit to first 100 to avoid query size issues
      const idsToFetch = entrepriseIds.slice(0, 100);

      const { data, error } = await supabase
        .from('lead_statuts')
        .select('entreprise_id, statut')
        .eq('user_id', userId)
        .in('entreprise_id', idsToFetch);

      if (error) {
        console.error('Error fetching prospect statuses:', error);
        return {};
      }

      const statusMap: ProspectStatusMap = {};
      data?.forEach(item => {
        statusMap[item.entreprise_id] = item.statut;
      });

      return statusMap;
    },
    enabled: !!userId && entrepriseIds.length > 0,
    staleTime: 30 * 1000, // 30 seconds
  });
};
