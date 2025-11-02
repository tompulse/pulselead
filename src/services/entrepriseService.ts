import { supabase } from "@/integrations/supabase/client";
import { categorizeActivity, getCategoryFromNaf } from "@/utils/detailedCategories";
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
  subcategories?: string[];
}

export const entrepriseService = {
  async fetchEntreprises(filters: EntrepriseFilters = {}, page = 0, pageSize = 50) {
    try {
      // Single request with server-side filters and exact count
      let query = supabase
        .from('entreprises')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      // Date filters
      if (filters.dateFrom) {
        query = query.gte('date_demarrage', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('date_demarrage', filters.dateTo);
      }

      // Activity defined filter
      if (filters.activiteDefinie === true) {
        query = query.not('activite', 'is', null).neq('activite', '');
      } else if (filters.activiteDefinie === false) {
        query = query.or('activite.is.null,activite.eq.');
      }

      // Server-side search across common fields
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const q = filters.searchQuery.trim();
        const like = `%${q}%`;
        query = query.or(
          `nom.ilike.${like},ville.ilike.${like},adresse.ilike.${like},activite.ilike.${like},siret.eq.${q}`
        );
      }

      // Server-side categories filter
      if (filters.categories && filters.categories.length > 0) {
        query = query.in('categorie_detaillee', filters.categories);
      }

      // Server-side departments filter (postal code prefixes)
      if (filters.departments && filters.departments.length > 0) {
        const deptPatterns = filters.departments
          .map((d) => {
            const dl = d.toString().toUpperCase();
            if (dl === '2A' || dl === '2B') return '20%';
            const norm = dl.length === 1 ? `0${dl}` : dl;
            return `${norm}%`;
          })
          .filter(Boolean);
        if (deptPatterns.length > 0) {
          const orExpr = deptPatterns.map((p) => `code_postal.ilike.${p}`).join(',');
          query = query.or(orExpr);
        }
      }

      const { data, error, count } = await query; 
      if (error) throw error;
      
      // Dédupliquer par ID pour éviter les doublons
      let filteredData = data || [];
      const uniqueMap = new Map();
      filteredData.forEach(e => {
        if (!uniqueMap.has(e.id)) {
          uniqueMap.set(e.id, e);
        }
      });
      filteredData = Array.from(uniqueMap.values());
      
      // Filter client-side for formes juridiques
      
      if (filters.formesJuridiques && filters.formesJuridiques.length > 0) {
        filteredData = filteredData.filter(e => {
          const forme = normalizeFormeJuridique(e.forme_juridique);
          return filters.formesJuridiques!.includes(forme);
        });
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

      return { 
        data: filteredData, 
        total: count || 0,
        hasMore: data && data.length === pageSize, 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching entreprises:', error);
      return { data: [], total: 0, hasMore: false, error };
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
