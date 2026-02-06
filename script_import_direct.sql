-- Script d'import direct pour vos données
-- À exécuter dans Supabase Dashboard > SQL Editor

-- ⚠️ IMPORTANT : Remplacez les valeurs ci-dessous par vos données réelles

INSERT INTO public.nouveaux_sites (
  siret,
  nom,
  date_creation,
  est_siege,
  categorie_juridique,
  categorie_entreprise,
  complement_adresse,
  numero_voie,
  type_voie,
  libelle_voie,
  code_postal,
  ville,
  coordonnee_lambert_x,
  coordonnee_lambert_y,
  code_naf
) VALUES
  -- Exemple 1
  (
    '12345678900012',              -- siret
    'ACME SARL',                   -- Entreprise (devient 'nom')
    '2024-01-15',                  -- date_creation (format: YYYY-MM-DD)
    true,                          -- siege (VRAI=true, FAUX=false)
    '5499',                        -- categorie_juridique
    'PME',                         -- categorie_entreprise
    NULL,                          -- complement_adresse
    '10',                          -- numero_voie
    'RUE',                         -- type_voie
    'DE PARIS',                    -- libelle_voie
    '75001',                       -- code_postal
    'PARIS',                       -- ville
    652432.5,                      -- coordonnee_lambert_x
    6862432.1,                     -- coordonnee_lambert_y
    '62.01Z'                       -- code naf (sans espace)
  ),
  -- Exemple 2
  (
    '98765432100023',
    'PULSE SAS',
    '2024-01-20',
    true,
    '5710',
    'PME',
    NULL,
    '20',
    'AVE',
    'VICTOR HUGO',
    '69001',
    'LYON',
    842123.4,
    6518765.2,
    '62.02Z'
  )
  -- Ajoutez d'autres lignes ici...
ON CONFLICT (siret) 
DO UPDATE SET
  nom = EXCLUDED.nom,
  date_creation = EXCLUDED.date_creation,
  est_siege = EXCLUDED.est_siege,
  categorie_juridique = EXCLUDED.categorie_juridique,
  categorie_entreprise = EXCLUDED.categorie_entreprise,
  complement_adresse = EXCLUDED.complement_adresse,
  numero_voie = EXCLUDED.numero_voie,
  type_voie = EXCLUDED.type_voie,
  libelle_voie = EXCLUDED.libelle_voie,
  code_postal = EXCLUDED.code_postal,
  ville = EXCLUDED.ville,
  coordonnee_lambert_x = EXCLUDED.coordonnee_lambert_x,
  coordonnee_lambert_y = EXCLUDED.coordonnee_lambert_y,
  code_naf = EXCLUDED.code_naf,
  updated_at = now();

-- Vérification après import
SELECT 
  COUNT(*) as total_insere,
  COUNT(DISTINCT categorie_juridique) as nb_categories
FROM nouveaux_sites
WHERE created_at >= NOW() - INTERVAL '5 minutes';
