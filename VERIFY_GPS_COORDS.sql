-- 🔍 Vérifier les coordonnées GPS des prospects

-- Exemples de quelques prospects pour vérifier si lat/lng sont corrects
SELECT 
  nom,
  adresse,
  code_postal,
  ville,
  latitude,
  longitude,
  coordonnee_lambert_x,
  coordonnee_lambert_y,
  -- Vérifier si les coordonnées sont dans les bonnes plages
  CASE 
    WHEN latitude BETWEEN 41 AND 51 AND longitude BETWEEN -5 AND 10 THEN '✅ France métropolitaine'
    WHEN latitude BETWEEN -5 AND 10 AND longitude BETWEEN 41 AND 51 THEN '⚠️ INVERSÉES ?'
    ELSE '❌ Hors France'
  END as statut_coords
FROM nouveaux_sites
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL
ORDER BY RANDOM()
LIMIT 20;

-- Compter combien ont des coords potentiellement inversées
SELECT 
  CASE 
    WHEN latitude BETWEEN 41 AND 51 AND longitude BETWEEN -5 AND 10 THEN 'OK'
    WHEN latitude BETWEEN -5 AND 10 AND longitude BETWEEN 41 AND 51 THEN 'INVERSÉES'
    ELSE 'INVALIDES'
  END as statut,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE latitude IS NOT NULL AND longitude IS NOT NULL
GROUP BY statut;
