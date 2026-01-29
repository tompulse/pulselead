-- =====================================================
-- FIX DÉFINITIF - Colonne tournees_created_count
-- Erreur: "Could not find the 'tournees_created_this_month' column"
-- =====================================================

-- 1. VÉRIFIER LA STRUCTURE ACTUELLE
SELECT 
  column_name, 
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_quotas'
ORDER BY ordinal_position;

-- 2. SUPPRIMER L'ANCIENNE COLONNE SI ELLE EXISTE
ALTER TABLE user_quotas DROP COLUMN IF EXISTS tournees_created_this_month;
ALTER TABLE user_quotas DROP COLUMN IF EXISTS unlocked_prospects_count;

-- 3. AJOUTER LES BONNES COLONNES SI ELLES N'EXISTENT PAS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_quotas' AND column_name = 'prospects_unlocked_count'
  ) THEN
    ALTER TABLE user_quotas ADD COLUMN prospects_unlocked_count int DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_quotas' AND column_name = 'tournees_created_count'
  ) THEN
    ALTER TABLE user_quotas ADD COLUMN tournees_created_count int DEFAULT 0;
  END IF;
END $$;

-- 4. METTRE À JOUR TOUTES LES VALEURS NULL
UPDATE user_quotas 
SET 
  prospects_unlocked_count = COALESCE(prospects_unlocked_count, 0),
  tournees_created_count = COALESCE(tournees_created_count, 0)
WHERE prospects_unlocked_count IS NULL 
   OR tournees_created_count IS NULL;

-- 5. RECRÉER TOUTES LES FONCTIONS AVEC LES BONS NOMS DE COLONNES

-- activate_free_plan
CREATE OR REPLACE FUNCTION activate_free_plan(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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
    false
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan_type = 'free',
    is_first_login = false,
    prospects_unlocked_count = COALESCE(user_quotas.prospects_unlocked_count, 0),
    tournees_created_count = COALESCE(user_quotas.tournees_created_count, 0),
    updated_at = now();

  INSERT INTO user_subscriptions (
    user_id,
    plan_type,
    subscription_status
  ) VALUES (
    p_user_id,
    'free',
    'active'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan_type = 'free',
    subscription_status = 'active';

  RETURN json_build_object(
    'success', true,
    'plan_type', 'free',
    'message', 'Plan FREE activé'
  );
END;
$$;

-- check_subscription_access (version corrigée)
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
  SELECT 
    subscription_status,
    subscription_plan,
    subscription_end_date,
    subscription_start_date,
    plan_type
  INTO sub_record
  FROM user_subscriptions
  WHERE user_id = _user_id
  LIMIT 1;

  IF sub_record IS NULL THEN
    INSERT INTO user_subscriptions (user_id, plan_type, subscription_status)
    VALUES (_user_id, 'free', 'active')
    ON CONFLICT (user_id) DO NOTHING;
    
    INSERT INTO user_quotas (user_id, plan_type, prospects_unlocked_count, tournees_created_count)
    VALUES (_user_id, 'free', 0, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN json_build_object(
      'has_access', true,
      'plan_type', 'free',
      'reason', 'free_plan',
      'status', 'active',
      'quotas', json_build_object(
        'prospects_unlocked', 0,
        'prospects_limit', 30,
        'tournees_created', 0,
        'tournees_limit', 2
      )
    );
  END IF;

  IF sub_record.plan_type = 'free' THEN
    SELECT * INTO quota_record
    FROM user_quotas
    WHERE user_id = _user_id;
    
    SELECT COUNT(*) INTO unlocked_count
    FROM user_unlocked_prospects
    WHERE user_id = _user_id;
    
    IF quota_record.tournees_reset_date < now() - INTERVAL '30 days' THEN
      UPDATE user_quotas
      SET 
        tournees_created_count = 0,
        tournees_reset_date = now()
      WHERE user_id = _user_id;
      
      quota_record.tournees_created_count := 0;
    END IF;
    
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

  IF sub_record.subscription_status IN ('active', 'trialing')
     AND (sub_record.subscription_end_date IS NULL OR sub_record.subscription_end_date > now()) THEN
    RETURN json_build_object(
      'has_access', true,
      'plan_type', sub_record.plan_type,
      'plan', sub_record.subscription_plan,
      'status', sub_record.subscription_status,
      'end_date', sub_record.subscription_end_date
    );
  END IF;

  RETURN json_build_object(
    'has_access', true,
    'plan_type', 'free',
    'status', 'active'
  );
END;
$$;

-- check_tournee_quota
CREATE OR REPLACE FUNCTION check_tournee_quota(_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  quota_record record;
  plan_type_val text;
BEGIN
  SELECT plan_type INTO plan_type_val
  FROM user_subscriptions
  WHERE user_id = _user_id;
  
  IF plan_type_val IN ('pro', 'teams') THEN
    RETURN json_build_object('allowed', true, 'limit_reached', false);
  END IF;
  
  SELECT * INTO quota_record
  FROM user_quotas
  WHERE user_id = _user_id;
  
  IF quota_record.tournees_reset_date < now() - INTERVAL '30 days' THEN
    UPDATE user_quotas
    SET 
      tournees_created_count = 0,
      tournees_reset_date = now()
    WHERE user_id = _user_id;
    
    quota_record.tournees_created_count := 0;
  END IF;
  
  IF COALESCE(quota_record.tournees_created_count, 0) >= 2 THEN
    RETURN json_build_object(
      'allowed', false, 
      'limit_reached', true,
      'message', 'Plan gratuit : 2 tournées par mois. Passez à PRO pour des tournées illimitées.',
      'tournees_created', quota_record.tournees_created_count,
      'limit', 2
    );
  END IF;
  
  RETURN json_build_object(
    'allowed', true, 
    'limit_reached', false,
    'tournees_created', COALESCE(quota_record.tournees_created_count, 0),
    'limit', 2
  );
END;
$$;

-- increment_tournee_quota
CREATE OR REPLACE FUNCTION increment_tournee_quota(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_quotas
  SET 
    tournees_created_count = COALESCE(tournees_created_count, 0) + 1,
    updated_at = now()
  WHERE user_id = _user_id;
END;
$$;

-- 6. GRANT PERMISSIONS
GRANT EXECUTE ON FUNCTION activate_free_plan(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION activate_free_plan(uuid) TO anon;
GRANT EXECUTE ON FUNCTION check_subscription_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION check_tournee_quota(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_tournee_quota(uuid) TO authenticated;

-- 7. FORCER LE REFRESH DU CACHE POSTGREST
NOTIFY pgrst, 'reload schema';
SELECT pg_notify('pgrst', 'reload config');

-- 8. VÉRIFIER LA STRUCTURE FINALE
SELECT 
  '✅ Structure finale de user_quotas :' as info;

SELECT 
  column_name, 
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_quotas'
ORDER BY ordinal_position;

-- 9. TEST
DO $$
DECLARE
  test_user_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO user_quotas (user_id, plan_type, prospects_unlocked_count, tournees_created_count)
  VALUES (test_user_id, 'free', 0, 0);
  
  RAISE NOTICE '✅ TEST INSERTION OK - Colonnes correctes';
  
  DELETE FROM user_quotas WHERE user_id = test_user_id;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '❌ TEST ÉCHOUÉ: %', SQLERRM;
END $$;

SELECT '✅ SCRIPT TERMINÉ - Cache refresh et colonnes corrigées' as status;
