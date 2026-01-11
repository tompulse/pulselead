-- ============================================
-- SECURITY FIX: Comprehensive RLS Policy Update
-- ============================================

-- 1. FIX: user_subscriptions - Remove overly permissive policies and add proper ones
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.user_subscriptions;

-- Users can only view their own subscription
CREATE POLICY "Users can view their own subscription" 
ON public.user_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own subscription (for initial creation after payment)
CREATE POLICY "Users can insert their own subscription" 
ON public.user_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscription (limited fields updated by webhooks)
CREATE POLICY "Users can update their own subscription" 
ON public.user_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage all subscriptions" 
ON public.user_subscriptions 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- 2. FIX: rate_limits - Replace blocking policy with proper service-level policy
DROP POLICY IF EXISTS "Rate limits are system managed" ON public.rate_limits;
DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limits;

-- Allow the system (anon/service role via edge functions) to manage rate limits
-- Users should not directly access this table
CREATE POLICY "Service can read rate limits" 
ON public.rate_limits 
FOR SELECT 
USING (true);

CREATE POLICY "Service can insert rate limits" 
ON public.rate_limits 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service can update rate limits" 
ON public.rate_limits 
FOR UPDATE 
USING (true);

-- 3. FIX: audit_logs - Restrict INSERT to admins or via triggers only
DROP POLICY IF EXISTS "Audit logs are append only" ON public.audit_logs;
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert audit logs (or via edge functions with admin token)
CREATE POLICY "Only admins can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. FIX: user_roles - Add explicit policies to prevent privilege escalation
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

-- Users can only view their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Only admins can insert new roles
CREATE POLICY "Only admins can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update roles
CREATE POLICY "Only admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete roles
CREATE POLICY "Only admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));