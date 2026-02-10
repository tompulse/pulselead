-- Version ultra-simple - exécuter chaque requête séparément si besoin

-- 1. RÉSUMÉ : Total, Sièges, Sites
SELECT 
  COUNT(*) as "TOTAL",
  COUNT(CASE WHEN UPPER(siege) IN ('VRAI', 'TRUE', 'V', '1', 'OUI') THEN 1 END) as "SIEGES",
  COUNT(CASE WHEN UPPER(siege) IN ('FAUX', 'FALSE', 'F', '0', 'NON') THEN 1 END) as "SITES"
FROM nouveaux_sites;

-- 2. TOP 10 SECTIONS NAF (2 premiers caractères)
SELECT 
  LEFT(code_naf, 2) as section_naf,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE code_naf IS NOT NULL
GROUP BY LEFT(code_naf, 2)
ORDER BY COUNT(*) DESC
LIMIT 10;

-- 3. TOP 10 DÉPARTEMENTS
SELECT 
  LEFT(code_postal, 2) as departement,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE code_postal IS NOT NULL
GROUP BY LEFT(code_postal, 2)
ORDER BY COUNT(*) DESC
LIMIT 10;
