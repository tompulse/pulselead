-- Ajouter une colonne pour la sous-catégorie détaillée
ALTER TABLE entreprises
ADD COLUMN IF NOT EXISTS sous_categorie TEXT;

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_entreprises_sous_categorie ON entreprises(sous_categorie);

-- Créer un index composite pour les filtres combinés
CREATE INDEX IF NOT EXISTS idx_entreprises_categorie_sous_categorie ON entreprises(categorie_qualifiee, sous_categorie);

COMMENT ON COLUMN entreprises.sous_categorie IS 'Sous-catégorie détaillée de l''activité de l''entreprise (ex: conseil_management, dev_logiciel, etc.)';