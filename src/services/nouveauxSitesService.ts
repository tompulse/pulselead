import { supabase } from '@/integrations/supabase/client';

export interface NouveauxSitesFilters {
  searchQuery?: string;
  nafSections?: string[];
  nafDivisions?: string[];
  nafGroupes?: string[];
  nafClasses?: string[];
  nafSousClasses?: string[];
  departments?: string[];
  categoriesJuridiques?: string[];
  typesEtablissement?: string[];
  dateCreationFrom?: string;
  dateCreationTo?: string;
  showUnlockedOnly?: boolean;
}

function getNom(row: any): string {
  return row?.nom ?? row?.entreprise ?? row?.nom_entreprise ?? row?.name ?? '';
}

export const nouveauxSitesService = {
  async fetchNouveauxSites(filters: NouveauxSitesFilters = {}, page = 0, pageSize = 50) {
    try {
      // Construire la requête Supabase avec filtres SQL
      let query = supabase
        .from('nouveaux_sites')
        .select('*', { count: 'exact' });

      // Filtrer les archivés en SQL
      query = query.neq('archived', true);

      // Filtre de recherche (nom, ville, siret, code_naf, adresse, CODE POSTAL)
      const search = filters.searchQuery?.trim();
      if (search) {
        // Recherche multi-colonnes avec OR
        query = query.or(
          `nom.ilike.%${search}%,` +
          `entreprise.ilike.%${search}%,` +
          `ville.ilike.%${search}%,` +
          `siret.ilike.%${search}%,` +
          `code_naf.ilike.%${search}%,` +
          `adresse.ilike.%${search}%,` +
          `code_postal.ilike.%${search}%`
        );
      }

      // Filtres NAF
      if (filters.nafSections?.length) {
        query = query.in('naf_section', filters.nafSections);
      }
      if (filters.nafDivisions?.length) {
        query = query.in('naf_division', filters.nafDivisions);
      }

      // Filtre départements - gérer les codes postaux avec zéro initial (01-09)
      if (filters.departments?.length) {
        // Créer des conditions OR pour chaque département
        const deptConditions = filters.departments.map(dept => {
          // Pour départements 01-09, chercher codes postaux commençant par 0X ou X
          if (dept.match(/^0[1-9]$/)) {
            const deptNum = dept.substring(1); // "01" -> "1"
            return `code_postal.like.${dept}*,code_postal.like.${deptNum}*,departement.eq.${dept}`;
          }
          // Pour les autres départements (10-95)
          return `code_postal.like.${dept}*,departement.eq.${dept}`;
        }).join(',');
        
        query = query.or(deptConditions);
      }

      // Filtre dates de création
      if (filters.dateCreationFrom) {
        query = query.gte('date_creation', filters.dateCreationFrom);
      }
      if (filters.dateCreationTo) {
        query = query.lte('date_creation', filters.dateCreationTo);
      }

      // Filtre types établissement (siège/site)
      if (filters.typesEtablissement?.length) {
        if (filters.typesEtablissement.includes('siege') && !filters.typesEtablissement.includes('site')) {
          query = query.eq('est_siege', true);
        } else if (filters.typesEtablissement.includes('site') && !filters.typesEtablissement.includes('siege')) {
          query = query.eq('est_siege', false);
        }
        // Si les deux sont sélectionnés, pas de filtre
      }

      // Filtre catégories juridiques
      if (filters.categoriesJuridiques?.length) {
        // Utiliser OR pour chaque catégorie (commence par)
        const catConditions = filters.categoriesJuridiques
          .map(cat => `categorie_juridique.like.${cat}*`)
          .join(',');
        query = query.or(catConditions);
      }

      // Appliquer la pagination APRÈS tous les filtres
      query = query.range(page * pageSize, (page + 1) * pageSize - 1);

      const result = await query;

      const error = result.error;
      if (error) {
        const errMsg = (error as { message?: string }).message ?? JSON.stringify(error);
        console.error('[nouveaux_sites]', errMsg);
        throw new Error(errMsg);
      }

      const data = result.data ?? [];
      const count = result.count ?? 0;
      const originalPageLength = data.length;

      // Grouper par nom d'entreprise (côté client, car c'est logique métier)
      const nameGroups = new Map<string, any[]>();
      data.forEach((site: any) => {
        const key = getNom(site).toLowerCase().trim() || site?.siret || site?.id || '';
        if (!nameGroups.has(key)) nameGroups.set(key, []);
        nameGroups.get(key)!.push(site);
      });

      const groupedData = Array.from(nameGroups.values()).map(group => {
        const main = group[0];
        const id = main?.id ?? main?.siret ?? '';
        return {
          ...main,
          id,
          nom: getNom(main) || 'Sans nom',
          multipleCreations: group.length > 1 ? group.length : undefined,
          relatedIds: group.map((s: any) => s?.id ?? s?.siret).filter(Boolean),
        };
      });

      return {
        data: groupedData,
        total: count,
        hasMore: originalPageLength === pageSize,
        error: null,
      };
    } catch (err) {
      console.error('Error fetching nouveaux sites:', err);
      return {
        data: [],
        total: 0,
        filteredCount: 0,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  },

  async fetchNouveauSiteById(id: string) {
    const byId = supabase.from('nouveaux_sites').select('*').eq('id', id).single();
    const bySiret = supabase.from('nouveaux_sites').select('*').eq('siret', id).single();
    const { data: d1, error: e1 } = await byId;
    if (!e1 && d1) return d1;
    const { data: d2, error: e2 } = await bySiret;
    if (e2) throw e2;
    return d2;
  },
};
