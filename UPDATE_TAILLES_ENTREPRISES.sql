-- Mettre à jour toutes les entreprises avec une taille non spécifiée
-- vers "Taille inconnue, nouvelle entité"

-- Comptage avant
SELECT 
    categorie_entreprise,
    COUNT(*) as nombre
FROM nouveaux_sites
GROUP BY categorie_entreprise
ORDER BY nombre DESC;

-- Update : remplacer "Non spécifié", NULL et vides par "Taille inconnue, nouvelle entité"
UPDATE nouveaux_sites
SET categorie_entreprise = 'Taille inconnue, nouvelle entité'
WHERE 
    categorie_entreprise IS NULL 
    OR categorie_entreprise = '' 
    OR categorie_entreprise = 'Non spécifié';

-- Comptage après pour vérifier
SELECT 
    categorie_entreprise,
    COUNT(*) as nombre
FROM nouveaux_sites
GROUP BY categorie_entreprise
ORDER BY nombre DESC;

-- Résumé final
SELECT 
    COUNT(*) FILTER (WHERE categorie_entreprise = 'GE') as GE,
    COUNT(*) FILTER (WHERE categorie_entreprise = 'ETI') as ETI,
    COUNT(*) FILTER (WHERE categorie_entreprise = 'PME') as PME,
    COUNT(*) FILTER (WHERE categorie_entreprise = 'Taille inconnue, nouvelle entité') as "Taille inconnue",
    COUNT(*) as total
FROM nouveaux_sites;
