-- Supprimer la colonne a_appeler de la table tournee_visites
ALTER TABLE tournee_visites DROP COLUMN IF EXISTS a_appeler;