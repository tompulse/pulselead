-- Ajouter des index pour optimiser les performances de recherche et filtrage

-- Index sur la catégorie qualifiée pour filtres rapides
CREATE INDEX IF NOT EXISTS idx_entreprises_categorie_qualifiee 
ON entreprises(categorie_qualifiee) 
WHERE categorie_qualifiee IS NOT NULL;

-- Index sur le code postal pour filtrage départemental
CREATE INDEX IF NOT EXISTS idx_entreprises_code_postal 
ON entreprises(code_postal);

-- Index sur la date de démarrage pour filtres temporels
CREATE INDEX IF NOT EXISTS idx_entreprises_date_demarrage 
ON entreprises(date_demarrage);

-- Index composite sur les coordonnées GPS pour requêtes géospatiales
CREATE INDEX IF NOT EXISTS idx_entreprises_coords 
ON entreprises(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Index sur activite pour recherches textuelles rapides
CREATE INDEX IF NOT EXISTS idx_entreprises_activite 
ON entreprises USING gin(to_tsvector('french', COALESCE(activite, '')));

-- Index sur nom pour recherches textuelles rapides
CREATE INDEX IF NOT EXISTS idx_entreprises_nom 
ON entreprises USING gin(to_tsvector('french', COALESCE(nom, '')));

-- Index sur ville pour recherches géographiques
CREATE INDEX IF NOT EXISTS idx_entreprises_ville 
ON entreprises(ville);

-- Index sur forme juridique pour filtres
CREATE INDEX IF NOT EXISTS idx_entreprises_forme_juridique 
ON entreprises(forme_juridique);

-- Index sur enrichissement pour optimiser les requêtes de qualification
CREATE INDEX IF NOT EXISTS idx_entreprises_enrichi 
ON entreprises(enrichi, date_enrichissement);
