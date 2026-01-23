-- =====================================================
-- FREEMIUM SYSTEM IMPLEMENTATION
-- =====================================================

-- 1. Add plan_type to user_subscriptions
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

-- 2. Create user_quotas table to track freemium limits
CREATE TABLE IF NOT EXISTS user_quotas (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type text NOT NULL DEFAULT 'free',
  
  -- Prospects limits (per month)
  prospects_viewed_count int DEFAULT 0,
  prospects_viewed_departments text[] DEFAULT '{}',
  prospects_reset_date timestamptz DEFAULT now(),
  
  -- Tournees limits (per month)
  tournees_created_count int DEFAULT 0,
  tournees_reset_date timestamptz DEFAULT now(),
  
  -- CRM limits
  crm_notes_count int DEFAULT 0,
  crm_reminders_enabled boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_quotas_user_id ON user_quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quotas_plan_type ON user_quotas(plan_type);

-- 3. Function to initialize user quota on signup
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

-- 4. Create trigger on user signup
DROP TRIGGER IF EXISTS on_user_created_initialize_quota ON auth.users;
CREATE TRIGGER on_user_created_initialize_quota
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_quota();

-- 5. Function to reset monthly quotas
CREATE OR REPLACE FUNCTION reset_monthly_quotas()
RETURNS void AS $$
BEGIN
  -- Reset prospects quota if more than 30 days
  UPDATE user_quotas
  SET 
    prospects_viewed_count = 0,
    prospects_viewed_departments = '{}',
    prospects_reset_date = now()
  WHERE prospects_reset_date < now() - INTERVAL '30 days';
  
  -- Reset tournees quota if more than 30 days
  UPDATE user_quotas
  SET 
    tournees_created_count = 0,
    tournees_reset_date = now()
  WHERE tournees_reset_date < now() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Updated check_subscription_access function with freemium support
CREATE OR REPLACE FUNCTION public.check_subscription_access(_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub_record record;
  quota_record record;
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

  -- No subscription record found - should not happen with trigger, but create free plan
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
      'is_returning_user', false
    );
  END IF;

  -- FREE PLAN: Always has access with limitations
  IF sub_record.plan_type = 'free' THEN
    -- Get quota info
    SELECT * INTO quota_record
    FROM user_quotas
    WHERE user_id = _user_id;
    
    RETURN json_build_object(
      'has_access', true,
      'plan_type', 'free',
      'status', 'active',
      'quotas', json_build_object(
        'prospects_viewed', COALESCE(quota_record.prospects_viewed_count, 0),
        'prospects_limit', 20,
        'tournees_created', COALESCE(quota_record.tournees_created_count, 0),
        'tournees_limit', 1,
        'crm_reminders_enabled', COALESCE(quota_record.crm_reminders_enabled, false)
      ),
      'is_returning_user', false
    );
  END IF;

  -- PRO / TEAMS PLAN: Check Stripe subscription status
  -- Active / Trialing subscription and not expired
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

  -- Cancelled but still within already-paid (or trial) period
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

  -- User has a subscription record but no access (expired, cancelled, past_due)
  -- Downgrade to free plan
  UPDATE user_subscriptions 
  SET plan_type = 'free'
  WHERE user_id = _user_id;
  
  UPDATE user_quotas
  SET plan_type = 'free'
  WHERE user_id = _user_id;
  
  RETURN json_build_object(
    'has_access', true,
    'plan_type', 'free',
    'reason', 'downgraded_to_free',
    'status', 'active',
    'is_returning_user', true
  );
END;
$$;

-- 7. Function to increment prospect view quota
CREATE OR REPLACE FUNCTION increment_prospect_quota(
  _user_id uuid,
  _department text
)
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
  
  -- FREE users: check limits
  SELECT * INTO quota_record
  FROM user_quotas
  WHERE user_id = _user_id;
  
  -- Reset if needed (30 days passed)
  IF quota_record.prospects_reset_date < now() - INTERVAL '30 days' THEN
    UPDATE user_quotas
    SET 
      prospects_viewed_count = 0,
      prospects_viewed_departments = '{}',
      prospects_reset_date = now()
    WHERE user_id = _user_id;
    
    quota_record.prospects_viewed_count := 0;
    quota_record.prospects_viewed_departments := '{}';
  END IF;
  
  -- Check if department already counted
  IF _department = ANY(quota_record.prospects_viewed_departments) THEN
    -- Already counted this department, allow access
    RETURN json_build_object('allowed', true, 'limit_reached', false);
  END IF;
  
  -- Check if limit reached (20 prospects per department, only 1 department allowed)
  IF array_length(quota_record.prospects_viewed_departments, 1) >= 1 THEN
    RETURN json_build_object(
      'allowed', false, 
      'limit_reached', true,
      'message', 'Plan gratuit : 1 département maximum. Passez à PRO pour débloquer toute la France.'
    );
  END IF;
  
  -- Increment quota
  UPDATE user_quotas
  SET 
    prospects_viewed_count = prospects_viewed_count + 1,
    prospects_viewed_departments = array_append(prospects_viewed_departments, _department),
    updated_at = now()
  WHERE user_id = _user_id;
  
  RETURN json_build_object('allowed', true, 'limit_reached', false);
END;
$$;

-- 8. Function to check tournee creation quota
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
  
  -- FREE users: check limits
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
  
  -- Check if limit reached (1 per month for free)
  IF quota_record.tournees_created_count >= 1 THEN
    RETURN json_build_object(
      'allowed', false, 
      'limit_reached', true,
      'message', 'Plan gratuit : 1 tournée par mois. Passez à PRO pour des tournées illimitées.'
    );
  END IF;
  
  RETURN json_build_object('allowed', true, 'limit_reached', false);
END;
$$;

-- 9. Function to increment tournee quota
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

-- 10. Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_subscription_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_prospect_quota(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_tournee_quota(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_tournee_quota(uuid) TO authenticated;

-- 11. Initialize quotas for existing users
INSERT INTO user_quotas (user_id, plan_type)
SELECT 
  us.user_id, 
  COALESCE(us.plan_type, 'free')
FROM user_subscriptions us
LEFT JOIN user_quotas uq ON us.user_id = uq.user_id
WHERE uq.user_id IS NULL;

COMMENT ON TABLE user_quotas IS 'Tracks usage quotas for freemium users';
COMMENT ON FUNCTION check_subscription_access IS 'Returns user subscription status including freemium plan';
COMMENT ON FUNCTION increment_prospect_quota IS 'Increments prospect view quota for free users';
COMMENT ON FUNCTION check_tournee_quota IS 'Checks if user can create a new tournee';
