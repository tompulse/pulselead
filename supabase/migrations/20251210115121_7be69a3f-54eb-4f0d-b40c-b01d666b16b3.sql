-- Normalisation des naf_groupe (XXX → XX.X)
UPDATE nouveaux_sites 
SET naf_groupe = SUBSTRING(naf_groupe, 1, 2) || '.' || SUBSTRING(naf_groupe, 3)
WHERE naf_groupe IS NOT NULL 
  AND naf_groupe NOT LIKE '%.%' 
  AND LENGTH(naf_groupe) >= 3;

-- Normalisation des naf_classe (XXXX → XX.XX)  
UPDATE nouveaux_sites 
SET naf_classe = SUBSTRING(naf_classe, 1, 2) || '.' || SUBSTRING(naf_classe, 3)
WHERE naf_classe IS NOT NULL 
  AND naf_classe NOT LIKE '%.%' 
  AND LENGTH(naf_classe) >= 4;