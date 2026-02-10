-- TEST 1 : Appeler la fonction RPC sans filtres
SELECT get_nouveaux_sites_filter_counts_dynamic(
  NULL, -- naf_sections
  NULL, -- naf_divisions
  NULL, -- departments
  NULL, -- categories_juridiques
  NULL, -- types_etablissement
  NULL  -- search_query
);

-- TEST 2 : Vérifier la somme des départements
WITH rpc_result AS (
  SELECT get_nouveaux_sites_filter_counts_dynamic(NULL, NULL, NULL, NULL, NULL, NULL) as data
),
dept_counts AS (
  SELECT 
    jsonb_each(data::jsonb -> 'departments') as dept_data
  FROM rpc_result
)
SELECT 
  'SOMME DÉPARTEMENTS' as test,
  SUM((dept_data).value::text::integer) as total_additionne
FROM dept_counts;

-- TEST 3 : Vérifier la somme des sections NAF
WITH rpc_result AS (
  SELECT get_nouveaux_sites_filter_counts_dynamic(NULL, NULL, NULL, NULL, NULL, NULL) as data
),
naf_counts AS (
  SELECT 
    jsonb_each(data::jsonb -> 'nafSections') as naf_data
  FROM rpc_result
)
SELECT 
  'SOMME SECTIONS NAF' as test,
  SUM((naf_data).value::text::integer) as total_additionne
FROM naf_counts;

-- TEST 4 : Compter directement dans la table
SELECT 
  'TOTAL TABLE DIRECTE' as test,
  COUNT(*) as total
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true');

-- TEST 5 : Compter avec extraction NAF
SELECT 
  'AVEC CODE NAF NON NULL' as test,
  COUNT(*) as total
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_naf IS NOT NULL
  AND code_naf != '';

-- TEST 6 : Détails par section NAF
SELECT 
  LEFT(code_naf, 2) as section,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_naf IS NOT NULL
  AND code_naf != ''
GROUP BY LEFT(code_naf, 2)
ORDER BY COUNT(*) DESC;
