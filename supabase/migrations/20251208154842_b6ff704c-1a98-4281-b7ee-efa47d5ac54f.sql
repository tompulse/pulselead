-- Fonction dynamique pour compteurs de filtres contextuels
-- Les compteurs se mettent à jour en fonction des autres filtres sélectionnés
CREATE OR REPLACE FUNCTION public.get_nouveaux_sites_filter_counts_dynamic(
  p_naf_sections text[] DEFAULT NULL,
  p_naf_divisions text[] DEFAULT NULL,
  p_departments text[] DEFAULT NULL,
  p_tailles text[] DEFAULT NULL,
  p_search_query text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_search_condition text := '';
  v_dept_condition text := '';
  v_taille_condition text := '';
  v_naf_section_condition text := '';
  v_naf_division_condition text := '';
BEGIN
  -- Build search condition for multi-term search
  IF p_search_query IS NOT NULL AND trim(p_search_query) != '' THEN
    DECLARE
      terms text[];
      term text;
      conditions text[] := ARRAY[]::text[];
    BEGIN
      terms := string_to_array(trim(p_search_query), ' ');
      FOREACH term IN ARRAY terms LOOP
        IF trim(term) != '' THEN
          conditions := array_append(conditions, format(
            '(nom ILIKE %L OR ville ILIKE %L OR adresse ILIKE %L OR code_naf ILIKE %L OR siret = %L)',
            '%' || trim(term) || '%',
            '%' || trim(term) || '%',
            '%' || trim(term) || '%',
            '%' || trim(term) || '%',
            trim(term)
          ));
        END IF;
      END LOOP;
      IF array_length(conditions, 1) > 0 THEN
        v_search_condition := ' AND (' || array_to_string(conditions, ' AND ') || ')';
      END IF;
    END;
  END IF;

  -- Build filter conditions
  IF p_departments IS NOT NULL AND array_length(p_departments, 1) > 0 THEN
    v_dept_condition := ' AND SUBSTRING(code_postal, 1, 2) = ANY(' || quote_literal(p_departments::text) || '::text[])';
  END IF;

  IF p_tailles IS NOT NULL AND array_length(p_tailles, 1) > 0 THEN
    v_taille_condition := ' AND categorie_entreprise = ANY(' || quote_literal(p_tailles::text) || '::text[])';
  END IF;

  IF p_naf_sections IS NOT NULL AND array_length(p_naf_sections, 1) > 0 THEN
    v_naf_section_condition := ' AND naf_section = ANY(' || quote_literal(p_naf_sections::text) || '::text[])';
  END IF;

  IF p_naf_divisions IS NOT NULL AND array_length(p_naf_divisions, 1) > 0 THEN
    v_naf_division_condition := ' AND naf_division = ANY(' || quote_literal(p_naf_divisions::text) || '::text[])';
  END IF;

  -- Return contextual counts
  -- NAF counts are filtered by departments + tailles (not by NAF itself)
  -- Department counts are filtered by NAF + tailles (not by department itself)
  -- Taille counts are filtered by NAF + departments (not by taille itself)
  RETURN jsonb_build_object(
    'nafSections', (
      SELECT COALESCE(jsonb_object_agg(naf_section, cnt), '{}'::jsonb)
      FROM (
        SELECT naf_section, COUNT(*)::int as cnt 
        FROM nouveaux_sites 
        WHERE naf_section IS NOT NULL
        AND (p_departments IS NULL OR array_length(p_departments, 1) = 0 OR SUBSTRING(code_postal, 1, 2) = ANY(p_departments))
        AND (p_tailles IS NULL OR array_length(p_tailles, 1) = 0 OR categorie_entreprise = ANY(p_tailles))
        AND (p_search_query IS NULL OR trim(p_search_query) = '' OR 
             nom ILIKE '%' || trim(p_search_query) || '%' OR 
             ville ILIKE '%' || trim(p_search_query) || '%' OR
             adresse ILIKE '%' || trim(p_search_query) || '%')
        GROUP BY naf_section
      ) s
    ),
    'nafDivisions', (
      SELECT COALESCE(jsonb_object_agg(naf_division, cnt), '{}'::jsonb)
      FROM (
        SELECT naf_division, COUNT(*)::int as cnt 
        FROM nouveaux_sites 
        WHERE naf_division IS NOT NULL
        AND (p_naf_sections IS NULL OR array_length(p_naf_sections, 1) = 0 OR naf_section = ANY(p_naf_sections))
        AND (p_departments IS NULL OR array_length(p_departments, 1) = 0 OR SUBSTRING(code_postal, 1, 2) = ANY(p_departments))
        AND (p_tailles IS NULL OR array_length(p_tailles, 1) = 0 OR categorie_entreprise = ANY(p_tailles))
        AND (p_search_query IS NULL OR trim(p_search_query) = '' OR 
             nom ILIKE '%' || trim(p_search_query) || '%' OR 
             ville ILIKE '%' || trim(p_search_query) || '%')
        GROUP BY naf_division
      ) d
    ),
    'nafGroupes', (
      SELECT COALESCE(jsonb_object_agg(naf_groupe, cnt), '{}'::jsonb)
      FROM (
        SELECT naf_groupe, COUNT(*)::int as cnt 
        FROM nouveaux_sites 
        WHERE naf_groupe IS NOT NULL
        AND (p_naf_sections IS NULL OR array_length(p_naf_sections, 1) = 0 OR naf_section = ANY(p_naf_sections))
        AND (p_naf_divisions IS NULL OR array_length(p_naf_divisions, 1) = 0 OR naf_division = ANY(p_naf_divisions))
        AND (p_departments IS NULL OR array_length(p_departments, 1) = 0 OR SUBSTRING(code_postal, 1, 2) = ANY(p_departments))
        AND (p_tailles IS NULL OR array_length(p_tailles, 1) = 0 OR categorie_entreprise = ANY(p_tailles))
        GROUP BY naf_groupe
      ) g
    ),
    'nafClasses', (
      SELECT COALESCE(jsonb_object_agg(naf_classe, cnt), '{}'::jsonb)
      FROM (
        SELECT naf_classe, COUNT(*)::int as cnt 
        FROM nouveaux_sites 
        WHERE naf_classe IS NOT NULL
        AND (p_naf_sections IS NULL OR array_length(p_naf_sections, 1) = 0 OR naf_section = ANY(p_naf_sections))
        AND (p_naf_divisions IS NULL OR array_length(p_naf_divisions, 1) = 0 OR naf_division = ANY(p_naf_divisions))
        AND (p_departments IS NULL OR array_length(p_departments, 1) = 0 OR SUBSTRING(code_postal, 1, 2) = ANY(p_departments))
        AND (p_tailles IS NULL OR array_length(p_tailles, 1) = 0 OR categorie_entreprise = ANY(p_tailles))
        GROUP BY naf_classe
      ) c
    ),
    'nafSousClasses', (
      SELECT COALESCE(jsonb_object_agg(code_naf, cnt), '{}'::jsonb)
      FROM (
        SELECT code_naf, COUNT(*)::int as cnt 
        FROM nouveaux_sites 
        WHERE code_naf IS NOT NULL
        AND (p_naf_sections IS NULL OR array_length(p_naf_sections, 1) = 0 OR naf_section = ANY(p_naf_sections))
        AND (p_naf_divisions IS NULL OR array_length(p_naf_divisions, 1) = 0 OR naf_division = ANY(p_naf_divisions))
        AND (p_departments IS NULL OR array_length(p_departments, 1) = 0 OR SUBSTRING(code_postal, 1, 2) = ANY(p_departments))
        AND (p_tailles IS NULL OR array_length(p_tailles, 1) = 0 OR categorie_entreprise = ANY(p_tailles))
        GROUP BY code_naf
      ) sc
    ),
    'departments', (
      SELECT COALESCE(jsonb_object_agg(dept, cnt), '{}'::jsonb)
      FROM (
        SELECT SUBSTRING(code_postal, 1, 2) as dept, COUNT(*)::int as cnt 
        FROM nouveaux_sites 
        WHERE code_postal IS NOT NULL
        AND (p_naf_sections IS NULL OR array_length(p_naf_sections, 1) = 0 OR naf_section = ANY(p_naf_sections))
        AND (p_naf_divisions IS NULL OR array_length(p_naf_divisions, 1) = 0 OR naf_division = ANY(p_naf_divisions))
        AND (p_tailles IS NULL OR array_length(p_tailles, 1) = 0 OR categorie_entreprise = ANY(p_tailles))
        AND (p_search_query IS NULL OR trim(p_search_query) = '' OR 
             nom ILIKE '%' || trim(p_search_query) || '%' OR 
             ville ILIKE '%' || trim(p_search_query) || '%')
        GROUP BY SUBSTRING(code_postal, 1, 2)
      ) p
    ),
    'taillesEntreprise', (
      SELECT COALESCE(jsonb_object_agg(categorie_entreprise, cnt), '{}'::jsonb)
      FROM (
        SELECT categorie_entreprise, COUNT(*)::int as cnt 
        FROM nouveaux_sites 
        WHERE categorie_entreprise IS NOT NULL
        AND (p_naf_sections IS NULL OR array_length(p_naf_sections, 1) = 0 OR naf_section = ANY(p_naf_sections))
        AND (p_naf_divisions IS NULL OR array_length(p_naf_divisions, 1) = 0 OR naf_division = ANY(p_naf_divisions))
        AND (p_departments IS NULL OR array_length(p_departments, 1) = 0 OR SUBSTRING(code_postal, 1, 2) = ANY(p_departments))
        AND (p_search_query IS NULL OR trim(p_search_query) = '' OR 
             nom ILIKE '%' || trim(p_search_query) || '%' OR 
             ville ILIKE '%' || trim(p_search_query) || '%')
        GROUP BY categorie_entreprise
      ) t
    )
  );
END;
$$;