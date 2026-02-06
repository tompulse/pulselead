-- Vérifier si la contrainte UNIQUE existe déjà
DO $$ 
BEGIN
    -- Vérifier si l'index unique existe
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'nouveaux_sites_siret_key'
        AND contype = 'u'
    ) THEN
        -- Supprimer d'abord les doublons potentiels
        DELETE FROM public.nouveaux_sites a
        USING public.nouveaux_sites b
        WHERE a.id > b.id 
        AND a.siret = b.siret;
        
        -- Ajouter la contrainte UNIQUE
        ALTER TABLE public.nouveaux_sites 
        ADD CONSTRAINT nouveaux_sites_siret_key UNIQUE (siret);
        
        RAISE NOTICE 'Contrainte UNIQUE ajoutée sur siret';
    ELSE
        RAISE NOTICE 'Contrainte UNIQUE existe déjà sur siret';
    END IF;
END $$;

-- Vérifier les contraintes
SELECT 
    conname AS constraint_name,
    contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'public.nouveaux_sites'::regclass;
