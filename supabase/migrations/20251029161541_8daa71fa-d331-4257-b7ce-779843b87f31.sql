-- Réinitialiser toutes les qualifications pour repartir sur une base propre
UPDATE public.entreprises
SET 
  categorie_qualifiee = NULL,
  categorie_confidence = NULL,
  date_qualification = NULL
WHERE categorie_qualifiee IS NOT NULL;