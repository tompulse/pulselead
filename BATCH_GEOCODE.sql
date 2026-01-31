-- SCRIPT DE REGEOCODING MASSIF
-- Créer une fonction pour géocoder un site

CREATE OR REPLACE FUNCTION batch_geocode_sites(batch_size INT DEFAULT 100)
RETURNS TABLE (
  site_id BIGINT,
  nom TEXT,
  statut TEXT,
  latitude NUMERIC,
  longitude NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    nom,
    CASE 
      WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 'A regeocoder'
      ELSE 'Sans coordonnées'
    END as statut,
    latitude,
    longitude
  FROM nouveaux_sites
  WHERE 
    (latitude IS NULL OR longitude IS NULL)
    OR (latitude < 41 OR latitude > 51)
    OR (longitude < -5 OR longitude > 10)
  ORDER BY 
    CASE WHEN latitude IS NULL THEN 0 ELSE 1 END,
    ville,
    nom
  LIMIT batch_size;
END;
$$ LANGUAGE plpgsql;

-- Lister les 100 premiers sites à géocoder
SELECT * FROM batch_geocode_sites(100);

-- Pour voir combien il y en a au total
SELECT COUNT(*) as sites_a_geocoder
FROM nouveaux_sites
WHERE 
  (latitude IS NULL OR longitude IS NULL)
  OR (latitude < 41 OR latitude > 51)
  OR (longitude < -5 OR longitude > 10);
