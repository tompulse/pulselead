-- Vérifier la qualité des coordonnées GPS dans nouveaux_sites

-- 1. Compter les sites avec coordonnées invalides ou suspectes
SELECT 
  COUNT(*) as total_sites,
  COUNT(CASE WHEN latitude IS NULL OR longitude IS NULL THEN 1 END) as sans_coordonnees,
  COUNT(CASE WHEN latitude = 0 OR longitude = 0 THEN 1 END) as coordonnees_zero,
  COUNT(CASE WHEN latitude < 41 OR latitude > 51 THEN 1 END) as hors_france_lat,
  COUNT(CASE WHEN longitude < -5 OR longitude > 10 THEN 1 END) as hors_france_lng,
  COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL 
             AND latitude BETWEEN 41 AND 51 
             AND longitude BETWEEN -5 AND 10 THEN 1 END) as coordonnees_valides_france
FROM nouveaux_sites;

-- 2. Afficher les 20 premiers sites avec des coordonnées suspectes
SELECT 
  id,
  nom,
  ville,
  code_postal,
  latitude,
  longitude,
  CASE 
    WHEN latitude IS NULL OR longitude IS NULL THEN 'Coordonnées manquantes'
    WHEN latitude = 0 OR longitude = 0 THEN 'Coordonnées à zéro'
    WHEN latitude < 41 OR latitude > 51 THEN 'Latitude hors France'
    WHEN longitude < -5 OR longitude > 10 THEN 'Longitude hors France'
    ELSE 'OK'
  END as statut
FROM nouveaux_sites
WHERE 
  latitude IS NULL OR longitude IS NULL
  OR latitude = 0 OR longitude = 0
  OR latitude < 41 OR latitude > 51
  OR longitude < -5 OR longitude > 10
ORDER BY nom
LIMIT 20;

-- 3. Trouver les sites avec ville = Paris mais coordonnées loin de Paris
SELECT 
  id,
  nom,
  ville,
  code_postal,
  latitude,
  longitude,
  -- Distance approximative du centre de Paris (48.8566, 2.3522)
  ROUND(
    CAST(
      111.32 * SQRT(
        POWER(latitude - 48.8566, 2) + 
        POWER((longitude - 2.3522) * COS(RADIANS(latitude)), 2)
      ) AS NUMERIC
    ), 2
  ) as distance_paris_km
FROM nouveaux_sites
WHERE 
  (LOWER(ville) LIKE '%paris%' OR code_postal LIKE '75%')
  AND latitude IS NOT NULL 
  AND longitude IS NOT NULL
  AND (
    latitude NOT BETWEEN 48.8 AND 48.9
    OR longitude NOT BETWEEN 2.2 AND 2.5
  )
ORDER BY distance_paris_km DESC
LIMIT 20;
