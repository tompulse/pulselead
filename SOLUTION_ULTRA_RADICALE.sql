-- =====================================================
-- 🔥 SOLUTION ULTRA RADICALE - TOUT RÉPARER
-- =====================================================
-- Exécute ce script dans Supabase SQL Editor
-- Puis SUPPRIME TOUS LES USERS et teste inscription

-- 1️⃣ SUPPRIMER SEULEMENT LES TRIGGERS CUSTOM (pas les contraintes système)
DO $$
DECLARE
  trigger_record RECORD;
BEGIN
  FOR trigger_record IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'auth.users'::regclass 
    AND tgname NOT LIKE 'pg_%'  -- Garde triggers PostgreSQL système
    AND tgname NOT LIKE 'RI_ConstraintTrigger%'  -- Garde triggers de contraintes (FK)
    AND tgisinternal = false  -- Garde triggers internes
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users CASCADE', trigger_record.tgname);
    RAISE NOTICE '❌ Trigger custom supprimé: %', trigger_record.tgname;
  END LOOP;
  
  RAISE NOTICE '✅ Triggers custom supprimés (contraintes système gardées)';
END $$;

-- 2️⃣ RECRÉER initialize_user_quota VIDE (ne fait RIEN)
CREATE OR REPLACE FUNCTION public.initialize_user_quota()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RAISE NOTICE '🔕 initialize_user_quota appelé mais NE FAIT RIEN (désactivé)';
  RETURN NEW;
END;
$$;

