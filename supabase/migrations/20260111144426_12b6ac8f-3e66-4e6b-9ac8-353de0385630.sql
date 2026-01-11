-- Mettre à jour la fonction check_subscription_access pour gérer le statut trialing
CREATE OR REPLACE FUNCTION public.check_subscription_access(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_subscription RECORD;
  v_is_admin BOOLEAN;
  v_is_demo BOOLEAN;
  v_days_remaining INTEGER;
BEGIN
  -- Vérifier si l'utilisateur est admin
  v_is_admin := public.has_role(_user_id, 'admin'::app_role);
  
  -- Les admins ont un accès illimité gratuit
  IF v_is_admin THEN
    RETURN jsonb_build_object(
      'has_access', true,
      'plan', 'admin',
      'days_remaining', 99999,
      'end_date', null,
      'reason', 'admin_access'
    );
  END IF;
  
  -- Vérifier si c'est le compte démo
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = _user_id AND email = 'demo@pulse.com'
  ) THEN
    RETURN jsonb_build_object(
      'has_access', true,
      'plan', 'demo',
      'days_remaining', 99999,
      'end_date', null,
      'reason', 'demo_access'
    );
  END IF;
  
  -- Pour les autres utilisateurs, vérifier l'abonnement
  SELECT * INTO v_subscription FROM public.user_subscriptions WHERE user_id = _user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('has_access', false, 'reason', 'no_subscription');
  END IF;
  
  -- Vérifier si l'abonnement est actif (active ou trialing) et non expiré
  IF v_subscription.subscription_status IN ('active', 'trialing') AND v_subscription.subscription_end_date > now() THEN
    v_days_remaining := EXTRACT(DAY FROM v_subscription.subscription_end_date - now())::INTEGER;
    RETURN jsonb_build_object(
      'has_access', true,
      'plan', v_subscription.subscription_plan,
      'status', v_subscription.subscription_status,
      'days_remaining', v_days_remaining,
      'end_date', v_subscription.subscription_end_date,
      'is_trial', v_subscription.subscription_status = 'trialing'
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