-- Allow cancelled subscriptions to keep access until end_date (cancellation at period end)
CREATE OR REPLACE FUNCTION public.check_subscription_access(_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub_record record;
BEGIN
  -- Get the subscription record for this user
  SELECT 
    subscription_status,
    subscription_plan,
    subscription_end_date,
    subscription_start_date
  INTO sub_record
  FROM user_subscriptions
  WHERE user_id = _user_id
  LIMIT 1;

  -- No subscription record found
  IF sub_record IS NULL THEN
    RETURN json_build_object(
      'has_access', false,
      'reason', 'no_subscription',
      'status', null,
      'is_returning_user', false
    );
  END IF;

  -- Active / Trialing subscription and not expired
  IF sub_record.subscription_status IN ('active', 'trialing')
     AND (sub_record.subscription_end_date IS NULL OR sub_record.subscription_end_date > now()) THEN
    RETURN json_build_object(
      'has_access', true,
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
      'plan', sub_record.subscription_plan,
      'status', sub_record.subscription_status,
      'end_date', sub_record.subscription_end_date,
      'days_remaining',
        GREATEST(0, EXTRACT(DAY FROM (sub_record.subscription_end_date - now())))::int,
      'is_returning_user', false
    );
  END IF;

  -- User has a subscription record but no access (expired, cancelled, past_due)
  RETURN json_build_object(
    'has_access', false,
    'reason',
      CASE
        WHEN sub_record.subscription_status = 'cancelled' THEN 'cancelled'
        WHEN sub_record.subscription_status = 'past_due' THEN 'payment_failed'
        WHEN sub_record.subscription_end_date IS NOT NULL AND sub_record.subscription_end_date <= now() THEN 'expired'
        ELSE 'inactive'
      END,
    'status', sub_record.subscription_status,
    'plan', sub_record.subscription_plan,
    'end_date', sub_record.subscription_end_date,
    'is_returning_user', true
  );
END;
$$;