-- 3️⃣ RECRÉER check_subscription_access SANS CRÉATION AUTO
DROP FUNCTION IF EXISTS public.check_subscription_access(uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.check_subscription_access(_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sub_record record;
  quota_record record;
  unlocked_count int;
BEGIN
  RAISE NOTICE '>>> check_subscription_access pour user %', _user_id;
  
  -- Chercher subscription
  SELECT * INTO sub_record
  FROM user_subscriptions
  WHERE user_id = _user_id
  LIMIT 1;

  -- 🔥 SI PAS DE SUBSCRIPTION = RETOURNER no_plan SANS RIEN CRÉER
  IF sub_record IS NULL THEN
    RAISE NOTICE '>>> ❌ PAS de subscription - Retourne no_plan SANS CRÉER';
    RETURN json_build_object(
      'has_access', false,
      'plan_type', null,
      'reason', 'no_plan_selected',
      'status', null
    );
  END IF;

  -- Chercher quotas
  SELECT * INTO quota_record
  FROM user_quotas
  WHERE user_id = _user_id;

  -- Si FREE
  IF sub_record.plan_type = 'free' THEN
    IF quota_record IS NULL THEN
      RAISE NOTICE '>>> ❌ FREE sans quotas';
      RETURN json_build_object(
        'has_access', false,
        'plan_type', null,
        'reason', 'no_quotas'
      );
    END IF;
    
    SELECT COUNT(*) INTO unlocked_count
    FROM user_unlocked_prospects WHERE user_id = _user_id;
    
    RAISE NOTICE '>>> ✅ Plan FREE valide';
    RETURN json_build_object(
      'has_access', true,
      'plan_type', 'free',
      'status', 'active',
      'quotas', json_build_object(
        'prospects_unlocked', unlocked_count,
        'prospects_limit', 30,
        'tournees_created', COALESCE(quota_record.tournees_created_count, 0),
        'tournees_limit', 2
      )
    );
  END IF;

  -- Si PRO
  IF sub_record.plan_type IN ('pro', 'teams') AND sub_record.subscription_status IN ('active', 'trialing') THEN
    RAISE NOTICE '>>> ✅ Plan PRO actif';
    RETURN json_build_object(
      'has_access', true,
      'plan_type', sub_record.plan_type,
      'status', sub_record.subscription_status
    );
  END IF;

  -- Par défaut
  RAISE NOTICE '>>> ❌ Aucun plan valide';
  RETURN json_build_object(
    'has_access', false,
    'plan_type', null,
    'reason', 'no_valid_plan'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_subscription_access(uuid) TO authenticated;

-- 4️⃣ RECRÉER activate_free_plan
DROP FUNCTION IF EXISTS public.activate_free_plan(uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.activate_free_plan(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_quota record;
  existing_sub record;
BEGIN
  RAISE NOTICE '>>> activate_free_plan pour user %', p_user_id;

  -- Vérifier si quotas existent déjà
  SELECT * INTO existing_quota
  FROM user_quotas
  WHERE user_id = p_user_id;

  IF existing_quota IS NULL THEN
    -- Créer quotas FREE
    INSERT INTO user_quotas (
      user_id,
      plan_type,
      prospects_unlocked_count,
      tournees_created_count,
      is_first_login
    ) VALUES (
      p_user_id,
      'free',
      0,
      0,
      false  -- ✅ Marquer comme "plan choisi"
    );
    RAISE NOTICE '>>> ✅ Quotas FREE créés';
  ELSE
    -- Mettre à jour quotas existants
    UPDATE user_quotas
    SET 
      plan_type = 'free',
      is_first_login = false
    WHERE user_id = p_user_id;
    RAISE NOTICE '>>> ✅ Quotas FREE mis à jour';
  END IF;

  -- Vérifier si subscription existe
  SELECT * INTO existing_sub
  FROM user_subscriptions
  WHERE user_id = p_user_id;

  IF existing_sub IS NULL THEN
    -- Créer subscription FREE
    INSERT INTO user_subscriptions (
      user_id,
      plan_type,
      subscription_status
    ) VALUES (
      p_user_id,
      'free',
      'active'
    );
    RAISE NOTICE '>>> ✅ Subscription FREE créée';
  ELSE
    -- Mettre à jour subscription
    UPDATE user_subscriptions
    SET 
      plan_type = 'free',
      subscription_status = 'active'
    WHERE user_id = p_user_id;
    RAISE NOTICE '>>> ✅ Subscription FREE mise à jour';
  END IF;

  RETURN json_build_object(
    'success', true,
    'plan_type', 'free',
    'message', 'Plan FREE activé avec succès'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.activate_free_plan(uuid) TO authenticated;

-- 5️⃣ RECRÉER activate_pro_plan
DROP FUNCTION IF EXISTS public.activate_pro_plan(uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.activate_pro_plan(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_quota record;
  existing_sub record;
BEGIN
  RAISE NOTICE '>>> activate_pro_plan pour user %', p_user_id;

  -- Vérifier si quotas existent déjà
  SELECT * INTO existing_quota
  FROM user_quotas
  WHERE user_id = p_user_id;

  IF existing_quota IS NULL THEN
    -- Créer quotas PRO
    INSERT INTO user_quotas (
      user_id,
      plan_type,
      prospects_unlocked_count,
      tournees_created_count,
      is_first_login
    ) VALUES (
      p_user_id,
      'pro',
      0,
      0,
      false  -- ✅ Marquer comme "plan choisi"
    );
    RAISE NOTICE '>>> ✅ Quotas PRO créés';
  ELSE
    -- Mettre à jour quotas existants
    UPDATE user_quotas
    SET 
      plan_type = 'pro',
      is_first_login = false
    WHERE user_id = p_user_id;
    RAISE NOTICE '>>> ✅ Quotas PRO mis à jour';
  END IF;

  -- Vérifier si subscription existe
  SELECT * INTO existing_sub
  FROM user_subscriptions
  WHERE user_id = p_user_id;

  IF existing_sub IS NULL THEN
    -- Créer subscription PRO (inactive, en attente de paiement Stripe)
    INSERT INTO user_subscriptions (
      user_id,
      plan_type,
      subscription_status
    ) VALUES (
      p_user_id,
      'pro',
      'inactive'  -- Sera mis à 'active' par le webhook Stripe
    );
    RAISE NOTICE '>>> ✅ Subscription PRO créée (inactive)';
  ELSE
    -- Mettre à jour subscription
    UPDATE user_subscriptions
    SET 
      plan_type = 'pro',
      subscription_status = 'inactive'
    WHERE user_id = p_user_id;
    RAISE NOTICE '>>> ✅ Subscription PRO mise à jour (inactive)';
  END IF;

  RETURN json_build_object(
    'success', true,
    'plan_type', 'pro',
    'message', 'Plan PRO créé, en attente de paiement Stripe'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.activate_pro_plan(uuid) TO authenticated;

-- 6️⃣ FORCER REFRESH DU CACHE PostgREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- 7️⃣ MESSAGE FINAL
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ TOUS LES TRIGGERS SUPPRIMÉS';
  RAISE NOTICE '✅ check_subscription_access NE CRÉE RIEN';
  RAISE NOTICE '✅ activate_free_plan OK';
  RAISE NOTICE '✅ activate_pro_plan OK';
  RAISE NOTICE '✅ Cache PostgREST forcé';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 TESTE MAINTENANT :';
  RAISE NOTICE '  1. SUPPRIME TOUS LES USERS :';
  RAISE NOTICE '     DELETE FROM user_unlocked_prospects;';
  RAISE NOTICE '     DELETE FROM user_subscriptions;';
  RAISE NOTICE '     DELETE FROM user_quotas;';
  RAISE NOTICE '     DELETE FROM auth.users;';
  RAISE NOTICE '';
  RAISE NOTICE '  2. VIDE LE CACHE NAVIGATEUR (Cmd+Shift+R)';
  RAISE NOTICE '  3. Inscris-toi avec un NOUVEL email';
  RAISE NOTICE '  4. Confirme email';
  RAISE NOTICE '  5. Connecte-toi';
  RAISE NOTICE '  6. ✅ Doit arriver sur /plan-selection';
  RAISE NOTICE '  7. Choisis FREE ou PRO';
  RAISE NOTICE '  8. ✅ Doit arriver sur /dashboard';
  RAISE NOTICE '================================================';
END $$;
