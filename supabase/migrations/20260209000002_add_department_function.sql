-- ÉTAPE 1: Fonction pour extraire le département d'un code postal
CREATE OR REPLACE FUNCTION public.get_departement_from_cp(code_postal TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF code_postal IS NULL OR LENGTH(code_postal) < 4 THEN
    RETURN NULL;
  END IF;
  
  -- Si code postal à 4 chiffres, ajouter un 0 devant
  IF LENGTH(code_postal) = 4 THEN
    RETURN '0' || LEFT(code_postal, 1);
  END IF;
  
  -- Sinon, prendre les 2 premiers caractères
  RETURN LEFT(code_postal, 2);
END;
$$;

-- ÉTAPE 2: Ajouter colonne departement si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' 
    AND column_name = 'departement'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN departement TEXT;
  END IF;
END $$;

-- ÉTAPE 3: Populer la colonne departement pour toutes les lignes
UPDATE nouveaux_sites 
SET departement = get_departement_from_cp(code_postal)
WHERE departement IS NULL OR departement = '';

-- ÉTAPE 4: Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_departement 
ON nouveaux_sites (departement);

-- ÉTAPE 5: Trigger pour auto-update lors des INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.update_departement_from_cp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.departement := get_departement_from_cp(NEW.code_postal);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_departement ON nouveaux_sites;
CREATE TRIGGER trigger_update_departement
  BEFORE INSERT OR UPDATE OF code_postal
  ON nouveaux_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_departement_from_cp();

COMMENT ON COLUMN nouveaux_sites.departement IS 
'Code département extrait automatiquement du code postal (2 chiffres, avec zéro initial pour 01-09)';

