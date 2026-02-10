-- DEBUG: Vérifier pourquoi la tournée n'affiche pas les sites

-- 1. Vérifier votre tournée actuelle
SELECT 
  id,
  nom,
  date_planifiee,
  entreprises_ids,
  ordre_optimise,
  array_length(entreprises_ids, 1) as nb_entreprises
FROM tournees
WHERE nom = 'lyon test'
ORDER BY created_at DESC
LIMIT 1;

-- 2. Vérifier les coordonnées GPS des prospects de cette tournée
-- Remplacez les IDs ci-dessous par ceux de votre tournée (voir résultat ci-dessus)
WITH tournee_ids AS (
  SELECT unnest(entreprises_ids) as site_id
  FROM tournees
  WHERE nom = 'lyon test'
  ORDER BY created_at DESC
  LIMIT 1
)
SELECT 
  ns.id,
  ns.nom,
  ns.commune,
  ns.code_postal,
  ns.coordonnee_lambert_x,
  ns.coordonnee_lambert_y,
  ns.latitude,
  ns.longitude,
  CASE 
    WHEN ns.latitude IS NOT NULL AND ns.longitude IS NOT NULL THEN '✅ GPS OK'
    WHEN ns.coordonnee_lambert_x IS NOT NULL AND ns.coordonnee_lambert_y IS NOT NULL THEN '⚠️ Lambert OK, GPS manquant'
    ELSE '❌ Pas de coordonnées'
  END as statut
FROM tournee_ids ti
JOIN nouveaux_sites ns ON ns.id = ti.site_id;

-- 3. Stats globales GPS
SELECT 
  COUNT(*) as total_prospects,
  COUNT(coordonnee_lambert_x) as avec_lambert,
  COUNT(latitude) as avec_gps,
  ROUND(100.0 * COUNT(latitude) / NULLIF(COUNT(*), 0), 1) as pct_gps
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true');
