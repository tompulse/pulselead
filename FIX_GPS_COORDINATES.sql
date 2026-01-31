-- SCRIPT DE CORRECTION DES COORDONNÉES GPS
-- À exécuter dans Supabase Dashboard SQL Editor

-- 1. BACKUP: Créer une table de sauvegarde des anciennes coordonnées
CREATE TABLE IF NOT EXISTS backup_coordonnees_20260131 AS
SELECT id, nom, ville, code_postal, latitude, longitude, created_at
FROM nouveaux_sites
WHERE latitude IS NOT NULL OR longitude IS NOT NULL;

-- 2. RESET des coordonnées invalides (hors France métropolitaine)
UPDATE nouveaux_sites
SET 
  latitude = NULL,
  longitude = NULL,
  updated_at = NOW()
WHERE 
  -- Coordonnées à zéro
  (latitude = 0 OR longitude = 0)
  -- Hors France métropolitaine (41-51°N, -5-10°E)
  OR latitude < 41 OR latitude > 51
  OR longitude < -5 OR longitude > 10
  -- Coordonnées aberrantes (trop précises = suspect)
  OR ABS(latitude) > 90 OR ABS(longitude) > 180;

-- 3. Afficher un résumé des corrections
SELECT 
  'Coordonnées réinitialisées' as action,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE latitude IS NULL AND longitude IS NULL;

-- 4. Liste des sites à regeocoder (sans coordonnées valides)
SELECT 
  id,
  nom,
  COALESCE(numero_voie || ' ' || type_voie || ' ' || libelle_voie, adresse) as adresse_complete,
  code_postal,
  ville
FROM nouveaux_sites
WHERE 
  (latitude IS NULL OR longitude IS NULL)
  AND ville IS NOT NULL
  AND code_postal IS NOT NULL
ORDER BY ville, nom
LIMIT 100;

-- 5. Créer un index sur les coordonnées pour les requêtes spatiales
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_coords 
ON nouveaux_sites(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Résumé final
SELECT 
  'Total sites' as categorie,
  COUNT(*) as nombre
FROM nouveaux_sites
UNION ALL
SELECT 
  'Avec coordonnées valides',
  COUNT(*)
FROM nouveaux_sites
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL
  AND latitude BETWEEN 41 AND 51
  AND longitude BETWEEN -5 AND 10
UNION ALL
SELECT 
  'Sans coordonnées',
  COUNT(*)
FROM nouveaux_sites
WHERE latitude IS NULL OR longitude IS NULL
UNION ALL
SELECT 
  'Coordonnées hors France',
  COUNT(*)
FROM nouveaux_sites
WHERE 
  latitude IS NOT NULL 
  AND longitude IS NOT NULL
  AND (latitude < 41 OR latitude > 51 OR longitude < -5 OR longitude > 10);
