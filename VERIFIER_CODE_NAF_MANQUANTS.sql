-- Vérifier combien de prospects N'ONT PAS de code_naf valide

-- Total général
SELECT 'TOTAL GENERAL' as categorie, COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true');

-- Avec code_naf valide
SELECT 'AVEC CODE NAF VALIDE' as categorie, COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_naf IS NOT NULL
  AND code_naf != ''
  AND LENGTH(code_naf) >= 2;

-- Sans code_naf ou code_naf invalide
SELECT 'SANS CODE NAF OU INVALIDE' as categorie, COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND (code_naf IS NULL OR code_naf = '' OR LENGTH(code_naf) < 2);

-- Exemples de prospects sans code_naf
SELECT 
  'EXEMPLES SANS CODE_NAF' as info,
  siret,
  nom,
  code_naf,
  commune,
  code_postal
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND (code_naf IS NULL OR code_naf = '' OR LENGTH(code_naf) < 2)
LIMIT 10;
