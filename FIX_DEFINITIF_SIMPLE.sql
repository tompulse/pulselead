-- =====================================================
-- 🔥 FIX DÉFINITIF ULTRA SIMPLE
-- =====================================================
-- Copie-colle CE SCRIPT dans Supabase SQL Editor

-- 1️⃣ SUPPRIMER initialize_user_quota trigger complètement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.initialize_user_quota() CASCADE;

-- 2️⃣ RECRÉER check_subscription_access QUI NE CRÉE RIEN
DROP FUNCTION IF EXISTS public.check_subscription_access(uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.check_subscription_access(_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sub_record record;
  quota_record record;
BEGIN
  -- Chercher subscription
  SELECT * INTO sub_record FROM user_subscriptions WHERE user_id = _user_id LIMIT 1;
  
  -- PAS DE SUBSCRIPTION = RETOURNER NULL
  IF sub_record IS NULL THEN
    RETURN json_build_object('has_access', false, 'plan_type', null, 'reason', 'no_plan');
  END IF;

  -- Chercher quotas
  SELECT * INTO quota_record FROM user_quotas WHERE user_id = _user_id;
  
  -- Si FREE
  IF sub_record.plan_type = 'free' AND quota_record IS NOT NULL THEN
    RETURN json_build_object('has_access', true, 'plan_type', 'free', 'status', 'active');
  END IF;

  -- Si PRO
  IF sub_record.plan_type = 'pro' AND sub_record.subscription_status = 'active' THEN
    RETURN json_build_object('has_access', true, 'plan_type', 'pro', 'status', 'active');
  END IF;

  -- Par défaut
  RETURN json_build_object('has_access', false, 'plan_type', null, 'reason', 'no_valid_plan');
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_subscription_access(uuid) TO authenticated;

-- 3️⃣ RECRÉER activate_free_plan
DROP FUNCTION IF EXISTS public.activate_free_plan(uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.activate_free_plan(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insérer ou mettre à jour quotas
  INSERT INTO user_quotas (user_id, plan_type, prospects_unlocked_count, tournees_created_count, is_first_login)
  VALUES (p_user_id, 'free', 0, 0, false)
  ON CONFLICT (user_id) 
  DO UPDATE SET plan_type = 'free', is_first_login = false;

  -- Insérer ou mettre à jour subscription
  INSERT INTO user_subscriptions (user_id, plan_type, subscription_status)
  VALUES (p_user_id, 'free', 'active')
  ON CONFLICT (user_id) 
  DO UPDATE SET plan_type = 'free', subscription_status = 'active';

  RETURN json_build_object('success', true, 'plan_type', 'free');
END;
$$;

GRANT EXECUTE ON FUNCTION public.activate_free_plan(uuid) TO authenticated;

-- 4️⃣ RECRÉER activate_pro_plan
DROP FUNCTION IF EXISTS public.activate_pro_plan(uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.activate_pro_plan(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insérer ou mettre à jour quotas
  INSERT INTO user_quotas (user_id, plan_type, prospects_unlocked_count, tournees_created_count, is_first_login)
  VALUES (p_user_id, 'pro', 0, 0, false)
  ON CONFLICT (user_id) 
  DO UPDATE SET plan_type = 'pro', is_first_login = false;

  -- Insérer ou mettre à jour subscription
  INSERT INTO user_subscriptions (user_id, plan_type, subscription_status)
  VALUES (p_user_id, 'pro', 'inactive')
  ON CONFLICT (user_id) 
  DO UPDATE SET plan_type = 'pro', subscription_status = 'inactive';

  RETURN json_build_object('success', true, 'plan_type', 'pro');
END;
$$;

GRANT EXECUTE ON FUNCTION public.activate_pro_plan(uuid) TO authenticated;

-- 5️⃣ FORCER REFRESH
NOTIFY pgrst, 'reload schema';

-- ✅ TERMINÉ
DO $$ BEGIN RAISE NOTICE '✅ FIX APPLIQUÉ - Aucun plan ne sera créé automatiquement'; END $$;
