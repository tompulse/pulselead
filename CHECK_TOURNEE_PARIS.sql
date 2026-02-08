-- 🔍 Vérifier les GPS des 6 prospects de la tournée "paris test"

SELECT 
  row_number() OVER () as numero_affichage,
  ns.id,
  ns.nom,
  ns.latitude,
  ns.longitude,
  ns.adresse,
  ns.code_postal,
  ns.ville,
  CASE 
    WHEN ns.latitude IS NULL OR ns.longitude IS NULL THEN '❌ GPS NULL'
    WHEN ns.latitude = 0 AND ns.longitude = 0 THEN '❌ GPS = 0,0'
    WHEN NOT (ns.latitude BETWEEN -90 AND 90) THEN '❌ Latitude invalide'
    WHEN NOT (ns.longitude BETWEEN -180 AND 180) THEN '❌ Longitude invalide'
    WHEN ns.latitude BETWEEN 41 AND 51 AND ns.longitude BETWEEN -5 AND 10 THEN '✅ GPS France OK'
    ELSE '⚠️ GPS hors France'
  END as statut_gps
FROM tournees t
CROSS JOIN LATERAL unnest(t.entreprises_ids) WITH ORDINALITY AS prospect_id(id, ord)
JOIN nouveaux_sites ns ON ns.id = prospect_id.id::BIGINT
WHERE t.id = '1d9b928d-b271-4a48-934c-bf9df6ede992'
ORDER BY prospect_id.ord;
