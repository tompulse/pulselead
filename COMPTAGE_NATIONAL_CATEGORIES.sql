-- Comptage national de tous les prospects par catégorie
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. TOTAL GÉNÉRAL DE PROSPECTS (non archivés)
SELECT 'TOTAL PROSPECTS' as categorie, COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true');

-- 2. PAR SECTION NAF
SELECT 'Section NAF: ' || naf_section as categorie, COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true') AND naf_section IS NOT NULL
GROUP BY naf_section
ORDER BY COUNT(*) DESC;

-- 3. PAR DIVISION NAF (top 20)
SELECT 'Division NAF: ' || naf_division as categorie, COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true') AND naf_division IS NOT NULL
GROUP BY naf_division
ORDER BY COUNT(*) DESC
LIMIT 20;

-- 4. PAR DÉPARTEMENT (normalisé avec zéro initial)
SELECT 
  'Département: ' || CASE 
    WHEN LENGTH(code_postal) = 4 THEN '0' || LEFT(code_postal, 1)
    WHEN LENGTH(code_postal) >= 5 THEN LEFT(code_postal, 2)
    ELSE 'INCONNU'
  END as categorie, 
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_postal IS NOT NULL
GROUP BY CASE 
  WHEN LENGTH(code_postal) = 4 THEN '0' || LEFT(code_postal, 1)
  WHEN LENGTH(code_postal) >= 5 THEN LEFT(code_postal, 2)
  ELSE 'INCONNU'
END
ORDER BY COUNT(*) DESC;

-- 5. PAR CATÉGORIE JURIDIQUE
SELECT 'Catégorie Juridique: ' || categorie_juridique as categorie, COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true') AND categorie_juridique IS NOT NULL
GROUP BY categorie_juridique
ORDER BY COUNT(*) DESC;

-- 6. PAR TYPE D'ÉTABLISSEMENT (Siège vs Site)
SELECT 
  'Type: ' || CASE WHEN est_siege = true THEN 'Siège' ELSE 'Site' END as categorie, 
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
GROUP BY est_siege;

-- 7. RÉSUMÉ COMPLET EN UNE SEULE REQUÊTE
WITH stats AS (
  SELECT
    COUNT(*) as total,
    COUNT(CASE WHEN est_siege = true THEN 1 END) as sieges,
    COUNT(CASE WHEN est_siege != true THEN 1 END) as sites,
    COUNT(DISTINCT naf_section) as nb_sections_naf,
    COUNT(DISTINCT naf_division) as nb_divisions_naf,
    COUNT(DISTINCT categorie_juridique) as nb_categories_juridiques,
    COUNT(DISTINCT CASE 
      WHEN LENGTH(code_postal) = 4 THEN '0' || LEFT(code_postal, 1)
      WHEN LENGTH(code_postal) >= 5 THEN LEFT(code_postal, 2)
    END) as nb_departements
  FROM nouveaux_sites
  WHERE (archived IS NULL OR archived != 'true')
)
SELECT 
  '📊 RÉSUMÉ NATIONAL' as titre,
  total as "Total Prospects",
  sieges as "Sièges",
  sites as "Sites",
  nb_sections_naf as "Sections NAF",
  nb_divisions_naf as "Divisions NAF",
  nb_categories_juridiques as "Catégories Juridiques",
  nb_departements as "Départements"
FROM stats;
