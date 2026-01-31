-- Vérifier la structure de la table tournees
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tournees'
ORDER BY ordinal_position;

-- Si updated_at n'existe pas, l'ajouter
ALTER TABLE tournees ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE nouveaux_sites ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Créer des triggers pour auto-update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tournees_updated_at ON tournees;
CREATE TRIGGER update_tournees_updated_at
    BEFORE UPDATE ON tournees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_nouveaux_sites_updated_at ON nouveaux_sites;
CREATE TRIGGER update_nouveaux_sites_updated_at
    BEFORE UPDATE ON nouveaux_sites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
