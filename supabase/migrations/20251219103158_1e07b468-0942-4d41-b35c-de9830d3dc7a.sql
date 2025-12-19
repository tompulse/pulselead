-- Recalculer les coordonnées GPS manquantes à partir des coordonnées Lambert
UPDATE nouveaux_sites ns
SET 
  latitude = conv.lat,
  longitude = conv.lng
FROM (
  SELECT 
    id,
    (lambert93_to_wgs84(coordonnee_lambert_x, coordonnee_lambert_y)).lat AS lat,
    (lambert93_to_wgs84(coordonnee_lambert_x, coordonnee_lambert_y)).lng AS lng
  FROM nouveaux_sites
  WHERE (latitude IS NULL OR longitude IS NULL)
    AND coordonnee_lambert_x IS NOT NULL 
    AND coordonnee_lambert_y IS NOT NULL
    AND coordonnee_lambert_x != 0
    AND coordonnee_lambert_y != 0
) AS conv
WHERE ns.id = conv.id
  AND conv.lat IS NOT NULL 
  AND conv.lng IS NOT NULL;