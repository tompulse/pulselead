-- Mise à jour MASSIVE de tous les secteurs d'activité selon le code NAF
-- Basé sur le mapping des sections NAF (2 premiers chiffres du code NAF)

BEGIN;

-- 1. Alimentaire (sections 10, 11)
UPDATE nouveaux_sites
SET secteur_activite = 'Alimentaire'
WHERE SUBSTRING(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 1, 2) IN ('10', '11')
  AND (archived IS NULL OR archived != 'true');

-- 2. BTP & Construction (sections 16, 23, 41, 42, 43)
UPDATE nouveaux_sites
SET secteur_activite = 'BTP & Construction'
WHERE SUBSTRING(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 1, 2) IN ('16', '23', '41', '42', '43')
  AND (archived IS NULL OR archived != 'true');

-- 3. Automobile (sections 29, 30, 45)
UPDATE nouveaux_sites
SET secteur_activite = 'Automobile'
WHERE SUBSTRING(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 1, 2) IN ('29', '30', '45')
  AND (archived IS NULL OR archived != 'true');

-- 4. Commerce & Distribution (sections 46, 47)
UPDATE nouveaux_sites
SET secteur_activite = 'Commerce & Distribution'
WHERE SUBSTRING(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 1, 2) IN ('46', '47')
  AND (archived IS NULL OR archived != 'true');

-- 5. Hôtellerie & Restauration (sections 55, 56)
UPDATE nouveaux_sites
SET secteur_activite = 'Hôtellerie & Restauration'
WHERE SUBSTRING(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 1, 2) IN ('55', '56')
  AND (archived IS NULL OR archived != 'true');

-- 6. Transport & Logistique (sections 49, 50, 51, 52, 53)
UPDATE nouveaux_sites
SET secteur_activite = 'Transport & Logistique'
WHERE SUBSTRING(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 1, 2) IN ('49', '50', '51', '52', '53')
  AND (archived IS NULL OR archived != 'true');

-- 7. Informatique & Digital (sections 58, 59, 60, 61, 62, 63)
UPDATE nouveaux_sites
SET secteur_activite = 'Informatique & Digital'
WHERE SUBSTRING(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 1, 2) IN ('58', '59', '60', '61', '62', '63')
  AND (archived IS NULL OR archived != 'true');

-- 8. Santé & Médical (sections 86, 87, 88)
UPDATE nouveaux_sites
SET secteur_activite = 'Santé & Médical'
WHERE SUBSTRING(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 1, 2) IN ('86', '87', '88')
  AND (archived IS NULL OR archived != 'true');

-- 9. Services personnels (sections 95, 96)
UPDATE nouveaux_sites
SET secteur_activite = 'Services personnels'
WHERE SUBSTRING(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 1, 2) IN ('95', '96')
  AND (archived IS NULL OR archived != 'true');

-- 10. Autres (toutes les autres sections)
UPDATE nouveaux_sites
SET secteur_activite = 'Autres'
WHERE (
    secteur_activite IS NULL 
    OR secteur_activite = ''
) AND code_naf IS NOT NULL
  AND (archived IS NULL OR archived != 'true');

-- 11. Mettre "Autres" pour ceux sans code NAF
UPDATE nouveaux_sites
SET secteur_activite = 'Autres'
WHERE (code_naf IS NULL OR code_naf = '')
  AND (archived IS NULL OR archived != 'true');

COMMIT;

-- Afficher les statistiques
SELECT 
    secteur_activite,
    COUNT(*) as nombre_prospects,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true'), 2) as pourcentage
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
GROUP BY secteur_activite
ORDER BY nombre_prospects DESC;

-- Total
SELECT 
    'TOTAL' as info,
    COUNT(*) as total_prospects,
    COUNT(CASE WHEN secteur_activite IS NOT NULL THEN 1 END) as avec_secteur,
    COUNT(CASE WHEN secteur_activite IS NULL THEN 1 END) as sans_secteur
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true');
