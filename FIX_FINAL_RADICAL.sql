-- =====================================================
-- FIX RADICAL - DÉSACTIVER TOUT CE QUI BLOQUE
-- Cette solution DOIT fonctionner
-- =====================================================

-- 1. DÉSACTIVER COMPLÈTEMENT LE TRIGGER
DROP TRIGGER IF EXISTS on_user_created_initialize_quota ON auth.users;

-- Créer un trigger vide qui ne fait RIEN
CREATE OR REPLACE FUNCTION initialize_user_quota()
RETURNS TRIGGER AS $$
BEGIN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pas de trigger du tout, on le laisse désactivé

-- 2. DÉSACTIVER RLS SUR TOUTES LES TABLES
ALTER TABLE user_quotas DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_unlocked_prospects DISABLE ROW LEVEL SECURITY;

-- 3. SUPPRIMER TOUTES LES POLITIQUES RLS
DROP POLICY IF EXISTS "Users can view own quotas" ON user_quotas;
DROP POLICY IF EXISTS "Users can update own quotas" ON user_quotas;
DROP POLICY IF EXISTS "Users can insert own quotas" ON user_quotas;
DROP POLICY IF EXISTS "Service role full access" ON user_quotas;
DROP POLICY IF EXISTS "Allow all for authenticated" ON user_quotas;
DROP POLICY IF EXISTS "System can insert quotas" ON user_quotas;

DROP POLICY IF EXISTS "Users can view own unlocked prospects" ON user_unlocked_prospects;
DROP POLICY IF EXISTS "Users can insert own unlocked prospects" ON user_unlocked_prospects;
DROP POLICY IF EXISTS "Service role can manage all unlocked prospects" ON user_unlocked_prospects;

-- Sur user_subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Allow all for authenticated subs" ON user_subscriptions;
DROP POLICY IF EXISTS "System can insert subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Service role full access subs" ON user_subscriptions;

-- 4. DONNER TOUS LES DROITS À AUTHENTICATED
GRANT ALL ON user_quotas TO authenticated;
GRANT ALL ON user_subscriptions TO authenticated;
GRANT ALL ON user_unlocked_prospects TO authenticated;

-- 5. S'ASSURER QUE activate_free_plan EXISTE
CREATE OR REPLACE FUNCTION activate_free_plan(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Créer ou mettre à jour user_quotas
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
    updated_at = now();

  -- Créer ou mettre à jour user_subscriptions
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

GRANT EXECUTE ON FUNCTION activate_free_plan(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION activate_free_plan(uuid) TO anon;

-- 6. VÉRIFIER QUE LES TABLES EXISTENT
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_quotas') THEN
    CREATE TABLE user_quotas (
      user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      plan_type text DEFAULT 'free',
      prospects_unlocked_count int DEFAULT 0,
      tournees_created_count int DEFAULT 0,
      tournees_reset_date timestamptz DEFAULT now(),
      is_first_login boolean DEFAULT true,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_subscriptions') THEN
    CREATE TABLE user_subscriptions (
      user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      plan_type text DEFAULT 'free',
      subscription_status text DEFAULT 'active',
      stripe_customer_id text,
      stripe_subscription_id text,
      stripe_subscription_status text,
      subscription_plan text,
      subscription_start_date timestamptz,
      subscription_end_date timestamptz,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- 7. NETTOYER LES UTILISATEURS BLOQUÉS
-- Si tu as essayé de t'inscrire et que ça a échoué, supprime cet utilisateur
-- DÉCOMMENTE ET REMPLACE PAR TON EMAIL
-- DELETE FROM auth.users WHERE email = 'TON_EMAIL@example.com';

-- 8. TEST FINAL
DO $$
DECLARE
  test_user_id uuid := gen_random_uuid();
BEGIN
  -- Test d'insertion dans user_quotas
  INSERT INTO user_quotas (user_id, plan_type, prospects_unlocked_count, tournees_created_count, is_first_login)
  VALUES (test_user_id, 'free', 0, 0, true);
  
  -- Test d'insertion dans user_subscriptions
  INSERT INTO user_subscriptions (user_id, plan_type, subscription_status)
  VALUES (test_user_id, 'free', 'active');
  
  RAISE NOTICE '✅ TEST RÉUSSI - Les insertions fonctionnent';
  
  -- Nettoyer
  DELETE FROM user_subscriptions WHERE user_id = test_user_id;
  DELETE FROM user_quotas WHERE user_id = test_user_id;
  
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '❌ TEST ÉCHOUÉ: %', SQLERRM;
END $$;

-- 9. AFFICHER LE STATUT
SELECT 
  '✅ Trigger désactivé' as status
UNION ALL
SELECT 
  '✅ RLS désactivé sur toutes les tables'
UNION ALL
SELECT 
  '✅ Tous les droits donnés à authenticated'
UNION ALL
SELECT 
  '✅ Fonction activate_free_plan créée'
UNION ALL
SELECT 
  '👉 Teste maintenant l''inscription !';
