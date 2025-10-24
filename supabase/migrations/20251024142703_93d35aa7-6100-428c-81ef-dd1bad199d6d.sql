-- Suppression des entreprises sans forme juridique renseignée
-- Concerne 10,762 entreprises (27.4% de la base)

DELETE FROM entreprises
WHERE forme_juridique IS NULL OR forme_juridique = 'Non renseigné';