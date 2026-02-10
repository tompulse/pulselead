-- Script de diagnostic pour vérifier les villes dans nouveaux_sites

-- 1. Vérifier que la colonne ville existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'nouveaux_sites' 
AND column_name = 'ville';

-- 2. Compter combien de lignes ont une ville
SELECT 
  COUNT(*) as total_prospects,
  COUNT(ville) as prospects_avec_ville,
  COUNT(*) - COUNT(ville) as prospects_sans_ville,
  ROUND((COUNT(ville)::numeric / COUNT(*)) * 100, 2) as pourcentage_avec_ville
FROM nouveaux_sites;

-- 3. Montrer quelques exemples avec et sans ville
SELECT 
  nom,
  code_postal,
  ville,
  CASE 
    WHEN ville IS NULL THEN '❌ VILLE MANQUANTE'
    WHEN ville = '' THEN '❌ VILLE VIDE'
    ELSE '✅ OK'
  END as statut_ville
FROM nouveaux_sites
LIMIT 20;

-- 4. Vérifier si les villes sont dans un autre champ
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'nouveaux_sites' 
AND (
  column_name ILIKE '%ville%' 
  OR column_name ILIKE '%city%' 
  OR column_name ILIKE '%commune%'
  OR column_name ILIKE '%localite%'
);

-- 5. Si la ville est manquante, vérifier les données brutes
SELECT 
  nom,
  siret,
  code_postal,
  ville,
  libelle_commune,
  adresse
FROM nouveaux_sites
WHERE ville IS NULL OR ville = ''
LIMIT 10;
