
-- Remplacer "other" par "activité non précisée" dans toutes les entreprises
UPDATE entreprises
SET categorie_qualifiee = 'activité non précisée'
WHERE categorie_qualifiee = 'other';

-- Normaliser les variations de santé et énergie
UPDATE entreprises
SET categorie_qualifiee = 'sante'
WHERE categorie_qualifiee = 'santé';

UPDATE entreprises
SET categorie_qualifiee = 'energie'
WHERE categorie_qualifiee = 'énergie';

-- Mettre à jour les NULL en "activité non précisée" pour homogénéiser
UPDATE entreprises
SET categorie_qualifiee = 'activité non précisée'
WHERE categorie_qualifiee IS NULL;
