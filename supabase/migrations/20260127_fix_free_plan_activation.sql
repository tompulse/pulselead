-- =====================================================
-- FIX FREE PLAN ACTIVATION - Plan Découverte
-- Date: 2026-01-27
-- Description: Ensures seamless free plan activation after email confirmation
-- =====================================================

-- 1. Create or replace activate_free_plan RPC function
-- This function is called when user clicks "Commencer gratuitement"
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
    false  -- User has now chosen their plan
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan_type = 'free',
    is_first_login = false,  -- Mark as no longer first login
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

-- 2. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION activate_free_plan(uuid) TO authenticated;

-- 3. Ensure initialize_user_quota trigger exists and is correct
CREATE OR REPLACE FUNCTION initialize_user_quota()
RETURNS TRIGGER AS $$
BEGIN
  -- Create subscription record with free plan
  INSERT INTO user_subscriptions (user_id, plan_type, subscription_status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create quota record with is_first_login = true
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

-- 5. Fix any existing users who might be stuck
-- Users with is_first_login = false but plan_type = 'free' should have access
UPDATE user_quotas
SET 
  prospects_unlocked_count = COALESCE(prospects_unlocked_count, 0),
  tournees_created_count = COALESCE(tournees_created_count, 0)
WHERE plan_type = 'free'
  AND (prospects_unlocked_count IS NULL OR tournees_created_count IS NULL);

-- Ensure user_subscriptions is in sync
UPDATE user_subscriptions us
SET 
  plan_type = 'free',
  subscription_status = 'active'
FROM user_quotas uq
WHERE us.user_id = uq.user_id
  AND uq.plan_type = 'free'
  AND us.plan_type != 'free';

-- 6. Verify structure
DO $$
DECLARE
  quotas_count int;
  unlocked_prospects_count int;
BEGIN
  SELECT COUNT(*) INTO quotas_count FROM user_quotas;
  SELECT COUNT(*) INTO unlocked_prospects_count FROM user_unlocked_prospects;
  
  RAISE NOTICE 'User quotas: %, Unlocked prospects: %', quotas_count, unlocked_prospects_count;
END $$;

COMMENT ON FUNCTION activate_free_plan(uuid) IS 'Activates FREE plan when user clicks "Commencer gratuitement" - sets is_first_login to false to prevent redirect loop';
