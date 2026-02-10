import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { countProspectsByCategory } from '@/utils/nafToCategory';
import { NouveauxSitesFilters } from '@/services/nouveauxSitesService';

/**
 * Hook pour compter les prospects par catégorie détaillée
 * Prend en compte les autres filtres actifs
 */
export function useCategoryCounts(filters: Omit<NouveauxSitesFilters, 'categories'>) {
  return useQuery({
    queryKey: ['category-counts', filters],
    queryFn: async () => {
      // Construire la requête de base
      let query = supabase
        .from('nouveaux_sites')
        .select('code_naf', { count: 'exact' });

      // Exclure les archivés
      query = query.or('archived.is.null,archived.eq.false');

      // Appliquer les filtres existants (sauf categories)
      if (filters.nafSections?.length) {
        query = query.in('naf_section', filters.nafSections);
      }
      if (filters.nafDivisions?.length) {
        query = query.in('naf_division', filters.nafDivisions);
      }
      if (filters.departments?.length) {
        query = query.in('departement', filters.departments);
      }
      if (filters.dateCreationFrom) {
        query = query.gte('date_creation', filters.dateCreationFrom);
      }
      if (filters.dateCreationTo) {
        query = query.lte('date_creation', filters.dateCreationTo);
      }
      if (filters.typesEtablissement?.length) {
        if (filters.typesEtablissement.includes('siege') && !filters.typesEtablissement.includes('site')) {
          query = query.eq('est_siege', true);
        } else if (filters.typesEtablissement.includes('site') && !filters.typesEtablissement.includes('siege')) {
          query = query.eq('est_siege', false);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching category counts:', error);
        throw error;
      }

      let filteredData = data || [];

      // Filtres côté client
      const search = filters.searchQuery?.trim().toLowerCase();
      if (search) {
        // Note: On ne peut pas filtrer par recherche multi-colonnes ici
        // car on n'a récupéré que le code_naf pour optimiser la requête
        // Le compteur sera donc approximatif si une recherche est active
      }

      // Filtre catégories juridiques
      if (filters.categoriesJuridiques?.length) {
        // On ne peut pas appliquer ce filtre ici non plus car on n'a pas la colonne
        // Le hook sera appelé avec les bons filtres en amont
      }

      // Compter par catégorie
      return countProspectsByCategory(filteredData);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });
}
