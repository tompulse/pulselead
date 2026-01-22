import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { crmService, InteractionType, LeadStatus } from '@/services/crmService';
import { useToast } from '@/hooks/use-toast';

export const useCRMActions = (entrepriseId: string, userId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch CRM data
  const { data, isLoading } = useQuery({
    queryKey: ['crm', entrepriseId, userId],
    queryFn: () => crmService.getCRMData(entrepriseId, userId),
    enabled: !!entrepriseId && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Add interaction mutation
  const addInteractionMutation = useMutation({
    mutationFn: ({ type, notes }: { type: InteractionType; notes?: string }) =>
      crmService.addInteraction(entrepriseId, userId, type, notes),
    onSuccess: (result) => {
      // Invalidate only the specific CRM queries (reduced from 5 to 2 invalidations)
      queryClient.invalidateQueries({ queryKey: ['crm', entrepriseId, userId] });
      queryClient.invalidateQueries({ queryKey: ['crm-leads-with-sites'] });
      toast({
        title: result.isNew ? "Interaction ajoutée" : "Interaction mise à jour",
        description: "L'action a été enregistrée avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer l'interaction",
        variant: "destructive"
      });
    }
  });

  // Remove interaction mutation
  const removeInteractionMutation = useMutation({
    mutationFn: (type: InteractionType) =>
      crmService.removeInteraction(entrepriseId, userId, type),
    onSuccess: () => {
      // Invalidate only the specific CRM queries (reduced from 5 to 2 invalidations)
      queryClient.invalidateQueries({ queryKey: ['crm', entrepriseId, userId] });
      queryClient.invalidateQueries({ queryKey: ['crm-leads-with-sites'] });
      toast({
        title: "Interaction supprimée",
        description: "L'action a été retirée",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'interaction",
        variant: "destructive"
      });
    }
  });

  // Update lead status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: LeadStatus) =>
      crmService.updateLeadStatus(entrepriseId, userId, status),
    onSuccess: () => {
      // Invalidate only the specific CRM queries (reduced from 3 to 2 invalidations)
      queryClient.invalidateQueries({ queryKey: ['crm', entrepriseId, userId] });
      queryClient.invalidateQueries({ queryKey: ['crm-leads-with-sites'] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut du lead a été modifié",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  });

  return {
    interactions: data?.interactions || [],
    leadStatus: data?.status,
    isLoading,
    addInteraction: addInteractionMutation.mutate,
    removeInteraction: removeInteractionMutation.mutate,
    updateLeadStatus: updateStatusMutation.mutate,
    isUpdating: addInteractionMutation.isPending || removeInteractionMutation.isPending || updateStatusMutation.isPending
  };
};
