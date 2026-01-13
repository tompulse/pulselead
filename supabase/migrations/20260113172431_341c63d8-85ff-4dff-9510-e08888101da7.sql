-- Mettre à jour la fonction RPC pour inclure les catégories juridiques
CREATE OR REPLACE FUNCTION public.get_nouveaux_sites_filter_counts_dynamic(
  p_naf_sections text[] DEFAULT NULL,
  p_naf_divisions text[] DEFAULT NULL,
  p_departments text[] DEFAULT NULL,
  p_tailles text[] DEFAULT NULL,
  p_search_query text DEFAULT NULL,
  p_categories_juridiques text[] DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  WITH base_filter AS (
    SELECT *
    FROM nouveaux_sites ns
    WHERE 
      (p_search_query IS NULL OR p_search_query = '' OR 
        ns.nom ILIKE '%' || p_search_query || '%' OR
        ns.ville ILIKE '%' || p_search_query || '%' OR
        ns.adresse ILIKE '%' || p_search_query || '%' OR
        ns.siret = p_search_query OR
        ns.code_naf ILIKE '%' || p_search_query || '%' OR
        ns.categorie_detaillee ILIKE '%' || p_search_query || '%'
      )
  ),
  -- Filtre pour les NAF counts (exclut naf_sections et naf_divisions)
  naf_base AS (
    SELECT * FROM base_filter bf
    WHERE
      (p_departments IS NULL OR LEFT(bf.code_postal, 2) = ANY(p_departments))
      AND (p_tailles IS NULL OR bf.categorie_entreprise = ANY(p_tailles))
      AND (p_categories_juridiques IS NULL OR LEFT(bf.categorie_juridique, 1) = ANY(p_categories_juridiques))
  ),
  -- Filtre pour les departments (exclut departments)
  dept_base AS (
    SELECT * FROM base_filter bf
    WHERE
      (p_naf_sections IS NULL OR bf.naf_section = ANY(p_naf_sections))
      AND (p_naf_divisions IS NULL OR bf.naf_division = ANY(p_naf_divisions))
      AND (p_tailles IS NULL OR bf.categorie_entreprise = ANY(p_tailles))
      AND (p_categories_juridiques IS NULL OR LEFT(bf.categorie_juridique, 1) = ANY(p_categories_juridiques))
  ),
  -- Filtre pour les tailles (exclut tailles)
  taille_base AS (
    SELECT * FROM base_filter bf
    WHERE
      (p_naf_sections IS NULL OR bf.naf_section = ANY(p_naf_sections))
      AND (p_naf_divisions IS NULL OR bf.naf_division = ANY(p_naf_divisions))
      AND (p_departments IS NULL OR LEFT(bf.code_postal, 2) = ANY(p_departments))
      AND (p_categories_juridiques IS NULL OR LEFT(bf.categorie_juridique, 1) = ANY(p_categories_juridiques))
  ),
  -- Filtre pour les catégories juridiques (exclut categories_juridiques)
  cat_jur_base AS (
    SELECT * FROM base_filter bf
    WHERE
      (p_naf_sections IS NULL OR bf.naf_section = ANY(p_naf_sections))
      AND (p_naf_divisions IS NULL OR bf.naf_division = ANY(p_naf_divisions))
      AND (p_departments IS NULL OR LEFT(bf.code_postal, 2) = ANY(p_departments))
      AND (p_tailles IS NULL OR bf.categorie_entreprise = ANY(p_tailles))
  ),
  -- Counts par section NAF
  naf_sections_count AS (
    SELECT naf_section as code, COUNT(*)::int as count
    FROM naf_base
    WHERE naf_section IS NOT NULL
    GROUP BY naf_section
  ),
  -- Counts par division NAF
  naf_divisions_count AS (
    SELECT naf_division as code, COUNT(*)::int as count
    FROM naf_base
    WHERE naf_division IS NOT NULL
    GROUP BY naf_division
  ),
  -- Counts par groupe NAF
  naf_groupes_count AS (
    SELECT naf_groupe as code, COUNT(*)::int as count
    FROM naf_base
    WHERE naf_groupe IS NOT NULL
    GROUP BY naf_groupe
  ),
  -- Counts par classe NAF
  naf_classes_count AS (
    SELECT naf_classe as code, COUNT(*)::int as count
    FROM naf_base
    WHERE naf_classe IS NOT NULL
    GROUP BY naf_classe
  ),
  -- Counts par sous-classe NAF
  naf_sous_classes_count AS (
    SELECT code_naf as code, COUNT(*)::int as count
    FROM naf_base
    WHERE code_naf IS NOT NULL
    GROUP BY code_naf
  ),
  -- Counts par département
  departments_count AS (
    SELECT LEFT(code_postal, 2) as code, COUNT(*)::int as count
    FROM dept_base
    WHERE code_postal IS NOT NULL AND LENGTH(code_postal) >= 2
      AND LEFT(code_postal, 2) ~ '^\d{2}$'
      AND LEFT(code_postal, 2) NOT IN ('00', '99')
    GROUP BY LEFT(code_postal, 2)
  ),
  -- Counts par taille
  tailles_count AS (
    SELECT COALESCE(categorie_entreprise, 'Non spécifié') as code, COUNT(*)::int as count
    FROM taille_base
    GROUP BY COALESCE(categorie_entreprise, 'Non spécifié')
  ),
  -- Counts par catégorie juridique (premier chiffre)
  categories_juridiques_count AS (
    SELECT LEFT(categorie_juridique, 1) as code, COUNT(*)::int as count
    FROM cat_jur_base
    WHERE categorie_juridique IS NOT NULL AND LENGTH(categorie_juridique) >= 1
    GROUP BY LEFT(categorie_juridique, 1)
  )
  SELECT json_build_object(
    'nafSections', COALESCE((SELECT json_object_agg(code, count) FROM naf_sections_count), '{}'::json),
    'nafDivisions', COALESCE((SELECT json_object_agg(code, count) FROM naf_divisions_count), '{}'::json),
    'nafGroupes', COALESCE((SELECT json_object_agg(code, count) FROM naf_groupes_count), '{}'::json),
    'nafClasses', COALESCE((SELECT json_object_agg(code, count) FROM naf_classes_count), '{}'::json),
    'nafSousClasses', COALESCE((SELECT json_object_agg(code, count) FROM naf_sous_classes_count), '{}'::json),
    'departments', COALESCE((SELECT json_object_agg(code, count) FROM departments_count), '{}'::json),
    'taillesEntreprise', COALESCE((SELECT json_object_agg(code, count) FROM tailles_count), '{}'::json),
    'categoriesJuridiques', COALESCE((SELECT json_object_agg(code, count) FROM categories_juridiques_count), '{}'::json)
  ) INTO result;
  
  RETURN result;
END;
$$;