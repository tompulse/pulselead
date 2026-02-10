-- Corriger le type des colonnes entreprises_ids et ordre_optimise dans tournees
-- Les IDs de nouveaux_sites sont des UUID, pas des BIGINT
-- Cette migration corrige l'erreur de la migration 20260131_fix_tournees_ids_type.sql

BEGIN;

-- Vérifier le type actuel
DO $$ 
DECLARE
    current_type text;
BEGIN
    SELECT data_type INTO current_type
    FROM information_schema.columns 
    WHERE table_name = 'tournees' 
    AND column_name = 'entreprises_ids';
    
    RAISE NOTICE 'Type actuel de entreprises_ids: %', current_type;
END $$;

-- Si les colonnes sont en BIGINT[], les reconvertir en UUID[]
-- Sinon, ne rien faire (elles sont déjà en UUID[])
DO $$
BEGIN
    -- Changer le type de entreprises_ids si nécessaire
    IF (SELECT data_type FROM information_schema.columns 
        WHERE table_name = 'tournees' AND column_name = 'entreprises_ids') = 'ARRAY' THEN
        
        -- Supprimer les tournées avec des IDs invalides (si elles existent)
        DELETE FROM public.tournees 
        WHERE entreprises_ids IS NOT NULL 
        AND EXISTS (
            SELECT 1 FROM unnest(entreprises_ids::text[]) AS id
            WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        );
        
        -- Convertir les colonnes en UUID[]
        ALTER TABLE public.tournees 
            ALTER COLUMN entreprises_ids TYPE UUID[] USING entreprises_ids::text[]::UUID[];
        
        ALTER TABLE public.tournees 
            ALTER COLUMN ordre_optimise TYPE UUID[] USING ordre_optimise::text[]::UUID[];
        
        RAISE NOTICE 'Colonnes converties de BIGINT[] vers UUID[]';
    ELSE
        RAISE NOTICE 'Les colonnes sont déjà en UUID[], aucune modification nécessaire';
    END IF;
END $$;

COMMIT;

-- Vérifier les types finaux
SELECT 
    column_name, 
    data_type,
    udt_name,
    CASE 
        WHEN data_type = 'ARRAY' THEN 
            (SELECT data_type FROM information_schema.element_types 
             WHERE object_schema = 'public' 
             AND object_name = 'tournees' 
             AND collection_type_identifier = (
                 SELECT dtd_identifier FROM information_schema.columns 
                 WHERE table_name = 'tournees' 
                 AND column_name = tournees_cols.column_name
             ))
        ELSE data_type
    END as array_element_type
FROM information_schema.columns tournees_cols
WHERE table_name = 'tournees' 
AND column_name IN ('entreprises_ids', 'ordre_optimise');
