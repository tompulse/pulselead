import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { entrepriseService, EntrepriseFilters } from '@/services/entrepriseService';

export const useDashboardData = (filters: EntrepriseFilters) => {
  const queryClient = useQueryClient();

  const { 
    data, 
    isLoading, 
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['entreprises', filters],
    queryFn: ({ pageParam = 0 }) => entrepriseService.fetchEntreprises(filters, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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

  const allEntreprises = data?.pages.flatMap(page => page.data) || [];
  const totalCount = data?.pages[0]?.total || 0;

  return {
    entreprises: allEntreprises,
    totalCount,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    enrichEntreprise: enrichMutation.mutate,
    isEnriching: enrichMutation.isPending
  };
};
