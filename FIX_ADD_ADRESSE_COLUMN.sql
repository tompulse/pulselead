-- Vérifier et ajouter la colonne 'adresse' si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'nouveaux_sites' 
        AND column_name = 'adresse'
    ) THEN
        ALTER TABLE public.nouveaux_sites 
        ADD COLUMN adresse TEXT;
        
        RAISE NOTICE 'Colonne adresse ajoutée avec succès';
    ELSE
        RAISE NOTICE 'Colonne adresse existe déjà';
    END IF;
END $$;

-- Ajouter aussi les colonnes NAF hierarchy si elles manquent
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'nouveaux_sites' 
        AND column_name = 'naf_section'
    ) THEN
        ALTER TABLE public.nouveaux_sites 
        ADD COLUMN naf_section TEXT,
        ADD COLUMN naf_division TEXT,
        ADD COLUMN naf_groupe TEXT,
        ADD COLUMN naf_classe TEXT;
        
        RAISE NOTICE 'Colonnes NAF hierarchy ajoutées avec succès';
    ELSE
        RAISE NOTICE 'Colonnes NAF hierarchy existent déjà';
    END IF;
END $$;

-- Vérification finale
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'nouveaux_sites'
ORDER BY ordinal_position;
