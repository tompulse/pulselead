-- Nettoyer les catégories qui ne font pas partie des 34 catégories valides
-- Liste des catégories valides
DO $$
DECLARE
  valid_categories TEXT[] := ARRAY[
    'conseil-consulting', 'holding', 'immobilier', 'finance-assurance', 'juridique',
    'maconnerie', 'plomberie-chauffage', 'electricite', 'menuiserie', 'peinture-revetements',
    'commerce-detail', 'commerce-gros', 'e-commerce', 'restauration', 'cafes-bars',
    'snack-fastfood', 'traiteur', 'livraison-coursier', 'transport-marchandises', 'vtc-taxi',
    'informatique-dev', 'digital-web', 'marketing-pub', 'energie-renouvelable',
    'environnement-recyclage', 'sante-medical', 'beaute-coiffure', 'industrie-fabrication',
    'agriculture', 'education-formation', 'artisanat-reparation', 'services-personne',
    'hotellerie', 'culture-spectacles', 'sport-loisirs', 'autre'
  ];
BEGIN
  -- Remettre à NULL toutes les catégories qui ne sont pas dans la liste valide
  UPDATE public.entreprises
  SET 
    categorie_qualifiee = NULL,
    categorie_confidence = NULL,
    date_qualification = NULL
  WHERE categorie_qualifiee IS NOT NULL
    AND categorie_qualifiee != ALL(valid_categories);
END $$;