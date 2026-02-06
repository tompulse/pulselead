-- 🔧 Correction de la logique inversée pour est_siege dans la RPC

-- La fonction utilisait:
-- CASE WHEN est_siege = true THEN 'siege' ELSE 'site' END
-- Mais la logique est inversée, donc on corrige:
-- CASE WHEN est_siege = false THEN 'siege' ELSE 'site' END

CREATE OR REPLACE FUNCTION public.get_nouveaux_sites_filter_counts_dynamic(
  p_naf_sections text[] DEFAULT NULL,
  p_naf_divisions text[] DEFAULT NULL,
  p_departments text[] DEFAULT NULL,
  p_tailles text[] DEFAULT NULL,
  p_categories_juridiques text[] DEFAULT NULL,
  p_types_etablissement text[] DEFAULT NULL,
  p_search_query text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  WITH filtered_base AS (
    SELECT 
      id,
      naf_section,
      naf_division,
      naf_groupe,
      naf_classe,
      code_naf,
      LEFT(code_postal, 2) as dept,
      categorie_entreprise,
      categorie_juridique,
      -- ✅ LOGIQUE INVERSÉE: false = siege, true = site
      CASE WHEN est_siege = false THEN 'siege' ELSE 'site' END as type_etablissement
    FROM nouveaux_sites
    WHERE 
      (p_naf_sections IS NULL OR naf_section = ANY(p_naf_sections))
      AND (p_naf_divisions IS NULL OR naf_division = ANY(p_naf_divisions))
      AND (p_departments IS NULL OR LEFT(code_postal, 2) = ANY(p_departments))
      AND (p_tailles IS NULL OR categorie_entreprise = ANY(p_tailles))
      AND (p_categories_juridiques IS NULL OR categorie_juridique = ANY(p_categories_juridiques))
      AND (p_types_etablissement IS NULL OR 
           (CASE WHEN est_siege = false THEN 'siege' ELSE 'site' END) = ANY(p_types_etablissement))
      AND (p_search_query IS NULL OR p_search_query = '' OR (
        nom ILIKE '%' || p_search_query || '%' OR
        ville ILIKE '%' || p_search_query || '%' OR
        adresse ILIKE '%' || p_search_query || '%' OR
        siret ILIKE '%' || p_search_query || '%' OR
        code_naf ILIKE '%' || p_search_query || '%'
      ))
      AND code_postal IS NOT NULL 
      AND LENGTH(code_postal) >= 2
      AND LEFT(code_postal, 2) ~ '^[0-9]+$'
      AND LEFT(code_postal, 2) NOT IN ('00', '97', '98', '99')
  ),
  naf_sections_agg AS (
    SELECT naf_section as key, COUNT(*)::integer as cnt
    FROM filtered_base
    WHERE naf_section IS NOT NULL
    GROUP BY naf_section
  ),
  naf_divisions_agg AS (
    SELECT naf_division as key, COUNT(*)::integer as cnt
    FROM filtered_base
    WHERE naf_division IS NOT NULL
    GROUP BY naf_division
  ),
  naf_groupes_agg AS (
    SELECT naf_groupe as key, COUNT(*)::integer as cnt
    FROM filtered_base
    WHERE naf_groupe IS NOT NULL
    GROUP BY naf_groupe
  ),
  naf_classes_agg AS (
    SELECT naf_classe as key, COUNT(*)::integer as cnt
    FROM filtered_base
    WHERE naf_classe IS NOT NULL
    GROUP BY naf_classe
  ),
  naf_sous_classes_agg AS (
    SELECT code_naf as key, COUNT(*)::integer as cnt
    FROM filtered_base
    WHERE code_naf IS NOT NULL
    GROUP BY code_naf
  ),
  departments_agg AS (
    SELECT dept as key, COUNT(*)::integer as cnt
    FROM filtered_base
    WHERE dept IS NOT NULL AND dept ~ '^[0-9]+$' AND dept NOT IN ('00', '97', '98', '99')
    GROUP BY dept
  ),
  tailles_agg AS (
    SELECT categorie_entreprise as key, COUNT(*)::integer as cnt
    FROM filtered_base
    WHERE categorie_entreprise IS NOT NULL
    GROUP BY categorie_entreprise
  ),
  categories_juridiques_agg AS (
    SELECT categorie_juridique as key, COUNT(*)::integer as cnt
    FROM filtered_base
    WHERE categorie_juridique IS NOT NULL
    GROUP BY categorie_juridique
  ),
  types_etablissement_agg AS (
    SELECT type_etablissement as key, COUNT(*)::integer as cnt
    FROM filtered_base
    WHERE type_etablissement IS NOT NULL
    GROUP BY type_etablissement
  )
  SELECT json_build_object(
    'nafSections', COALESCE((SELECT json_object_agg(key, cnt) FROM naf_sections_agg), '{}'::json),
    'nafDivisions', COALESCE((SELECT json_object_agg(key, cnt) FROM naf_divisions_agg), '{}'::json),
    'nafGroupes', COALESCE((SELECT json_object_agg(key, cnt) FROM naf_groupes_agg), '{}'::json),
    'nafClasses', COALESCE((SELECT json_object_agg(key, cnt) FROM naf_classes_agg), '{}'::json),
    'nafSousClasses', COALESCE((SELECT json_object_agg(key, cnt) FROM naf_sous_classes_agg), '{}'::json),
    'departments', COALESCE((SELECT json_object_agg(key, cnt) FROM departments_agg), '{}'::json),
    'taillesEntreprise', COALESCE((SELECT json_object_agg(key, cnt) FROM tailles_agg), '{}'::json),
    'categoriesJuridiques', COALESCE((SELECT json_object_agg(key, cnt) FROM categories_juridiques_agg), '{}'::json),
    'typesEtablissement', COALESCE((SELECT json_object_agg(key, cnt) FROM types_etablissement_agg), '{}'::json)
  ) INTO result;
  
  RETURN result;
END;
$$;
