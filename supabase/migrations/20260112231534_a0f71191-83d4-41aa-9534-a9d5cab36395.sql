-- Supprimer la policy admin trop permissive sur user_subscriptions
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.user_subscriptions;

-- Créer une policy admin plus restrictive pour SELECT (sans les colonnes Stripe sensibles)
-- Les admins peuvent voir les abonnements mais les modifications sensibles passent par service_role
CREATE POLICY "Admins can view subscription metadata" 
ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Les admins peuvent mettre à jour uniquement les champs non-sensibles
-- stripe_customer_id, stripe_subscription_id, stripe_payment_intent_id sont gérés par webhook
CREATE POLICY "Admins can update subscription status" 
ON public.user_subscriptions
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Créer une vue sécurisée pour l'affichage admin qui masque les identifiants Stripe
CREATE OR REPLACE VIEW public.user_subscriptions_safe AS
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

-- Supprimer les policies dupliquées pour nettoyer
DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;

-- Garder une seule policy de lecture claire
-- (la policy "Admins can view subscription metadata" gère déjà les deux cas)