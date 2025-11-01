import { supabase } from '@/integrations/supabase/client';

export interface NouveauxSitesFilters {
  searchQuery?: string;
  codesNaf?: string[];
  departments?: string[];
  categories?: string[];
}

export const nouveauxSitesService = {
  async fetchNouveauxSites(filters: NouveauxSitesFilters = {}, page = 0, pageSize = 50) {
    try {
      let query = supabase
        .from('nouveaux_sites')
        .select('*', { count: 'exact' })
        .order('date_creation', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      // Server-side search across common fields
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const q = filters.searchQuery.trim();
        const like = `%${q}%`;
        query = query.or(
          `nom.ilike.${like},ville.ilike.${like},adresse.ilike.${like},siret.eq.${q},code_naf.ilike.${like}`
        );
      }

      // Filtre par catégorie détaillée
      if (filters.categories && filters.categories.length > 0) {
        query = query.in('categorie_detaillee', filters.categories);
      }

      // Filtre par département
      if (filters.departments && filters.departments.length > 0) {
        const deptConditions = filters.departments.map(dept => 
          `code_postal.ilike.${dept}%`
        ).join(',');
        query = query.or(deptConditions);
      }

      // Filtre par code NAF
      if (filters.codesNaf && filters.codesNaf.length > 0) {
        const nafConditions = filters.codesNaf.map(code => 
          `code_naf.ilike.${code}%`
        ).join(',');
        query = query.or(nafConditions);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        hasMore: data && data.length === pageSize,
        error: null
      };
    } catch (error) {
      console.error('Error fetching nouveaux sites:', error);
      return {
        data: [],
        total: 0,
        filteredCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async fetchNouveauSiteById(id: string) {
    const { data, error } = await supabase
      .from('nouveaux_sites')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
};
