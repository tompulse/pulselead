-- ============================================
-- 🔧 ROLLBACK COMPLET - TRIGGER MINIMAL
-- ============================================
-- On supprime complètement la logique du trigger
-- Tout sera géré côté frontend
-- ============================================

-- Supprimer le trigger problématique
DROP TRIGGER IF EXISTS on_user_created_initialize_quota ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS initialize_user_quota() CASCADE;

-- Créer un trigger MINIMAL qui ne fait RIEN
-- Toute la logique sera dans le frontend
CREATE OR REPLACE FUNCTION initialize_user_quota()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Ne rien faire, juste retourner le user
  -- La création des quotas sera gérée par le frontend
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Ne jamais bloquer la création du user
    RETURN NEW;
END;
$$;

-- Recréer le trigger (vide)
CREATE TRIGGER on_user_created_initialize_quota
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_quota();

-- Vérifier que les RLS policies permettent l'insertion
-- Policy pour permettre aux users authentifiés d'insérer leurs propres quotas
DROP POLICY IF EXISTS "Users can insert their own quotas" ON user_quotas;
CREATE POLICY "Users can insert their own quotas"
  ON user_quotas
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy pour permettre la lecture
DROP POLICY IF EXISTS "Users can read own quotas" ON user_quotas;
CREATE POLICY "Users can read own quotas"
  ON user_quotas
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy pour permettre la mise à jour
DROP POLICY IF EXISTS "Users can update own quotas" ON user_quotas;
CREATE POLICY "Users can update own quotas"
  ON user_quotas
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Vérification
SELECT 'Trigger désactivé + RLS policies mises à jour ✅' as status;
