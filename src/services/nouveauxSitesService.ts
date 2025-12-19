import { supabase } from '@/integrations/supabase/client';
import { findNafCodesForKeyword, normalizeSearchTerm, generateNafFilterConditions } from '@/utils/searchKeywordMapping';

export interface NouveauxSitesFilters {
  searchQuery?: string;
  nafSections?: string[];
  nafDivisions?: string[];
  nafGroupes?: string[];
  nafClasses?: string[];
  nafSousClasses?: string[];
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

      // Recherche intelligente multi-termes avec synonymes métier
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const rawQuery = filters.searchQuery.trim();
        const terms = rawQuery.split(/\s+/).filter(t => t.length > 0);
        
        // Pour chaque terme, on construit une recherche étendue
        for (const term of terms) {
          const like = `%${term}%`;
          
          // Trouver les codes NAF associés à ce terme (synonymes métier)
          const relatedNafCodes = findNafCodesForKeyword(term);
          
          // Construire les conditions de recherche
          // Champs étendus : nom, ville, adresse, siret, code_naf, categorie_detaillee
          let searchConditions = [
            `nom.ilike.${like}`,
            `ville.ilike.${like}`,
            `adresse.ilike.${like}`,
            `siret.eq.${term}`,
            `code_naf.ilike.${like}`,
            `categorie_detaillee.ilike.${like}`
          ];
          
          // Ajouter les conditions NAF issues des synonymes métier
          if (relatedNafCodes.length > 0) {
            const nafConditions = generateNafFilterConditions(relatedNafCodes);
            if (nafConditions) {
              searchConditions.push(nafConditions);
            }
          }
          
          query = query.or(searchConditions.join(','));
        }
      }

      // Filtre par section NAF
      if (filters.nafSections && filters.nafSections.length > 0) {
        query = query.in('naf_section', filters.nafSections);
      }

      // Filtre par division NAF
      if (filters.nafDivisions && filters.nafDivisions.length > 0) {
        query = query.in('naf_division', filters.nafDivisions);
      }

      // Filtre par groupe NAF
      if (filters.nafGroupes && filters.nafGroupes.length > 0) {
        query = query.in('naf_groupe', filters.nafGroupes);
      }

      // Filtre par classe NAF
      if (filters.nafClasses && filters.nafClasses.length > 0) {
        query = query.in('naf_classe', filters.nafClasses);
      }

      // Filtre par sous-classe NAF
      if (filters.nafSousClasses && filters.nafSousClasses.length > 0) {
        query = query.in('code_naf', filters.nafSousClasses);
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
