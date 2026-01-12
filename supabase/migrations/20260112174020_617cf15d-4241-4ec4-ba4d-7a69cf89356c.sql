-- Supprimer l'ancienne contrainte de statut
ALTER TABLE public.user_subscriptions DROP CONSTRAINT user_subscriptions_subscription_status_check;

-- Recréer avec les bons statuts incluant trialing et past_due
ALTER TABLE public.user_subscriptions ADD CONSTRAINT user_subscriptions_subscription_status_check 
CHECK (subscription_status = ANY (ARRAY['pending'::text, 'trialing'::text, 'active'::text, 'past_due'::text, 'expired'::text, 'cancelled'::text]));