-- Vérifier que TOUS les codes NAF sont bien couverts par les secteurs
-- Identifie les sections NAF présentes en base mais non mappées

-- 1. Lister toutes les sections NAF présentes en base (2 premiers chiffres)
SELECT 
    LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) as section_naf,
    COUNT(*) as nombre_prospects,
    MIN(code_naf) as exemple_code_naf,
    MIN(nom) as exemple_entreprise
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_naf IS NOT NULL
  AND LENGTH(code_naf) >= 2
GROUP BY LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2)
ORDER BY LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2);

-- 2. Secteurs mappés (depuis simpleCategories.ts)
-- Ces sections sont couvertes:
-- Alimentaire: 10, 11
-- BTP & Construction: 16, 23, 41, 42, 43
-- Automobile: 29, 30, 45
-- Commerce & Distribution: 46, 47
-- Hôtellerie & Restauration: 55, 56
-- Transport & Logistique: 49, 50, 51, 52, 53
-- Informatique & Digital: 58, 59, 60, 61, 62, 63
-- Santé & Médical: 86, 87, 88
-- Services personnels: 95, 96
-- Autres: TOUT LE RESTE

-- 3. Vérifier s'il y a des sections NON couvertes (il ne devrait plus y en avoir car "Autres" couvre tout)
SELECT 
    LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) as section_non_couverte,
    COUNT(*) as nombre_prospects
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_naf IS NOT NULL
  AND LENGTH(code_naf) >= 2
  -- Exclure les sections explicitement mappées
  AND LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) NOT IN (
    '10', '11', -- Alimentaire
    '16', '23', '41', '42', '43', -- BTP
    '29', '30', '45', -- Automobile
    '46', '47', -- Commerce
    '55', '56', -- Hôtellerie
    '49', '50', '51', '52', '53', -- Transport
    '58', '59', '60', '61', '62', '63', -- Informatique
    '86', '87', '88', -- Santé
    '95', '96' -- Services personnels
  )
GROUP BY LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2)
ORDER BY COUNT(*) DESC;

-- 4. Statistiques par secteur avec le mapping actuel
SELECT 
    CASE 
        WHEN LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) IN ('10', '11') THEN 'Alimentaire'
        WHEN LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) IN ('16', '23', '41', '42', '43') THEN 'BTP & Construction'
        WHEN LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) IN ('29', '30', '45') THEN 'Automobile'
        WHEN LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) IN ('46', '47') THEN 'Commerce & Distribution'
        WHEN LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) IN ('55', '56') THEN 'Hôtellerie & Restauration'
        WHEN LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) IN ('49', '50', '51', '52', '53') THEN 'Transport & Logistique'
        WHEN LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) IN ('58', '59', '60', '61', '62', '63') THEN 'Informatique & Digital'
        WHEN LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) IN ('86', '87', '88') THEN 'Santé & Médical'
        WHEN LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) IN ('95', '96') THEN 'Services personnels'
        ELSE 'Autres'
    END as secteur,
    COUNT(*) as nombre_prospects,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true'), 2) as pourcentage
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_naf IS NOT NULL
GROUP BY 
    CASE 
        WHEN LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) IN ('10', '11') THEN 'Alimentaire'
        WHEN LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) IN ('16', '23', '41', '42', '43') THEN 'BTP & Construction'
        WHEN LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) IN ('29', '30', '45') THEN 'Automobile'
        WHEN LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) IN ('46', '47') THEN 'Commerce & Distribution'
        WHEN LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) IN ('55', '56') THEN 'Hôtellerie & Restauration'
        WHEN LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) IN ('49', '50', '51', '52', '53') THEN 'Transport & Logistique'
        WHEN LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) IN ('58', '59', '60', '61', '62', '63') THEN 'Informatique & Digital'
        WHEN LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) IN ('86', '87', '88') THEN 'Santé & Médical'
        WHEN LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) IN ('95', '96') THEN 'Services personnels'
        ELSE 'Autres'
    END
ORDER BY COUNT(*) DESC;
