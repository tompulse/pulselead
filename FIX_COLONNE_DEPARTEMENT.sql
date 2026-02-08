-- 🔧 CORRECTION: S'assurer que la colonne departement est correctement remplie
-- Problème: Le filtre par département montre des entreprises du mauvais département

-- 1️⃣ Diagnostic rapide
SELECT 
  'Total entreprises' as statut,
  COUNT(*) as nombre
FROM nouveaux_sites

UNION ALL

SELECT 
  'Avec code postal' as statut,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE code_postal IS NOT NULL

UNION ALL

SELECT 
  'Avec colonne departement remplie' as statut,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE departement IS NOT NULL

UNION ALL

SELECT 
  'Departement à synchroniser' as statut,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE code_postal IS NOT NULL 
  AND LENGTH(code_postal) >= 2
  AND (
    departement IS NULL 
    OR (LENGTH(code_postal) >= 5 AND LEFT(code_postal, 2) != departement AND LEFT(code_postal, 3) != departement)
  );

-- 2️⃣ Exemples d'incohérences
SELECT 
  id,
  nom,
  ville,
  code_postal,
  LEFT(code_postal, 2) as dept_calcule,
  departement as dept_actuel,
  'Incohérence!' as probleme
FROM nouveaux_sites
WHERE code_postal IS NOT NULL 
  AND LENGTH(code_postal) = 5
  AND departement IS NOT NULL
  AND departement != LEFT(code_postal, 2)
  AND departement != LEFT(code_postal, 3)
ORDER BY ville
LIMIT 30;

-- 3️⃣ CORRECTION: Synchroniser la colonne departement avec code_postal
UPDATE nouveaux_sites
SET departement = CASE 
  -- DOM-TOM: codes postaux à 3 chiffres (97xxx, 98xxx)
  WHEN code_postal ~ '^9[78]' AND LENGTH(code_postal) >= 3 THEN LEFT(code_postal, 3)
  -- Métropole et Corse: codes postaux à 2 chiffres
  WHEN LENGTH(code_postal) >= 2 THEN LEFT(code_postal, 2)
  ELSE NULL
END
WHERE code_postal IS NOT NULL 
  AND (
    departement IS NULL 
    OR (LENGTH(code_postal) >= 5 AND departement != LEFT(code_postal, 2) AND departement != LEFT(code_postal, 3))
  );

-- 4️⃣ Vérification après correction
SELECT 
  departement,
  COUNT(*) as nombre_entreprises,
  COUNT(DISTINCT ville) as nb_villes,
  MIN(ville) as exemple_ville_1,
  MAX(ville) as exemple_ville_2
FROM nouveaux_sites
WHERE departement IS NOT NULL
GROUP BY departement
ORDER BY departement;

-- 5️⃣ Vérifier qu'il ne reste plus d'incohérences
SELECT 
  'Incohérences restantes' as statut,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE code_postal IS NOT NULL 
  AND LENGTH(code_postal) = 5
  AND departement IS NOT NULL
  AND departement != LEFT(code_postal, 2)
  AND departement != LEFT(code_postal, 3);

-- ✅ Résultat attendu: 0 incohérences restantes
-- ✅ Ensuite, rafraîchir le dashboard pour voir les filtres corrects
