-- =====================================================
-- SCRIPT COMPLET POUR RÉPARER LE PLAN DÉCOUVERTE
-- Date: 2026-01-27
-- À exécuter dans Supabase SQL Editor
-- =====================================================

-- 1. Create or replace activate_free_plan RPC function
-- Cette fonction est appelée quand l'utilisateur clique "Commencer gratuitement"
CREATE OR REPLACE FUNCTION activate_free_plan(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Upsert dans user_quotas avec is_first_login = false
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
    is_first_login = false,  -- Marquer comme n'étant plus la première connexion
    updated_at = now();

  -- Upsert dans user_subscriptions
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

  -- Retourner succès
  RETURN json_build_object(
    'success', true,
    'plan_type', 'free',
    'message', 'Plan FREE activé avec succès'
  );
END;
$$;

-- 2. Grant execute permission
GRANT EXECUTE ON FUNCTION activate_free_plan(uuid) TO authenticated;

-- 3. Ensure trigger function is correct
CREATE OR REPLACE FUNCTION initialize_user_quota()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer l'enregistrement subscription avec plan free
  INSERT INTO user_subscriptions (user_id, plan_type, subscription_status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Créer l'enregistrement quota avec is_first_login = true
  INSERT INTO user_quotas (user_id, plan_type, is_first_login)
  VALUES (NEW.id, 'free', true)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure trigger exists
DROP TRIGGER IF EXISTS on_user_created_initialize_quota ON auth.users;
CREATE TRIGGER on_user_created_initialize_quota
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_quota();

-- 5. Fix existing users who might be stuck
-- Assurer que tous les utilisateurs ont des valeurs correctes
UPDATE user_quotas
SET 
  prospects_unlocked_count = COALESCE(prospects_unlocked_count, 0),
  tournees_created_count = COALESCE(tournees_created_count, 0)
WHERE prospects_unlocked_count IS NULL 
   OR tournees_created_count IS NULL;

-- Synchroniser user_subscriptions
INSERT INTO user_subscriptions (user_id, plan_type, subscription_status)
SELECT 
  uq.user_id, 
  'free', 
  'active'
FROM user_quotas uq
WHERE NOT EXISTS (
  SELECT 1 FROM user_subscriptions us WHERE us.user_id = uq.user_id
)
ON CONFLICT (user_id) DO UPDATE SET
  plan_type = EXCLUDED.plan_type,
  subscription_status = EXCLUDED.subscription_status;

-- 6. Vérifier que tout est OK
DO $$
DECLARE
  quotas_count int;
  subscriptions_count int;
  unlocked_prospects_count int;
BEGIN
  SELECT COUNT(*) INTO quotas_count FROM user_quotas;
  SELECT COUNT(*) INTO subscriptions_count FROM user_subscriptions;
  SELECT COUNT(*) INTO unlocked_prospects_count FROM user_unlocked_prospects;
  
  RAISE NOTICE '✅ Vérification:';
  RAISE NOTICE '   - User quotas: %', quotas_count;
  RAISE NOTICE '   - User subscriptions: %', subscriptions_count;
  RAISE NOTICE '   - Unlocked prospects: %', unlocked_prospects_count;
END $$;

-- 7. Afficher les utilisateurs FREE actuels
SELECT 
  u.email,
  uq.plan_type,
  uq.is_first_login,
  uq.prospects_unlocked_count,
  uq.tournees_created_count,
  us.subscription_status
FROM auth.users u
JOIN user_quotas uq ON u.id = uq.user_id
JOIN user_subscriptions us ON u.id = us.user_id
WHERE uq.plan_type = 'free'
ORDER BY u.created_at DESC
LIMIT 10;

-- ✅ SCRIPT TERMINÉ
-- Le plan découverte devrait maintenant fonctionner correctement !
