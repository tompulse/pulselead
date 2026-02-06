-- 🔄 INVERSER TOUTES les valeurs de est_siege dans la BDD

-- Étape 1: Vérification AVANT inversion
SELECT 
  est_siege,
  COUNT(*) as nombre_avant
FROM nouveaux_sites
GROUP BY est_siege
ORDER BY est_siege DESC;

-- Étape 2: INVERSER toutes les valeurs
UPDATE nouveaux_sites
SET est_siege = NOT est_siege;

-- Étape 3: Vérification APRÈS inversion
SELECT 
  est_siege,
  COUNT(*) as nombre_apres,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as pourcentage
FROM nouveaux_sites
GROUP BY est_siege
ORDER BY est_siege DESC;

-- ✅ Résultat attendu:
-- true: ~41519 (99%) = SIÈGES
-- false: ~437 (1%) = SITES SECONDAIRES
