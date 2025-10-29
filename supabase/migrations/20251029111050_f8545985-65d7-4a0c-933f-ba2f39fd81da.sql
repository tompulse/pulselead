-- Ajouter les colonnes pour la catégorisation par type de bâtiment
ALTER TABLE entreprises 
ADD COLUMN IF NOT EXISTS type_batiment text,
ADD COLUMN IF NOT EXISTS zone_type text;

-- Créer des index pour optimiser les requêtes de filtrage
CREATE INDEX IF NOT EXISTS idx_type_batiment ON entreprises(type_batiment);
CREATE INDEX IF NOT EXISTS idx_zone_type ON entreprises(zone_type);