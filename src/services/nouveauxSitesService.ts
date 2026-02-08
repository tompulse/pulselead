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
  categoriesJuridiques?: string[];
  typesEtablissement?: string[];
  dateCreationFrom?: string;
  dateCreationTo?: string;
  showUnlockedOnly?: boolean;
}

export const nouveauxSitesService = {
  async fetchNouveauxSites(filters: NouveauxSitesFilters = {}, page = 0, pageSize = 50) {
    try {
      let query = supabase
        .from('nouveaux_sites')
        .select('*', { count: 'exact' })
        .eq('archived', false) // Exclure les entreprises archivées de l'onglet Prospects
        .order('random_order', { ascending: true }) // Ordre mélangé mais stable pour diversité
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
            `code_naf.ilike.${like}`
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

      // Filtre par département - utilise la colonne departement si disponible
      if (filters.departments && filters.departments.length > 0) {
        // Utiliser la colonne departement pour un filtrage précis
        // Fallback sur code_postal pour compatibilité
        query = query.in('departement', filters.departments);
      }

      // Filtre par taille d'entreprise
      if (filters.taillesEntreprise && filters.taillesEntreprise.length > 0) {
        query = query.in('categorie_entreprise', filters.taillesEntreprise);
      }

      // Filtre par catégorie juridique (premier chiffre du code)
      if (filters.categoriesJuridiques && filters.categoriesJuridiques.length > 0) {
        const catConditions = filters.categoriesJuridiques.map(cat => 
          `categorie_juridique.like.${cat}%`
        ).join(',');
        query = query.or(catConditions);
      }

      // Filtre par type d'établissement (siège vs site)
      if (filters.typesEtablissement && filters.typesEtablissement.length > 0) {
        const typeConditions: string[] = [];
        if (filters.typesEtablissement.includes('siege')) {
          typeConditions.push('est_siege.eq.true');
        }
        if (filters.typesEtablissement.includes('site')) {
          typeConditions.push('est_siege.eq.false');
        }
        if (typeConditions.length > 0) {
          query = query.or(typeConditions.join(','));
        }
      }

      // Filtre par date de création
      if (filters.dateCreationFrom) {
        query = query.gte('date_creation', filters.dateCreationFrom);
      }
      if (filters.dateCreationTo) {
        query = query.lte('date_creation', filters.dateCreationTo);
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
