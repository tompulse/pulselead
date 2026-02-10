import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCategoryFromNaf } from '@/utils/nafToCategory';
import { DETAILED_CATEGORIES } from '@/utils/detailedCategories';

interface FiltersInput {
  departments?: string[];
  categoriesJuridiques?: string[];
  typesEtablissement?: string[];
  searchQuery?: string;
}

/**
 * Hook pour obtenir les compteurs de prospects par catégorie détaillée
 * Récupère tous les codes NAF et les catégorise côté client
 */
export function useAvailableCategoriesCount(filters: FiltersInput = {}) {
  return useQuery({
    queryKey: [
      'categories-count',
      filters.departments || [],
      filters.categoriesJuridiques || [],
      filters.typesEtablissement || [],
      filters.searchQuery || ''
    ],
    queryFn: async (): Promise<Record<string, number>> => {
      try {
        // Construire la requête pour récupérer tous les codes NAF
        let query = supabase
          .from('nouveaux_sites')
          .select('code_naf', { count: 'exact' });

        // Exclure les archivés
        query = query.or('archived.is.null,archived.eq.false');

        // Appliquer les filtres (sauf catégories)
        if (filters.departments?.length) {
          query = query.in('departement', filters.departments);
        }

        if (filters.typesEtablissement?.length) {
          if (filters.typesEtablissement.includes('siege') && !filters.typesEtablissement.includes('site')) {
            query = query.eq('est_siege', true);
          } else if (filters.typesEtablissement.includes('site') && !filters.typesEtablissement.includes('siege')) {
            query = query.eq('est_siege', false);
          }
        }

        // Récupérer les données
        const { data, error } = await query;

        if (error) {
          console.error('Erreur lors du comptage des catégories:', error);
          return {};
        }

        // Initialiser les compteurs à 0
        const counts: Record<string, number> = {};
        DETAILED_CATEGORIES.forEach(cat => {
          counts[cat.key] = 0;
        });

        // Compter les prospects par catégorie
        if (data) {
          data.forEach((row: any) => {
            const category = getCategoryFromNaf(row.code_naf);
            counts[category] = (counts[category] || 0) + 1;
          });
        }

        // Log pour debug
        const totalCounted = Object.values(counts).reduce((sum, count) => sum + count, 0);
        console.log(`[Catégories] ${totalCounted} prospects catégorisés sur ${data?.length || 0} lignes`);
        
        // Afficher les 5 catégories les plus populaires
        const topCategories = Object.entries(counts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([key, count]) => `${key}: ${count}`);
        console.log('[Top 5 catégories]', topCategories);

        return counts;
      } catch (error) {
        console.error('Erreur dans useAvailableCategoriesCount:', error);
        return {};
      }
    },
    staleTime: 5 * 60 * 1000, // Cache pendant 5 minutes
    gcTime: 10 * 60 * 1000,
  });
}
