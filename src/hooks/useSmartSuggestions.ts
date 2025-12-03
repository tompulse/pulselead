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
      // Fetch all nouveaux_sites to analyze
      const { data: sites, error } = await supabase
        .from('nouveaux_sites')
        .select('ville, code_postal, categorie_detaillee');

      if (error) throw error;

      const newSuggestions: SmartSuggestion[] = [];

      // Analyze by department (from postal code)
      const departmentCounts = new Map<string, number>();

      sites?.forEach(e => {
        if (e.code_postal) {
          const dept = e.code_postal.substring(0, 2);
          departmentCounts.set(dept, (departmentCounts.get(dept) || 0) + 1);
        }
      });

      // Top departments by volume
      const sortedDepts = Array.from(departmentCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      sortedDepts.forEach(([dept, count], index) => {
        newSuggestions.push({
          type: 'department',
          value: dept,
          label: `Département ${dept}`,
          reason: `${count} entreprises dans ce département`,
          count,
          priority: 10 - index,
        });
      });

      // Analyze by category
      const categoryCounts = new Map<string, number>();

      sites?.forEach(e => {
        if (e.categorie_detaillee) {
          categoryCounts.set(e.categorie_detaillee, (categoryCounts.get(e.categorie_detaillee) || 0) + 1);
        }
      });

      // Top categories by volume
      const sortedCategories = Array.from(categoryCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      sortedCategories.forEach(([category, count], index) => {
        newSuggestions.push({
          type: 'category',
          value: category,
          label: category,
          reason: `${count} entreprises dans ce secteur`,
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