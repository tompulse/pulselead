-- Corriger le type de entreprise_id dans lead_interactions
-- Passer de bigint à text pour accepter les UUIDs de nouveaux_sites

-- 1. Supprimer les contraintes FK si elles existent
DO $$
BEGIN
  -- Chercher et supprimer toutes les FK sur entreprise_id
  EXECUTE (
    SELECT string_agg('ALTER TABLE lead_interactions DROP CONSTRAINT IF EXISTS ' || constraint_name || ';', ' ')
    FROM information_schema.table_constraints
    WHERE table_name = 'lead_interactions' 
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE '%entreprise%'
  );
END $$;

-- 2. Supprimer les données existantes qui ne sont pas des UUIDs valides
DELETE FROM lead_interactions 
WHERE entreprise_id IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM nouveaux_sites WHERE id::text = entreprise_id::text
  );

-- 3. Changer le type de colonne
ALTER TABLE lead_interactions 
  ALTER COLUMN entreprise_id TYPE text USING entreprise_id::text;

-- 4. Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_lead_interactions_entreprise_id 
  ON lead_interactions(entreprise_id);

-- 5. Vérification
SELECT 
  'Migration terminée' as status,
  COUNT(*) as total_interactions,
  COUNT(entreprise_id) as avec_entreprise_id
FROM lead_interactions;
