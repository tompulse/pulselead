-- 🔒 ACTIVATION RLS (Row Level Security)
-- Date: 30 janvier 2026
-- Objectif: Corriger les erreurs de sécurité Supabase

-- ============================================
-- 1. Table: nouveaux_sites
-- ============================================
ALTER TABLE public.nouveaux_sites ENABLE ROW LEVEL SECURITY;

-- Vérification des policies existantes (elles sont déjà créées)
-- ✅ "Allow admins to manage nouveaux_sites"
-- ✅ "Allow authenticated users to read nouveaux_sites"

-- ============================================
-- 2. Table: user_subscriptions
-- ============================================
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Vérification des policies existantes (elles sont déjà créées)
-- ✅ "Admins can update subscription status"
-- ✅ "Admins can view all subscriptions"
-- ✅ "Users can insert their own subscription"
-- ✅ "Users can only view own subscription"
-- ✅ "Users can update their own subscription"

-- ============================================
-- 3. Table: user_quotas
-- ============================================
ALTER TABLE public.user_quotas ENABLE ROW LEVEL SECURITY;

-- Note: Les policies doivent déjà exister sur cette table
-- Si pas de policies, en ajouter après activation

-- ============================================
-- 4. Table: user_unlocked_prospects
-- ============================================
ALTER TABLE public.user_unlocked_prospects ENABLE ROW LEVEL SECURITY;

-- Vérification des policies existantes (elles sont déjà créées)
-- ✅ "Enable all for authenticated users on own unlocked"
-- ✅ "Enable all for service role unlocked"

-- ============================================
-- VÉRIFICATION
-- ============================================
-- Pour vérifier que RLS est bien activé :
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('nouveaux_sites', 'user_subscriptions', 'user_quotas', 'user_unlocked_prospects');

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Toutes les tables doivent avoir rls_enabled = true

-- ============================================
-- IMPORTANT
-- ============================================
-- ⚠️ Ces commandes doivent être exécutées dans l'ordre
-- ⚠️ Les policies existantes resteront actives
-- ⚠️ RLS protège les données au niveau ligne
-- ⚠️ Sans RLS, les policies ne sont pas appliquées !
