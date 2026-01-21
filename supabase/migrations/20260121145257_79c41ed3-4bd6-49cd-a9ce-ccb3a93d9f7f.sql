-- Fix admin analytics functions - use NOT IN instead of != ALL for better NULL handling

CREATE OR REPLACE FUNCTION public.get_admin_tournee_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  SELECT json_build_object(
    'total', COALESCE(COUNT(*)::int, 0),
    'terminees', COALESCE(COUNT(*) FILTER (WHERE statut = 'terminee')::int, 0),
    'en_cours', COALESCE(COUNT(*) FILTER (WHERE statut = 'en_cours')::int, 0),
    'planifiees', COALESCE(COUNT(*) FILTER (WHERE statut = 'planifiee')::int, 0),
    'totalKm', COALESCE(ROUND(SUM(distance_totale_km)::numeric, 0)::int, 0),
    'totalMinutes', COALESCE(SUM(temps_estime_minutes)::int, 0),
    'totalStops', COALESCE(SUM(array_length(ordre_optimise, 1))::int, 0),
    'avgKmPerTournee', COALESCE(ROUND(AVG(distance_totale_km)::numeric, 0)::int, 0),
    'avgMinutesPerTournee', COALESCE(ROUND(AVG(temps_estime_minutes)::numeric, 0)::int, 0),
    'avgStopsPerTournee', COALESCE(ROUND(AVG(array_length(ordre_optimise, 1))::numeric, 1), 0)
  ) INTO result
  FROM tournees
  WHERE user_id NOT IN (
    SELECT id FROM auth.users WHERE email IN ('tom.iolov@hotmail.fr', 'tomiolovpro@gmail.com')
  );

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_crm_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  total_leads int;
  total_interactions int;
  won_leads int;
  rdv_count int;
  to_call_count int;
  status_counts json;
  interaction_types json;
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Count leads (excluding admin accounts)
  SELECT COUNT(*) INTO total_leads 
  FROM lead_statuts 
  WHERE user_id NOT IN (SELECT id FROM auth.users WHERE email IN ('tom.iolov@hotmail.fr', 'tomiolovpro@gmail.com'));

  -- Count interactions (excluding admin accounts)
  SELECT COUNT(*) INTO total_interactions 
  FROM lead_interactions 
  WHERE user_id NOT IN (SELECT id FROM auth.users WHERE email IN ('tom.iolov@hotmail.fr', 'tomiolovpro@gmail.com'));

  -- Count won leads
  SELECT COUNT(*) INTO won_leads 
  FROM lead_statuts 
  WHERE statut = 'gagne' 
  AND user_id NOT IN (SELECT id FROM auth.users WHERE email IN ('tom.iolov@hotmail.fr', 'tomiolovpro@gmail.com'));

  -- Count RDV
  SELECT COUNT(*) INTO rdv_count 
  FROM lead_interactions 
  WHERE type = 'rdv' 
  AND user_id NOT IN (SELECT id FROM auth.users WHERE email IN ('tom.iolov@hotmail.fr', 'tomiolovpro@gmail.com'));

  -- Count to call
  SELECT COUNT(*) INTO to_call_count 
  FROM lead_interactions 
  WHERE type = 'a_rappeler' 
  AND user_id NOT IN (SELECT id FROM auth.users WHERE email IN ('tom.iolov@hotmail.fr', 'tomiolovpro@gmail.com'));

  -- Status breakdown
  SELECT json_object_agg(statut, cnt) INTO status_counts
  FROM (
    SELECT statut, COUNT(*) as cnt 
    FROM lead_statuts 
    WHERE user_id NOT IN (SELECT id FROM auth.users WHERE email IN ('tom.iolov@hotmail.fr', 'tomiolovpro@gmail.com'))
    GROUP BY statut
  ) s;

  -- Interaction types breakdown
  SELECT json_object_agg(type, cnt) INTO interaction_types
  FROM (
    SELECT type, COUNT(*) as cnt 
    FROM lead_interactions 
    WHERE user_id NOT IN (SELECT id FROM auth.users WHERE email IN ('tom.iolov@hotmail.fr', 'tomiolovpro@gmail.com'))
    GROUP BY type
  ) i;

  result := json_build_object(
    'totalLeads', COALESCE(total_leads, 0),
    'totalInteractions', COALESCE(total_interactions, 0),
    'conversionRate', CASE WHEN total_leads > 0 THEN ROUND((won_leads::numeric / total_leads) * 100, 1) ELSE 0 END,
    'rdvScheduled', COALESCE(rdv_count, 0),
    'toCall', COALESCE(to_call_count, 0),
    'byStatus', COALESCE(status_counts, '{}'::json),
    'interactionsByType', COALESCE(interaction_types, '{}'::json)
  );

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_users_activity()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  SELECT json_agg(user_activity) INTO result
  FROM (
    SELECT 
      u.id as user_id,
      u.email as user_email,
      COALESCE(t.tournee_count, 0) as tournees_count,
      COALESCE(l.lead_count, 0) as leads_count,
      COALESCE(i.interaction_count, 0) as interactions_count,
      GREATEST(t.last_tournee, l.last_lead, i.last_interaction) as last_activity
    FROM auth.users u
    LEFT JOIN (
      SELECT user_id, COUNT(*) as tournee_count, MAX(created_at) as last_tournee
      FROM tournees
      GROUP BY user_id
    ) t ON t.user_id = u.id
    LEFT JOIN (
      SELECT user_id, COUNT(*) as lead_count, MAX(created_at) as last_lead
      FROM lead_statuts
      GROUP BY user_id
    ) l ON l.user_id = u.id
    LEFT JOIN (
      SELECT user_id, COUNT(*) as interaction_count, MAX(created_at) as last_interaction
      FROM lead_interactions
      GROUP BY user_id
    ) i ON i.user_id = u.id
    WHERE u.email NOT IN ('tom.iolov@hotmail.fr', 'tomiolovpro@gmail.com')
    AND (t.tournee_count > 0 OR l.lead_count > 0 OR i.interaction_count > 0)
    ORDER BY last_activity DESC NULLS LAST
    LIMIT 50
  ) user_activity;

  RETURN COALESCE(result, '[]'::json);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_timeseries()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  SELECT json_agg(daily_data ORDER BY date) INTO result
  FROM (
    SELECT 
      d.date::text as date,
      COALESCE(t.tournee_count, 0) as tournees,
      COALESCE(t.total_km, 0) as km,
      COALESCE(l.lead_count, 0) as leads,
      COALESCE(i.interaction_count, 0) as interactions
    FROM (
      SELECT generate_series(
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE,
        '1 day'::interval
      )::date as date
    ) d
    LEFT JOIN (
      SELECT 
        created_at::date as date, 
        COUNT(*) as tournee_count,
        ROUND(SUM(distance_totale_km)::numeric, 0)::int as total_km
      FROM tournees
      WHERE user_id NOT IN (SELECT id FROM auth.users WHERE email IN ('tom.iolov@hotmail.fr', 'tomiolovpro@gmail.com'))
      AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY created_at::date
    ) t ON t.date = d.date
    LEFT JOIN (
      SELECT created_at::date as date, COUNT(*) as lead_count
      FROM lead_statuts
      WHERE user_id NOT IN (SELECT id FROM auth.users WHERE email IN ('tom.iolov@hotmail.fr', 'tomiolovpro@gmail.com'))
      AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY created_at::date
    ) l ON l.date = d.date
    LEFT JOIN (
      SELECT created_at::date as date, COUNT(*) as interaction_count
      FROM lead_interactions
      WHERE user_id NOT IN (SELECT id FROM auth.users WHERE email IN ('tom.iolov@hotmail.fr', 'tomiolovpro@gmail.com'))
      AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY created_at::date
    ) i ON i.date = d.date
  ) daily_data;

  RETURN COALESCE(result, '[]'::json);
END;
$$;