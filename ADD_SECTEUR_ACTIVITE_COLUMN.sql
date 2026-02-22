-- Ajouter la colonne secteur_activite si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'nouveaux_sites' 
        AND column_name = 'secteur_activite'
    ) THEN
        ALTER TABLE nouveaux_sites 
        ADD COLUMN secteur_activite TEXT;
        
        RAISE NOTICE 'Colonne secteur_activite ajoutée avec succès';
    ELSE
        RAISE NOTICE 'La colonne secteur_activite existe déjà';
    END IF;
END $$;

-- Créer un index pour améliorer les performances des recherches par secteur
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_secteur_activite 
ON nouveaux_sites(secteur_activite);

-- Afficher le résultat
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'nouveaux_sites' 
AND column_name = 'secteur_activite';
