-- Ajouter colonnes latitude/longitude et les remplir depuis coordonnées Lambert
-- Lambert 93 → WGS84 (GPS)

-- Installer l'extension PostGIS si pas déjà fait
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Ajouter les colonnes si elles n'existent pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN latitude NUMERIC;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN longitude NUMERIC;
  END IF;
END $$;

-- 2. Convertir Lambert 93 (EPSG:2154) vers WGS84 (EPSG:4326)
UPDATE nouveaux_sites
SET 
  latitude = ST_Y(
    ST_Transform(
      ST_SetSRID(
        ST_MakePoint(
          coordonnee_lambert_x::numeric,
          coordonnee_lambert_y::numeric
        ),
        2154  -- Lambert 93
      ),
      4326  -- WGS84 (GPS)
    )
  ),
  longitude = ST_X(
    ST_Transform(
      ST_SetSRID(
        ST_MakePoint(
          coordonnee_lambert_x::numeric,
          coordonnee_lambert_y::numeric
        ),
        2154
      ),
      4326
    )
  )
WHERE coordonnee_lambert_x IS NOT NULL 
  AND coordonnee_lambert_y IS NOT NULL
  AND coordonnee_lambert_x ~ '^[0-9.]+$'
  AND coordonnee_lambert_y ~ '^[0-9.]+$'
  AND (latitude IS NULL OR longitude IS NULL);

-- 3. Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_latitude_longitude 
ON nouveaux_sites(latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 4. Vérifier le résultat
SELECT 
  'CONVERSION TERMINÉE' as status,
  COUNT(*) as total,
  COUNT(latitude) as avec_latitude,
  COUNT(longitude) as avec_longitude,
  ROUND(100.0 * COUNT(latitude) / COUNT(*), 1) as pct_avec_gps
FROM nouveaux_sites;
