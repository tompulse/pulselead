import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entrepriseService, EntrepriseFilters } from '@/services/entrepriseService';

export const useDashboardData = (filters: EntrepriseFilters) => {
  const queryClient = useQueryClient();

  const { data: entreprises, isLoading, error } = useQuery({
    queryKey: ['entreprises', filters],
    queryFn: () => entrepriseService.fetchEntreprises(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  const enrichMutation = useMutation({
    mutationFn: (id: string) => entrepriseService.enrichEntreprise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entreprises'] });
    }
  });

  return {
    entreprises: entreprises?.data || [],
    isLoading,
    error: error || entreprises?.error,
    enrichEntreprise: enrichMutation.mutate,
    isEnriching: enrichMutation.isPending
  };
};
