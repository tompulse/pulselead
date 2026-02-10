import { supabase } from '@/integrations/supabase/client';
import { getCategoryFromNaf } from '@/utils/nafToCategory';
import { getSecteurNafSections } from '@/utils/simpleCategories';

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
  categories?: string[]; // Nouvelles catégories détaillées
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
        (filters.categories?.length || 0) > 0 ||
        filters.dateCreationFrom ||
        filters.dateCreationTo;

      // Si filtres actifs: charger TOUT d'un coup (jusqu'à 100000 résultats pour catégories)
      // Sinon: pagination normale (50 par page)
      const effectivePageSize = hasFilters ? 100000 : pageSize;

      // TOUS LES FILTRES EN SQL - Plus de filtrage côté client!
      let query = supabase
        .from('nouveaux_sites')
        .select('*', { count: 'exact' });

      // Exclure les archivés (archived est TEXT, pas boolean)
      query = query.or('archived.is.null,archived.neq.true');

      // Filtres NAF - FILTRER DIRECTEMENT EN SQL PAR SECTIONS
      if (filters.nafSections?.length) {
        // Filtrer par les 2 premiers caractères du code_naf
        const conditions = filters.nafSections.map(section => `code_naf.like.${section}%`).join(',');
        query = query.or(conditions);
      }
      
      // Filtre catégories simplifiées → convertir en sections NAF
      if (filters.categories?.length) {
        const allSections = new Set<string>();
        filters.categories.forEach(secteur => {
          const sections = getSecteurNafSections(secteur);
          sections.forEach(s => allSections.add(s));
        });
        
        if (allSections.size > 0) {
          const conditions = Array.from(allSections).map(section => `code_naf.like.${section}%`).join(',');
          query = query.or(conditions);
        }
      }
      
      // Filtre départements
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

      // Filtre types établissement - UTILISER siege (TEXT), pas est_siege (boolean)
      if (filters.typesEtablissement?.length) {
        if (filters.typesEtablissement.includes('siege') && !filters.typesEtablissement.includes('site')) {
          // Filtrer les sièges (siege TEXT = 'VRAI', 'TRUE', etc.)
          query = query.or('siege.ilike.VRAI,siege.ilike.TRUE,siege.eq.V,siege.eq.1');
        } else if (filters.typesEtablissement.includes('site') && !filters.typesEtablissement.includes('siege')) {
          // Filtrer les sites (siege TEXT = 'FAUX', 'FALSE', etc.)
          query = query.or('siege.ilike.FAUX,siege.ilike.FALSE,siege.eq.F,siege.eq.0,siege.is.null');
        }
      }

      // Pagination (avec effectivePageSize adaptatif)
      // Si categories est utilisé, ne PAS paginer pour récupérer TOUS les résultats
      if (!filters.categories?.length) {
        query = query.range(page * effectivePageSize, (page + 1) * effectivePageSize - 1);
      }

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

      // FILTRES CÔTÉ CLIENT (seulement pour NAF divisions et recherche)
      
      // Filtre NAF Divisions (extrait depuis code_naf)
      if (filters.nafDivisions?.length) {
        data = data.filter((row: any) => {
          const codeNaf = row?.code_naf ?? '';
          const division = codeNaf.substring(0, 4);
          return filters.nafDivisions!.includes(division);
        });
      }
      
      // Recherche multi-colonnes (nom, COMMUNE, siret, code_naf, adresse, code postal)
      const search = filters.searchQuery?.trim().toLowerCase();
      if (search) {
        data = data.filter((row: any) => {
          const nom = getNom(row);
          const commune = row?.commune ?? ''; // UTILISER commune, PAS ville
          const siret = row?.siret ?? '';
          const codeNaf = row?.code_naf ?? '';
          const adresse = row?.adresse ?? '';
          const codePostal = row?.code_postal ?? '';
          return [nom, commune, siret, codeNaf, adresse, codePostal].some(s => 
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
