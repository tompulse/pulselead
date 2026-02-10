-- Script de diagnostic pour vérifier les communes/villes dans nouveaux_sites

-- 1. Vérifier que la colonne commune existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'nouveaux_sites' 
AND column_name = 'commune';

-- 2. Compter combien de lignes ont une commune
SELECT 
  COUNT(*) as total_prospects,
  COUNT(commune) as prospects_avec_commune,
  COUNT(*) - COUNT(commune) as prospects_sans_commune,
  ROUND((COUNT(commune)::numeric / COUNT(*)) * 100, 2) as pourcentage_avec_commune
FROM nouveaux_sites;

-- 3. Montrer quelques exemples avec et sans commune
SELECT 
  nom,
  code_postal,
  commune,
  CASE 
    WHEN commune IS NULL THEN '❌ COMMUNE MANQUANTE'
    WHEN commune = '' THEN '❌ COMMUNE VIDE'
    ELSE '✅ OK'
  END as statut_commune
FROM nouveaux_sites
LIMIT 20;

-- 4. Vérifier tous les champs liés à la localisation
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

-- 5. Vérifier les données complètes
SELECT 
  nom,
  siret,
  code_postal,
  commune,
  libelle_commune,
  adresse
FROM nouveaux_sites
LIMIT 20;
