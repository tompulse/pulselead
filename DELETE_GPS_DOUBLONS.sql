-- 🗑️ Supprimer les entreprises avec GPS en double

-- Étape 1: Identifier les doublons GPS
CREATE TEMP TABLE gps_doublons AS
SELECT 
  latitude,
  longitude,
  COUNT(*) as nombre,
  array_agg(id ORDER BY created_at ASC) as ids
FROM nouveaux_sites
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL
GROUP BY latitude, longitude
HAVING COUNT(*) > 1;

-- Étape 2: Voir combien il y a de doublons
SELECT 
  COUNT(*) as groupes_de_doublons,
  SUM(nombre) as total_entreprises_concernees,
  SUM(nombre - 1) as entreprises_a_supprimer
FROM gps_doublons;

-- Étape 3: Afficher quelques exemples de doublons
SELECT 
  latitude,
  longitude,
  nombre,
  (SELECT array_agg(nom) FROM nouveaux_sites WHERE id = ANY(ids)) as noms_entreprises
FROM gps_doublons
ORDER BY nombre DESC
LIMIT 10;

-- ⚠️ VÉRIFIE les exemples ci-dessus AVANT de continuer !

-- Étape 4: Supprimer les doublons (garder le premier, supprimer le reste)
-- DÉCOMMENTER après vérification:

-- DELETE FROM nouveaux_sites
-- WHERE id IN (
--   SELECT unnest(ids[2:array_length(ids, 1)])
--   FROM gps_doublons
-- );

-- Étape 5: Vérification finale
-- SELECT 
--   COUNT(*) as total_apres,
--   COUNT(DISTINCT CONCAT(latitude, longitude)) as gps_uniques
-- FROM nouveaux_sites
-- WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- DROP TABLE gps_doublons;
