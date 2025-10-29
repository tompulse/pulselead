-- Réinitialiser toutes les qualifications pour repartir à zéro
UPDATE entreprises 
SET categorie_qualifiee = NULL,
    categorie_confidence = NULL,
    date_qualification = NULL;

-- Supprimer la table qualification_jobs si elle existe
DROP TABLE IF EXISTS qualification_jobs CASCADE;