-- =====================================================
-- FIX FLUX CHOIX DE PLAN
-- L'utilisateur doit choisir FREE ou PRO après la connexion
-- =====================================================

-- 1. DÉSACTIVER COMPLÈTEMENT LE TRIGGER (ne crée plus de plan automatique)
DROP TRIGGER IF EXISTS on_user_created_initialize_quota ON auth.users;

-- Créer un trigger vide qui ne fait RIEN
CREATE OR REPLACE FUNCTION initialize_user_quota()
RETURNS TRIGGER AS $$
BEGIN
  -- Ne rien créer automatiquement
  -- L'utilisateur choisira son plan dans /plan-selection
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ne pas recréer le trigger - on le laisse désactivé

-- 2. SUPPRIMER LES QUOTAS/SUBSCRIPTIONS CRÉÉS AUTOMATIQUEMENT
-- ⚠️ ATTENTION : Ceci supprime les quotas de TOUS les utilisateurs
-- Si tu as déjà des vrais utilisateurs, ne fais pas ça ou sois sélectif

-- Option A : Supprimer TOUS les quotas (si tu es en dev/test)
-- DÉCOMMENTE ces lignes si tu veux tout reset
/*
TRUNCATE user_quotas CASCADE;
TRUNCATE user_subscriptions CASCADE;
TRUNCATE user_unlocked_prospects CASCADE;
*/

-- Option B : Supprimer seulement ton compte test
-- DÉCOMMENTE et remplace par ton email
/*
DELETE FROM user_unlocked_prospects 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'ton@email.com');

DELETE FROM user_subscriptions 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'ton@email.com');

DELETE FROM user_quotas 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'ton@email.com');
*/

-- 3. MODIFIER activate_free_plan pour créer les quotas correctement
CREATE OR REPLACE FUNCTION activate_free_plan(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Créer user_quotas avec is_first_login = false (plan choisi)
  INSERT INTO user_quotas (
    user_id,
    plan_type,
    prospects_unlocked_count,
    tournees_created_count,
    is_first_login
  ) VALUES (
    p_user_id,
    'free',
    0,
    0,
    false  -- L'utilisateur a maintenant choisi son plan
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan_type = 'free',
    is_first_login = false,
    prospects_unlocked_count = 0,
    tournees_created_count = 0,
    updated_at = now();

  -- Créer user_subscriptions
  INSERT INTO user_subscriptions (
    user_id,
    plan_type,
    subscription_status
  ) VALUES (
    p_user_id,
    'free',
    'active'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan_type = 'free',
    subscription_status = 'active';

  RETURN json_build_object(
    'success', true,
    'plan_type', 'free',
    'message', 'Plan FREE activé'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION activate_free_plan(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION activate_free_plan(uuid) TO anon;

-- 4. CRÉER activate_pro_plan (pour le plan PRO)
CREATE OR REPLACE FUNCTION activate_pro_plan(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Créer user_quotas avec is_first_login = false (plan choisi)
  INSERT INTO user_quotas (
    user_id,
    plan_type,
    prospects_unlocked_count,
    tournees_created_count,
    is_first_login
  ) VALUES (
    p_user_id,
    'pro',
    0,
    0,
    false  -- L'utilisateur a maintenant choisi son plan
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan_type = 'pro',
    is_first_login = false,
    updated_at = now();

  -- Créer user_subscriptions avec status 'pending'
  -- (sera mis à jour par Stripe webhook après paiement)
  INSERT INTO user_subscriptions (
    user_id,
    plan_type,
    subscription_status
  ) VALUES (
    p_user_id,
    'pro',
    'pending'  -- En attente du paiement Stripe
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan_type = 'pro',
    subscription_status = 'pending';

  RETURN json_build_object(
    'success', true,
    'plan_type', 'pro',
    'message', 'Plan PRO activé - redirection vers paiement'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION activate_pro_plan(uuid) TO authenticated;

-- 5. VÉRIFIER LA CONFIGURATION
DO $$
BEGIN
  RAISE NOTICE '✅ Trigger désactivé - Pas de création automatique de plan';
  RAISE NOTICE '✅ activate_free_plan créé';
  RAISE NOTICE '✅ activate_pro_plan créé';
  RAISE NOTICE '';
  RAISE NOTICE '📋 FLUX UTILISATEUR :';
  RAISE NOTICE '  1. Inscription → Email';
  RAISE NOTICE '  2. Validation email → Page "Email confirmé"';
  RAISE NOTICE '  3. Connexion → Redirection vers /plan-selection';
  RAISE NOTICE '  4. Choix FREE → activate_free_plan() → Dashboard';
  RAISE NOTICE '  5. Choix PRO → activate_pro_plan() → Stripe → Dashboard';
END $$;
