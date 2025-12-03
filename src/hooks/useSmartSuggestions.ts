import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SmartSuggestion {
  type: 'region' | 'department' | 'category';
  value: string;
  label: string;
  reason: string;
  count: number;
  priority: number;
}

export const useSmartSuggestions = () => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateSuggestions();
  }, []);

  const generateSuggestions = async () => {
    setLoading(true);
    
    try {
      // Fetch all entreprises to analyze
      const { data: entreprises, error } = await supabase
        .from('entreprises')
        .select('ville, code_postal, activite, effectifs, chiffre_affaires');

      if (error) throw error;

      const newSuggestions: SmartSuggestion[] = [];

      // Analyze by department (from postal code)
      const departmentCounts = new Map<string, number>();
      const departmentHighValue = new Map<string, number>();

      entreprises?.forEach(e => {
        if (e.code_postal) {
          const dept = e.code_postal.substring(0, 2);
          departmentCounts.set(dept, (departmentCounts.get(dept) || 0) + 1);
          
          if (e.chiffre_affaires && e.chiffre_affaires > 500000) {
            departmentHighValue.set(dept, (departmentHighValue.get(dept) || 0) + 1);
          }
        }
      });

      // Top departments by volume
      const sortedDepts = Array.from(departmentCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      sortedDepts.forEach(([dept, count], index) => {
        const highValueCount = departmentHighValue.get(dept) || 0;
        newSuggestions.push({
          type: 'department',
          value: dept,
          label: `Département ${dept}`,
          reason: highValueCount > 0 
            ? `${count} entreprises dont ${highValueCount} à fort potentiel`
            : `${count} entreprises dans ce département`,
          count,
          priority: 10 - index,
        });
      });

      // Analyze by activity
      const activityCounts = new Map<string, number>();
      const activityHighValue = new Map<string, number>();

      entreprises?.forEach(e => {
        if (e.activite) {
          activityCounts.set(e.activite, (activityCounts.get(e.activite) || 0) + 1);
          
          if (e.chiffre_affaires && e.chiffre_affaires > 500000) {
            activityHighValue.set(e.activite, (activityHighValue.get(e.activite) || 0) + 1);
          }
        }
      });

      // Top activities by volume
      const sortedActivities = Array.from(activityCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      sortedActivities.forEach(([activity, count], index) => {
        const highValueCount = activityHighValue.get(activity) || 0;
        newSuggestions.push({
          type: 'category',
          value: activity,
          label: activity,
          reason: highValueCount > 0
            ? `${count} entreprises, ${highValueCount} à fort CA`
            : `${count} entreprises dans ce secteur`,
          count,
          priority: 7 - index,
        });
      });

      // Sort all suggestions by priority
      newSuggestions.sort((a, b) => b.priority - a.priority);

      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  return { suggestions, loading, refreshSuggestions: generateSuggestions };
};
