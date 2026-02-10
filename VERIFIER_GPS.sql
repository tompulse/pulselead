-- Vérifier l'état des coordonnées GPS
SELECT 
  'Total prospects' as categorie,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')

UNION ALL

SELECT 
  'Avec Lambert X+Y' as categorie,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND coordonnee_lambert_x IS NOT NULL 
  AND coordonnee_lambert_y IS NOT NULL

UNION ALL

SELECT 
  'Avec latitude+longitude' as categorie,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND latitude IS NOT NULL 
  AND longitude IS NOT NULL

UNION ALL

SELECT 
  'Lambert OK mais GPS manquant' as categorie,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND coordonnee_lambert_x IS NOT NULL 
  AND coordonnee_lambert_y IS NOT NULL
  AND (latitude IS NULL OR longitude IS NULL);

-- Quelques exemples de données
SELECT 
  id,
  nom,
  commune,
  coordonnee_lambert_x,
  coordonnee_lambert_y,
  latitude,
  longitude
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND coordonnee_lambert_x IS NOT NULL
LIMIT 5;
