-- Créer la table user_subscriptions sans période d'essai
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Statut d'abonnement (pas de trial)
  subscription_status TEXT DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'active', 'expired', 'cancelled')),
  subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'quarterly', 'yearly')),
  
  -- Dates d'abonnement
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  
  -- Stripe (prêt pour plus tard)
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_payment_intent_id TEXT,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leur propre abonnement
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Les admins peuvent tout voir et modifier
CREATE POLICY "Admins can manage all subscriptions" ON public.user_subscriptions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour créer automatiquement un abonnement en attente à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, subscription_status)
  VALUES (NEW.id, 'pending');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- Fonction pour vérifier si l'utilisateur a accès (seulement si abonnement actif)
CREATE OR REPLACE FUNCTION public.check_subscription_access(_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_subscription RECORD;
  v_has_access BOOLEAN;
  v_days_remaining INTEGER;
BEGIN
  SELECT * INTO v_subscription FROM public.user_subscriptions WHERE user_id = _user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('has_access', false, 'reason', 'no_subscription');
  END IF;
  
  -- Vérifier si l'abonnement est actif et non expiré
  IF v_subscription.subscription_status = 'active' AND v_subscription.subscription_end_date > now() THEN
    v_days_remaining := EXTRACT(DAY FROM v_subscription.subscription_end_date - now())::INTEGER;
    RETURN jsonb_build_object(
      'has_access', true,
      'plan', v_subscription.subscription_plan,
      'days_remaining', v_days_remaining,
      'end_date', v_subscription.subscription_end_date
    );
  ELSE
    RETURN jsonb_build_object(
      'has_access', false,
      'reason', v_subscription.subscription_status,
      'plan', v_subscription.subscription_plan
    );
  END IF;
END;
$$;