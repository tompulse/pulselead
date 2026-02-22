-- ═══════════════════════════════════════════════════════════════════
-- AJOUT DU FILTRE DATES DANS LE RPC
-- Date: 2026-02-22
-- ═══════════════════════════════════════════════════════════════════

-- Supprimer toutes les versions existantes
DROP FUNCTION IF EXISTS public.get_nouveaux_sites_filter_counts_dynamic(text[], text[], text[], text[], text[], text);
DROP FUNCTION IF EXISTS public.get_nouveaux_sites_filter_counts_dynamic(text[], text[], text[], text[], text[], text, text, text);
DROP FUNCTION IF EXISTS public.get_nouveaux_sites_filter_counts_dynamic CASCADE;

-- Recréer avec les paramètres de dates
CREATE OR REPLACE FUNCTION public.get_nouveaux_sites_filter_counts_dynamic(
  p_naf_sections text[] DEFAULT NULL,
  p_naf_divisions text[] DEFAULT NULL,
  p_departments text[] DEFAULT NULL,
  p_categories_juridiques text[] DEFAULT NULL,
  p_types_etablissement text[] DEFAULT NULL,
  p_search_query text DEFAULT NULL,
  p_date_from text DEFAULT NULL,
  p_date_to text DEFAULT NULL
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
      -- Extraire les niveaux NAF depuis code_naf (nettoyer points et espaces)
      LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) as naf_section,
      LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 4) as naf_division,
      LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 5) as naf_groupe,
      LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 6) as naf_classe,
      REPLACE(REPLACE(code_naf, '.', ''), ' ', '') as code_naf_clean,
      -- Normaliser le département avec format 01-09
      COALESCE(
        CASE 
          WHEN LENGTH(TRIM(departement)) = 2 THEN TRIM(departement)
          WHEN LENGTH(TRIM(departement)) = 1 THEN LPAD(TRIM(departement), 2, '0')
          ELSE NULL
        END,
        CASE 
          WHEN LENGTH(TRIM(code_postal)) = 4 THEN '0' || LEFT(TRIM(code_postal), 1)
          WHEN LENGTH(TRIM(code_postal)) >= 5 THEN LEFT(TRIM(code_postal), 2)
          ELSE NULL
        END
      ) as dept,
      -- Type établissement
      CASE 
        WHEN UPPER(siege) IN ('VRAI', 'TRUE', 'V', '1', 'OUI') THEN 'siege' 
        ELSE 'site' 
      END as type_etablissement
    FROM nouveaux_sites
    WHERE 
      (archived IS NULL OR archived != 'true')
      -- Filtres NAF (nettoyer avant extraction)
      AND (p_naf_sections IS NULL OR LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) = ANY(p_naf_sections))
      AND (p_naf_divisions IS NULL OR LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 4) = ANY(p_naf_divisions))
      -- Filtre départements
      AND (p_departments IS NULL OR 
           COALESCE(
             CASE 
               WHEN LENGTH(TRIM(departement)) = 2 THEN TRIM(departement)
               WHEN LENGTH(TRIM(departement)) = 1 THEN LPAD(TRIM(departement), 2, '0')
               ELSE NULL
             END,
             CASE 
               WHEN LENGTH(TRIM(code_postal)) = 4 THEN '0' || LEFT(TRIM(code_postal), 1)
               WHEN LENGTH(TRIM(code_postal)) >= 5 THEN LEFT(TRIM(code_postal), 2)
               ELSE NULL
             END
           ) = ANY(p_departments)
      )
      -- Filtre types établissement
      AND (p_types_etablissement IS NULL OR 
           (CASE 
             WHEN UPPER(siege) IN ('VRAI', 'TRUE', 'V', '1', 'OUI') THEN 'siege' 
             ELSE 'site' 
           END) = ANY(p_types_etablissement))
      -- Recherche textuelle
      AND (p_search_query IS NULL OR p_search_query = '' OR (
        nom ILIKE '%' || p_search_query || '%' OR
        commune ILIKE '%' || p_search_query || '%' OR
        code_postal ILIKE '%' || p_search_query || '%' OR
        siret ILIKE '%' || p_search_query || '%' OR
        code_naf ILIKE '%' || p_search_query || '%'
      ))
      -- ✨ Filtre dates (utilise date_creation_iso de type DATE)
      AND (p_date_from IS NULL OR 
           date_creation_iso >= TO_DATE(p_date_from, 'YYYY-MM-DD'))
      AND (p_date_to IS NULL OR 
           date_creation_iso <= TO_DATE(p_date_to, 'YYYY-MM-DD'))
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
    SELECT code_naf_clean as key, COUNT(*)::integer as cnt
    FROM filtered_base
    WHERE code_naf_clean IS NOT NULL AND code_naf_clean != ''
    GROUP BY code_naf_clean
  ),
  departments_agg AS (
    SELECT dept as key, COUNT(*)::integer as cnt
    FROM filtered_base
    WHERE dept IS NOT NULL 
      AND dept != ''
      AND dept ~ '^[0-9]{2}$'
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

-- ═══════════════════════════════════════════════════════════════════
-- TESTS
-- ═══════════════════════════════════════════════════════════════════

\echo '✅ Fonction RPC recréée avec filtre dates'
\echo ''

-- Test 1: Sans filtres (doit retourner tous les compteurs)
\echo '🧪 Test 1: Appel sans filtres'
SELECT json_object_keys((get_nouveaux_sites_filter_counts_dynamic())::json) as "Clés disponibles";

-- Test 2: Avec filtre de dates (janvier 2025)
\echo ''
\echo '🧪 Test 2: Filtre dates (janvier 2025)'
SELECT 
    'Total prospects' as info,
    (SELECT SUM((value)::int) FROM json_each_text((data->'nafSections')::json)) as total
FROM (
    SELECT get_nouveaux_sites_filter_counts_dynamic(
        p_date_from := '2025-01-01',
        p_date_to := '2025-01-31'
    ) as data
) sub;

-- Test 3: Vérifier que les dates sont bien filtrées
\echo ''
\echo '🧪 Test 3: Vérification manuelle des dates (janvier 2025)'
SELECT 
    COUNT(*) as "Prospects janvier 2025"
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND date_creation IS NOT NULL
  AND TO_DATE(date_creation, 'DD/MM/YYYY') >= TO_DATE('2025-01-01', 'YYYY-MM-DD')
  AND TO_DATE(date_creation, 'DD/MM/YYYY') <= TO_DATE('2025-01-31', 'YYYY-MM-DD');

\echo ''
\echo '═══════════════════════════════════════════════════════════════════'
\echo '✅ MIGRATION TERMINÉE'
\echo '   - Fonction RPC mise à jour avec filtres dates'
\echo '   - Format en base: DD/MM/YYYY'
\echo '   - Format en paramètres: YYYY-MM-DD'
\echo '═══════════════════════════════════════════════════════════════════'
