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
      // STRATÉGIE HYBRIDE: Filtres SQL simples + filtres complexes côté client
      let query = supabase
        .from('nouveaux_sites')
        .select('*', { count: 'exact' });

      // Filtres SQL simples (pas de OR complexes)
      if (filters.nafSections?.length) {
        query = query.in('naf_section', filters.nafSections);
      }
      if (filters.nafDivisions?.length) {
        query = query.in('naf_division', filters.nafDivisions);
      }
      if (filters.dateCreationFrom) {
        query = query.gte('date_creation', filters.dateCreationFrom);
      }
      if (filters.dateCreationTo) {
        query = query.lte('date_creation', filters.dateCreationTo);
      }

      // Pagination
      query = query.range(page * pageSize, (page + 1) * pageSize - 1);

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

      // FILTRES CÔTÉ CLIENT pour recherche, départements, catégories juridiques
      
      // Filtrer les archivés
      data = data.filter((row: any) => row?.archived !== true);

      // Recherche (nom, ville, siret, code_naf, adresse, CODE POSTAL)
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

      // Filtre départements (gère codes postaux avec/sans zéro initial)
      if (filters.departments?.length) {
        data = data.filter((row: any) => {
          const codePostal = String(row?.code_postal || '');
          const departement = row?.departement;
          
          return filters.departments!.some(dept => {
            // Check colonne departement directe
            if (departement === dept) return true;
            
            // Normaliser le code postal (ajouter 0 si manquant)
            const normalized = codePostal.length === 4 ? '0' + codePostal : codePostal;
            
            // Extraire les 2 premiers chiffres
            const cpDept = normalized.substring(0, 2);
            
            return cpDept === dept;
          });
        });
      }

      // Filtre types établissement (siège/site)
      if (filters.typesEtablissement?.length) {
        data = data.filter((row: any) => {
          const siege = row?.est_siege === true;
          if (filters.typesEtablissement!.includes('siege') && siege) return true;
          if (filters.typesEtablissement!.includes('site') && !siege) return true;
          return false;
        });
      }

      // Filtre catégories juridiques (commence par)
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
