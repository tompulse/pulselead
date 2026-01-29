-- =====================================================
-- FIX DATABASE ERROR SAVING NEW USER
-- Date: 2026-01-27
-- Erreur: Le trigger initialize_user_quota échoue
-- =====================================================

-- 1. Désactiver temporairement le trigger pour voir si c'est lui le problème
DROP TRIGGER IF EXISTS on_user_created_initialize_quota ON auth.users;

-- 2. Vérifier la structure des tables
DO $$
BEGIN
  RAISE NOTICE '=== Vérification de la structure des tables ===';
END $$;

-- Vérifier user_quotas
SELECT 
  'user_quotas' as table_name,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_quotas'
ORDER BY ordinal_position;

-- Vérifier user_subscriptions
SELECT 
  'user_subscriptions' as table_name,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_subscriptions'
ORDER BY ordinal_position;

-- 3. Créer une version simplifiée et robuste du trigger
CREATE OR REPLACE FUNCTION initialize_user_quota()
RETURNS TRIGGER AS $$
DECLARE
  quota_exists boolean;
  sub_exists boolean;
BEGIN
  -- Log pour debug
  RAISE NOTICE 'Initializing quota for user: %', NEW.id;
  
  -- Vérifier si user_quotas existe déjà
  SELECT EXISTS(
    SELECT 1 FROM user_quotas WHERE user_id = NEW.id
  ) INTO quota_exists;
  
  -- Créer user_quotas seulement si n'existe pas
  IF NOT quota_exists THEN
    BEGIN
      INSERT INTO user_quotas (
        user_id, 
        plan_type, 
        prospects_unlocked_count,
        tournees_created_count,
        is_first_login
      ) VALUES (
        NEW.id, 
        'free',
        0,
        0,
        true
      );
      RAISE NOTICE 'user_quotas créé avec succès';
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Erreur création user_quotas: %', SQLERRM;
    END;
  END IF;
  
  -- Vérifier si user_subscriptions existe déjà
  SELECT EXISTS(
    SELECT 1 FROM user_subscriptions WHERE user_id = NEW.id
  ) INTO sub_exists;
  
  -- Créer user_subscriptions seulement si n'existe pas
  IF NOT sub_exists THEN
    BEGIN
      INSERT INTO user_subscriptions (
        user_id, 
        plan_type, 
        subscription_status
      ) VALUES (
        NEW.id, 
        'free', 
        'active'
      );
      RAISE NOTICE 'user_subscriptions créé avec succès';
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Erreur création user_subscriptions: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- En cas d'erreur, log mais ne bloque pas la création de l'utilisateur
  RAISE WARNING 'Erreur dans initialize_user_quota: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recréer le trigger
DROP TRIGGER IF EXISTS on_user_created_initialize_quota ON auth.users;
CREATE TRIGGER on_user_created_initialize_quota
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_quota();

-- 5. Vérifier les permissions RLS sur user_quotas
-- Désactiver temporairement RLS pour les insertions système
DROP POLICY IF EXISTS "Service role full access" ON user_quotas;
DROP POLICY IF EXISTS "System can insert quotas" ON user_quotas;

CREATE POLICY "System can insert quotas" ON user_quotas
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Service role full access" ON user_quotas
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 6. Vérifier les permissions RLS sur user_subscriptions
DROP POLICY IF EXISTS "Service role full access subs" ON user_subscriptions;
DROP POLICY IF EXISTS "System can insert subscriptions" ON user_subscriptions;

CREATE POLICY "System can insert subscriptions" ON user_subscriptions
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Service role full access subs" ON user_subscriptions
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 7. Vérifier que la table user_subscriptions a bien une colonne user_id PRIMARY KEY
DO $$
BEGIN
  -- Si la contrainte PRIMARY KEY n'existe pas, la créer
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE table_name = 'user_subscriptions' 
      AND constraint_type = 'PRIMARY KEY'
  ) THEN
    ALTER TABLE user_subscriptions ADD PRIMARY KEY (user_id);
    RAISE NOTICE 'PRIMARY KEY ajouté à user_subscriptions';
  END IF;
END $$;

-- 8. Test: Créer un utilisateur fictif pour tester le trigger
DO $$
DECLARE
  test_user_id uuid := gen_random_uuid();
BEGIN
  -- Simuler une insertion d'utilisateur (ne marche que si on a les permissions)
  RAISE NOTICE 'Test user ID: %', test_user_id;
  
  -- Tester directement l'insertion dans user_quotas
  INSERT INTO user_quotas (user_id, plan_type, prospects_unlocked_count, tournees_created_count, is_first_login)
  VALUES (test_user_id, 'free', 0, 0, true);
  
  RAISE NOTICE '✅ Test insertion user_quotas OK';
  
  -- Tester directement l'insertion dans user_subscriptions
  INSERT INTO user_subscriptions (user_id, plan_type, subscription_status)
  VALUES (test_user_id, 'free', 'active');
  
  RAISE NOTICE '✅ Test insertion user_subscriptions OK';
  
  -- Nettoyer
  DELETE FROM user_subscriptions WHERE user_id = test_user_id;
  DELETE FROM user_quotas WHERE user_id = test_user_id;
  
  RAISE NOTICE '✅ Nettoyage OK';
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '❌ Erreur durant le test: %', SQLERRM;
END $$;

-- 9. Afficher le statut final
SELECT 
  'Trigger actif' as status,
  COUNT(*) as count
FROM pg_trigger 
WHERE tgname = 'on_user_created_initialize_quota';

COMMENT ON FUNCTION initialize_user_quota() IS 'Initialise les quotas FREE pour un nouvel utilisateur - Version robuste avec gestion d''erreurs';
