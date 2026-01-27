-- ================================================
-- FORCER LA SÉLECTION DE PLAN POUR USERS EXISTANTS
-- ================================================
-- Ce script force tous les utilisateurs FREE existants
-- à choisir leur plan lors de leur prochaine connexion
-- ================================================

-- 1. Identifier les utilisateurs concernés (FREE uniquement)
SELECT 
  user_id,
  plan_type,
  is_first_login,
  created_at
FROM user_quotas
WHERE plan_type = 'free'
  AND is_first_login = false;

-- 2. Mettre à jour is_first_login pour forcer la sélection
UPDATE user_quotas
SET is_first_login = true
WHERE plan_type = 'free'
  AND is_first_login = false;

-- 3. Vérification finale
SELECT 
  COUNT(*) as total_users_a_reselectionner
FROM user_quotas
WHERE plan_type = 'free'
  AND is_first_login = true;

-- ================================================
-- RÉSULTAT ATTENDU:
-- ================================================
-- Tous les utilisateurs FREE existants auront:
-- - is_first_login = true
-- - À leur prochaine connexion → Redirection vers /plan-selection
-- - Pourront choisir entre FREE et PRO (avec 7j d'essai)
-- ================================================
