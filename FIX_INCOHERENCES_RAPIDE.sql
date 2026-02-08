-- 🚀 CORRECTION RAPIDE des incohérences département/ville
-- Problème: Le Haillan (33) apparaît dans le département 75

-- 1️⃣ Voir combien d'entrées sont concernées
SELECT 
  'Villes du 33 avec mauvais code postal' as probleme,
  COUNT(*) as nombre_entreprises
FROM nouveaux_sites
WHERE LOWER(TRIM(ville)) LIKE '%haillan%'
  AND LEFT(code_postal, 2) != '33'
  AND code_postal IS NOT NULL

UNION ALL

SELECT 
  'Toutes incohérences Gironde (33)' as probleme,
  COUNT(*) as nombre_entreprises
FROM nouveaux_sites
WHERE LOWER(TRIM(ville)) IN (
  'le haillan', 'bordeaux', 'mérignac', 'pessac', 'talence', 'bègles', 
  'villenave-d''ornon', 'gradignan', 'cenon', 'lormont', 'floirac',
  'ambarès-et-lagrave', 'artigues-près-bordeaux', 'blanquefort', 
  'carbon-blanc', 'eysines', 'le bouscat', 'parempuyre', 
  'saint-médard-en-jalles', 'bruges', 'bassens'
)
AND LEFT(code_postal, 2) != '33'
AND code_postal IS NOT NULL;

-- 2️⃣ Voir des exemples
SELECT 
  id,
  nom,
  code_postal,
  ville,
  adresse,
  LEFT(code_postal, 2) as dept_actuel
FROM nouveaux_sites
WHERE LOWER(TRIM(ville)) LIKE '%haillan%'
  AND LEFT(code_postal, 2) != '33'
  AND code_postal IS NOT NULL
LIMIT 20;

-- 3️⃣ SUPPRIMER LES INCOHÉRENCES (décommente pour exécuter)
DELETE FROM nouveaux_sites
WHERE LOWER(TRIM(ville)) IN (
  'le haillan', 'bordeaux', 'mérignac', 'pessac', 'talence', 'bègles', 
  'villenave-d''ornon', 'gradignan', 'cenon', 'lormont', 'floirac',
  'ambarès-et-lagrave', 'artigues-près-bordeaux', 'blanquefort', 
  'carbon-blanc', 'eysines', 'le bouscat', 'parempuyre', 
  'saint-médard-en-jalles', 'bruges', 'bassens', 'ambares-et-lagrave'
)
AND LEFT(code_postal, 2) != '33'
AND code_postal IS NOT NULL;

-- 4️⃣ Vérification finale
SELECT 
  'Vérification: Le Haillan restant' as check_type,
  COUNT(*) as nombre,
  array_agg(DISTINCT LEFT(code_postal, 2)) as departements
FROM nouveaux_sites
WHERE LOWER(TRIM(ville)) LIKE '%haillan%'
  AND code_postal IS NOT NULL;

-- ✅ Résultat attendu: nombre = 0 ou seulement département 33
