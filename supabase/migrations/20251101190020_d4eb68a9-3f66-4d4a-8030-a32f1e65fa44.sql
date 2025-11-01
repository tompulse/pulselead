-- Créer une fonction pour obtenir les compteurs de filtres pour nouveaux_sites
CREATE OR REPLACE FUNCTION public.get_nouveaux_sites_filter_counts(
  p_categories text[] DEFAULT NULL::text[], 
  p_departments text[] DEFAULT NULL::text[], 
  p_codes_naf text[] DEFAULT NULL::text[], 
  p_search_query text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_result jsonb;
  v_category_counts jsonb;
  v_department_counts jsonb;
  v_naf_counts jsonb;
  v_search_condition text;
BEGIN
  -- Build search condition
  IF p_search_query IS NOT NULL AND p_search_query != '' THEN
    v_search_condition := format(
      '(nom ILIKE %L OR ville ILIKE %L OR adresse ILIKE %L OR siret = %L)',
      '%' || p_search_query || '%',
      '%' || p_search_query || '%',
      '%' || p_search_query || '%',
      p_search_query
    );
  ELSE
    v_search_condition := 'true';
  END IF;

  -- Count by detailed categories (filtered by departments and NAF codes)
  EXECUTE format('
    SELECT jsonb_object_agg(categorie_detaillee, count)
    FROM (
      SELECT categorie_detaillee, COUNT(*)::int as count
      FROM nouveaux_sites
      WHERE categorie_detaillee IS NOT NULL
        AND %s
        AND CASE WHEN $1 IS NOT NULL AND array_length($1, 1) > 0 
            THEN SUBSTRING(code_postal, 1, 2) = ANY($1)
            ELSE true END
        AND CASE WHEN $2 IS NOT NULL AND array_length($2, 1) > 0
            THEN EXISTS (
              SELECT 1 FROM unnest($2) AS naf_prefix 
              WHERE code_naf LIKE naf_prefix || ''%%''
            )
            ELSE true END
      GROUP BY categorie_detaillee
    ) sub
  ', v_search_condition)
  INTO v_category_counts
  USING p_departments, p_codes_naf;

  -- Count by departments (filtered by categories and NAF codes)
  EXECUTE format('
    SELECT jsonb_object_agg(dept, count)
    FROM (
      SELECT SUBSTRING(code_postal, 1, 2) as dept, COUNT(*)::int as count
      FROM nouveaux_sites
      WHERE code_postal IS NOT NULL
        AND %s
        AND CASE WHEN $1 IS NOT NULL AND array_length($1, 1) > 0
            THEN categorie_detaillee = ANY($1)
            ELSE true END
        AND CASE WHEN $2 IS NOT NULL AND array_length($2, 1) > 0
            THEN EXISTS (
              SELECT 1 FROM unnest($2) AS naf_prefix 
              WHERE code_naf LIKE naf_prefix || ''%%''
            )
            ELSE true END
      GROUP BY SUBSTRING(code_postal, 1, 2)
    ) sub
  ', v_search_condition)
  INTO v_department_counts
  USING p_categories, p_codes_naf;

  -- Count by NAF codes (first 2 digits) - filtered by categories and departments
  EXECUTE format('
    SELECT jsonb_object_agg(naf_prefix, count)
    FROM (
      SELECT SUBSTRING(code_naf, 1, 2) as naf_prefix, COUNT(*)::int as count
      FROM nouveaux_sites
      WHERE code_naf IS NOT NULL
        AND %s
        AND CASE WHEN $1 IS NOT NULL AND array_length($1, 1) > 0
            THEN categorie_detaillee = ANY($1)
            ELSE true END
        AND CASE WHEN $2 IS NOT NULL AND array_length($2, 1) > 0
            THEN SUBSTRING(code_postal, 1, 2) = ANY($2)
            ELSE true END
      GROUP BY SUBSTRING(code_naf, 1, 2)
    ) sub
  ', v_search_condition)
  INTO v_naf_counts
  USING p_categories, p_departments;

  -- Combine results
  v_result := jsonb_build_object(
    'categories', COALESCE(v_category_counts, '{}'::jsonb),
    'departments', COALESCE(v_department_counts, '{}'::jsonb),
    'nafCodes', COALESCE(v_naf_counts, '{}'::jsonb)
  );

  RETURN v_result;
END;
$function$;