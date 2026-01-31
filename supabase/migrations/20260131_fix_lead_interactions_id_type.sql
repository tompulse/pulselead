-- FIX: Changer lead_interactions.entreprise_id de UUID à BIGINT

BEGIN;

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lead_interactions' 
    AND column_name = 'entreprise_id' 
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.lead_interactions 
      ALTER COLUMN entreprise_id TYPE BIGINT USING entreprise_id::text::BIGINT;
    
    RAISE NOTICE 'Colonne lead_interactions.entreprise_id changée en BIGINT';
  END IF;
END $$;

COMMIT;
