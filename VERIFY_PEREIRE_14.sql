-- 🔍 Vérifier les données de PEREIRE 14

SELECT 
  nom,
  numero_voie,
  type_voie,
  libelle_voie,
  code_postal,
  ville,
  complement_adresse,
  adresse,
  siret
FROM nouveaux_sites
WHERE nom LIKE '%PEREIRE%'
LIMIT 5;

-- Vérifier les types des colonnes
SELECT 
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'nouveaux_sites'
  AND column_name IN ('code_postal', 'numero_voie', 'complement_adresse', 'adresse')
ORDER BY column_name;
