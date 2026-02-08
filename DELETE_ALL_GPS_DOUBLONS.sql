-- 🗑️ Supprimer TOUTES les entreprises qui partagent un GPS

-- Étape 1: Identifier les GPS qui sont partagés par plusieurs entreprises
CREATE TEMP TABLE gps_partages AS
SELECT 
  latitude,
  longitude,
  COUNT(*) as nombre_entreprises,
  array_agg(id) as ids_a_supprimer,
  array_agg(nom) as noms
FROM nouveaux_sites
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL
GROUP BY latitude, longitude
HAVING COUNT(*) > 1;

-- Étape 2: Stats avant suppression
SELECT 
  (SELECT COUNT(*) FROM nouveaux_sites) as total_actuel,
  (SELECT COUNT(*) FROM gps_partages) as nb_groupes_gps_partages,
  (SELECT SUM(nombre_entreprises) FROM gps_partages) as total_entreprises_a_supprimer,
  (SELECT COUNT(*) FROM nouveaux_sites) - (SELECT SUM(nombre_entreprises) FROM gps_partages) as total_apres_suppression
;

-- Étape 3: Exemples de ce qui sera supprimé
SELECT 
  latitude,
  longitude,
  nombre_entreprises,
  noms
FROM gps_partages
ORDER BY nombre_entreprises DESC
LIMIT 10;

-- ⚠️ VÉRIFIE les stats ci-dessus !
-- Tu vas supprimer ~9000 entreprises et garder ~33k avec GPS unique

-- Étape 4: SUPPRIMER toutes les entreprises avec GPS partagé
DELETE FROM nouveaux_sites
WHERE id IN (
  SELECT unnest(ids_a_supprimer)
  FROM gps_partages
);

-- Étape 5: Vérification finale
SELECT 
  COUNT(*) as total_restant,
  COUNT(DISTINCT CONCAT(latitude, longitude)) as gps_uniques_restants,
  COUNT(*) - COUNT(DISTINCT CONCAT(latitude, longitude)) as doublons_restants
FROM nouveaux_sites
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

DROP TABLE gps_partages;

-- ✅ Résultat: doublons_restants doit être 0
