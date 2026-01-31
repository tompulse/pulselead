-- VÉRIFICATION COMPLÈTE DES COORDONNÉES RESTANTES

-- 1. Statistiques globales
SELECT 
  COUNT(*) as total_sites,
  COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as avec_coordonnees,
  COUNT(CASE WHEN latitude BETWEEN 41 AND 51 AND longitude BETWEEN -5 AND 10 THEN 1 END) as coordonnees_valides_france,
  ROUND(AVG(latitude), 4) as latitude_moyenne,
  ROUND(AVG(longitude), 4) as longitude_moyenne
FROM nouveaux_sites;

-- 2. Vérifier les coordonnées par région (pour détecter anomalies)
SELECT 
  LEFT(code_postal, 2) as departement,
  COUNT(*) as nombre_sites,
  ROUND(AVG(latitude), 4) as lat_moy,
  ROUND(AVG(longitude), 4) as lng_moy,
  ROUND(MIN(latitude), 4) as lat_min,
  ROUND(MAX(latitude), 4) as lat_max,
  ROUND(MIN(longitude), 4) as lng_min,
  ROUND(MAX(longitude), 4) as lng_max
FROM nouveaux_sites
WHERE latitude IS NOT NULL AND longitude IS NOT NULL
GROUP BY LEFT(code_postal, 2)
ORDER BY departement;

-- 3. Détecter les coordonnées suspectes (trop regroupées = probablement fausses)
SELECT 
  ROUND(latitude, 2) as lat_arrondi,
  ROUND(longitude, 2) as lng_arrondi,
  COUNT(*) as nombre_sites,
  STRING_AGG(nom, ', ' ORDER BY nom LIMIT 5) as exemples
FROM nouveaux_sites
WHERE latitude IS NOT NULL AND longitude IS NOT NULL
GROUP BY ROUND(latitude, 2), ROUND(longitude, 2)
HAVING COUNT(*) > 20
ORDER BY COUNT(*) DESC
LIMIT 20;

-- 4. Vérifier Paris spécifiquement
SELECT 
  COUNT(*) as sites_paris,
  COUNT(CASE WHEN latitude BETWEEN 48.8 AND 48.9 
             AND longitude BETWEEN 2.2 AND 2.5 THEN 1 END) as coordonnees_coherentes,
  ROUND(AVG(latitude), 6) as lat_moyenne,
  ROUND(AVG(longitude), 6) as lng_moyenne
FROM nouveaux_sites
WHERE code_postal LIKE '75%' OR LOWER(ville) LIKE '%paris%';

-- 5. Sites avec coordonnées identiques (suspects)
SELECT 
  latitude,
  longitude,
  COUNT(*) as nombre_sites,
  STRING_AGG(DISTINCT ville, ', ') as villes
FROM nouveaux_sites
WHERE latitude IS NOT NULL
GROUP BY latitude, longitude
HAVING COUNT(*) > 5
ORDER BY COUNT(*) DESC
LIMIT 20;
