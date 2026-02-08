-- 🔍 DIAGNOSTIC: Pourquoi Le Haillan (33) apparaît dans le filtre département 75

-- 1️⃣ Vérifier si la colonne departement existe et est bien remplie
SELECT 
  'Structure des départements' as check_type,
  COUNT(*) as total,
  COUNT(DISTINCT departement) as nb_depts_distincts,
  COUNT(DISTINCT LEFT(code_postal, 2)) as nb_depts_via_code_postal,
  COUNT(*) FILTER (WHERE departement IS NULL) as sans_departement,
  COUNT(*) FILTER (WHERE code_postal IS NULL) as sans_code_postal
FROM nouveaux_sites;

-- 2️⃣ Vérifier les incohérences entre departement et code_postal
SELECT 
  'Incohérences departement vs code_postal' as probleme,
  COUNT(*) as nombre,
  array_agg(DISTINCT ville ORDER BY ville) FILTER (WHERE ville IS NOT NULL) as exemples_villes
FROM nouveaux_sites
WHERE departement IS NOT NULL 
  AND code_postal IS NOT NULL
  AND LENGTH(code_postal) = 5
  AND departement != LEFT(code_postal, 2)
  AND departement != LEFT(code_postal, 3) -- Pour les DOM-TOM
LIMIT 1;

-- 3️⃣ Cas spécifique: Le Haillan
SELECT 
  id,
  nom,
  ville,
  code_postal,
  LEFT(code_postal, 2) as dept_via_code_postal,
  departement as dept_colonne,
  adresse
FROM nouveaux_sites
WHERE LOWER(TRIM(ville)) = 'le haillan'
ORDER BY code_postal
LIMIT 20;

-- 4️⃣ Vérifier si des entreprises de Le Haillan ont un code postal 75XXX
SELECT 
  'Le Haillan avec code 75XXX' as probleme,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE LOWER(TRIM(ville)) = 'le haillan'
  AND LEFT(code_postal, 2) = '75';

-- 5️⃣ Statistiques globales par département (via code_postal)
SELECT 
  LEFT(code_postal, 2) as dept,
  COUNT(*) as nombre_entreprises,
  COUNT(DISTINCT ville) as nb_villes,
  array_agg(DISTINCT ville ORDER BY ville) FILTER (WHERE ville IN ('le haillan', 'bordeaux', 'marseille', 'lyon', 'toulouse', 'nice', 'nantes')) as villes_importantes
FROM nouveaux_sites
WHERE code_postal IS NOT NULL 
  AND LENGTH(code_postal) = 5
GROUP BY LEFT(code_postal, 2)
ORDER BY dept;

-- 6️⃣ Vérifier si la colonne departement est utilisée ou ignorée
SELECT 
  departement,
  LEFT(code_postal, 2) as dept_via_code_postal,
  COUNT(*) as nombre,
  array_agg(DISTINCT ville) FILTER (WHERE ville IS NOT NULL) as exemples_villes
FROM nouveaux_sites
WHERE code_postal IS NOT NULL
  AND LENGTH(code_postal) = 5
GROUP BY departement, LEFT(code_postal, 2)
HAVING departement != LEFT(code_postal, 2)
ORDER BY nombre DESC
LIMIT 20;

-- 7️⃣ Solution: Mettre à jour la colonne departement si elle existe
-- UPDATE nouveaux_sites
-- SET departement = CASE 
--   WHEN code_postal ~ '^9[78]' THEN LEFT(code_postal, 3)
--   ELSE LEFT(code_postal, 2)
-- END
-- WHERE code_postal IS NOT NULL 
--   AND LENGTH(code_postal) >= 5
--   AND (departement IS NULL OR departement != LEFT(code_postal, 2));
