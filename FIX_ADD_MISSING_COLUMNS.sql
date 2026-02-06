-- Ajouter la colonne 'adresse' si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'nouveaux_sites' 
        AND column_name = 'adresse'
    ) THEN
        ALTER TABLE public.nouveaux_sites ADD COLUMN adresse TEXT;
        RAISE NOTICE 'Colonne adresse ajoutée';
    ELSE
        RAISE NOTICE 'Colonne adresse existe déjà';
    END IF;
END $$;

-- Ajouter naf_section
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'nouveaux_sites' 
        AND column_name = 'naf_section'
    ) THEN
        ALTER TABLE public.nouveaux_sites ADD COLUMN naf_section TEXT;
        RAISE NOTICE 'Colonne naf_section ajoutée';
    ELSE
        RAISE NOTICE 'Colonne naf_section existe déjà';
    END IF;
END $$;

-- Ajouter naf_division (probablement existe déjà)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'nouveaux_sites' 
        AND column_name = 'naf_division'
    ) THEN
        ALTER TABLE public.nouveaux_sites ADD COLUMN naf_division TEXT;
        RAISE NOTICE 'Colonne naf_division ajoutée';
    ELSE
        RAISE NOTICE 'Colonne naf_division existe déjà';
    END IF;
END $$;

-- Ajouter naf_groupe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'nouveaux_sites' 
        AND column_name = 'naf_groupe'
    ) THEN
        ALTER TABLE public.nouveaux_sites ADD COLUMN naf_groupe TEXT;
        RAISE NOTICE 'Colonne naf_groupe ajoutée';
    ELSE
        RAISE NOTICE 'Colonne naf_groupe existe déjà';
    END IF;
END $$;

-- Ajouter naf_classe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'nouveaux_sites' 
        AND column_name = 'naf_classe'
    ) THEN
        ALTER TABLE public.nouveaux_sites ADD COLUMN naf_classe TEXT;
        RAISE NOTICE 'Colonne naf_classe ajoutée';
    ELSE
        RAISE NOTICE 'Colonne naf_classe existe déjà';
    END IF;
END $$;

-- Afficher toutes les colonnes pour vérification
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'nouveaux_sites'
ORDER BY ordinal_position;
