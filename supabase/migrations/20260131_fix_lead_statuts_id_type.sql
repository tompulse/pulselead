-- FIX: Changer lead_statuts.entreprise_id de UUID à BIGINT
-- Car nouveaux_sites.id est BIGINT

BEGIN;

-- Vérifier le type actuel
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lead_statuts' 
    AND column_name = 'entreprise_id' 
    AND data_type = 'uuid'
  ) THEN
    -- Changer le type
    ALTER TABLE public.lead_statuts 
      ALTER COLUMN entreprise_id TYPE BIGINT USING entreprise_id::text::BIGINT;
    
    RAISE NOTICE 'Colonne lead_statuts.entreprise_id changée en BIGINT';
  END IF;
END $$;

COMMIT;
