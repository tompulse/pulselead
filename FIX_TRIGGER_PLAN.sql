-- ================================================
-- FIX: Trigger pour respecter le plan choisi
-- ================================================
-- Le trigger initialize_user_quota créé automatiquement
-- un plan FREE, ce qui écrase le plan choisi par l'user
-- ================================================

-- 1. Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS initialize_user_quota();

-- 2. Créer un nouveau trigger qui lit le plan depuis user_metadata
CREATE OR REPLACE FUNCTION initialize_user_quota()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  selected_plan TEXT;
BEGIN
  -- Lire le plan depuis les metadata (défaut: 'free' si non spécifié)
  selected_plan := COALESCE(
    NEW.raw_user_meta_data->>'selected_plan',
    'free'
  );
  
  -- Créer les quotas avec le plan choisi
  INSERT INTO public.user_quotas (
    user_id,
    plan_type,
    is_first_login,
    unlocked_prospects_count,
    tournees_created_this_month
  ) VALUES (
    NEW.id,
    selected_plan,
    false, -- is_first_login = false car le plan est déjà choisi
    0,
    0
  );
  
  RETURN NEW;
END;
$$;

-- 3. Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_quota();

-- 4. Vérification
SELECT 
  proname as function_name,
  prosrc as function_code
FROM pg_proc 
WHERE proname = 'initialize_user_quota';

-- ================================================
-- TEST APRÈS APPLICATION:
-- ================================================
-- 1. Créé un compte avec /auth?plan=pro
-- 2. Vérifie dans user_quotas:
--    SELECT plan_type FROM user_quotas WHERE user_id = 'xxx';
--    → Doit retourner 'pro' (pas 'free')
-- ================================================
