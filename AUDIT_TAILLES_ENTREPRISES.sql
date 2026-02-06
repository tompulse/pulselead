-- AUDIT COMPLET DES TAILLES D'ENTREPRISES DANS LA BASE DE DONNÉES

-- 1. Comptage EXACT de toutes les valeurs de categorie_entreprise
SELECT 
    CASE 
        WHEN categorie_entreprise IS NULL THEN '⚠️ NULL (vide)'
        WHEN categorie_entreprise = '' THEN '⚠️ Chaîne vide'
        ELSE categorie_entreprise
    END as categorie,
    COUNT(*) as nombre,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM nouveaux_sites), 2) as pourcentage
FROM nouveaux_sites
GROUP BY categorie_entreprise
ORDER BY nombre DESC;

-- 2. Total général
SELECT 
    COUNT(*) as total_entreprises,
    COUNT(categorie_entreprise) as avec_categorie,
    COUNT(*) - COUNT(categorie_entreprise) as sans_categorie_null
FROM nouveaux_sites;

-- 3. Exemples de chaque catégorie (5 premiers de chaque)
SELECT 
    categorie_entreprise,
    nom,
    siret,
    code_postal,
    date_creation
FROM nouveaux_sites
WHERE categorie_entreprise = 'PME'
LIMIT 5;

SELECT 
    categorie_entreprise,
    nom,
    siret,
    code_postal,
    date_creation
FROM nouveaux_sites
WHERE categorie_entreprise = 'ETI'
LIMIT 5;

SELECT 
    categorie_entreprise,
    nom,
    siret,
    code_postal,
    date_creation
FROM nouveaux_sites
WHERE categorie_entreprise = 'GE'
LIMIT 5;

SELECT 
    categorie_entreprise,
    nom,
    siret,
    code_postal,
    date_creation
FROM nouveaux_sites
WHERE categorie_entreprise = 'Non spécifié'
LIMIT 5;

SELECT 
    categorie_entreprise,
    nom,
    siret,
    code_postal,
    date_creation
FROM nouveaux_sites
WHERE categorie_entreprise IS NULL OR categorie_entreprise = ''
LIMIT 5;

-- 4. Vérifier les valeurs EXACTES uniques (sans transformation)
SELECT DISTINCT categorie_entreprise
FROM nouveaux_sites
ORDER BY categorie_entreprise;

-- 5. Détection d'anomalies (espaces, majuscules, etc.)
SELECT 
    categorie_entreprise,
    LENGTH(categorie_entreprise) as longueur,
    COUNT(*) as nombre
FROM nouveaux_sites
WHERE categorie_entreprise IS NOT NULL
GROUP BY categorie_entreprise
ORDER BY nombre DESC;
