-- Sécuriser la vue user_subscriptions_safe avec RLS
-- La vue hérite des politiques de la table sous-jacente, mais ajoutons une politique explicite

-- D'abord, vérifions si RLS est activé sur la vue (les vues n'ont pas de RLS propre, 
-- mais on peut créer une fonction sécurisée pour l'accès)

-- Créer une fonction sécurisée pour accéder aux données d'abonnement masquées
CREATE OR REPLACE FUNCTION public.get_my_subscription_safe()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  stripe_customer_masked text,
  stripe_subscription_masked text,
  subscription_status text,
  subscription_plan text,
  subscription_start_date timestamptz,
  subscription_end_date timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    user_id,
    CASE 
      WHEN stripe_customer_id IS NOT NULL 
      THEN '***' || RIGHT(stripe_customer_id, 4)
      ELSE NULL
    END as stripe_customer_masked,
    CASE 
      WHEN stripe_subscription_id IS NOT NULL 
      THEN '***' || RIGHT(stripe_subscription_id, 4)
      ELSE NULL
    END as stripe_subscription_masked,
    subscription_status,
    subscription_plan,
    subscription_start_date::timestamptz,
    subscription_end_date::timestamptz,
    created_at::timestamptz,
    updated_at::timestamptz
  FROM public.user_subscriptions
  WHERE user_id = auth.uid();
$$;