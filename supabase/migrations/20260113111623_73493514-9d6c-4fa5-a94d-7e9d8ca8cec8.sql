-- =============================================================
-- SECURITY HARDENING: Restrict access to subscribers only
-- =============================================================

-- 1. Drop existing overly permissive policy on nouveaux_sites
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.nouveaux_sites;
DROP POLICY IF EXISTS "Authenticated users can read nouveaux_sites" ON public.nouveaux_sites;

-- 2. Create strict RLS policy: only active/trialing subscribers OR admins can access prospects
CREATE POLICY "Only active subscribers or admins can read prospects"
ON public.nouveaux_sites
FOR SELECT
USING (
  -- Check if user has active subscription
  EXISTS (
    SELECT 1 FROM public.user_subscriptions us
    WHERE us.user_id = auth.uid()
    AND us.subscription_status IN ('active', 'trialing')
    AND (us.subscription_end_date IS NULL OR us.subscription_end_date > now())
  )
  OR
  -- Check if user has cancelled but still within paid period
  EXISTS (
    SELECT 1 FROM public.user_subscriptions us
    WHERE us.user_id = auth.uid()
    AND us.subscription_status = 'cancelled'
    AND us.subscription_end_date IS NOT NULL
    AND us.subscription_end_date > now()
  )
  OR
  -- Check if user is admin
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
);

-- 3. Ensure user_subscriptions_safe view has proper security
-- The view uses security_invoker = true so it respects RLS
-- But we need to ensure users can only see their OWN masked data
DROP POLICY IF EXISTS "Users can view own subscription safe data" ON public.user_subscriptions;

-- 4. Harden user_subscriptions: users can ONLY read their own row
-- First drop any existing permissive policies
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can view subscription metadata" ON public.user_subscriptions;

-- Users can only see their own subscription (but full Stripe IDs are hidden by using the safe view in frontend)
CREATE POLICY "Users can only view own subscription"
ON public.user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all subscriptions for management (but should use safe view in UI)
CREATE POLICY "Admins can view all subscriptions"
ON public.user_subscriptions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
);

-- 5. Ensure service role can still manage subscriptions (for webhooks)
-- Service role bypasses RLS by default, so no policy needed

-- 6. Add comment for documentation
COMMENT ON POLICY "Only active subscribers or admins can read prospects" ON public.nouveaux_sites IS 
'Security policy: Restricts prospect data access to paying/trialing users and admins only. Prevents competitors or free users from harvesting business data.';