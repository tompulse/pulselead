-- Fix search_path security warning for get_filter_counts function
DROP FUNCTION IF EXISTS get_filter_counts(text[], text[], text[], text);

CREATE OR REPLACE FUNCTION get_filter_counts(
  p_categories text[] DEFAULT NULL,
  p_departments text[] DEFAULT NULL,
  p_formes text[] DEFAULT NULL,
  p_search_query text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_category_counts jsonb;
  v_department_counts jsonb;
  v_forme_counts jsonb;
  v_search_condition text;
BEGIN
  -- Build search condition
  IF p_search_query IS NOT NULL AND p_search_query != '' THEN
    v_search_condition := format(
      '(nom ILIKE %L OR ville ILIKE %L OR adresse ILIKE %L OR activite ILIKE %L OR siret = %L)',
      '%' || p_search_query || '%',
      '%' || p_search_query || '%',
      '%' || p_search_query || '%',
      '%' || p_search_query || '%',
      p_search_query
    );
  ELSE
    v_search_condition := 'true';
  END IF;

  -- Count by categories (filtered by departments and formes)
  EXECUTE format('
    SELECT jsonb_object_agg(categorie_qualifiee, count)
    FROM (
      SELECT categorie_qualifiee, COUNT(*)::int as count
      FROM entreprises
      WHERE categorie_qualifiee IS NOT NULL
        AND %s
        AND CASE WHEN $1 IS NOT NULL AND array_length($1, 1) > 0 
            THEN SUBSTRING(code_postal, 1, 2) = ANY($1)
            ELSE true END
        AND CASE WHEN $2 IS NOT NULL AND array_length($2, 1) > 0
            THEN forme_juridique = ANY($2)
            ELSE true END
      GROUP BY categorie_qualifiee
    ) sub
  ', v_search_condition)
  INTO v_category_counts
  USING p_departments, p_formes;

  -- Count by departments (filtered by categories and formes)
  EXECUTE format('
    SELECT jsonb_object_agg(dept, count)
    FROM (
      SELECT SUBSTRING(code_postal, 1, 2) as dept, COUNT(*)::int as count
      FROM entreprises
      WHERE code_postal IS NOT NULL
        AND %s
        AND CASE WHEN $1 IS NOT NULL AND array_length($1, 1) > 0
            THEN categorie_qualifiee = ANY($1)
            ELSE true END
        AND CASE WHEN $2 IS NOT NULL AND array_length($2, 1) > 0
            THEN forme_juridique = ANY($2)
            ELSE true END
      GROUP BY SUBSTRING(code_postal, 1, 2)
    ) sub
  ', v_search_condition)
  INTO v_department_counts
  USING p_categories, p_formes;

  -- Count by formes juridiques (filtered by categories and departments)
  EXECUTE format('
    SELECT jsonb_object_agg(forme_juridique, count)
    FROM (
      SELECT forme_juridique, COUNT(*)::int as count
      FROM entreprises
      WHERE forme_juridique IS NOT NULL
        AND %s
        AND CASE WHEN $1 IS NOT NULL AND array_length($1, 1) > 0
            THEN categorie_qualifiee = ANY($1)
            ELSE true END
        AND CASE WHEN $2 IS NOT NULL AND array_length($2, 1) > 0
            THEN SUBSTRING(code_postal, 1, 2) = ANY($2)
            ELSE true END
      GROUP BY forme_juridique
    ) sub
  ', v_search_condition)
  INTO v_forme_counts
  USING p_categories, p_departments;

  -- Combine results
  v_result := jsonb_build_object(
    'categories', COALESCE(v_category_counts, '{}'::jsonb),
    'departments', COALESCE(v_department_counts, '{}'::jsonb),
    'formes', COALESCE(v_forme_counts, '{}'::jsonb)
  );

  RETURN v_result;
END;
$$;