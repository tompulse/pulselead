-- ============================================================
-- RPC : create_prospection_imprevue
-- Crée en une seule transaction atomique :
--   1. Un prospect dans nouveaux_sites (SECURITY DEFINER → bypass RLS)
--   2. Une lead_interaction avec date de relance
-- Note : lead_statuts retiré (les compteurs CRM viennent de
--        lead_interactions, pas de lead_statuts)
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_prospection_imprevue(
  p_nom                 text,
  p_siret               text,
  p_user_id             uuid,
  p_statut_lead         text,
  p_interaction_type    text,
  p_interaction_statut  text,
  p_notes               text DEFAULT NULL,
  p_date_relance        timestamptz DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entreprise_id uuid;
BEGIN
  -- 1. Créer le prospect (contourne le RLS grâce à SECURITY DEFINER)
  INSERT INTO nouveaux_sites (nom, siret)
  VALUES (p_nom, p_siret)
  RETURNING id INTO v_entreprise_id;

  -- 2. Créer l'interaction (created_at a une DEFAULT now(), pas besoin de date_interaction)
  INSERT INTO lead_interactions (
    entreprise_id,
    user_id,
    type,
    statut,
    notes,
    date_relance
  )
  VALUES (
    v_entreprise_id,
    p_user_id,
    p_interaction_type,
    p_interaction_statut,
    p_notes,
    p_date_relance
  );

  RETURN v_entreprise_id;
END;
$$;

-- Accorder l'exécution aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION public.create_prospection_imprevue TO authenticated;
