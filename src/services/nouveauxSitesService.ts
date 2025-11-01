import { supabase } from '@/integrations/supabase/client';

export interface NouveauxSitesFilters {
  searchQuery?: string;
  codesNaf?: string[];
  departments?: string[];
  categoriesEntreprise?: string[];
}

export const nouveauxSitesService = {
  async fetchNouveauxSites(filters: NouveauxSitesFilters = {}) {
    try {
      // Query pour compter TOUS les sites (sans filtres) pour le total
      const { count: totalCount } = await supabase
        .from('nouveaux_sites')
        .select('*', { count: 'exact', head: true });

      let query = supabase
        .from('nouveaux_sites')
        .select('*', { count: 'exact' });

      // Filtre par code NAF (2 premiers chiffres)
      if (filters.codesNaf && filters.codesNaf.length > 0) {
        const nafConditions = filters.codesNaf.map(code => 
          `code_naf.ilike.${code}%`
        ).join(',');
        query = query.or(nafConditions);
      }

      // Filtre par département
      if (filters.departments && filters.departments.length > 0) {
        const deptConditions = filters.departments.map(dept => 
          `code_postal.ilike.${dept}%`
        ).join(',');
        query = query.or(deptConditions);
      }

      // Filtre par catégorie détaillée
      if (filters.categoriesEntreprise && filters.categoriesEntreprise.length > 0) {
        query = query.in('categorie_detaillee', filters.categoriesEntreprise);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Filtrage client pour la recherche textuelle
      let filteredData = data || [];

      if (filters.searchQuery && filters.searchQuery.trim()) {
        const searchLower = filters.searchQuery.toLowerCase().trim();
        filteredData = filteredData.filter(site =>
          site.nom?.toLowerCase().includes(searchLower) ||
          site.ville?.toLowerCase().includes(searchLower) ||
          site.adresse?.toLowerCase().includes(searchLower) ||
          site.siret?.includes(searchLower) ||
          site.code_naf?.toLowerCase().includes(searchLower)
        );
      }

      return {
        data: filteredData,
        total: totalCount || 0, // Total de TOUS les sites dans la DB
        filteredCount: filteredData.length, // Nombre après filtres
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
