-- Conversion Lambert 93 → GPS (WGS84) - VERSION ROBUSTE
-- Gère les colonnes text et numeric

-- 1. Installer PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Ajouter les colonnes si nécessaire
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'nouveaux_sites' 
      AND column_name = 'latitude'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN latitude DOUBLE PRECISION;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'nouveaux_sites' 
      AND column_name = 'longitude'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN longitude DOUBLE PRECISION;
  END IF;
END $$;

-- 3. Conversion (gère text et numeric)
UPDATE nouveaux_sites
SET 
  latitude = ST_Y(
    ST_Transform(
      ST_SetSRID(
        ST_MakePoint(
          CAST(coordonnee_lambert_x AS DOUBLE PRECISION),
          CAST(coordonnee_lambert_y AS DOUBLE PRECISION)
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
          CAST(coordonnee_lambert_x AS DOUBLE PRECISION),
          CAST(coordonnee_lambert_y AS DOUBLE PRECISION)
        ),
        2154
      ),
      4326
    )
  )
WHERE coordonnee_lambert_x IS NOT NULL 
  AND coordonnee_lambert_y IS NOT NULL
  AND coordonnee_lambert_x <> ''
  AND coordonnee_lambert_y <> ''
  AND coordonnee_lambert_x ~ '^[0-9.]+$'
  AND coordonnee_lambert_y ~ '^[0-9.]+$';

-- 4. Créer index
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_gps 
ON nouveaux_sites(latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 5. Vérification
SELECT 
  'RÉSULTAT' as status,
  COUNT(*) as total_prospects,
  COUNT(coordonnee_lambert_x) as avec_lambert,
  COUNT(latitude) as avec_gps,
  ROUND(100.0 * COUNT(latitude) / NULLIF(COUNT(*), 0), 1) as pct_gps
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true');
