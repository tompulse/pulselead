-- 🧹 NETTOYAGE COMPLET: Supprimer TOUTES les incohérences département/ville
-- Problème: Des entreprises apparaissent dans le mauvais département lors du filtrage

-- 1️⃣ DIAGNOSTIC: Identifier l'ampleur du problème
WITH villes_connues AS (
  SELECT ville, LEFT(code_postal, 2) as dept
  FROM nouveaux_sites
  WHERE code_postal IS NOT NULL 
    AND ville IS NOT NULL
    AND LENGTH(code_postal) = 5
  GROUP BY ville, LEFT(code_postal, 2)
),
dept_majoritaire_par_ville AS (
  SELECT 
    ville,
    dept as dept_majoritaire,
    COUNT(*) as occurences,
    ROW_NUMBER() OVER (PARTITION BY ville ORDER BY COUNT(*) DESC) as rang
  FROM villes_connues
  GROUP BY ville, dept
),
dept_correct AS (
  SELECT ville, dept_majoritaire as dept_correct
  FROM dept_majoritaire_par_ville
  WHERE rang = 1
)
SELECT 
  ns.ville,
  LEFT(ns.code_postal, 2) as dept_actuel,
  dc.dept_correct as dept_attendu,
  COUNT(*) as nombre_incoherences,
  array_agg(DISTINCT ns.code_postal) as codes_postaux_errones
FROM nouveaux_sites ns
JOIN dept_correct dc ON LOWER(TRIM(ns.ville)) = LOWER(TRIM(dc.ville))
WHERE LEFT(ns.code_postal, 2) != dc.dept_correct
  AND ns.code_postal IS NOT NULL
  AND LENGTH(ns.code_postal) = 5
GROUP BY ns.ville, LEFT(ns.code_postal, 2), dc.dept_correct
ORDER BY nombre_incoherences DESC
LIMIT 100;

-- 2️⃣ COMPTAGE TOTAL des incohérences
WITH dept_majoritaire_par_ville AS (
  SELECT 
    ville,
    LEFT(code_postal, 2) as dept,
    COUNT(*) as occurences,
    ROW_NUMBER() OVER (PARTITION BY ville ORDER BY COUNT(*) DESC) as rang
  FROM nouveaux_sites
  WHERE code_postal IS NOT NULL 
    AND ville IS NOT NULL
    AND LENGTH(code_postal) = 5
  GROUP BY ville, LEFT(code_postal, 2)
),
dept_correct AS (
  SELECT ville, dept as dept_correct
  FROM dept_majoritaire_par_ville
  WHERE rang = 1
)
SELECT 
  COUNT(*) as total_incoherences,
  COUNT(DISTINCT ns.ville) as nb_villes_concernees,
  COUNT(DISTINCT LEFT(ns.code_postal, 2)) as nb_depts_concernes
FROM nouveaux_sites ns
JOIN dept_correct dc ON LOWER(TRIM(ns.ville)) = LOWER(TRIM(dc.ville))
WHERE LEFT(ns.code_postal, 2) != dc.dept_correct
  AND ns.code_postal IS NOT NULL
  AND LENGTH(ns.code_postal) = 5;

-- 3️⃣ Exemples concrets d'incohérences
WITH dept_majoritaire_par_ville AS (
  SELECT 
    ville,
    LEFT(code_postal, 2) as dept,
    COUNT(*) as occurences,
    ROW_NUMBER() OVER (PARTITION BY ville ORDER BY COUNT(*) DESC) as rang
  FROM nouveaux_sites
  WHERE code_postal IS NOT NULL 
    AND ville IS NOT NULL
    AND LENGTH(code_postal) = 5
  GROUP BY ville, LEFT(code_postal, 2)
),
dept_correct AS (
  SELECT ville, dept as dept_correct
  FROM dept_majoritaire_par_ville
  WHERE rang = 1
)
SELECT 
  ns.id,
  ns.nom,
  ns.ville,
  ns.code_postal,
  LEFT(ns.code_postal, 2) as dept_actuel,
  dc.dept_correct as dept_attendu,
  ns.adresse
FROM nouveaux_sites ns
JOIN dept_correct dc ON LOWER(TRIM(ns.ville)) = LOWER(TRIM(dc.ville))
WHERE LEFT(ns.code_postal, 2) != dc.dept_correct
  AND ns.code_postal IS NOT NULL
  AND LENGTH(ns.code_postal) = 5
ORDER BY ns.ville, ns.code_postal
LIMIT 50;

-- ⚠️ 4️⃣ SUPPRESSION: Nettoyer TOUTES les incohérences
-- Cette requête supprime toutes les entreprises dont le code postal ne correspond pas 
-- au département majoritaire de la ville

WITH dept_majoritaire_par_ville AS (
  SELECT 
    ville,
    LEFT(code_postal, 2) as dept,
    COUNT(*) as occurences,
    ROW_NUMBER() OVER (PARTITION BY ville ORDER BY COUNT(*) DESC) as rang
  FROM nouveaux_sites
  WHERE code_postal IS NOT NULL 
    AND ville IS NOT NULL
    AND LENGTH(code_postal) = 5
  GROUP BY ville, LEFT(code_postal, 2)
),
dept_correct AS (
  SELECT ville, dept as dept_correct
  FROM dept_majoritaire_par_ville
  WHERE rang = 1
),
ids_a_supprimer AS (
  SELECT ns.id
  FROM nouveaux_sites ns
  JOIN dept_correct dc ON LOWER(TRIM(ns.ville)) = LOWER(TRIM(dc.ville))
  WHERE LEFT(ns.code_postal, 2) != dc.dept_correct
    AND ns.code_postal IS NOT NULL
    AND LENGTH(ns.code_postal) = 5
)
DELETE FROM nouveaux_sites
WHERE id IN (SELECT id FROM ids_a_supprimer);

-- 5️⃣ VÉRIFICATION FINALE
SELECT 
  'Total entreprises restantes' as statut,
  COUNT(*) as nombre
FROM nouveaux_sites

UNION ALL

SELECT 
  'Avec code postal valide' as statut,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE code_postal IS NOT NULL 
  AND LENGTH(code_postal) = 5

UNION ALL

SELECT 
  'Incohérences restantes' as statut,
  COUNT(*) as nombre
FROM nouveaux_sites ns
WHERE EXISTS (
  SELECT 1
  FROM nouveaux_sites ns2
  WHERE LOWER(TRIM(ns2.ville)) = LOWER(TRIM(ns.ville))
    AND LEFT(ns2.code_postal, 2) != LEFT(ns.code_postal, 2)
    AND ns2.code_postal IS NOT NULL
    AND LENGTH(ns2.code_postal) = 5
)
AND ns.code_postal IS NOT NULL
AND LENGTH(ns.code_postal) = 5;

-- ✅ Résultat attendu: Incohérences restantes = 0
