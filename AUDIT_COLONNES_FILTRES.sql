-- AUDIT COMPLET : Vérifier que toutes les colonnes nécessaires aux filtres sont remplies

-- 1. COLONNES EXISTANTES
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'nouveaux_sites'
ORDER BY ordinal_position;

-- 2. TAUX DE REMPLISSAGE par colonne critique
SELECT 
    COUNT(*) as total_entreprises,
    COUNT(nom) as avec_nom,
    COUNT(code_naf) as avec_code_naf,
    COUNT(naf_section) as avec_naf_section,
    COUNT(naf_division) as avec_naf_division,
    COUNT(code_postal) as avec_code_postal,
    COUNT(ville) as avec_ville,
    COUNT(categorie_entreprise) as avec_taille,
    COUNT(categorie_juridique) as avec_forme_juridique,
    COUNT(latitude) as avec_latitude,
    COUNT(longitude) as avec_longitude,
    COUNT(date_creation) as avec_date_creation
FROM nouveaux_sites;

-- 3. RÉPARTITION PAR TAILLE (pour filtre Taille)
SELECT 
    COALESCE(categorie_entreprise, '⚠️ NULL') as taille,
    COUNT(*) as nombre
FROM nouveaux_sites
GROUP BY categorie_entreprise
ORDER BY nombre DESC;

-- 4. RÉPARTITION PAR SECTION NAF (pour filtres NAF)
SELECT 
    COALESCE(naf_section, '⚠️ NULL') as section,
    COUNT(*) as nombre
FROM nouveaux_sites
GROUP BY naf_section
ORDER BY nombre DESC;

-- 5. RÉPARTITION PAR DÉPARTEMENT (pour filtre Départements)
SELECT 
    LEFT(code_postal, 2) as departement,
    COUNT(*) as nombre
FROM nouveaux_sites
WHERE code_postal IS NOT NULL
GROUP BY LEFT(code_postal, 2)
ORDER BY nombre DESC
LIMIT 15;

-- 6. VÉRIFIER LES COORDONNÉES (pour la carte)
SELECT 
    COUNT(*) as total,
    COUNT(latitude) as avec_lat,
    COUNT(longitude) as avec_lng,
    COUNT(*) FILTER (WHERE latitude IS NOT NULL AND longitude IS NOT NULL) as avec_coords_completes
FROM nouveaux_sites;

-- 7. ENTREPRISES PROBLÉMATIQUES
SELECT 
    nom,
    siret,
    categorie_entreprise,
    code_naf,
    naf_section,
    code_postal
FROM nouveaux_sites
WHERE nom IS NULL 
   OR nom = '' 
   OR nom = 'Entreprise sans nom'
LIMIT 10;
