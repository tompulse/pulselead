-- 🗑️ SUPPRIMER TOUTES LES INTERACTIONS CRM

-- Vérifier combien d'interactions vont être supprimées
SELECT 
  COUNT(*) as total_interactions,
  COUNT(DISTINCT entreprise_id) as entreprises_concernees,
  COUNT(DISTINCT user_id) as utilisateurs_concernes
FROM lead_interactions;

-- Voir la répartition par type
SELECT 
  type,
  statut,
  COUNT(*) as nombre
FROM lead_interactions
GROUP BY type, statut
ORDER BY nombre DESC;

-- ⚠️ ATTENTION : Cette commande supprime TOUT
-- Décommentez la ligne ci-dessous pour exécuter
-- TRUNCATE TABLE lead_interactions RESTART IDENTITY CASCADE;

-- Ou pour supprimer uniquement vos interactions :
-- DELETE FROM lead_interactions WHERE user_id = 'votre-user-id';

-- Vérifier après suppression
SELECT COUNT(*) as restantes FROM lead_interactions;
