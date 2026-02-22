-- Correction MASSIVE des codes postaux à 4 chiffres
-- Ajoute un 0 devant tous les codes postaux qui ont 4 chiffres

BEGIN;

-- Afficher d'abord combien de codes postaux sont concernés
SELECT 
    'AVANT CORRECTION' as etape,
    COUNT(*) as total_4_chiffres
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_postal IS NOT NULL
  AND LENGTH(TRIM(code_postal)) = 4
  AND code_postal ~ '^[0-9]{4}$';

-- Correction: ajouter 0 devant les codes à 4 chiffres
UPDATE nouveaux_sites
SET code_postal = '0' || TRIM(code_postal)
WHERE (archived IS NULL OR archived != 'true')
  AND code_postal IS NOT NULL
  AND LENGTH(TRIM(code_postal)) = 4
  AND code_postal ~ '^[0-9]{4}$';

-- Nettoyer les codes postaux (enlever espaces, caractères spéciaux)
UPDATE nouveaux_sites
SET code_postal = REGEXP_REPLACE(code_postal, '[^0-9]', '', 'g')
WHERE (archived IS NULL OR archived != 'true')
  AND code_postal IS NOT NULL
  AND code_postal ~ '[^0-9]';

-- S'assurer que tous les codes font 5 chiffres (padding avec 0)
UPDATE nouveaux_sites
SET code_postal = LPAD(code_postal, 5, '0')
WHERE (archived IS NULL OR archived != 'true')
  AND code_postal IS NOT NULL
  AND LENGTH(code_postal) < 5
  AND code_postal ~ '^[0-9]+$';

COMMIT;

-- Vérification après correction
SELECT 
    'APRÈS CORRECTION' as etape,
    LENGTH(code_postal) as longueur_code,
    COUNT(*) as nombre,
    MIN(code_postal) as exemple_min,
    MAX(code_postal) as exemple_max
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_postal IS NOT NULL
GROUP BY LENGTH(code_postal)
ORDER BY longueur_code;

-- Exemples de codes postaux corrigés (départements 01-09)
SELECT 
    nom,
    commune,
    code_postal,
    CASE 
        WHEN code_postal LIKE '0%' THEN 'OK - Commence par 0'
        ELSE 'À vérifier'
    END as statut
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_postal IS NOT NULL
  AND SUBSTRING(code_postal, 1, 1) = '0'
LIMIT 20;
