-- Recréer la vue avec SECURITY INVOKER (comportement par défaut sécurisé)
-- Cela garantit que les RLS policies sont respectées
DROP VIEW IF EXISTS public.user_subscriptions_safe;

CREATE VIEW public.user_subscriptions_safe 
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  subscription_status,
  subscription_plan,
  subscription_start_date,
  subscription_end_date,
  created_at,
  updated_at,
  -- Masquer les identifiants Stripe avec des marqueurs
  CASE 
    WHEN stripe_customer_id IS NOT NULL THEN '***' || RIGHT(stripe_customer_id, 4)
    ELSE NULL 
  END as stripe_customer_masked,
  CASE 
    WHEN stripe_subscription_id IS NOT NULL THEN '***' || RIGHT(stripe_subscription_id, 4)
    ELSE NULL 
  END as stripe_subscription_masked
FROM public.user_subscriptions;

-- Accorder l'accès à la vue aux utilisateurs authentifiés
GRANT SELECT ON public.user_subscriptions_safe TO authenticated;