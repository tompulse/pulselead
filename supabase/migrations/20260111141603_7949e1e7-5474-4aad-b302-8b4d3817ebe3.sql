-- ============================================
-- SECURITY FIX 3: Clean up conflicting policies
-- ============================================

-- 1. Remove conflicting audit_logs policy
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;

-- 2. Remove conflicting rate_limits policy (the one with USING: false)
DROP POLICY IF EXISTS "Rate limits blocked" ON public.rate_limits;

-- 3. Check and clean up any duplicate policies on rate_limits
-- Keep only the admin-only policies
DROP POLICY IF EXISTS "Service can read rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Service can insert rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Service can update rate limits" ON public.rate_limits;