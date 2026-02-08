-- 🔍 DIAGNOSTIC: Pourquoi les markers glissent sur la carte
-- Problème: Coordonnées correctes mais markers visuellement décalés

-- 1️⃣ Vérifier quel système de coordonnées est utilisé
SELECT 
  'Analyse des coordonnées' as diagnostic,
  COUNT(*) as total,
  AVG(latitude) as lat_moyenne,
  AVG(longitude) as lng_moyenne,
  MIN(latitude) as lat_min,
  MAX(latitude) as lat_max,
  MIN(longitude) as lng_min,
  MAX(longitude) as lng_max,
  AVG(coordonnee_lambert_x::numeric) FILTER (WHERE coordonnee_lambert_x IS NOT NULL) as lambert_x_moyen,
  AVG(coordonnee_lambert_y::numeric) FILTER (WHERE coordonnee_lambert_y IS NOT NULL) as lambert_y_moyen
FROM nouveaux_sites
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL;

-- 2️⃣ Vérifier si latitude/longitude sont en fait des coordonnées Lambert
-- Lambert 93 en France métropolitaine:
-- X (longitude équivalent): ~100 000 à 1 300 000
-- Y (latitude équivalent): ~6 000 000 à 7 200 000

SELECT 
  CASE
    WHEN latitude BETWEEN 41 AND 51 AND longitude BETWEEN -5 AND 10 
      THEN '✅ WGS84 (GPS standard)'
    WHEN latitude > 1000 OR longitude > 1000 
      THEN '⚠️ Coordonnées Lambert dans lat/lng'
    WHEN latitude BETWEEN -5 AND 10 AND longitude BETWEEN 41 AND 51 
      THEN '⚠️ Lat/Lng inversées'
    ELSE '❌ Format inconnu'
  END as type_coordonnees,
  COUNT(*) as nombre,
  AVG(latitude) as lat_moy,
  AVG(longitude) as lng_moy,
  (array_agg(DISTINCT ville ORDER BY ville) FILTER (WHERE ville IS NOT NULL))[1:5] as exemples
FROM nouveaux_sites
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL
GROUP BY type_coordonnees
ORDER BY nombre DESC;

-- 3️⃣ Exemples concrets pour Paris
SELECT 
  id,
  nom,
  ville,
  code_postal,
  latitude,
  longitude,
  coordonnee_lambert_x,
  coordonnee_lambert_y,
  CASE
    WHEN latitude BETWEEN 48 AND 49 AND longitude BETWEEN 2 AND 3 AND LEFT(code_postal, 2) = '75'
      THEN '✅ GPS correct pour Paris'
    WHEN coordonnee_lambert_x IS NOT NULL 
      AND coordonnee_lambert_x::numeric BETWEEN 600000 AND 700000 
      AND coordonnee_lambert_y::numeric BETWEEN 6800000 AND 6900000
      AND LEFT(code_postal, 2) = '75'
      THEN '⚠️ Lambert stocké dans lat/lng'
    ELSE '❌ Coordonnées suspectes'
  END as statut
FROM nouveaux_sites
WHERE ville ILIKE '%paris%'
  OR code_postal LIKE '75%'
ORDER BY RANDOM()
LIMIT 10;

-- 4️⃣ Vérifier la précision des coordonnées
SELECT 
  'Précision GPS' as check_type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE latitude::text LIKE '%.%' AND LENGTH(SPLIT_PART(latitude::text, '.', 2)) >= 4) as lat_precision_ok,
  COUNT(*) FILTER (WHERE longitude::text LIKE '%.%' AND LENGTH(SPLIT_PART(longitude::text, '.', 2)) >= 4) as lng_precision_ok,
  COUNT(*) FILTER (WHERE latitude = ROUND(latitude) OR longitude = ROUND(longitude)) as coords_arrondies
FROM nouveaux_sites
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL;

-- 5️⃣ Comparer avec les coordonnées Lambert si disponibles
SELECT 
  id,
  nom,
  ville,
  latitude as lat_actuelle,
  longitude as lng_actuelle,
  coordonnee_lambert_x,
  coordonnee_lambert_y,
  -- Vérifier si lat/lng ressemblent plus à des coordonnées Lambert
  CASE 
    WHEN latitude > 1000 OR longitude > 1000 THEN '⚠️ PROBLÈME: Coordonnées Lambert dans lat/lng'
    WHEN latitude BETWEEN 41 AND 51 AND longitude BETWEEN -5 AND 10 THEN '✅ WGS84'
    ELSE '❓ Indéterminé'
  END as diagnostic
FROM nouveaux_sites
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL
  AND (coordonnee_lambert_x IS NOT NULL OR coordonnee_lambert_y IS NOT NULL)
ORDER BY RANDOM()
LIMIT 20;

-- 6️⃣ Si coordonnées Lambert détectées: besoin de conversion
-- La conversion Lambert 93 -> WGS84 nécessite une fonction PostGIS
-- ou un service externe (geocodage)

SELECT 
  'RÉSUMÉ' as titre,
  CASE 
    WHEN AVG(latitude) BETWEEN 41 AND 51 AND AVG(longitude) BETWEEN -5 AND 10 
      THEN 'Coordonnées semblent correctes (WGS84). Problème probablement ailleurs.'
    WHEN AVG(latitude) > 1000 OR AVG(longitude) > 1000
      THEN 'ERREUR: Coordonnées Lambert stockées dans latitude/longitude. Conversion nécessaire!'
    ELSE 'Format de coordonnées non standard détecté'
  END as diagnostic,
  COUNT(*) as total_entreprises
FROM nouveaux_sites
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL;

-- ✅ Si les coordonnées sont en WGS84, le problème vient d'ailleurs (CSS, anchor, etc.)
-- ⚠️ Si les coordonnées sont en Lambert, il faut les reconvertir en WGS84
