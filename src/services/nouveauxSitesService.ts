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
      // Détecter si des filtres sont appliqués
      const hasFilters = 
        (filters.nafSections?.length || 0) > 0 ||
        (filters.nafDivisions?.length || 0) > 0 ||
        (filters.departments?.length || 0) > 0 ||
        (filters.categoriesJuridiques?.length || 0) > 0 ||
        (filters.typesEtablissement?.length || 0) > 0 ||
        (filters.searchQuery?.trim() || '').length > 0 ||
        filters.dateCreationFrom ||
        filters.dateCreationTo;

      // Si filtres actifs: charger TOUT d'un coup (jusqu'à 10000 résultats)
      // Sinon: pagination normale (50 par page)
      const effectivePageSize = hasFilters ? 10000 : pageSize;

      // TOUS LES FILTRES EN SQL - Plus de filtrage côté client!
      let query = supabase
        .from('nouveaux_sites')
        .select('*', { count: 'exact' });

      // Exclure les archivés
      query = query.or('archived.is.null,archived.eq.false');

      // Filtres NAF
      if (filters.nafSections?.length) {
        query = query.in('naf_section', filters.nafSections);
      }
      if (filters.nafDivisions?.length) {
        query = query.in('naf_division', filters.nafDivisions);
      }

      // Filtre départements EN SQL (plus besoin de filtrer côté client!)
      if (filters.departments?.length) {
        query = query.in('departement', filters.departments);
      }

      // Filtres dates
      if (filters.dateCreationFrom) {
        query = query.gte('date_creation', filters.dateCreationFrom);
      }
      if (filters.dateCreationTo) {
        query = query.lte('date_creation', filters.dateCreationTo);
      }

      // Filtre types établissement
      if (filters.typesEtablissement?.length) {
        if (filters.typesEtablissement.includes('siege') && !filters.typesEtablissement.includes('site')) {
          query = query.eq('est_siege', true);
        } else if (filters.typesEtablissement.includes('site') && !filters.typesEtablissement.includes('siege')) {
          query = query.eq('est_siege', false);
        }
      }

      // Pagination (avec effectivePageSize adaptatif)
      query = query.range(page * effectivePageSize, (page + 1) * effectivePageSize - 1);

      const result = await query;

      const error = result.error;
      if (error) {
        const errMsg = (error as { message?: string }).message ?? JSON.stringify(error);
        console.error('[nouveaux_sites]', errMsg);
        throw new Error(errMsg);
      }

      let data = result.data ?? [];
      let count = result.count ?? 0;
      const originalPageLength = data.length;

      // FILTRES CÔTÉ CLIENT (seulement recherche multi-colonnes et catégories juridiques)
      
      // Recherche multi-colonnes (nom, ville, siret, code_naf, adresse, code postal)
      const search = filters.searchQuery?.trim().toLowerCase();
      if (search) {
        data = data.filter((row: any) => {
          const nom = getNom(row);
          const ville = row?.ville ?? '';
          const siret = row?.siret ?? '';
          const codeNaf = row?.code_naf ?? '';
          const adresse = row?.adresse ?? '';
          const codePostal = row?.code_postal ?? '';
          return [nom, ville, siret, codeNaf, adresse, codePostal].some(s => 
            String(s).toLowerCase().includes(search)
          );
        });
      }

      // Filtre catégories juridiques (commence par) - côté client car logique "startsWith"
      if (filters.categoriesJuridiques?.length) {
        data = data.filter((row: any) =>
          filters.categoriesJuridiques!.some(c => 
            String(row?.categorie_juridique ?? '').startsWith(c)
          )
        );
      }

      // Grouper par nom d'entreprise
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
        total: count, // Le total global (avant filtres client)
        hasMore: originalPageLength === effectivePageSize,
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
