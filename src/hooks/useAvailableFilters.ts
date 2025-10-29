import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ACTIVITY_CATEGORIES } from '@/utils/activityCategories';
import { DEPARTMENT_NAMES } from '@/utils/regionsData';

interface FilterCounts {
  categories: Record<string, number>;
  departments: Record<string, number>;
  formes: Record<string, number>;
}

export function useAvailableFilters(currentFilters: {
  categories?: string[];
  departments?: string[];
  formesJuridiques?: string[];
  searchQuery?: string;
}) {
  return useQuery({
    queryKey: ['available-filters', currentFilters],
    queryFn: async (): Promise<FilterCounts> => {
      // Build base query with current filters
      let baseQuery = supabase
        .from('entreprises')
        .select('categorie_qualifiee, code_postal, forme_juridique');

      // Apply search filter if present
      if (currentFilters.searchQuery?.trim()) {
        const q = currentFilters.searchQuery.trim();
        const like = `%${q}%`;
        baseQuery = baseQuery.or(
          `nom.ilike.${like},ville.ilike.${like},adresse.ilike.${like},activite.ilike.${like},siret.eq.${q}`
        );
      }

      // Get categories with department filter
      let categoriesQuery = supabase
        .from('entreprises')
        .select('categorie_qualifiee', { count: 'exact', head: true });
      
      if (currentFilters.searchQuery?.trim()) {
        const q = currentFilters.searchQuery.trim();
        const like = `%${q}%`;
        categoriesQuery = categoriesQuery.or(
          `nom.ilike.${like},ville.ilike.${like},adresse.ilike.${like},activite.ilike.${like},siret.eq.${q}`
        );
      }
      
      if (currentFilters.departments && currentFilters.departments.length > 0) {
        const deptFilters = currentFilters.departments.map(dept => 
          `code_postal.like.${dept}%`
        ).join(',');
        categoriesQuery = categoriesQuery.or(deptFilters);
      }

      if (currentFilters.formesJuridiques && currentFilters.formesJuridiques.length > 0) {
        categoriesQuery = categoriesQuery.in('forme_juridique', currentFilters.formesJuridiques);
      }

      // Get departments with category filter
      let departmentsQuery = supabase
        .from('entreprises')
        .select('code_postal', { count: 'exact', head: true });
      
      if (currentFilters.searchQuery?.trim()) {
        const q = currentFilters.searchQuery.trim();
        const like = `%${q}%`;
        departmentsQuery = departmentsQuery.or(
          `nom.ilike.${like},ville.ilike.${like},adresse.ilike.${like},activite.ilike.${like},siret.eq.${q}`
        );
      }
      
      if (currentFilters.categories && currentFilters.categories.length > 0) {
        departmentsQuery = departmentsQuery.in('categorie_qualifiee', currentFilters.categories);
      }

      if (currentFilters.formesJuridiques && currentFilters.formesJuridiques.length > 0) {
        departmentsQuery = departmentsQuery.in('forme_juridique', currentFilters.formesJuridiques);
      }

      // Get formes juridiques with other filters
      let formesQuery = supabase
        .from('entreprises')
        .select('forme_juridique', { count: 'exact', head: true });
      
      if (currentFilters.searchQuery?.trim()) {
        const q = currentFilters.searchQuery.trim();
        const like = `%${q}%`;
        formesQuery = formesQuery.or(
          `nom.ilike.${like},ville.ilike.${like},adresse.ilike.${like},activite.ilike.${like},siret.eq.${q}`
        );
      }
      
      if (currentFilters.categories && currentFilters.categories.length > 0) {
        formesQuery = formesQuery.in('categorie_qualifiee', currentFilters.categories);
      }

      if (currentFilters.departments && currentFilters.departments.length > 0) {
        const deptFilters = currentFilters.departments.map(dept => 
          `code_postal.like.${dept}%`
        ).join(',');
        formesQuery = formesQuery.or(deptFilters);
      }

      // Fetch all data
      const { data: allData, error } = await baseQuery;
      if (error) throw error;

      // Count by category
      const categoryCounts: Record<string, number> = {};
      const departmentCounts: Record<string, number> = {};
      const formeCounts: Record<string, number> = {};

      // Process all data to get counts
      allData?.forEach(row => {
        // Count categories
        const categorie = row.categorie_qualifiee;
        if (categorie) {
          // Check if matches department filter
          const dept = row.code_postal?.substring(0, 2);
          const matchesDept = !currentFilters.departments?.length || 
                             currentFilters.departments.includes(dept || '');
          const matchesForme = !currentFilters.formesJuridiques?.length || 
                              currentFilters.formesJuridiques.includes(row.forme_juridique || '');
          
          if (matchesDept && matchesForme) {
            categoryCounts[categorie] = (categoryCounts[categorie] || 0) + 1;
          }
        }

        // Count departments
        const dept = row.code_postal?.substring(0, 2);
        if (dept && DEPARTMENT_NAMES[dept]) {
          const matchesCategory = !currentFilters.categories?.length || 
                                 currentFilters.categories.includes(row.categorie_qualifiee || '');
          const matchesForme = !currentFilters.formesJuridiques?.length || 
                              currentFilters.formesJuridiques.includes(row.forme_juridique || '');
          
          if (matchesCategory && matchesForme) {
            departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
          }
        }

        // Count formes juridiques
        const forme = row.forme_juridique;
        if (forme) {
          const matchesCategory = !currentFilters.categories?.length || 
                                 currentFilters.categories.includes(row.categorie_qualifiee || '');
          const matchesDept = !currentFilters.departments?.length || 
                             currentFilters.departments.includes(dept || '');
          
          if (matchesCategory && matchesDept) {
            formeCounts[forme] = (formeCounts[forme] || 0) + 1;
          }
        }
      });

      return {
        categories: categoryCounts,
        departments: departmentCounts,
        formes: formeCounts
      };
    },
    staleTime: 30000, // 30 seconds cache
  });
}
