-- Modifier la fonction check_subscription_access pour donner accès gratuit aux admins
CREATE OR REPLACE FUNCTION public.check_subscription_access(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_subscription RECORD;
  v_is_admin BOOLEAN;
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
  
  -- Pour les non-admins, vérifier l'abonnement normal
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
$function$;

-- Ajouter le rôle admin pour l'email mcastany.lppv@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'mcastany.lppv@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;