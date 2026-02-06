-- 🗑️ SUPPRESSION TOTALE de la table nouveaux_sites
-- Seulement si aucune tournée active

-- Étape 1: Vérifier qu'il n'y a pas de tournées actives
DO $$
DECLARE
  nb_tournees INT;
  nb_crm_interactions INT;
  nb_crm_statuts INT;
BEGIN
  SELECT COUNT(*) INTO nb_tournees FROM tournees;
  SELECT COUNT(*) INTO nb_crm_interactions FROM lead_interactions;
  SELECT COUNT(*) INTO nb_crm_statuts FROM lead_statuts;
  
  RAISE NOTICE '🔍 Vérification avant suppression:';
  RAISE NOTICE '  - Tournées: %', nb_tournees;
  RAISE NOTICE '  - Interactions CRM: %', nb_crm_interactions;
  RAISE NOTICE '  - Statuts CRM: %', nb_crm_statuts;
  
  IF nb_tournees > 0 OR nb_crm_interactions > 0 OR nb_crm_statuts > 0 THEN
    RAISE EXCEPTION '⚠️ STOP: Il y a des données CRM/Tournées. Suppression annulée.';
  ELSE
    RAISE NOTICE '✅ Aucune donnée CRM/Tournées. OK pour supprimer.';
  END IF;
END $$;

-- Étape 2: Supprimer TOUTES les entreprises
TRUNCATE TABLE nouveaux_sites RESTART IDENTITY CASCADE;

-- Étape 3: Vérification
SELECT 
  COUNT(*) as entreprises_restantes,
  'La table est vide, prête pour le réimport' as statut
FROM nouveaux_sites;

-- ✅ Maintenant tu peux réimporter ton CSV depuis l'onglet Admin
