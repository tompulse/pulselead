-- Comptage simple et rapide pour vérifier les données
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. TOTAL GÉNÉRAL
SELECT 'TOTAL GENERAL' as label, COUNT(*) as nombre
FROM nouveaux_sites;

-- 2. PAR TYPE (Siège vs Site) - si la colonne existe
SELECT 
  'Type: ' || COALESCE(est_siege::text, 'inconnu') as label, 
  COUNT(*) as nombre
FROM nouveaux_sites
GROUP BY est_siege
ORDER BY COUNT(*) DESC;

-- 3. PAR DÉPARTEMENT (depuis code_postal)
SELECT 
  'Département: ' || LEFT(code_postal, 2) as label,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE code_postal IS NOT NULL AND LENGTH(code_postal) >= 2
GROUP BY LEFT(code_postal, 2)
ORDER BY COUNT(*) DESC
LIMIT 20;

-- 4. PAR CATÉGORIE JURIDIQUE (si existe)
SELECT 
  'Catégorie Juridique: ' || categorie_juridique as label,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE categorie_juridique IS NOT NULL
GROUP BY categorie_juridique
ORDER BY COUNT(*) DESC
LIMIT 20;

-- 5. VÉRIFIER SI LES COLONNES NAF EXISTENT
SELECT 
  COUNT(*) FILTER (WHERE naf_section IS NOT NULL) as avec_naf_section,
  COUNT(*) FILTER (WHERE naf_division IS NOT NULL) as avec_naf_division,
  COUNT(*) FILTER (WHERE naf_groupe IS NOT NULL) as avec_naf_groupe,
  COUNT(*) FILTER (WHERE naf_classe IS NOT NULL) as avec_naf_classe,
  COUNT(*) FILTER (WHERE code_naf IS NOT NULL) as avec_code_naf,
  COUNT(*) as total
FROM nouveaux_sites;

-- 6. SI NAF_SECTION EXISTE, compter par section
-- (Décommentez cette requête après avoir vérifié que la colonne existe)
/*
SELECT 
  'Section NAF: ' || naf_section as label,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE naf_section IS NOT NULL
GROUP BY naf_section
ORDER BY COUNT(*) DESC;
*/

-- 7. SI NAF_DIVISION EXISTE, compter par division (top 20)
-- (Décommentez cette requête après avoir vérifié que la colonne existe)
/*
SELECT 
  'Division NAF: ' || naf_division as label,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE naf_division IS NOT NULL
GROUP BY naf_division
ORDER BY COUNT(*) DESC
LIMIT 20;
*/
