-- FIX URGENT: Changer les colonnes UUID[] en BIGINT[] pour tournees
-- Les IDs des nouveaux_sites sont des BIGINT, pas des UUID

BEGIN;

-- Supprimer les contraintes foreign key si elles existent
ALTER TABLE public.tournees DROP CONSTRAINT IF EXISTS tournees_entreprises_ids_fkey;

-- Changer le type des colonnes
ALTER TABLE public.tournees 
  ALTER COLUMN entreprises_ids TYPE BIGINT[] USING entreprises_ids::text::BIGINT[],
  ALTER COLUMN ordre_optimise TYPE BIGINT[] USING ordre_optimise::text::BIGINT[];

COMMIT;

-- Vérifier
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tournees' 
AND column_name IN ('entreprises_ids', 'ordre_optimise');
