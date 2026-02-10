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
      // Une seule requête : SELECT * sur nouveaux_sites. Aucun filtre SQL pour ne jamais planter.
      const result = await supabase
        .from('nouveaux_sites')
        .select('*', { count: 'exact' })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      const error = result.error;
      if (error) {
        const errMsg = (error as { message?: string }).message ?? JSON.stringify(error);
        console.error('[nouveaux_sites]', errMsg);
        throw new Error(errMsg);
      }

      let data = result.data ?? [];
      let count = result.count ?? 0;
      const originalPageLength = data.length;

      const search = filters.searchQuery?.trim().toLowerCase();
      if (search) {
        data = data.filter((row: any) => {
          const nom = getNom(row);
          const ville = row?.ville ?? '';
          const siret = row?.siret ?? '';
          const codeNaf = row?.code_naf ?? '';
          const adresse = row?.adresse ?? '';
          return [nom, ville, siret, codeNaf, adresse].some(s => String(s).toLowerCase().includes(search));
        });
        count = data.length;
      }
      if (filters.nafSections?.length) {
        data = data.filter((row: any) => filters.nafSections!.includes(row?.naf_section));
        count = data.length;
      }
      if (filters.nafDivisions?.length) {
        data = data.filter((row: any) => filters.nafDivisions!.includes(row?.naf_division));
        count = data.length;
      }
      if (filters.departments?.length) {
        data = data.filter((row: any) => filters.departments!.includes(row?.departement ?? row?.code_postal));
        count = data.length;
      }
      if (filters.dateCreationFrom) {
        data = data.filter((row: any) => (row?.date_creation ?? '') >= filters.dateCreationFrom!);
        count = data.length;
      }
      if (filters.dateCreationTo) {
        data = data.filter((row: any) => (row?.date_creation ?? '') <= filters.dateCreationTo!);
        count = data.length;
      }
      if (filters.typesEtablissement?.length) {
        data = data.filter((row: any) => {
          const siege = row?.est_siege === true;
          if (filters.typesEtablissement!.includes('siege') && siege) return true;
          if (filters.typesEtablissement!.includes('site') && !siege) return true;
          return false;
        });
        count = data.length;
      }
      if (filters.categoriesJuridiques?.length) {
        data = data.filter((row: any) =>
          filters.categoriesJuridiques!.some(c => String(row?.categorie_juridique ?? '').startsWith(c))
        );
        count = data.length;
      }

      const raw = (data ?? []).filter((row: any) => row?.archived !== true);
      const nameGroups = new Map<string, any[]>();
      raw.forEach((site: any) => {
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
        total: count ?? 0,
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
