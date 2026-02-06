-- 🔍 Vérifier les codes postaux des départements 01 à 09

-- Étape 1: Voir quelques exemples de codes postaux
SELECT 
  code_postal,
  ville,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE code_postal IS NOT NULL
  AND (
    code_postal::TEXT LIKE '1%'
    OR code_postal::TEXT LIKE '2%'
    OR code_postal::TEXT LIKE '3%'
    OR code_postal::TEXT LIKE '4%'
    OR code_postal::TEXT LIKE '5%'
    OR code_postal::TEXT LIKE '6%'
    OR code_postal::TEXT LIKE '7%'
    OR code_postal::TEXT LIKE '8%'
    OR code_postal::TEXT LIKE '9%'
  )
  AND LENGTH(code_postal::TEXT) < 5
GROUP BY code_postal, ville
ORDER BY code_postal::INTEGER
LIMIT 20;

-- Étape 2: Compter combien ont un code postal < 5 caractères
SELECT 
  LENGTH(code_postal::TEXT) as longueur,
  COUNT(*) as nombre,
  MIN(code_postal) as exemple_min,
  MAX(code_postal) as exemple_max
FROM nouveaux_sites
WHERE code_postal IS NOT NULL
GROUP BY LENGTH(code_postal::TEXT)
ORDER BY longueur;

-- Étape 3: Compter par département (2 premiers chiffres)
SELECT 
  CASE 
    WHEN LENGTH(code_postal::TEXT) = 4 THEN '0' || LEFT(code_postal::TEXT, 1)
    ELSE LEFT(code_postal::TEXT, 2)
  END as departement,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE code_postal IS NOT NULL
GROUP BY departement
ORDER BY departement
LIMIT 15;
