-- =====================================================
-- FREEMIUM SYSTEM V2 - Unlock-based model
-- =====================================================

-- 1. Add plan_type to user_subscriptions if not exists
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'teams'));

-- Update existing users without plan_type to 'pro' if they have active subscription
UPDATE user_subscriptions 
SET plan_type = 'pro' 
WHERE plan_type IS NULL 
  AND subscription_status IN ('active', 'trialing');

-- Set default to 'free' for users without subscription
UPDATE user_subscriptions 
SET plan_type = 'free' 
WHERE plan_type IS NULL;

-- 2. Create table to track unlocked prospects (free users)
CREATE TABLE IF NOT EXISTS user_unlocked_prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entreprise_id text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, entreprise_id)
);

CREATE INDEX IF NOT EXISTS idx_user_unlocked_prospects_user_id ON user_unlocked_prospects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_unlocked_prospects_entreprise_id ON user_unlocked_prospects(entreprise_id);

-- 3. Create user_quotas table
CREATE TABLE IF NOT EXISTS user_quotas (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type text NOT NULL DEFAULT 'free',
  
  -- Prospects unlocked (max 30 for free)
  prospects_unlocked_count int DEFAULT 0,
  
  -- Tournees limits (max 2 for free, unlimited for pro)
  tournees_created_count int DEFAULT 0,
  tournees_reset_date timestamptz DEFAULT now(),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_quotas_user_id ON user_quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quotas_plan_type ON user_quotas(plan_type);

-- 4. Function to initialize user quota on signup
CREATE OR REPLACE FUNCTION initialize_user_quota()
RETURNS TRIGGER AS $$
BEGIN
  -- Create subscription record with free plan
  INSERT INTO user_subscriptions (user_id, plan_type, subscription_status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create quota record
  INSERT INTO user_quotas (user_id, plan_type)
  VALUES (NEW.id, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger on user signup
DROP TRIGGER IF EXISTS on_user_created_initialize_quota ON auth.users;
CREATE TRIGGER on_user_created_initialize_quota
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_quota();

-- 6. Function to reset monthly tournee quotas (called by cron or manually)
CREATE OR REPLACE FUNCTION reset_monthly_tournee_quotas()
RETURNS void AS $$
BEGIN
  -- Reset tournees quota if more than 30 days
  UPDATE user_quotas
  SET 
    tournees_created_count = 0,
    tournees_reset_date = now()
  WHERE tournees_reset_date < now() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Updated check_subscription_access function with freemium v2
CREATE OR REPLACE FUNCTION public.check_subscription_access(_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub_record record;
  quota_record record;
  unlocked_count int;
BEGIN
  -- Get the subscription record for this user
  SELECT 
    subscription_status,
    subscription_plan,
    subscription_end_date,
    subscription_start_date,
    plan_type
  INTO sub_record
  FROM user_subscriptions
  WHERE user_id = _user_id
  LIMIT 1;

  -- No subscription record found - create free plan
  IF sub_record IS NULL THEN
    INSERT INTO user_subscriptions (user_id, plan_type, subscription_status)
    VALUES (_user_id, 'free', 'active')
    ON CONFLICT (user_id) DO NOTHING;
    
    INSERT INTO user_quotas (user_id, plan_type)
    VALUES (_user_id, 'free')
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN json_build_object(
      'has_access', true,
      'plan_type', 'free',
      'reason', 'free_plan',
      'status', 'active',
      'is_returning_user', false,
      'quotas', json_build_object(
        'prospects_unlocked', 0,
        'prospects_limit', 30,
        'tournees_created', 0,
        'tournees_limit', 2
      )
    );
  END IF;

  -- FREE PLAN: Always has access with unlock-based limitations
  IF sub_record.plan_type = 'free' THEN
    -- Get quota info
    SELECT * INTO quota_record
    FROM user_quotas
    WHERE user_id = _user_id;
    
    -- Count unlocked prospects
    SELECT COUNT(*) INTO unlocked_count
    FROM user_unlocked_prospects
    WHERE user_id = _user_id;
    
    -- Reset tournees if needed (30 days passed)
    IF quota_record.tournees_reset_date < now() - INTERVAL '30 days' THEN
      UPDATE user_quotas
      SET 
        tournees_created_count = 0,
        tournees_reset_date = now()
      WHERE user_id = _user_id;
      
      quota_record.tournees_created_count := 0;
    END IF;
    
    RETURN json_build_object(
      'has_access', true,
      'plan_type', 'free',
      'status', 'active',
      'quotas', json_build_object(
        'prospects_unlocked', unlocked_count,
        'prospects_limit', 30,
        'tournees_created', COALESCE(quota_record.tournees_created_count, 0),
        'tournees_limit', 2
      ),
      'is_returning_user', false
    );
  END IF;

  -- PRO / TEAMS PLAN: Check Stripe subscription status
  IF sub_record.subscription_status IN ('active', 'trialing')
     AND (sub_record.subscription_end_date IS NULL OR sub_record.subscription_end_date > now()) THEN
    RETURN json_build_object(
      'has_access', true,
      'plan_type', sub_record.plan_type,
      'plan', sub_record.subscription_plan,
      'status', sub_record.subscription_status,
      'end_date', sub_record.subscription_end_date,
      'days_remaining',
        CASE
          WHEN sub_record.subscription_end_date IS NOT NULL
          THEN GREATEST(0, EXTRACT(DAY FROM (sub_record.subscription_end_date - now())))::int
          ELSE null
        END,
      'is_returning_user', false
    );
  END IF;

  -- Cancelled but still within paid period
  IF sub_record.subscription_status = 'cancelled'
     AND sub_record.subscription_end_date IS NOT NULL
     AND sub_record.subscription_end_date > now() THEN
    RETURN json_build_object(
      'has_access', true,
      'plan_type', sub_record.plan_type,
      'plan', sub_record.subscription_plan,
      'status', sub_record.subscription_status,
      'end_date', sub_record.subscription_end_date,
      'days_remaining',
        GREATEST(0, EXTRACT(DAY FROM (sub_record.subscription_end_date - now())))::int,
      'is_returning_user', false
    );
  END IF;

  -- Expired/cancelled - downgrade to free
  UPDATE user_subscriptions 
  SET plan_type = 'free'
  WHERE user_id = _user_id;
  
  UPDATE user_quotas
  SET plan_type = 'free'
  WHERE user_id = _user_id;
  
  -- Count unlocked prospects for downgraded user
  SELECT COUNT(*) INTO unlocked_count
  FROM user_unlocked_prospects
  WHERE user_id = _user_id;
  
  RETURN json_build_object(
    'has_access', true,
    'plan_type', 'free',
    'reason', 'downgraded_to_free',
    'status', 'active',
    'quotas', json_build_object(
      'prospects_unlocked', unlocked_count,
      'prospects_limit', 30,
      'tournees_created', 0,
      'tournees_limit', 2
    ),
    'is_returning_user', true
  );
END;
$$;

-- 8. Function to unlock a prospect (free users)
CREATE OR REPLACE FUNCTION unlock_prospect(
  _user_id uuid,
  _entreprise_id text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plan_type_val text;
  unlocked_count int;
  already_unlocked boolean;
BEGIN
  -- Get current plan type
  SELECT plan_type INTO plan_type_val
  FROM user_subscriptions
  WHERE user_id = _user_id;
  
  -- PRO/TEAMS users can unlock unlimited (no need to track)
  IF plan_type_val IN ('pro', 'teams') THEN
    RETURN json_build_object(
      'success', true, 
      'limit_reached', false,
      'message', 'Plan PRO : accès illimité'
    );
  END IF;
  
  -- Check if already unlocked
  SELECT EXISTS(
    SELECT 1 FROM user_unlocked_prospects
    WHERE user_id = _user_id AND entreprise_id = _entreprise_id
  ) INTO already_unlocked;
  
  IF already_unlocked THEN
    RETURN json_build_object(
      'success', true,
      'limit_reached', false,
      'message', 'Déjà débloqué'
    );
  END IF;
  
  -- Count current unlocked prospects
  SELECT COUNT(*) INTO unlocked_count
  FROM user_unlocked_prospects
  WHERE user_id = _user_id;
  
  -- Check limit (30 for free)
  IF unlocked_count >= 30 THEN
    RETURN json_build_object(
      'success', false,
      'limit_reached', true,
      'message', 'Plan gratuit : 30 prospects maximum. Passez à PRO pour débloquer 4,5M+ entreprises.',
      'unlocked_count', unlocked_count,
      'limit', 30
    );
  END IF;
  
  -- Unlock the prospect
  INSERT INTO user_unlocked_prospects (user_id, entreprise_id)
  VALUES (_user_id, _entreprise_id)
  ON CONFLICT (user_id, entreprise_id) DO NOTHING;
  
  -- Update quota count
  UPDATE user_quotas
  SET 
    prospects_unlocked_count = (
      SELECT COUNT(*) FROM user_unlocked_prospects WHERE user_id = _user_id
    ),
    updated_at = now()
  WHERE user_id = _user_id;
  
  RETURN json_build_object(
    'success', true,
    'limit_reached', false,
    'message', 'Prospect débloqué !',
    'unlocked_count', unlocked_count + 1,
    'limit', 30
  );
END;
$$;

-- 9. Function to check if prospect is unlocked
CREATE OR REPLACE FUNCTION is_prospect_unlocked(
  _user_id uuid,
  _entreprise_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plan_type_val text;
BEGIN
  -- Get current plan type
  SELECT plan_type INTO plan_type_val
  FROM user_subscriptions
  WHERE user_id = _user_id;
  
  -- PRO/TEAMS users have access to all
  IF plan_type_val IN ('pro', 'teams') THEN
    RETURN true;
  END IF;
  
  -- Check if unlocked for free users
  RETURN EXISTS(
    SELECT 1 FROM user_unlocked_prospects
    WHERE user_id = _user_id AND entreprise_id = _entreprise_id
  );
END;
$$;

-- 10. Function to get user's unlocked prospects
CREATE OR REPLACE FUNCTION get_unlocked_prospects(_user_id uuid)
RETURNS TABLE (
  entreprise_id text,
  unlocked_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uup.entreprise_id,
    uup.unlocked_at
  FROM user_unlocked_prospects uup
  WHERE uup.user_id = _user_id
  ORDER BY uup.unlocked_at DESC;
END;
$$;

-- 11. Function to check tournee creation quota
CREATE OR REPLACE FUNCTION check_tournee_quota(_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  quota_record record;
  plan_type_val text;
BEGIN
  -- Get current plan type
  SELECT plan_type INTO plan_type_val
  FROM user_subscriptions
  WHERE user_id = _user_id;
  
  -- PRO/TEAMS users have unlimited access
  IF plan_type_val IN ('pro', 'teams') THEN
    RETURN json_build_object('allowed', true, 'limit_reached', false);
  END IF;
  
  -- FREE users: check limits (2 per month)
  SELECT * INTO quota_record
  FROM user_quotas
  WHERE user_id = _user_id;
  
  -- Reset if needed (30 days passed)
  IF quota_record.tournees_reset_date < now() - INTERVAL '30 days' THEN
    UPDATE user_quotas
    SET 
      tournees_created_count = 0,
      tournees_reset_date = now()
    WHERE user_id = _user_id;
    
    quota_record.tournees_created_count := 0;
  END IF;
  
  -- Check if limit reached (2 per month for free)
  IF quota_record.tournees_created_count >= 2 THEN
    RETURN json_build_object(
      'allowed', false, 
      'limit_reached', true,
      'message', 'Plan gratuit : 2 tournées par mois. Passez à PRO pour des tournées illimitées.',
      'tournees_created', quota_record.tournees_created_count,
      'limit', 2
    );
  END IF;
  
  RETURN json_build_object(
    'allowed', true, 
    'limit_reached', false,
    'tournees_created', quota_record.tournees_created_count,
    'limit', 2
  );
END;
$$;

-- 12. Function to increment tournee quota
CREATE OR REPLACE FUNCTION increment_tournee_quota(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_quotas
  SET 
    tournees_created_count = tournees_created_count + 1,
    updated_at = now()
  WHERE user_id = _user_id;
END;
$$;

-- 13. Grant permissions
GRANT EXECUTE ON FUNCTION check_subscription_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION unlock_prospect(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION is_prospect_unlocked(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unlocked_prospects(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION check_tournee_quota(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_tournee_quota(uuid) TO authenticated;

-- 14. Initialize quotas for existing users
INSERT INTO user_quotas (user_id, plan_type)
SELECT 
  us.user_id, 
  COALESCE(us.plan_type, 'free')
FROM user_subscriptions us
LEFT JOIN user_quotas uq ON us.user_id = uq.user_id
WHERE uq.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE user_unlocked_prospects IS 'Tracks which prospects free users have unlocked (max 30)';
COMMENT ON TABLE user_quotas IS 'Tracks usage quotas: unlocked prospects count and tournees count';
COMMENT ON FUNCTION unlock_prospect IS 'Unlocks a prospect for a free user (max 30)';
COMMENT ON FUNCTION get_unlocked_prospects IS 'Returns list of unlocked prospects for a user';
