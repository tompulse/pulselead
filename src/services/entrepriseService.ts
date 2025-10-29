import { supabase } from "@/integrations/supabase/client";
import { categorizeActivity } from "@/utils/activityCategories";
import { normalizeFormeJuridique } from "@/utils/formesJuridiques";
// Removed activitySubcategories import
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
  async fetchEntreprises(filters: EntrepriseFilters = {}) {
    try {
      // Single request with server-side filters and exact count
      let query = supabase
        .from('entreprises')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(0, 999); // fetch first 1000 rows for the list

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

      // Server-side departments filter (postal code prefixes)
      if (filters.departments && filters.departments.length > 0) {
        const deptPatterns = filters.departments
          .map((d) => {
            const dl = d.toString().toUpperCase();
            // Handle Corsica codes gracefully by mapping to 20xxx (no precise split needed here)
            if (dl === '2A' || dl === '2B') return '20%';
            // Zero-pad single-digit departments
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

// Subcategories removed
      
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

      // Get qualified count with a separate query to count ALL qualified entreprises matching filters
      let countQuery = supabase
        .from('entreprises')
        .select('id', { count: 'exact', head: true })
        .not('categorie_qualifiee', 'is', null);

      // Apply same filters to count query
      if (filters.dateFrom) {
        countQuery = countQuery.gte('date_demarrage', filters.dateFrom);
      }
      if (filters.dateTo) {
        countQuery = countQuery.lte('date_demarrage', filters.dateTo);
      }
      if (filters.activiteDefinie === true) {
        countQuery = countQuery.not('activite', 'is', null).neq('activite', '');
      } else if (filters.activiteDefinie === false) {
        countQuery = countQuery.or('activite.is.null,activite.eq.');
      }
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const q = filters.searchQuery.trim();
        const like = `%${q}%`;
        countQuery = countQuery.or(
          `nom.ilike.${like},ville.ilike.${like},adresse.ilike.${like},activite.ilike.${like},siret.eq.${q}`
        );
      }
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
          countQuery = countQuery.or(orExpr);
        }
      }

      const { count: qualifiedCount } = await countQuery;
      const total = filteredData.length;

      return { data: filteredData, total, qualifiedCount: qualifiedCount ?? 0, error: null };
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
