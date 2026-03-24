-- ============================================================
-- ÉTAPE 1 : Convertir les colonnes ENUM en TEXT sur lead_interactions
-- Nécessaire car le code utilise 'a_revoir' qui n'est pas dans l'ENUM
-- d'origine. Les colonnes type et statut doivent accepter n'importe
-- quelle valeur texte.
-- ============================================================

DO $$
BEGIN
  -- Convertir "type" si c'est encore un ENUM
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'lead_interactions'
      AND column_name  = 'type'
      AND udt_name     = 'interaction_type'
  ) THEN
    ALTER TABLE public.lead_interactions
      ALTER COLUMN type TYPE text USING type::text;
    RAISE NOTICE 'lead_interactions.type converti en TEXT';
  END IF;

  -- Convertir "statut" si c'est encore un ENUM
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'lead_interactions'
      AND column_name  = 'statut'
      AND udt_name     = 'interaction_statut'
  ) THEN
    ALTER TABLE public.lead_interactions
      ALTER COLUMN statut TYPE text USING statut::text;
    RAISE NOTICE 'lead_interactions.statut converti en TEXT';
  END IF;
END $$;

-- ============================================================
-- ÉTAPE 2 : RPC create_prospection_imprevue
-- Crée en une seule transaction atomique :
--   1. Un prospect dans nouveaux_sites (SECURITY DEFINER → bypass RLS)
--   2. Une lead_interaction avec date de relance
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

  -- 2. Créer l'interaction (created_at DEFAULT now(), pas de date_interaction)
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
