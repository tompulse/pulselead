-- URGENCE : Recalculer toutes les colonnes NAF hierarchy depuis code_naf

-- 1. Vérifier si code_naf existe
SELECT 
    COUNT(*) as total,
    COUNT(code_naf) as avec_code_naf,
    COUNT(naf_section) as avec_section
FROM nouveaux_sites;

-- 2. Exemples de code_naf existants
SELECT code_naf, COUNT(*) as nombre
FROM nouveaux_sites
WHERE code_naf IS NOT NULL
GROUP BY code_naf
ORDER BY nombre DESC
LIMIT 10;

-- 3. RECALCULER naf_section depuis code_naf
UPDATE nouveaux_sites
SET naf_section = CASE 
    WHEN SUBSTRING(code_naf, 1, 2)::int BETWEEN 1 AND 3 THEN 'A'
    WHEN SUBSTRING(code_naf, 1, 2)::int BETWEEN 5 AND 9 THEN 'B'
    WHEN SUBSTRING(code_naf, 1, 2)::int BETWEEN 10 AND 33 THEN 'C'
    WHEN SUBSTRING(code_naf, 1, 2)::int = 35 THEN 'D'
    WHEN SUBSTRING(code_naf, 1, 2)::int BETWEEN 36 AND 39 THEN 'E'
    WHEN SUBSTRING(code_naf, 1, 2)::int BETWEEN 41 AND 43 THEN 'F'
    WHEN SUBSTRING(code_naf, 1, 2)::int BETWEEN 45 AND 47 THEN 'G'
    WHEN SUBSTRING(code_naf, 1, 2)::int BETWEEN 49 AND 53 THEN 'H'
    WHEN SUBSTRING(code_naf, 1, 2)::int BETWEEN 55 AND 56 THEN 'I'
    WHEN SUBSTRING(code_naf, 1, 2)::int BETWEEN 58 AND 63 THEN 'J'
    WHEN SUBSTRING(code_naf, 1, 2)::int BETWEEN 64 AND 66 THEN 'K'
    WHEN SUBSTRING(code_naf, 1, 2)::int = 68 THEN 'L'
    WHEN SUBSTRING(code_naf, 1, 2)::int BETWEEN 69 AND 75 THEN 'M'
    WHEN SUBSTRING(code_naf, 1, 2)::int BETWEEN 77 AND 82 THEN 'N'
    WHEN SUBSTRING(code_naf, 1, 2)::int = 84 THEN 'O'
    WHEN SUBSTRING(code_naf, 1, 2)::int = 85 THEN 'P'
    WHEN SUBSTRING(code_naf, 1, 2)::int BETWEEN 86 AND 88 THEN 'Q'
    WHEN SUBSTRING(code_naf, 1, 2)::int BETWEEN 90 AND 93 THEN 'R'
    WHEN SUBSTRING(code_naf, 1, 2)::int BETWEEN 94 AND 96 THEN 'S'
    WHEN SUBSTRING(code_naf, 1, 2)::int BETWEEN 97 AND 98 THEN 'T'
    WHEN SUBSTRING(code_naf, 1, 2)::int = 99 THEN 'U'
END
WHERE code_naf IS NOT NULL 
AND code_naf ~ '^\d{2}';

-- 4. RECALCULER naf_division
UPDATE nouveaux_sites
SET naf_division = SUBSTRING(REPLACE(code_naf, '.', ''), 1, 2)
WHERE code_naf IS NOT NULL 
AND code_naf ~ '^\d{2}';

-- 5. RECALCULER naf_groupe
UPDATE nouveaux_sites
SET naf_groupe = SUBSTRING(REPLACE(code_naf, '.', ''), 1, 3)
WHERE code_naf IS NOT NULL 
AND LENGTH(REPLACE(code_naf, '.', '')) >= 3;

-- 6. RECALCULER naf_classe
UPDATE nouveaux_sites
SET naf_classe = SUBSTRING(REPLACE(code_naf, '.', ''), 1, 4)
WHERE code_naf IS NOT NULL 
AND LENGTH(REPLACE(code_naf, '.', '')) >= 4;

-- 7. Vérifier après
SELECT 
    COUNT(*) as total,
    COUNT(naf_section) as avec_section,
    COUNT(naf_division) as avec_division
FROM nouveaux_sites;

-- 8. Exemples de résultats
SELECT nom, code_naf, naf_section, naf_division, naf_groupe, naf_classe
FROM nouveaux_sites
WHERE code_naf IS NOT NULL
LIMIT 10;
