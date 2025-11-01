-- Ajouter la colonne categorie_detaillee aux deux tables
ALTER TABLE public.entreprises 
ADD COLUMN IF NOT EXISTS categorie_detaillee text;

ALTER TABLE public.nouveaux_sites 
ADD COLUMN IF NOT EXISTS categorie_detaillee text;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_entreprises_categorie_detaillee 
ON public.entreprises(categorie_detaillee);

CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_categorie_detaillee 
ON public.nouveaux_sites(categorie_detaillee);

-- Mettre à jour la fonction get_filter_counts pour utiliser categorie_detaillee
CREATE OR REPLACE FUNCTION public.get_filter_counts(
  p_categories text[] DEFAULT NULL::text[], 
  p_departments text[] DEFAULT NULL::text[], 
  p_formes text[] DEFAULT NULL::text[], 
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

  -- Count by detailed categories (filtered by departments and formes)
  EXECUTE format('
    SELECT jsonb_object_agg(categorie_detaillee, count)
    FROM (
      SELECT categorie_detaillee, COUNT(*)::int as count
      FROM entreprises
      WHERE categorie_detaillee IS NOT NULL
        AND %s
        AND CASE WHEN $1 IS NOT NULL AND array_length($1, 1) > 0 
            THEN SUBSTRING(code_postal, 1, 2) = ANY($1)
            ELSE true END
        AND CASE WHEN $2 IS NOT NULL AND array_length($2, 1) > 0
            THEN forme_juridique = ANY($2)
            ELSE true END
      GROUP BY categorie_detaillee
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
            THEN categorie_detaillee = ANY($1)
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
            THEN categorie_detaillee = ANY($1)
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
$function$;