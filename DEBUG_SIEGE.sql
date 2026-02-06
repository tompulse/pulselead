-- 🔍 Vérifier les sièges sociaux

-- 1️⃣ Distribution en BDD
SELECT 
  est_siege,
  COUNT(*) as nombre
FROM nouveaux_sites
GROUP BY est_siege;

-- 2️⃣ Ce que la RPC retourne
SELECT get_nouveaux_sites_filter_counts_dynamic(
  NULL, NULL, NULL, NULL, NULL, NULL, NULL
) -> 'typesEtablissement';

-- 3️⃣ Test manuel
WITH filtered_base AS (
  SELECT 
    CASE WHEN est_siege = true THEN 'siege' ELSE 'site' END as type_etablissement
  FROM nouveaux_sites
  WHERE code_postal IS NOT NULL 
    AND LENGTH(code_postal) >= 2
    AND LEFT(code_postal, 2) ~ '^[0-9]+$'
    AND LEFT(code_postal, 2) NOT IN ('00', '97', '98', '99')
)
SELECT 
  type_etablissement,
  COUNT(*) as nombre
FROM filtered_base
GROUP BY type_etablissement;
