-- =====================================================
-- 🔥 FIX PLAN PRO - Corriger activate_pro_plan
-- =====================================================

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

  -- Insérer ou mettre à jour subscription avec 'trialing' au lieu de 'inactive'
  -- 'trialing' est une valeur Stripe standard pour les périodes d'essai
  INSERT INTO user_subscriptions (user_id, plan_type, subscription_status)
  VALUES (p_user_id, 'pro', 'trialing')
  ON CONFLICT (user_id) 
  DO UPDATE SET plan_type = 'pro', subscription_status = 'trialing';

  RETURN json_build_object('success', true, 'plan_type', 'pro');
END;
$$;

GRANT EXECUTE ON FUNCTION public.activate_pro_plan(uuid) TO authenticated;

-- Forcer refresh
NOTIFY pgrst, 'reload schema';

-- ✅ TERMINÉ
DO $$ BEGIN RAISE NOTICE '✅ activate_pro_plan corrigé - utilise "trialing" au lieu de "inactive"'; END $$;
