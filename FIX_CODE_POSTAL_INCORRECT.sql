-- 🔧 Corriger les codes postaux incorrects

-- 1️⃣ Voir des exemples de codes postaux incorrects
SELECT 
  nom,
  code_postal,
  LENGTH(code_postal::TEXT) as longueur,
  ville,
  siret
FROM nouveaux_sites
WHERE LENGTH(code_postal::TEXT) != 5
  AND code_postal IS NOT NULL
ORDER BY LENGTH(code_postal::TEXT) DESC
LIMIT 20;

-- 2️⃣ Corriger les codes postaux en gardant seulement les 5 premiers chiffres
UPDATE nouveaux_sites
SET code_postal = LEFT(code_postal, 5)
WHERE LENGTH(code_postal::TEXT) > 5
  AND code_postal ~ '^[0-9]+$';

-- 3️⃣ Vérification après correction
SELECT 
  LENGTH(code_postal::TEXT) as longueur,
  COUNT(*) as nombre_entreprises
FROM nouveaux_sites
WHERE code_postal IS NOT NULL
GROUP BY LENGTH(code_postal::TEXT)
ORDER BY longueur;

-- ✅ Résultat attendu: Tous les codes postaux font 5 chiffres (sauf codes spéciaux)
