import { supabase } from "@/integrations/supabase/client";

export interface EntrepriseFilters {
  dateFrom?: string;
  dateTo?: string;
  categories?: string[];
  departments?: string[];
}

export const entrepriseService = {
  async fetchEntreprises(filters: EntrepriseFilters = {}) {
    try {
      let query = supabase
        .from('entreprises')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.dateFrom) {
        query = query.gte('date_demarrage', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('date_demarrage', filters.dateTo);
      }
      if (filters.departments && filters.departments.length > 0) {
        query = query.in('code_postal', filters.departments.map(d => d));
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Filter by categories client-side (if needed)
      let filteredData = data || [];
      if (filters.categories && filters.categories.length > 0) {
        filteredData = filteredData.filter(e => 
          filters.categories!.some(cat => e.activite?.toLowerCase().includes(cat.toLowerCase()))
        );
      }

      return { data: filteredData, error: null };
    } catch (error) {
      console.error('Error fetching entreprises:', error);
      return { data: null, error };
    }
  },

  async fetchEntrepriseById(id: string) {
    try {
      const { data, error } = await supabase
        .from('entreprises')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching entreprise:', error);
      return { data: null, error };
    }
  },

  async updateEntreprise(id: string, updates: Partial<any>) {
    try {
      const { data, error } = await supabase
        .from('entreprises')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating entreprise:', error);
      return { data: null, error };
    }
  },

  async enrichEntreprise(id: string) {
    try {
      const { data, error } = await supabase
        .from('entreprises')
        .update({ enrichi: true, date_enrichissement: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error enriching entreprise:', error);
      return { data: null, error };
    }
  }
};
