-- 🧪 Test de la fonction RPC pour les filtres

-- Appeler la fonction RPC (comme le fait le frontend)
SELECT get_nouveaux_sites_filter_counts_dynamic(
  NULL, -- p_naf_sections
  NULL, -- p_naf_divisions
  NULL, -- p_departments
  NULL, -- p_tailles
  NULL, -- p_categories_juridiques
  NULL, -- p_types_etablissement
  NULL  -- p_search_query
);

-- Vérifier directement les tailles en BDD
SELECT 
  categorie_entreprise,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE categorie_entreprise IS NOT NULL
GROUP BY categorie_entreprise
ORDER BY 
  CASE categorie_entreprise
    WHEN 'GE' THEN 1
    WHEN 'ETI' THEN 2
    WHEN 'PME' THEN 3
    WHEN 'Taille inconnue, nouvelle entité' THEN 4
    ELSE 5
  END;
