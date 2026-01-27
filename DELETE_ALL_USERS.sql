-- ================================================
-- SUPPRIMER TOUS LES UTILISATEURS (CLEAN SLATE)
-- ================================================
-- ⚠️ ATTENTION: Ce script supprime TOUS les utilisateurs
-- et leurs données associées (quotas, prospects, tournées)
-- Utilise ça uniquement pour les tests !
-- ================================================

-- 1. Voir combien d'utilisateurs seront supprimés
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN q.plan_type = 'free' THEN 1 END) as users_free,
  COUNT(CASE WHEN q.plan_type = 'pro' THEN 1 END) as users_pro
FROM auth.users u
LEFT JOIN user_quotas q ON u.id = q.user_id;

-- 2. Voir la liste des utilisateurs (pour vérification)
SELECT 
  u.id,
  u.email,
  u.created_at,
  q.plan_type,
  q.is_first_login
FROM auth.users u
LEFT JOIN user_quotas q ON u.id = q.user_id
ORDER BY u.created_at DESC;

-- ================================================
-- OPTION A : Supprimer UNIQUEMENT les users FREE
-- ================================================
-- (Garde les users PRO si tu en as)

-- A1. Voir les users FREE à supprimer
SELECT 
  u.id,
  u.email,
  q.plan_type
FROM auth.users u
JOIN user_quotas q ON u.id = q.user_id
WHERE q.plan_type = 'free';

-- A2. Supprimer leurs données (user_quotas, unlocked_prospects, tournées, etc.)
-- Les foreign keys avec ON DELETE CASCADE vont supprimer automatiquement
DELETE FROM user_quotas
WHERE plan_type = 'free';

-- A3. Supprimer les users FREE de auth.users
-- NOTE: Tu dois faire ça depuis Supabase Dashboard > Authentication > Users
-- Ou via l'API Supabase Admin (pas via SQL direct)

-- ================================================
-- OPTION B : Supprimer TOUS les utilisateurs
-- ================================================
-- (Reset complet - recommandé pour les tests)

-- B1. Supprimer toutes les données utilisateurs
DELETE FROM user_unlocked_prospects;
DELETE FROM user_quotas;
DELETE FROM user_subscriptions;
DELETE FROM tournees WHERE user_id IS NOT NULL;
DELETE FROM tournee_visites WHERE user_id IS NOT NULL;
DELETE FROM lead_interactions WHERE user_id IS NOT NULL;
DELETE FROM lead_statuts WHERE user_id IS NOT NULL;

-- B2. Supprimer les users de auth.users
-- NOTE: Tu dois faire ça depuis Supabase Dashboard > Authentication > Users
-- Sélectionne tous les users et clique sur "Delete"
-- Ou utilise cette approche :

-- Pour supprimer via SQL (nécessite service_role) :
-- DELETE FROM auth.users;

-- ⚠️ IMPORTANT: La suppression des users auth.users doit se faire
-- depuis le Dashboard Supabase pour plus de sécurité

-- ================================================
-- VÉRIFICATION FINALE
-- ================================================

-- Vérifier qu'il ne reste plus de données
SELECT COUNT(*) as remaining_quotas FROM user_quotas;
SELECT COUNT(*) as remaining_unlocked FROM user_unlocked_prospects;
SELECT COUNT(*) as remaining_subscriptions FROM user_subscriptions;

-- Vérifier les users restants
SELECT COUNT(*) as remaining_users FROM auth.users;

-- ================================================
-- APRÈS LE NETTOYAGE
-- ================================================
-- Tous les nouveaux utilisateurs qui s'inscriront:
-- 1. Recevront un email de confirmation
-- 2. Seront redirigés vers /plan-selection
-- 3. Devront choisir FREE ou PRO
-- 4. is_first_login sera correctement géré
-- ================================================
