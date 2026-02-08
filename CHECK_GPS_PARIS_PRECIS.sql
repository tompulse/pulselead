-- 🔍 Vérifier la précision GPS pour Paris
-- Pour voir si le décalage vient de coordonnées imprécises

-- 1️⃣ Vérifier la précision des coordonnées (nombre de décimales)
SELECT 
  id,
  nom,
  ville,
  adresse,
  latitude,
  longitude,
  LENGTH(SPLIT_PART(latitude::text, '.', 2)) as decimales_lat,
  LENGTH(SPLIT_PART(longitude::text, '.', 2)) as decimales_lng,
  CASE
    WHEN LENGTH(SPLIT_PART(latitude::text, '.', 2)) < 4 
      OR LENGTH(SPLIT_PART(longitude::text, '.', 2)) < 4
    THEN '⚠️ Précision insuffisante'
    ELSE '✅ Précision OK'
  END as precision
FROM nouveaux_sites
WHERE code_postal LIKE '75%'
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL
ORDER BY RANDOM()
LIMIT 20;

-- 2️⃣ Statistiques de précision pour Paris
SELECT 
  AVG(LENGTH(SPLIT_PART(latitude::text, '.', 2))) as decimales_lat_moyenne,
  AVG(LENGTH(SPLIT_PART(longitude::text, '.', 2))) as decimales_lng_moyenne,
  MIN(LENGTH(SPLIT_PART(latitude::text, '.', 2))) as decimales_lat_min,
  MIN(LENGTH(SPLIT_PART(longitude::text, '.', 2))) as decimales_lng_min,
  COUNT(*) FILTER (WHERE LENGTH(SPLIT_PART(latitude::text, '.', 2)) < 4) as lat_peu_precise,
  COUNT(*) FILTER (WHERE LENGTH(SPLIT_PART(longitude::text, '.', 2)) < 4) as lng_peu_precise
FROM nouveaux_sites
WHERE code_postal LIKE '75%'
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL;

-- 3️⃣ Quelques adresses exactes de Paris pour test manuel
SELECT 
  nom,
  adresse,
  code_postal,
  ville,
  latitude,
  longitude
FROM nouveaux_sites
WHERE code_postal LIKE '75%'
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL
  AND adresse IS NOT NULL
ORDER BY RANDOM()
LIMIT 5;

-- ✅ Pour tester: prenez une adresse ci-dessus et vérifiez sur Google Maps
-- si les coordonnées correspondent bien à l'adresse
