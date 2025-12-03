import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type LeadStatut = 'nouveau' | 'contacte' | 'qualifie' | 'proposition' | 'negociation' | 'gagne' | 'perdu';
export type InteractionType = 'appel' | 'email' | 'visite' | 'rdv' | 'autre';

interface LeadStatus {
  id: string;
  entreprise_id: string;
  statut: LeadStatut;
  score: number;
  notes: string | null;
}

interface Interaction {
  id: string;
  entreprise_id: string;
  type: InteractionType;
  statut: string;
  notes: string | null;
  date_interaction: string;
  date_relance: string | null;
}

export const useCRMActions = (userId: string) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getLeadStatus = useCallback(async (entrepriseId: string): Promise<LeadStatus | null> => {
    const { data, error } = await supabase
      .from('lead_statuts')
      .select('*')
      .eq('user_id', userId)
      .eq('entreprise_id', entrepriseId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching lead status:', error);
      return null;
    }
    if (!data) return null;
    return {
      id: data.id,
      entreprise_id: data.entreprise_id,
      statut: data.statut as LeadStatut,
      score: data.score || 0,
      notes: data.notes
    };
  }, [userId]);

  const updateLeadStatus = useCallback(async (entrepriseId: string, statut: LeadStatut, notes?: string) => {
    setLoading(true);
    try {
      const existing = await getLeadStatus(entrepriseId);
      
      if (existing) {
        const { error } = await supabase
          .from('lead_statuts')
          .update({ statut, notes: notes || existing.notes })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lead_statuts')
          .insert({
            user_id: userId,
            entreprise_id: entrepriseId,
            statut,
            notes
          });

        if (error) throw error;
      }

      toast({ title: 'Statut mis à jour', duration: 2000 });
      return true;
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut', variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId, getLeadStatus, toast]);

  const getInteractions = useCallback(async (entrepriseId: string): Promise<Interaction[]> => {
    const { data, error } = await supabase
      .from('lead_interactions')
      .select('*')
      .eq('user_id', userId)
      .eq('entreprise_id', entrepriseId)
      .order('date_interaction', { ascending: false });

    if (error) {
      console.error('Error fetching interactions:', error);
      return [];
    }
    return (data || []).map(d => ({
      id: d.id,
      entreprise_id: d.entreprise_id,
      type: d.type as InteractionType,
      statut: d.statut,
      notes: d.notes,
      date_interaction: d.date_interaction,
      date_relance: d.date_relance
    }));
  }, [userId]);

  const addInteraction = useCallback(async (
    entrepriseId: string,
    type: InteractionType,
    notes: string,
    dateRelance?: Date
  ) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('lead_interactions')
        .insert({
          user_id: userId,
          entreprise_id: entrepriseId,
          type,
          notes,
          date_relance: dateRelance?.toISOString()
        });

      if (error) throw error;

      // Update lead status to 'contacte' if it was 'nouveau'
      const status = await getLeadStatus(entrepriseId);
      if (!status || status.statut === 'nouveau') {
        await updateLeadStatus(entrepriseId, 'contacte');
      }

      toast({ title: 'Interaction ajoutée', duration: 2000 });
      return true;
    } catch (error) {
      console.error('Error adding interaction:', error);
      toast({ title: 'Erreur', description: 'Impossible d\'ajouter l\'interaction', variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId, getLeadStatus, updateLeadStatus, toast]);

  const getAllLeadsWithStatus = useCallback(async () => {
    const { data, error } = await supabase
      .from('lead_statuts')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching all leads:', error);
      return [];
    }
    return data || [];
  }, [userId]);

  const deleteInteraction = useCallback(async (interactionId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('lead_interactions')
        .delete()
        .eq('id', interactionId);

      if (error) throw error;

      toast({ title: 'Interaction supprimée', duration: 2000 });
      return true;
    } catch (error) {
      console.error('Error deleting interaction:', error);
      toast({ title: 'Erreur', variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    getLeadStatus,
    updateLeadStatus,
    getInteractions,
    addInteraction,
    getAllLeadsWithStatus,
    deleteInteraction
  };
};
