import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { entrepriseService, EntrepriseFilters } from '@/services/entrepriseService';

export const useDashboardData = (filters: EntrepriseFilters) => {
  const queryClient = useQueryClient();

  const { data: entreprises, isLoading, error } = useQuery({
    queryKey: ['entreprises', filters],
    queryFn: () => entrepriseService.fetchEntreprises(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes - longer cache for better performance
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const enrichMutation = useMutation({
    mutationFn: (id: string) => entrepriseService.enrichEntreprise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entreprises'] });
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel('entreprises-qualif')
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'entreprises',
          filter: 'categorie_qualifiee=neq.null' // Only listen to qualification updates
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['entreprises'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    entreprises: entreprises?.data || [],
    totalCount: entreprises?.total,
    qualifiedCount: entreprises?.qualifiedCount,
    isLoading,
    error: error || entreprises?.error,
    enrichEntreprise: enrichMutation.mutate,
    isEnriching: enrichMutation.isPending
  };
};
