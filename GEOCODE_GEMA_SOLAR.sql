-- 🗺️ Géocoder GEMA SOLAR manuellement

-- GEMA SOLAR - 75009 PARIS
-- Coordonnées approximatives du centre de Paris 9ème: 48.8766, 2.3383

UPDATE nouveaux_sites
SET 
  latitude = 48.8766,
  longitude = 2.3383
WHERE id = 68
  AND nom = 'GEMA SOLAR';

-- Vérification
SELECT 
  id,
  nom,
  latitude,
  longitude,
  code_postal,
  ville
FROM nouveaux_sites
WHERE id = 68;
