-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_entreprises_categorie_qualifiee ON entreprises(categorie_qualifiee);
CREATE INDEX IF NOT EXISTS idx_entreprises_code_postal ON entreprises(code_postal);
CREATE INDEX IF NOT EXISTS idx_entreprises_date_demarrage ON entreprises(date_demarrage);
CREATE INDEX IF NOT EXISTS idx_entreprises_coords ON entreprises(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_entreprises_activite ON entreprises(activite);
CREATE INDEX IF NOT EXISTS idx_entreprises_nom ON entreprises(nom);
CREATE INDEX IF NOT EXISTS idx_entreprises_ville ON entreprises(ville);
CREATE INDEX IF NOT EXISTS idx_entreprises_forme_juridique ON entreprises(forme_juridique);
CREATE INDEX IF NOT EXISTS idx_entreprises_enrichi_date ON entreprises(enrichi, date_enrichissement);
