-- ========================================
-- CRÉER UN COMPTE ADMIN
-- Email: tomiolovpro@gmail.com
-- Password: Footmarseille74!
-- ========================================

-- ÉTAPE 1 : Créer le user dans Supabase Auth
-- ⚠️ À exécuter dans le Dashboard Supabase Auth, pas SQL Editor

-- Va sur : https://supabase.com/dashboard/project/ywavxjmbsywpjzchuuho/auth/users
-- Clique sur "Add user" → "Create new user"
-- Email: tomiolovpro@gmail.com
-- Password: Footmarseille74!
-- Auto Confirm User: ✅ OUI (pour ne pas avoir à valider l'email)


-- ÉTAPE 2 : Une fois le user créé, exécute ce SQL pour lui donner un abonnement actif

-- Récupérer le user_id
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'tomiolovpro@gmail.com';

-- Créer l'abonnement actif (jusqu'en 2099 pour admin)
INSERT INTO public.user_subscriptions (
  user_id, 
  subscription_status, 
  subscription_plan, 
  subscription_start_date, 
  subscription_end_date,
  created_at,
  updated_at
)
SELECT 
  id,
  'active',
  'monthly',
  NOW(),
  '2099-12-31 00:00:00+00',  -- Accès permanent pour admin
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'tomiolovpro@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  subscription_status = 'active',
  subscription_plan = 'monthly',
  subscription_start_date = NOW(),
  subscription_end_date = '2099-12-31 00:00:00+00',
  updated_at = NOW();


-- ÉTAPE 3 : Donner les droits admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'tomiolovpro@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;


-- ÉTAPE 4 : Vérifier que tout est OK
SELECT 
  u.id,
  u.email,
  u.confirmed_at,
  us.subscription_status,
  us.subscription_end_date,
  ur.role
FROM auth.users u
LEFT JOIN user_subscriptions us ON us.user_id = u.id
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email = 'tomiolovpro@gmail.com';

-- Résultat attendu :
-- ✅ confirmed_at: [date] (user confirmé)
-- ✅ subscription_status: active
-- ✅ subscription_end_date: 2099-12-31
-- ✅ role: admin
