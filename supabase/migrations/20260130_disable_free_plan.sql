-- =====================================================
-- DÉSACTIVER LE PLAN FREE
-- =====================================================

-- 1. Supprimer le trigger qui crée automatiquement un plan FREE
DROP TRIGGER IF EXISTS on_user_created_initialize_quota ON auth.users;

-- 2. Remplacer par un trigger vide (ne fait rien)
CREATE OR REPLACE FUNCTION initialize_user_quota()
RETURNS TRIGGER AS $$
BEGIN
  -- Ne rien créer ! Les utilisateurs DOIVENT passer par Stripe pour avoir un plan
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recréer le trigger (mais il ne fait rien maintenant)
CREATE TRIGGER on_user_created_initialize_quota
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_quota();

-- 4. Supprimer tous les plans FREE existants (optionnel - décommente si besoin)
-- DELETE FROM user_quotas WHERE plan_type = 'free';
-- DELETE FROM user_subscriptions WHERE plan_type = 'free';
