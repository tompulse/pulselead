-- CORRECTION COMPLÈTE DE LA FONCTION RPC
-- Utilise les VRAIES colonnes de la table nouveaux_sites

CREATE OR REPLACE FUNCTION public.get_nouveaux_sites_filter_counts_dynamic(
  p_naf_sections text[] DEFAULT NULL,
  p_naf_divisions text[] DEFAULT NULL,
  p_departments text[] DEFAULT NULL,
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
      -- Extraire les niveaux NAF depuis code_naf
      LEFT(code_naf, 2) as naf_section,
      LEFT(code_naf, 4) as naf_division,
      LEFT(code_naf, 5) as naf_groupe,
      LEFT(code_naf, 6) as naf_classe,
      code_naf,
      -- Normaliser le département: ajouter le zéro si manquant
      CASE 
        WHEN LENGTH(code_postal) = 4 THEN '0' || LEFT(code_postal, 1)
        WHEN LENGTH(code_postal) >= 5 THEN LEFT(code_postal, 2)
        ELSE NULL
      END as dept,
      -- Type établissement depuis colonne siege (text)
      CASE 
        WHEN UPPER(siege) IN ('VRAI', 'TRUE', 'V', '1', 'OUI') THEN 'siege' 
        ELSE 'site' 
      END as type_etablissement
    FROM nouveaux_sites
    WHERE 
      -- archived est TEXT, pas boolean
      (archived IS NULL OR archived != 'true')
      -- Filtres NAF (extraits depuis code_naf)
      AND (p_naf_sections IS NULL OR LEFT(code_naf, 2) = ANY(p_naf_sections))
      AND (p_naf_divisions IS NULL OR LEFT(code_naf, 4) = ANY(p_naf_divisions))
      -- Filtre départements (gérer codes postaux 4 ou 5 caractères)
      AND (p_departments IS NULL OR 
           CASE 
             WHEN LENGTH(code_postal) = 4 THEN '0' || LEFT(code_postal, 1)
             WHEN LENGTH(code_postal) >= 5 THEN LEFT(code_postal, 2)
             ELSE NULL
           END = ANY(p_departments)
      )
      -- Filtre types établissement (depuis siege en text)
      AND (p_types_etablissement IS NULL OR 
           (CASE 
             WHEN UPPER(siege) IN ('VRAI', 'TRUE', 'V', '1', 'OUI') THEN 'siege' 
             ELSE 'site' 
           END) = ANY(p_types_etablissement))
      -- Recherche textuelle (utiliser les VRAIES colonnes)
      AND (p_search_query IS NULL OR p_search_query = '' OR (
        nom ILIKE '%' || p_search_query || '%' OR
        commune ILIKE '%' || p_search_query || '%' OR
        code_postal ILIKE '%' || p_search_query || '%' OR
        siret ILIKE '%' || p_search_query || '%' OR
        code_naf ILIKE '%' || p_search_query || '%'
      ))
  ),
  naf_sections_agg AS (
    SELECT naf_section as key, COUNT(*)::integer as cnt
    FROM filtered_base
    WHERE naf_section IS NOT NULL AND naf_section != ''
    GROUP BY naf_section
  ),
  naf_divisions_agg AS (
    SELECT naf_division as key, COUNT(*)::integer as cnt
    FROM filtered_base
    WHERE naf_division IS NOT NULL AND naf_division != ''
    GROUP BY naf_division
  ),
  naf_groupes_agg AS (
    SELECT naf_groupe as key, COUNT(*)::integer as cnt
    FROM filtered_base
    WHERE naf_groupe IS NOT NULL AND naf_groupe != ''
    GROUP BY naf_groupe
  ),
  naf_classes_agg AS (
    SELECT naf_classe as key, COUNT(*)::integer as cnt
    FROM filtered_base
    WHERE naf_classe IS NOT NULL AND naf_classe != ''
    GROUP BY naf_classe
  ),
  naf_sous_classes_agg AS (
    SELECT code_naf as key, COUNT(*)::integer as cnt
    FROM filtered_base
    WHERE code_naf IS NOT NULL AND code_naf != ''
    GROUP BY code_naf
  ),
  departments_agg AS (
    SELECT dept as key, COUNT(*)::integer as cnt
    FROM filtered_base
    WHERE dept IS NOT NULL 
      AND dept != ''
      AND dept ~ '^[0-9]+$'
      -- NE PLUS EXCLURE les départements 97 et 98 !
    GROUP BY dept
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
    'categoriesJuridiques', '{}'::json,
    'typesEtablissement', COALESCE((SELECT json_object_agg(key, cnt) FROM types_etablissement_agg), '{}'::json)
  ) INTO result;
  
  RETURN result;
END;
$$;
