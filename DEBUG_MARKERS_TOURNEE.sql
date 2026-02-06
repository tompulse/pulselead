-- 🔍 Vérifier les GPS de tous les prospects d'une tournée

-- 1️⃣ Trouver l'ID de ta dernière tournée
SELECT 
  id as tournee_id,
  nom,
  date_planifiee,
  array_length(entreprises_ids, 1) as nb_prospects,
  array_length(ordre_optimise, 1) as nb_ordre
FROM tournees
ORDER BY created_at DESC
LIMIT 3;

-- 2️⃣ Une fois que tu as l'ID, remplace 'TON_TOURNEE_ID' ci-dessous:

-- SELECT 
--   row_number() OVER () as numero_affichage,
--   ns.id,
--   ns.nom,
--   ns.latitude,
--   ns.longitude,
--   ns.adresse,
--   ns.code_postal,
--   ns.ville,
--   CASE 
--     WHEN ns.latitude IS NULL OR ns.longitude IS NULL THEN '❌ GPS NULL'
--     WHEN ns.latitude = 0 AND ns.longitude = 0 THEN '❌ GPS = 0,0'
--     WHEN NOT (ns.latitude BETWEEN -90 AND 90) THEN '❌ Latitude invalide'
--     WHEN NOT (ns.longitude BETWEEN -180 AND 180) THEN '❌ Longitude invalide'
--     ELSE '✅ GPS VALIDE'
--   END as statut_gps
-- FROM tournees t
-- CROSS JOIN LATERAL unnest(t.entreprises_ids) WITH ORDINALITY AS prospect_id(id, ord)
-- JOIN nouveaux_sites ns ON ns.id = prospect_id.id::BIGINT
-- WHERE t.id = 'TON_TOURNEE_ID'
-- ORDER BY prospect_id.ord;
