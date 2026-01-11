-- ============================================
-- SECURITY FIX 2: Fix rate_limits and audit_logs policies
-- ============================================

-- 1. FIX rate_limits - Drop all existing policies and create proper service-level ones
-- The rate_limits table is managed by edge functions using service role, so we need policies
-- that work for unauthenticated service calls
DROP POLICY IF EXISTS "Service can read rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Service can insert rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Service can update rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Rate limits are system managed" ON public.rate_limits;

-- Rate limits should only be managed by admin or service role
-- For service role (used by edge functions), RLS is bypassed automatically
-- For regular users, block all access
CREATE POLICY "Only admins can view rate limits"
ON public.rate_limits
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage rate limits"
ON public.rate_limits
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 2. FIX audit_logs - More restrictive INSERT policy
DROP POLICY IF EXISTS "Only admins can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Audit logs are append only" ON public.audit_logs;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can manage audit logs (INSERT/UPDATE/DELETE)
-- Edge functions using service role will bypass RLS
CREATE POLICY "Only admins can manage audit logs"
ON public.audit_logs
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));