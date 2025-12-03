import { supabase } from '@/integrations/supabase/client';

export interface NouveauxSitesFilters {
  searchQuery?: string;
  nafSections?: string[];
  nafDivisions?: string[];
  departments?: string[];
  taillesEntreprise?: string[];
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

      // Filtre par section NAF
      if (filters.nafSections && filters.nafSections.length > 0) {
        query = query.in('naf_section', filters.nafSections);
      }

      // Filtre par division NAF
      if (filters.nafDivisions && filters.nafDivisions.length > 0) {
        query = query.in('naf_division', filters.nafDivisions);
      }

      // Filtre par département
      if (filters.departments && filters.departments.length > 0) {
        const deptConditions = filters.departments.map(dept => 
          `code_postal.ilike.${dept}%`
        ).join(',');
        query = query.or(deptConditions);
      }

      // Filtre par taille d'entreprise
      if (filters.taillesEntreprise && filters.taillesEntreprise.length > 0) {
        query = query.in('categorie_entreprise', filters.taillesEntreprise);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Grouper par nom pour éviter les doublons d'affichage
      const nameGroups = new Map<string, any[]>();
      (data || []).forEach(site => {
        const normalizedName = site.nom?.toLowerCase().trim() || '';
        if (!nameGroups.has(normalizedName)) {
          nameGroups.set(normalizedName, []);
        }
        nameGroups.get(normalizedName)!.push(site);
      });

      // Garder uniquement le premier site de chaque groupe avec un compteur
      const groupedData = Array.from(nameGroups.values()).map(group => {
        const main = group[0];
        return {
          ...main,
          multipleCreations: group.length > 1 ? group.length : undefined,
          relatedIds: group.map(s => s.id)
        };
      });

      return {
        data: groupedData,
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
