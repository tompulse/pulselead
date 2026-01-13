import { supabase } from "@/integrations/supabase/client";

export type InteractionType = 'appel' | 'email' | 'visite' | 'rdv';
export type LeadStatus = 'nouveau' | 'contacte' | 'qualifie' | 'proposition' | 'negociation' | 'gagne' | 'perdu';

export const crmService = {
  async addInteraction(
    entrepriseId: string, 
    userId: string, 
    type: InteractionType,
    notes?: string,
    dateRelance?: string
  ) {
    try {
      // Check if interaction already exists
      const { data: existing } = await supabase
        .from('lead_interactions')
        .select('id')
        .eq('entreprise_id', entrepriseId)
        .eq('user_id', userId)
        .eq('type', type)
        .single();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('lead_interactions')
          .update({ 
            notes,
            date_relance: dateRelance || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return { data, error: null, isNew: false };
      } else {
        // Create new
        const { data, error } = await supabase
          .from('lead_interactions')
          .insert([{
            entreprise_id: entrepriseId,
            user_id: userId,
            type,
            statut: 'en_cours' as const,
            notes,
            date_relance: dateRelance || null
          }])
          .select()
          .single();

        if (error) throw error;
        return { data, error: null, isNew: true };
      }
    } catch (error) {
      console.error('Error adding interaction:', error);
      return { data: null, error, isNew: false };
    }
  },

  async removeInteraction(entrepriseId: string, userId: string, type: InteractionType) {
    try {
      const { error } = await supabase
        .from('lead_interactions')
        .delete()
        .eq('entreprise_id', entrepriseId)
        .eq('user_id', userId)
        .eq('type', type);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error removing interaction:', error);
      return { error };
    }
  },

  async getInteractionHistory(entrepriseId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('lead_interactions')
        .select('*')
        .eq('entreprise_id', entrepriseId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching interactions:', error);
      return { data: [], error };
    }
  },

  async updateLeadStatus(entrepriseId: string, userId: string, status: LeadStatus) {
    try {
      // Check if status exists
      const { data: existing } = await supabase
        .from('lead_statuts')
        .select('id')
        .eq('entreprise_id', entrepriseId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Update
        const { data, error } = await supabase
          .from('lead_statuts')
          .update({ 
            statut_actuel: status,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      } else {
        // Create
        const { data, error } = await supabase
          .from('lead_statuts')
          .insert({
            entreprise_id: entrepriseId,
            user_id: userId,
            statut_actuel: status
          })
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      return { data: null, error };
    }
  },

  async getLeadStatus(entrepriseId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('lead_statuts')
        .select('*')
        .eq('entreprise_id', entrepriseId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data: data || null, error: null };
    } catch (error) {
      console.error('Error fetching lead status:', error);
      return { data: null, error };
    }
  },

  async getCRMData(entrepriseId: string, userId: string) {
    try {
      const [interactions, status] = await Promise.all([
        this.getInteractionHistory(entrepriseId, userId),
        this.getLeadStatus(entrepriseId, userId)
      ]);

      return {
        interactions: interactions.data,
        status: status.data,
        error: interactions.error || status.error
      };
    } catch (error) {
      console.error('Error fetching CRM data:', error);
      return { interactions: [], status: null, error };
    }
  }
};
