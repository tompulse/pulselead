-- Drop the problematic index that causes size issues
DROP INDEX IF EXISTS idx_entreprises_categorie_qualifiee;

-- Create a hash index instead for the categorie_qualifiee column
CREATE INDEX idx_entreprises_categorie_hash ON entreprises USING hash(categorie_qualifiee);