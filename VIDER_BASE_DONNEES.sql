-- 🗑️ VIDER COMPLÈTEMENT la base de données pour import d'une nouvelle base
-- ⚠️ ATTENTION: Cette opération supprime TOUTES les données existantes !

-- 1️⃣ Statistiques AVANT suppression (pour info)
SELECT 
  '📊 État actuel de la base' as info,
  COUNT(*) as total_entreprises,
  COUNT(DISTINCT code_postal) as codes_postaux_distincts,
  COUNT(DISTINCT ville) as villes_distinctes,
  COUNT(DISTINCT naf_division) as divisions_naf_distinctes,
  COUNT(*) FILTER (WHERE latitude IS NOT NULL) as avec_gps,
  MIN(created_at) as premiere_creation,
  MAX(created_at) as derniere_creation
FROM nouveaux_sites;

-- 2️⃣ Confirmation avant suppression
-- ⚠️ DÉCOMMENTEZ LA LIGNE CI-DESSOUS POUR CONFIRMER LA SUPPRESSION
-- SELECT 'PRÊT À SUPPRIMER' as confirmation;

-- 3️⃣ SUPPRESSION TOTALE de toutes les entreprises
TRUNCATE TABLE nouveaux_sites RESTART IDENTITY CASCADE;

-- Alternative si TRUNCATE ne fonctionne pas:
-- DELETE FROM nouveaux_sites;

-- 4️⃣ Vérification que la table est vide
SELECT 
  '✅ Base de données vidée' as statut,
  COUNT(*) as entreprises_restantes,
  (SELECT COUNT(*) FROM nouveaux_sites) as verification_double
FROM nouveaux_sites;

-- 5️⃣ Réinitialiser la séquence d'ID (optionnel)
-- Trouver le nom de la séquence automatiquement
DO $$
DECLARE
  seq_name TEXT;
BEGIN
  SELECT pg_get_serial_sequence('nouveaux_sites', 'id') INTO seq_name;
  IF seq_name IS NOT NULL THEN
    EXECUTE 'ALTER SEQUENCE ' || seq_name || ' RESTART WITH 1';
    RAISE NOTICE 'Séquence réinitialisée: %', seq_name;
  ELSE
    RAISE NOTICE 'Aucune séquence trouvée pour la colonne id';
  END IF;
END $$;

-- 6️⃣ Vérification finale
SELECT 
  table_name,
  (SELECT COUNT(*) FROM nouveaux_sites) as nombre_lignes
FROM information_schema.tables 
WHERE table_name = 'nouveaux_sites';

-- ✅ La base de données est maintenant vide et prête pour le nouvel import !
-- 📥 Vous pouvez maintenant importer votre nouvelle base de données
