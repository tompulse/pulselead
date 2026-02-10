-- Vérifier si les colonnes latitude/longitude existent
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'nouveaux_sites' 
  AND (column_name LIKE '%lat%' OR column_name LIKE '%lon%' OR column_name LIKE '%lambert%' OR column_name LIKE '%coord%')
ORDER BY column_name;

-- Compter combien ont des coordonnées Lambert
SELECT 
  COUNT(*) as total,
  COUNT(coordonnee_lambert_x) as avec_lambert_x,
  COUNT(coordonnee_lambert_y) as avec_lambert_y,
  ROUND(100.0 * COUNT(coordonnee_lambert_x) / COUNT(*), 1) as pct_lambert
FROM nouveaux_sites;

-- Exemples de coordonnées Lambert
SELECT 
  nom,
  code_postal,
  commune,
  coordonnee_lambert_x,
  coordonnee_lambert_y
FROM nouveaux_sites
WHERE coordonnee_lambert_x IS NOT NULL
LIMIT 5;
