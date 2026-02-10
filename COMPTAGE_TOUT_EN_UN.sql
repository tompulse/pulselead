-- COMPTAGE COMPLET EN UNE SEULE REQUÊTE
-- Copier-coller le résultat complet

WITH stats AS (
  SELECT
    -- Total et types
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE UPPER(siege) IN ('VRAI', 'TRUE', 'V', '1', 'OUI')) as nb_sieges,
    COUNT(*) FILTER (WHERE UPPER(siege) IN ('FAUX', 'FALSE', 'F', '0', 'NON')) as nb_sites,
    COUNT(*) FILTER (WHERE siege IS NULL OR (UPPER(siege) NOT IN ('VRAI', 'TRUE', 'V', '1', 'OUI', 'FAUX', 'FALSE', 'F', '0', 'NON'))) as nb_non_specifie,
    
    -- Sections NAF (comptage distinct)
    COUNT(DISTINCT LEFT(code_naf, 2)) FILTER (WHERE code_naf IS NOT NULL AND LENGTH(code_naf) >= 2) as nb_sections_naf,
    
    -- Divisions NAF
    COUNT(DISTINCT LEFT(code_naf, 4)) FILTER (WHERE code_naf IS NOT NULL AND LENGTH(code_naf) >= 4) as nb_divisions_naf,
    
    -- Codes NAF complets
    COUNT(DISTINCT code_naf) FILTER (WHERE code_naf IS NOT NULL) as nb_codes_naf,
    
    -- Départements
    COUNT(DISTINCT CASE 
      WHEN LENGTH(code_postal) = 4 THEN '0' || LEFT(code_postal, 1)
      WHEN LENGTH(code_postal) >= 5 THEN LEFT(code_postal, 2)
    END) FILTER (WHERE code_postal IS NOT NULL) as nb_departements
    
  FROM nouveaux_sites
  WHERE (archived IS NULL OR archived != 'true')
)
SELECT 
  '📊 RÉSUMÉ NATIONAL' as categorie,
  total as "Total",
  nb_sieges as "Sièges",
  nb_sites as "Sites", 
  nb_non_specifie as "Non spécifié",
  nb_sections_naf as "Sections NAF distinctes",
  nb_divisions_naf as "Divisions NAF distinctes",
  nb_codes_naf as "Codes NAF distincts",
  nb_departements as "Départements distincts"
FROM stats;

-- Top 10 Sections NAF
SELECT '=== TOP 10 SECTIONS NAF ===' as info;
SELECT 
  LEFT(code_naf, 2) as section_naf,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_naf IS NOT NULL 
  AND LENGTH(code_naf) >= 2
GROUP BY LEFT(code_naf, 2)
ORDER BY COUNT(*) DESC
LIMIT 10;

-- Top 10 Départements
SELECT '=== TOP 10 DÉPARTEMENTS ===' as info;
SELECT 
  CASE 
    WHEN LENGTH(code_postal) = 4 THEN '0' || LEFT(code_postal, 1)
    WHEN LENGTH(code_postal) >= 5 THEN LEFT(code_postal, 2)
  END as departement,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_postal IS NOT NULL
GROUP BY CASE 
  WHEN LENGTH(code_postal) = 4 THEN '0' || LEFT(code_postal, 1)
  WHEN LENGTH(code_postal) >= 5 THEN LEFT(code_postal, 2)
END
ORDER BY COUNT(*) DESC
LIMIT 10;

-- Top 10 Codes NAF complets
SELECT '=== TOP 10 CODES NAF COMPLETS ===' as info;
SELECT 
  code_naf,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_naf IS NOT NULL
GROUP BY code_naf
ORDER BY COUNT(*) DESC
LIMIT 10;
