-- Ajouter le type "a_revoir" aux interactions (séparé en deux migrations)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'a_revoir' 
    AND enumtypid = 'interaction_type'::regtype
  ) THEN
    ALTER TYPE interaction_type ADD VALUE 'a_revoir';
  END IF;
END $$;