-- 🔧 Configuration Admin pour tomiolovpro@gmail.com
-- Exécuter dans Supabase SQL Editor

-- 1. Confirmer l'email
UPDATE auth.users
SET email_confirmed_at = NOW(), updated_at = NOW()
WHERE email = 'tomiolovpro@gmail.com';

-- 2. Mettre quotas illimités
INSERT INTO public.user_quotas (user_id, plan_type, prospects_unlocked_count, tournees_created_count, is_first_login)
SELECT id, 'unlimited', 999999, 999999, false
FROM auth.users WHERE email = 'tomiolovpro@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET plan_type = 'unlimited', prospects_unlocked_count = 999999, tournees_created_count = 999999;

-- 3. Subscription à vie
INSERT INTO public.user_subscriptions (user_id, subscription_status, subscription_plan, subscription_start_date, subscription_end_date)
SELECT id, 'active', 'yearly', NOW(), '2099-12-31'::timestamptz
FROM auth.users WHERE email = 'tomiolovpro@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET subscription_status = 'active', subscription_end_date = '2099-12-31'::timestamptz;

-- 4. Policy RLS admin
DROP POLICY IF EXISTS "Admin has full access to nouveaux_sites" ON public.nouveaux_sites;
CREATE POLICY "Admin has full access to nouveaux_sites" ON public.nouveaux_sites FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_quotas WHERE user_quotas.user_id = auth.uid() AND user_quotas.plan_type = 'unlimited'));

-- ✅ Done!
