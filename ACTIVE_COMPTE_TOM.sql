-- ⚡ ACTIVATION IMMÉDIATE DU COMPTE tomiolovpro@gmail.com
-- Copie/colle ce SQL dans Supabase SQL Editor et exécute

DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'tomiolovpro@gmail.com';
BEGIN
  -- Récupérer le user_id
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '❌ Aucun utilisateur trouvé avec email: %', v_email;
  END IF;
  
  RAISE NOTICE '✅ User trouvé: %', v_user_id;
  
  -- ✅ ACTIVER LE COMPTE
  INSERT INTO public.user_quotas (
    user_id,
    plan_type,
    is_first_login,
    subscription_status,
    prospects_limit,
    tournees_limit,
    updated_at
  ) VALUES (
    v_user_id,
    'pro',
    false, -- ✅ ACTIVATION !
    'trialing',
    999999,
    999999,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan_type = 'pro',
    is_first_login = false, -- ✅ ACTIVATION !
    subscription_status = 'trialing',
    prospects_limit = 999999,
    tournees_limit = 999999,
    updated_at = NOW();
  
  RAISE NOTICE '✅ Compte activé avec succès !';
  
END $$;

-- ✅ VÉRIFICATION : Affiche ton compte activé
SELECT 
  u.email,
  q.plan_type,
  q.is_first_login,
  q.subscription_status,
  q.prospects_limit,
  q.tournees_limit
FROM auth.users u
LEFT JOIN public.user_quotas q ON q.user_id = u.id
WHERE u.email = 'tomiolovpro@gmail.com';

-- ✅ Tu dois voir :
-- email: tomiolovpro@gmail.com
-- plan_type: pro
-- is_first_login: false ✅
-- subscription_status: trialing
-- prospects_limit: 999999
-- tournees_limit: 999999
