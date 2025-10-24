import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entrepriseService, EntrepriseFilters } from '@/services/entrepriseService';

export const useDashboardData = (filters: EntrepriseFilters) => {
  const queryClient = useQueryClient();

  const { data: entreprises, isLoading, error } = useQuery({
    queryKey: ['entreprises', filters],
    queryFn: () => entrepriseService.fetchEntreprises(filters),
    staleTime: 30 * 1000, // 30 seconds - refresh frequently to show qualified enterprises
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
  });

  const enrichMutation = useMutation({
    mutationFn: (id: string) => entrepriseService.enrichEntreprise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entreprises'] });
    }
  });

  return {
    entreprises: entreprises?.data || [],
    totalCount: entreprises?.total,
    isLoading,
    error: error || entreprises?.error,
    enrichEntreprise: enrichMutation.mutate,
    isEnriching: enrichMutation.isPending
  };
};
