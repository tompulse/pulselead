-- 🔍 Vérifier les coordonnées GPS des prospects d'une tournée

-- Remplace 'TON_TOURNEE_ID' par l'ID de ta tournée
-- Pour trouver l'ID, regarde l'URL ou exécute:
SELECT id, nom, date_planifiee, array_length(entreprises_ids, 1) as nb_prospects
FROM tournees
ORDER BY created_at DESC
LIMIT 5;

-- Ensuite, vérifie les GPS de chaque prospect de la tournée:
-- REMPLACE 'TON_TOURNEE_ID' par le vrai ID ci-dessous ⬇️

-- SELECT 
--   ns.id,
--   ns.nom,
--   ns.latitude,
--   ns.longitude,
--   ns.adresse,
--   ns.code_postal,
--   ns.ville,
--   CASE 
--     WHEN ns.latitude IS NULL OR ns.longitude IS NULL THEN '❌ GPS MANQUANT'
--     WHEN ns.latitude = 0 AND ns.longitude = 0 THEN '❌ GPS INVALIDE (0,0)'
--     ELSE '✅ GPS OK'
--   END as statut_gps
-- FROM tournees t
-- CROSS JOIN LATERAL unnest(t.entreprises_ids) AS prospect_id
-- JOIN nouveaux_sites ns ON ns.id = prospect_id::BIGINT
-- WHERE t.id = 'TON_TOURNEE_ID'
-- ORDER BY array_position(t.ordre_optimise, prospect_id::TEXT);
