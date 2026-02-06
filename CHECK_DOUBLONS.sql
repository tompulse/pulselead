-- Vérifier les doublons de SIRET
SELECT 
  siret,
  COUNT(*) as nombre_doublons,
  array_agg(id) as ids_en_double
FROM nouveaux_sites
WHERE siret IS NOT NULL 
  AND siret != ''
GROUP BY siret
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC
LIMIT 50;

-- Stats globales
SELECT 
  COUNT(*) as total_entreprises,
  COUNT(DISTINCT siret) as sirets_uniques,
  COUNT(*) - COUNT(DISTINCT siret) as doublons_a_supprimer
FROM nouveaux_sites
WHERE siret IS NOT NULL AND siret != '';
