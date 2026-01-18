-- Fix RLS policies for nouveaux_sites table
-- The issue is having two RESTRICTIVE SELECT policies that conflict

-- Drop the conflicting policies
DROP POLICY IF EXISTS "Authenticated users can view nouveaux sites" ON public.nouveaux_sites;
DROP POLICY IF EXISTS "Only active subscribers or admins can read prospects" ON public.nouveaux_sites;

-- Create a single PERMISSIVE policy for active subscribers and admins
CREATE POLICY "Active subscribers and admins can view prospects"
ON public.nouveaux_sites
FOR SELECT
USING (
  -- User has active or trialing subscription with valid end date
  EXISTS (
    SELECT 1 FROM user_subscriptions us
    WHERE us.user_id = auth.uid()
    AND us.subscription_status IN ('active', 'trialing')
    AND (us.subscription_end_date IS NULL OR us.subscription_end_date > now())
  )
  OR
  -- User has cancelled subscription but still within access period
  EXISTS (
    SELECT 1 FROM user_subscriptions us
    WHERE us.user_id = auth.uid()
    AND us.subscription_status = 'cancelled'
    AND us.subscription_end_date IS NOT NULL
    AND us.subscription_end_date > now()
  )
  OR
  -- User is admin
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'::app_role
  )
);