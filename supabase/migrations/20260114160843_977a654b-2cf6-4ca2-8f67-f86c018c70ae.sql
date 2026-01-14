-- Mettre à jour la fonction RPC pour inclure les comptages par type d'établissement (Siège vs Site)
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
    SELECT *
    FROM nouveaux_sites ns
    WHERE 
      -- Filtre NAF sections
      (p_naf_sections IS NULL OR ns.naf_section = ANY(p_naf_sections))
      -- Filtre NAF divisions
      AND (p_naf_divisions IS NULL OR ns.naf_division = ANY(p_naf_divisions))
      -- Filtre départements (via code postal)
      AND (p_departments IS NULL OR 
           EXISTS (
             SELECT 1 FROM unnest(p_departments) dept 
             WHERE ns.code_postal LIKE dept || '%'
           ))
      -- Filtre tailles entreprise
      AND (p_tailles IS NULL OR ns.categorie_entreprise = ANY(p_tailles))
      -- Filtre catégories juridiques
      AND (p_categories_juridiques IS NULL OR 
           EXISTS (
             SELECT 1 FROM unnest(p_categories_juridiques) cat 
             WHERE ns.categorie_juridique LIKE cat || '%'
           ))
      -- Filtre types établissement
      AND (p_types_etablissement IS NULL OR 
           (
             ('siege' = ANY(p_types_etablissement) AND ns.est_siege = true) OR
             ('site' = ANY(p_types_etablissement) AND ns.est_siege = false)
           ))
      -- Filtre recherche textuelle
      AND (p_search_query IS NULL OR p_search_query = '' OR
           ns.nom ILIKE '%' || p_search_query || '%' OR
           ns.ville ILIKE '%' || p_search_query || '%' OR
           ns.adresse ILIKE '%' || p_search_query || '%' OR
           ns.siret = p_search_query OR
           ns.code_naf ILIKE '%' || p_search_query || '%' OR
           ns.categorie_detaillee ILIKE '%' || p_search_query || '%')
  )
  SELECT json_build_object(
    'nafSections', COALESCE((
      SELECT json_object_agg(naf_section, cnt)
      FROM (
        SELECT naf_section, COUNT(*) as cnt
        FROM filtered_base
        WHERE naf_section IS NOT NULL
        GROUP BY naf_section
      ) s
    ), '{}'::json),
    'nafDivisions', COALESCE((
      SELECT json_object_agg(naf_division, cnt)
      FROM (
        SELECT naf_division, COUNT(*) as cnt
        FROM filtered_base
        WHERE naf_division IS NOT NULL
        GROUP BY naf_division
      ) d
    ), '{}'::json),
    'nafGroupes', COALESCE((
      SELECT json_object_agg(naf_groupe, cnt)
      FROM (
        SELECT naf_groupe, COUNT(*) as cnt
        FROM filtered_base
        WHERE naf_groupe IS NOT NULL
        GROUP BY naf_groupe
      ) g
    ), '{}'::json),
    'nafClasses', COALESCE((
      SELECT json_object_agg(naf_classe, cnt)
      FROM (
        SELECT naf_classe, COUNT(*) as cnt
        FROM filtered_base
        WHERE naf_classe IS NOT NULL
        GROUP BY naf_classe
      ) c
    ), '{}'::json),
    'nafSousClasses', COALESCE((
      SELECT json_object_agg(code_naf, cnt)
      FROM (
        SELECT code_naf, COUNT(*) as cnt
        FROM filtered_base
        WHERE code_naf IS NOT NULL
        GROUP BY code_naf
      ) sc
    ), '{}'::json),
    'departments', COALESCE((
      SELECT json_object_agg(dept, cnt)
      FROM (
        SELECT 
          CASE 
            WHEN code_postal ~ '^[0-9]{5}$' THEN LEFT(code_postal, 2)
            ELSE NULL
          END as dept,
          COUNT(*) as cnt
        FROM filtered_base
        WHERE code_postal IS NOT NULL 
          AND code_postal ~ '^[0-9]{5}$'
          AND LEFT(code_postal, 2) NOT IN ('00', '97', '98', '99')
        GROUP BY LEFT(code_postal, 2)
        HAVING LEFT(code_postal, 2) IS NOT NULL
      ) dp
    ), '{}'::json),
    'taillesEntreprise', COALESCE((
      SELECT json_object_agg(categorie_entreprise, cnt)
      FROM (
        SELECT categorie_entreprise, COUNT(*) as cnt
        FROM filtered_base
        WHERE categorie_entreprise IS NOT NULL
          AND categorie_entreprise IN ('GE', 'ETI', 'PME', 'Non spécifié')
        GROUP BY categorie_entreprise
      ) te
    ), '{}'::json),
    'categoriesJuridiques', COALESCE((
      SELECT json_object_agg(cat_prefix, cnt)
      FROM (
        SELECT LEFT(categorie_juridique, 1) as cat_prefix, COUNT(*) as cnt
        FROM filtered_base
        WHERE categorie_juridique IS NOT NULL
          AND categorie_juridique ~ '^[0-9]'
        GROUP BY LEFT(categorie_juridique, 1)
      ) cj
    ), '{}'::json),
    'typesEtablissement', COALESCE((
      SELECT json_object_agg(type_etab, cnt)
      FROM (
        SELECT 
          CASE 
            WHEN est_siege = true THEN 'siege'
            WHEN est_siege = false THEN 'site'
            ELSE 'non_specifie'
          END as type_etab,
          COUNT(*) as cnt
        FROM filtered_base
        WHERE est_siege IS NOT NULL
        GROUP BY est_siege
      ) te
    ), '{}'::json)
  ) INTO result;
  
  RETURN result;
END;
$$;