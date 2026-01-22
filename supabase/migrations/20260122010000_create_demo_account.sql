-- Script pour créer le compte démo avec données réalistes
-- Ce script doit être exécuté après avoir créé manuellement le user demo@pulse.com dans Supabase Auth

-- 1. Créer l'abonnement actif pour le compte démo
INSERT INTO public.user_subscriptions (user_id, subscription_status, subscription_plan, subscription_start_date, subscription_end_date)
SELECT 
  id,
  'active'::text,
  'monthly'::text,
  NOW()::timestamptz,
  (NOW() + INTERVAL '365 days')::timestamptz
FROM auth.users
WHERE email = 'demo@pulse.com'
ON CONFLICT (user_id) DO UPDATE SET
  subscription_status = 'active',
  subscription_plan = 'monthly',
  subscription_start_date = NOW(),
  subscription_end_date = NOW() + INTERVAL '365 days';

-- 2. Marquer l'onboarding comme terminé
INSERT INTO public.user_onboarding_progress (user_id, current_step, completed_steps, completed_at, skipped_tutorial)
SELECT 
  id,
  3,
  '[1, 2, 3]'::jsonb,
  NOW(),
  false
FROM auth.users
WHERE email = 'demo@pulse.com'
ON CONFLICT (user_id) DO UPDATE SET
  current_step = 3,
  completed_steps = '[1, 2, 3]'::jsonb,
  completed_at = NOW(),
  skipped_tutorial = false;

-- 3. Créer quelques tournées exemple (sera fait via l'interface utilisateur)
-- Note: Les tournées seront créées manuellement pour avoir des données réalistes

-- 4. Créer des interactions CRM exemple pour quelques entreprises
-- Note: Les interactions seront également créées manuellement

-- Commentaire : Pour compléter la démo, vous devez :
-- 1. Créer le user demo@pulse.com / DemoPulse2024! dans Supabase Auth Dashboard
-- 2. Exécuter cette migration
-- 3. Se connecter et créer manuellement :
--    - 2-3 tournées avec des prospects variés
--    - Quelques interactions CRM (appels, visites, RDV)
--    - Des notes sur certains prospects
