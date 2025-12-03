-- Create a function to get all filter counts for nouveaux_sites
CREATE OR REPLACE FUNCTION public.get_nouveaux_sites_filter_counts_v2()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'nafSections', COALESCE((
      SELECT jsonb_object_agg(naf_section, cnt) 
      FROM (
        SELECT naf_section, COUNT(*)::int as cnt 
        FROM nouveaux_sites 
        WHERE naf_section IS NOT NULL 
        GROUP BY naf_section
      ) s
    ), '{}'::jsonb),
    'nafDivisions', COALESCE((
      SELECT jsonb_object_agg(naf_division, cnt)
      FROM (
        SELECT naf_division, COUNT(*)::int as cnt 
        FROM nouveaux_sites 
        WHERE naf_division IS NOT NULL 
        GROUP BY naf_division
      ) d
    ), '{}'::jsonb),
    'departments', COALESCE((
      SELECT jsonb_object_agg(dept, cnt)
      FROM (
        SELECT SUBSTRING(code_postal, 1, 2) as dept, COUNT(*)::int as cnt 
        FROM nouveaux_sites 
        WHERE code_postal IS NOT NULL 
        GROUP BY SUBSTRING(code_postal, 1, 2)
      ) p
    ), '{}'::jsonb),
    'taillesEntreprise', COALESCE((
      SELECT jsonb_object_agg(categorie_entreprise, cnt)
      FROM (
        SELECT categorie_entreprise, COUNT(*)::int as cnt 
        FROM nouveaux_sites 
        WHERE categorie_entreprise IS NOT NULL 
        GROUP BY categorie_entreprise
      ) t
    ), '{}'::jsonb)
  );
$$;