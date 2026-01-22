-- Script pour nettoyer la base de données
-- Supprime tous les prospects créés avant le 1er novembre 2025

-- ==========================================
-- ÉTAPE 1 : VÉRIFIER AVANT DE SUPPRIMER
-- ==========================================

-- 1. Compter les prospects à supprimer
SELECT 
  'Prospects à SUPPRIMER (< 01/11/2025)' as categorie,
  COUNT(*) as nombre,
  COUNT(*) FILTER (WHERE dirigeant IS NOT NULL AND dirigeant != '') as avec_dirigeant,
  COUNT(*) FILTER (WHERE dirigeant IS NULL OR dirigeant = '') as sans_dirigeant
FROM nouveaux_sites 
WHERE date_creation < '2025-11-01'

UNION ALL

-- 2. Compter les prospects à GARDER
SELECT 
  'Prospects à GARDER (>= 01/11/2025)' as categorie,
  COUNT(*) as nombre,
  COUNT(*) FILTER (WHERE dirigeant IS NOT NULL AND dirigeant != '') as avec_dirigeant,
  COUNT(*) FILTER (WHERE dirigeant IS NULL OR dirigeant = '') as sans_dirigeant
FROM nouveaux_sites 
WHERE date_creation >= '2025-11-01'

UNION ALL

-- 3. Total actuel
SELECT 
  'TOTAL ACTUEL' as categorie,
  COUNT(*) as nombre,
  COUNT(*) FILTER (WHERE dirigeant IS NOT NULL AND dirigeant != '') as avec_dirigeant,
  COUNT(*) FILTER (WHERE dirigeant IS NULL OR dirigeant = '') as sans_dirigeant
FROM nouveaux_sites;

-- ==========================================
-- ÉTAPE 2 : SUPPRESSION (À EXÉCUTER APRÈS VÉRIFICATION)
-- ==========================================

-- ⚠️ NE DÉCOMMENTE ET N'EXÉCUTE CETTE LIGNE QUE SI TU ES SÛR ! ⚠️
-- DELETE FROM nouveaux_sites WHERE date_creation < '2025-11-01';

-- ==========================================
-- ÉTAPE 3 : VÉRIFICATION APRÈS SUPPRESSION
-- ==========================================

-- Après avoir exécuté le DELETE, lance cette requête pour vérifier :
-- SELECT 
--   COUNT(*) as total_restant,
--   COUNT(*) FILTER (WHERE dirigeant IS NOT NULL AND dirigeant != '') as avec_dirigeant,
--   COUNT(*) FILTER (WHERE dirigeant IS NULL OR dirigeant = '') as sans_dirigeant
-- FROM nouveaux_sites;
