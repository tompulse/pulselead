-- Script pour vérifier combien d'entreprises récentes tu as
-- À exécuter dans Supabase SQL Editor

-- 1. Compte les entreprises créées depuis le 1er novembre 2025
SELECT 
  'Entreprises récentes (>= 01/11/2025)' as categorie,
  COUNT(*) as nombre
FROM nouveaux_sites 
WHERE date_creation >= '2025-11-01'

UNION ALL

-- 2. Compte les entreprises anciennes (< 01/11/2025)
SELECT 
  'Entreprises anciennes (< 01/11/2025)' as categorie,
  COUNT(*) as nombre
FROM nouveaux_sites 
WHERE date_creation < '2025-11-01'

UNION ALL

-- 3. Total
SELECT 
  'TOTAL' as categorie,
  COUNT(*) as nombre
FROM nouveaux_sites;

-- 4. Répartition par mois (pour voir la distribution)
SELECT 
  TO_CHAR(date_creation, 'YYYY-MM') as mois,
  COUNT(*) as nombre
FROM nouveaux_sites 
WHERE date_creation >= '2025-11-01'
GROUP BY TO_CHAR(date_creation, 'YYYY-MM')
ORDER BY mois DESC;

-- 5. Calcul du coût Pappers pour les entreprises récentes
SELECT 
  COUNT(*) as nombre_entreprises,
  COUNT(*) * 0.08 as cout_pappers_euros
FROM nouveaux_sites 
WHERE date_creation >= '2025-11-01';
