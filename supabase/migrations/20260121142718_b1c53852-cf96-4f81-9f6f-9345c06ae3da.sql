
-- Fonction admin pour récupérer les stats de toutes les tournées
CREATE OR REPLACE FUNCTION public.get_admin_tournee_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  SELECT json_build_object(
    'total', COUNT(*),
    'planifiees', COUNT(*) FILTER (WHERE statut = 'planifiee'),
    'en_cours', COUNT(*) FILTER (WHERE statut = 'en_cours'),
    'terminees', COUNT(*) FILTER (WHERE statut = 'terminee'),
    'total_km', COALESCE(SUM(distance_totale_km), 0),
    'total_minutes', COALESCE(SUM(temps_estime_minutes), 0),
    'total_stops', COALESCE(SUM(array_length(entreprises_ids, 1)), 0),
    'tournees', (
      SELECT json_agg(t ORDER BY t.created_at DESC)
      FROM (
        SELECT id, nom, date_planifiee, statut, distance_totale_km, 
               temps_estime_minutes, array_length(entreprises_ids, 1) as stops_count,
               user_id, created_at
        FROM tournees
        ORDER BY created_at DESC
        LIMIT 20
      ) t
    )
  ) INTO result
  FROM tournees;

  RETURN result;
END;
$$;

-- Fonction admin pour récupérer les stats CRM globales
CREATE OR REPLACE FUNCTION public.get_admin_crm_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  SELECT json_build_object(
    'total_leads', (SELECT COUNT(*) FROM lead_statuts),
    'total_interactions', (SELECT COUNT(*) FROM lead_interactions),
    'by_status', (
      SELECT COALESCE(json_object_agg(statut, cnt), '{}'::json)
      FROM (SELECT statut, COUNT(*) as cnt FROM lead_statuts GROUP BY statut) s
    ),
    'by_interaction_type', (
      SELECT COALESCE(json_object_agg(type, cnt), '{}'::json)
      FROM (SELECT type, COUNT(*) as cnt FROM lead_interactions GROUP BY type) i
    ),
    'rdv_scheduled', (
      SELECT COUNT(*) FROM lead_interactions 
      WHERE type = 'rdv' AND date_relance >= now()
    ),
    'to_call', (
      SELECT COUNT(*) FROM lead_interactions 
      WHERE type = 'appel' AND statut = 'en_cours'
    ),
    'pending_followups', (
      SELECT COUNT(*) FROM lead_interactions 
      WHERE date_relance >= now()
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Fonction admin pour récupérer l'activité des utilisateurs
CREATE OR REPLACE FUNCTION public.get_admin_users_activity()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN (
    SELECT COALESCE(json_agg(u ORDER BY total_activity DESC), '[]'::json)
    FROM (
      SELECT 
        COALESCE(t.user_id, l.user_id, i.user_id) as user_id,
        COALESCE(t.tournees_count, 0) as tournees_count,
        COALESCE(l.leads_count, 0) as leads_count,
        COALESCE(i.interactions_count, 0) as interactions_count,
        GREATEST(t.last_activity, i.last_interaction) as last_activity,
        COALESCE(t.tournees_count, 0) + COALESCE(l.leads_count, 0) + COALESCE(i.interactions_count, 0) as total_activity
      FROM 
        (SELECT user_id, COUNT(*) as tournees_count, MAX(created_at) as last_activity FROM tournees GROUP BY user_id) t
      FULL OUTER JOIN 
        (SELECT user_id, COUNT(*) as leads_count FROM lead_statuts GROUP BY user_id) l ON t.user_id = l.user_id
      FULL OUTER JOIN 
        (SELECT user_id, COUNT(*) as interactions_count, MAX(date_interaction) as last_interaction FROM lead_interactions GROUP BY user_id) i ON COALESCE(t.user_id, l.user_id) = i.user_id
    ) u
  );
END;
$$;

-- Fonction admin pour les time series (30 derniers jours)
CREATE OR REPLACE FUNCTION public.get_admin_timeseries()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  WITH dates AS (
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '29 days',
      CURRENT_DATE,
      '1 day'::interval
    )::date as date
  ),
  daily_tournees AS (
    SELECT DATE(created_at) as date, COUNT(*) as count, COALESCE(SUM(distance_totale_km), 0) as km
    FROM tournees
    WHERE created_at >= CURRENT_DATE - INTERVAL '29 days'
    GROUP BY DATE(created_at)
  ),
  daily_leads AS (
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM lead_statuts
    WHERE created_at >= CURRENT_DATE - INTERVAL '29 days'
    GROUP BY DATE(created_at)
  ),
  daily_interactions AS (
    SELECT DATE(date_interaction) as date, COUNT(*) as count
    FROM lead_interactions
    WHERE date_interaction >= CURRENT_DATE - INTERVAL '29 days'
    GROUP BY DATE(date_interaction)
  )
  SELECT json_agg(
    json_build_object(
      'date', d.date,
      'tournees', COALESCE(t.count, 0),
      'km', COALESCE(t.km, 0),
      'leads', COALESCE(l.count, 0),
      'interactions', COALESCE(i.count, 0)
    ) ORDER BY d.date
  ) INTO result
  FROM dates d
  LEFT JOIN daily_tournees t ON d.date = t.date
  LEFT JOIN daily_leads l ON d.date = l.date
  LEFT JOIN daily_interactions i ON d.date = i.date;

  RETURN result;
END;
$$;
