
-- 1. Supprimer les enregistrements avec noms trop courts (<3 chars)
DELETE FROM nouveaux_sites 
WHERE LENGTH(TRIM(nom)) < 3;

-- 2. Supprimer les enregistrements avec adresses trop courtes (<10 chars)
DELETE FROM nouveaux_sites 
WHERE adresse IS NOT NULL AND LENGTH(TRIM(adresse)) < 10;

-- 3. Supprimer les enregistrements hors France métropolitaine (latitude hors 41-51)
DELETE FROM nouveaux_sites 
WHERE latitude IS NOT NULL AND (latitude < 41 OR latitude > 51);

-- 4. Mettre "Non spécifié" pour les catégories juridiques vides
UPDATE nouveaux_sites 
SET categorie_juridique = 'Non spécifié'
WHERE categorie_juridique IS NULL OR TRIM(categorie_juridique) = '';

-- 5. Supprimer la colonne categorie_detaillee
ALTER TABLE nouveaux_sites DROP COLUMN IF EXISTS categorie_detaillee;
