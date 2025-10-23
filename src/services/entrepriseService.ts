import { supabase } from "@/integrations/supabase/client";
import { categorizeActivity } from "@/utils/activityCategories";
import { normalizeFormeJuridique } from "@/utils/formesJuridiques";

export interface EntrepriseFilters {
  dateFrom?: string;
  dateTo?: string;
  categories?: string[];
  departments?: string[];
  typeEvenement?: string[];
  activiteDefinie?: boolean | null;
  formesJuridiques?: string[];
  searchQuery?: string;
}

export const entrepriseService = {
  async fetchEntreprises(filters: EntrepriseFilters = {}) {
    try {
      let query = supabase
        .from('entreprises')
        .select('*')
        .order('created_at', { ascending: false });

      // Appliquer les filtres de date uniquement s'ils sont définis
      if (filters.dateFrom) {
        query = query.gte('date_demarrage', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('date_demarrage', filters.dateTo);
      }
      
      // Filtre pour activité définie/non définie
      if (filters.activiteDefinie === true) {
        query = query.not('activite', 'is', null).neq('activite', '');
      } else if (filters.activiteDefinie === false) {
        query = query.or('activite.is.null,activite.eq.');
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Filter client-side for more complex filters
      let filteredData = data || [];
      
      // Filter by departments (code postal starts with department code)
      if (filters.departments && filters.departments.length > 0) {
        filteredData = filteredData.filter(e => {
          if (!e.code_postal) return false;
          return filters.departments!.some(dept => {
            // Handle Corsica special cases
            if (dept === '2A' || dept === '2B') {
              return e.code_postal.startsWith(dept);
            }
            // For standard departments (01-95), match the first 2 digits
            return e.code_postal.startsWith(dept);
          });
        });
      }
      
      // Filter by categories using categorie_qualifiee
      if (filters.categories && filters.categories.length > 0) {
        filteredData = filteredData.filter(e => {
          const category = categorizeActivity(e.activite, e.categorie_qualifiee);
          return filters.categories!.includes(category);
        });
      }
      
      // Filter by formes juridiques
      if (filters.formesJuridiques && filters.formesJuridiques.length > 0) {
        filteredData = filteredData.filter(e => {
          const forme = normalizeFormeJuridique(e.forme_juridique);
          return filters.formesJuridiques!.includes(forme);
        });
      }
      
      // Filter by search query
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const searchLower = filters.searchQuery.toLowerCase();
        filteredData = filteredData.filter(e => 
          e.nom?.toLowerCase().includes(searchLower) ||
          e.siret?.includes(filters.searchQuery!) ||
          e.ville?.toLowerCase().includes(searchLower) ||
          e.adresse?.toLowerCase().includes(searchLower) ||
          e.activite?.toLowerCase().includes(searchLower)
        );
      }

      // Filter by event type
      if (filters.typeEvenement && filters.typeEvenement.length > 0) {
        filteredData = filteredData.filter(e => {
          const activite = e.activite?.toLowerCase() || '';
          return filters.typeEvenement!.some(type => {
            if (type === 'creation') {
              return activite.includes('création') || activite.includes('creation');
            } else if (type === 'immatriculation') {
              return activite.includes('immatriculation');
            } else if (type === 'cession') {
              return activite.includes('cession') || activite.includes('vente de fonds');
            }
            return false;
          });
        });
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
