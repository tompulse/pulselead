-- 🔧 Corriger les codes postaux des départements 01 à 09
-- Ajouter le zéro devant si manquant

-- Étape 1: Vérifier les codes postaux à 4 chiffres
SELECT 
  LENGTH(code_postal) as longueur,
  COUNT(*) as nombre,
  array_agg(DISTINCT code_postal ORDER BY code_postal) FILTER (WHERE code_postal IS NOT NULL) as exemples
FROM nouveaux_sites
WHERE LENGTH(code_postal) = 4
GROUP BY LENGTH(code_postal);

-- Étape 2: Mettre à jour les codes postaux à 4 chiffres (ajouter 0 devant)
UPDATE nouveaux_sites
SET code_postal = '0' || code_postal
WHERE LENGTH(code_postal) = 4
  AND code_postal ~ '^[1-9][0-9]{3}$';

-- Étape 3: Vérification - afficher les départements 01 à 09
SELECT 
  LEFT(code_postal, 2) as departement,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE LEFT(code_postal, 2) IN ('01', '02', '03', '04', '05', '06', '07', '08', '09')
GROUP BY LEFT(code_postal, 2)
ORDER BY departement;

-- Étape 4: Vérifier qu'il n'y a plus de codes postaux à 4 chiffres
SELECT COUNT(*) as codes_postaux_a_4_chiffres
FROM nouveaux_sites
WHERE LENGTH(code_postal) = 4;

-- ✅ Les départements 01-09 devraient maintenant apparaître dans les filtres
