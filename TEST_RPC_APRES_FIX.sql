-- TESTER LA FONCTION RPC APRÈS LE FIX

-- 1. Appeler la fonction sans filtres (doit retourner tous les 57,160)
SELECT get_nouveaux_sites_filter_counts_dynamic(
  NULL::text[], -- naf_sections
  NULL::text[], -- naf_divisions
  NULL::text[], -- departments
  NULL::text[], -- categories_juridiques
  NULL::text[], -- types_etablissement
  NULL::text    -- search_query
);

-- 2. Vérifier les sommes
WITH rpc_data AS (
  SELECT get_nouveaux_sites_filter_counts_dynamic(
    NULL::text[], NULL::text[], NULL::text[], NULL::text[], NULL::text[], NULL::text
  ) as result
),
dept_sum AS (
  SELECT 
    SUM((value->>'value')::int) as total_dept
  FROM rpc_data, 
       json_each((result->>'departments')::json)
),
naf_sum AS (
  SELECT 
    SUM((value->>'value')::int) as total_naf
  FROM rpc_data,
       json_each((result->>'nafSections')::json)
)
SELECT 
  'VÉRIFICATION DES TOTAUX' as test,
  (SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true') as "Total BDD",
  (SELECT total_dept FROM dept_sum) as "Somme Départements",
  (SELECT total_naf FROM naf_sum) as "Somme Sections NAF";
