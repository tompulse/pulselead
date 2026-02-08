-- 🔧 CORRIGER les markers mal placés (latitude/longitude inversées)
-- Problème: Les markers s'affichent au mauvais endroit sur la carte

-- 1️⃣ Vérifier si latitude et longitude sont inversées
-- En France métropolitaine:
-- - Latitude devrait être entre 41° et 51° (Nord/Sud)
-- - Longitude devrait être entre -5° et 10° (Ouest/Est)

SELECT 
  'Coordonnées probablement inversées' as probleme,
  COUNT(*) as nombre_entreprises,
  (array_agg(DISTINCT ville ORDER BY ville) FILTER (WHERE ville IS NOT NULL))[1:10] as exemples_villes
FROM nouveaux_sites
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL
  -- Latitude dans les valeurs de longitude (-5 à 10)
  AND latitude BETWEEN -5 AND 10
  -- Longitude dans les valeurs de latitude (41 à 51)
  AND longitude BETWEEN 41 AND 51;

-- 2️⃣ Exemples concrets d'inversions
SELECT 
  id,
  nom,
  ville,
  code_postal,
  latitude as lat_actuelle,
  longitude as lng_actuelle,
  CASE 
    WHEN latitude BETWEEN -5 AND 10 AND longitude BETWEEN 41 AND 51 
    THEN '⚠️ INVERSÉ'
    ELSE '✅ OK'
  END as statut
FROM nouveaux_sites
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL
  AND (
    -- Latitude dans les valeurs de longitude
    (latitude BETWEEN -5 AND 10 AND longitude BETWEEN 41 AND 51)
    OR
    -- Ou coordonnées complètement hors de France
    (latitude NOT BETWEEN 41 AND 51 OR longitude NOT BETWEEN -5 AND 10)
  )
ORDER BY ville
LIMIT 50;

-- 3️⃣ Statistiques des coordonnées
SELECT 
  CASE 
    WHEN latitude BETWEEN -5 AND 10 AND longitude BETWEEN 41 AND 51 THEN 'Inversées'
    WHEN latitude BETWEEN 41 AND 51 AND longitude BETWEEN -5 AND 10 THEN 'Correctes'
    ELSE 'Hors France'
  END as type_coords,
  COUNT(*) as nombre,
  MIN(latitude) as lat_min,
  MAX(latitude) as lat_max,
  MIN(longitude) as lng_min,
  MAX(longitude) as lng_max
FROM nouveaux_sites
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL
GROUP BY type_coords
ORDER BY nombre DESC;

-- 4️⃣ CORRECTION: Inverser latitude et longitude
-- Créer une sauvegarde temporaire
CREATE TEMP TABLE coords_backup AS
SELECT id, latitude, longitude, code_postal
FROM nouveaux_sites
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL
  AND latitude BETWEEN -5 AND 10 
  AND longitude BETWEEN 41 AND 51;

-- Afficher ce qui va être inversé
SELECT 
  COUNT(*) as entreprises_a_corriger,
  array_agg(DISTINCT LEFT(code_postal, 2) ORDER BY LEFT(code_postal, 2)) FILTER (WHERE code_postal IS NOT NULL) as departements_concernes
FROM coords_backup;

-- INVERSER les coordonnées
UPDATE nouveaux_sites
SET 
  latitude = longitude,
  longitude = latitude
WHERE id IN (SELECT id FROM coords_backup);

-- 5️⃣ Vérification après correction
SELECT 
  'Après correction' as statut,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE latitude BETWEEN 41 AND 51 AND longitude BETWEEN -5 AND 10) as coords_correctes,
  COUNT(*) FILTER (WHERE latitude BETWEEN -5 AND 10 AND longitude BETWEEN 41 AND 51) as coords_inversees,
  COUNT(*) FILTER (WHERE latitude NOT BETWEEN 41 AND 51 OR longitude NOT BETWEEN -5 AND 10) as hors_france
FROM nouveaux_sites
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL;

-- 6️⃣ Exemples après correction
SELECT 
  id,
  nom,
  ville,
  code_postal,
  latitude,
  longitude,
  '✅ Corrigé' as statut
FROM nouveaux_sites
WHERE id IN (SELECT id FROM coords_backup LIMIT 10);

-- Nettoyer la table temporaire
DROP TABLE coords_backup;

-- ✅ Les markers devraient maintenant être correctement placés sur la carte
