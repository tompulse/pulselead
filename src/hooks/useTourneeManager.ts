import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTourneeManager = (userId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedEntreprises, setSelectedEntreprises] = useState<any[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Fetch tournees
  const { data: tournees = [], isLoading } = useQuery({
    queryKey: ['tournees', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournees')
        .select('*')
        .eq('user_id', userId)
        .order('date_planifiee', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId
  });

  // Create tournee mutation
  const createTourneeMutation = useMutation({
    mutationFn: async ({ nom, date, entreprises }: { nom: string; date: string; entreprises: any[] }) => {
      const { data, error } = await supabase
        .from('tournees')
        .insert({
          user_id: userId,
          nom,
          date_planifiee: date,
          entreprises_ids: entreprises.map(e => e.id),
          ordre_optimise: entreprises.map(e => e.id),
          statut: 'planifiee'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournees', userId] });
      toast({
        title: "Tournée créée",
        description: "La tournée a été enregistrée avec succès"
      });
      setSelectedEntreprises([]);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la tournée",
        variant: "destructive"
      });
    }
  });

  // Optimize tournee
  const optimizeTournee = async (entreprises: any[], userLat: number, userLng: number) => {
    setIsOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('optimize-tournee', {
        body: {
          entreprises: entreprises.map(e => ({
            id: e.id,
            nom: e.nom,
            latitude: e.latitude,
            longitude: e.longitude,
            adresse: e.adresse
          })),
          point_depart: { latitude: userLat, longitude: userLng }
        }
      });

      if (error) throw error;
      
      return {
        optimizedOrder: data.optimized_route || [],
        distance: data.total_distance_km || 0,
        time: data.estimated_time_minutes || 0
      };
    } catch (error) {
      console.error('Optimization error:', error);
      toast({
        title: "Erreur d'optimisation",
        description: "Impossible d'optimiser la tournée",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsOptimizing(false);
    }
  };

  // Delete tournee mutation
  const deleteTourneeMutation = useMutation({
    mutationFn: async (tourneeId: string) => {
      const { error } = await supabase
        .from('tournees')
        .delete()
        .eq('id', tourneeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournees', userId] });
      toast({
        title: "Tournée supprimée",
        description: "La tournée a été supprimée"
      });
    }
  });

  const toggleEntreprise = (entreprise: any) => {
    setSelectedEntreprises(prev => {
      const exists = prev.find(e => e.id === entreprise.id);
      if (exists) {
        return prev.filter(e => e.id !== entreprise.id);
      }
      return [...prev, entreprise];
    });
  };

  const isSelected = (id: string) => {
    return selectedEntreprises.some(e => e.id === id);
  };

  return {
    tournees,
    isLoading,
    selectedEntreprises,
    isOptimizing,
    toggleEntreprise,
    isSelected,
    clearSelection: () => setSelectedEntreprises([]),
    createTournee: createTourneeMutation.mutate,
    optimizeTournee,
    deleteTournee: deleteTourneeMutation.mutate,
    isCreating: createTourneeMutation.isPending
  };
};
