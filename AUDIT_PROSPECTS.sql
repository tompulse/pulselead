-- AUDIT RAPIDE des 9000 nouveaux prospects
-- À exécuter pour voir l'état actuel avant traitement

-- 1. CODES POSTAUX: Combien ont 4 chiffres ?
SELECT 
    '1. CODES POSTAUX À 4 CHIFFRES' as categorie,
    COUNT(*) as nombre,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true'), 2) as pourcentage
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_postal IS NOT NULL
  AND LENGTH(TRIM(code_postal)) = 4
  AND code_postal ~ '^[0-9]{4}$';

-- 2. GÉOCODAGE: Combien sans coordonnées GPS ?
SELECT 
    '2. SANS COORDONNÉES GPS' as categorie,
    COUNT(*) as nombre,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true'), 2) as pourcentage
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND (latitude IS NULL OR longitude IS NULL);

-- 3. GÉOCODAGE: Combien avec coordonnées invalides ?
SELECT 
    '3. GPS INVALIDES (hors France)' as categorie,
    COUNT(*) as nombre,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true'), 2) as pourcentage
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND (
    latitude IS NOT NULL 
    AND longitude IS NOT NULL
    AND (latitude < 41 OR latitude > 51.5 OR longitude < -5.5 OR longitude > 10)
  );

-- 4. SECTEUR D'ACTIVITÉ: Combien sans secteur ?
SELECT 
    '4. SANS SECTEUR ACTIVITÉ' as categorie,
    COUNT(*) as nombre,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true'), 2) as pourcentage
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND (secteur_activite IS NULL OR secteur_activite = '');

-- 5. CODE NAF: Combien sans code NAF ?
SELECT 
    '5. SANS CODE NAF' as categorie,
    COUNT(*) as nombre,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true'), 2) as pourcentage
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND (code_naf IS NULL OR code_naf = '');

-- 6. DATE DE CRÉATION: Combien avec date invalide ou manquante ?
SELECT 
    '6. SANS DATE CRÉATION' as categorie,
    COUNT(*) as nombre,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true'), 2) as pourcentage
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND (date_creation IS NULL OR date_creation::text = '');

-- 7. RÉSUMÉ GLOBAL
SELECT 
    '📊 TOTAL PROSPECTS ACTIFS' as info,
    COUNT(*) as total
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true');

-- 8. Exemples de prospects nécessitant un traitement
SELECT 
    id,
    nom,
    code_postal,
    LENGTH(code_postal) as cp_longueur,
    commune,
    code_naf,
    SUBSTRING(REPLACE(code_naf, '.', ''), 1, 2) as naf_section,
    CASE 
        WHEN latitude IS NULL OR longitude IS NULL THEN 'Pas de GPS'
        WHEN latitude < 41 OR latitude > 51.5 OR longitude < -5.5 OR longitude > 10 THEN 'GPS invalide'
        ELSE 'GPS OK'
    END as statut_gps,
    secteur_activite,
    date_creation
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND (
    -- Code postal à 4 chiffres
    (code_postal IS NOT NULL AND LENGTH(TRIM(code_postal)) = 4)
    -- Ou pas de GPS
    OR (latitude IS NULL OR longitude IS NULL)
    -- Ou pas de secteur
    OR (secteur_activite IS NULL OR secteur_activite = '')
  )
ORDER BY id DESC
LIMIT 20;
