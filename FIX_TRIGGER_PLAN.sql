-- ============================================
-- 🔧 FIX TRIGGER PLAN PRO/FREE
-- ============================================
-- Supprime et recrée le trigger pour qu'il respecte
-- le plan choisi par l'user (free ou pro)
-- ============================================

-- Supprimer l'ancien trigger défectueux (avec CASCADE)
DROP TRIGGER IF EXISTS on_user_created_initialize_quota ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS initialize_user_quota() CASCADE;

-- Créer nouveau trigger qui LIT le plan choisi
CREATE OR REPLACE FUNCTION initialize_user_quota()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  selected_plan TEXT;
BEGIN
  -- Lire le plan depuis metadata (free par défaut)
  selected_plan := COALESCE(
    NEW.raw_user_meta_data->>'selected_plan',
    'free'
  );
  
  -- Créer quotas avec le BON plan
  INSERT INTO public.user_quotas (
    user_id,
    plan_type,
    is_first_login,
    unlocked_prospects_count,
    tournees_created_this_month
  ) VALUES (
    NEW.id,
    selected_plan, -- Plan choisi par l'user (free ou pro)
    false, -- Déjà choisi son plan
    0,
    0
  );
  
  RETURN NEW;
END;
$$;

-- Recréer le trigger
CREATE TRIGGER on_user_created_initialize_quota
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_quota();

-- Vérification
SELECT 'Trigger mis à jour avec succès ✅' as status;
