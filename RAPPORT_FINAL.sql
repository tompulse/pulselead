-- RAPPORT FINAL: Vue complète des prospects après traitement
-- Statistiques détaillées pour validation

\echo '═══════════════════════════════════════════════════════════════'
\echo '📊 RAPPORT COMPLET - PROSPECTS TRAITÉS'
\echo '═══════════════════════════════════════════════════════════════'
\echo ''

-- 1. Vue d'ensemble
\echo '1️⃣  VUE D''ENSEMBLE'
\echo '───────────────────────────────────────────────────────────────'
SELECT 
    COUNT(*) as "Total Prospects",
    COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as "Avec GPS",
    COUNT(CASE WHEN secteur_activite IS NOT NULL THEN 1 END) as "Avec Secteur",
    COUNT(CASE WHEN LENGTH(code_postal) = 5 THEN 1 END) as "Code Postal OK",
    COUNT(CASE WHEN date_creation IS NOT NULL THEN 1 END) as "Avec Date"
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true');

\echo ''
\echo '2️⃣  RÉPARTITION PAR SECTEUR D''ACTIVITÉ'
\echo '───────────────────────────────────────────────────────────────'
SELECT 
    COALESCE(secteur_activite, 'Non assigné') as "Secteur",
    COUNT(*) as "Nombre",
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true'), 2) as "% Total"
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
GROUP BY secteur_activite
ORDER BY COUNT(*) DESC;

\echo ''
\echo '3️⃣  QUALITÉ DES CODES POSTAUX'
\echo '───────────────────────────────────────────────────────────────'
SELECT 
    CASE 
        WHEN LENGTH(code_postal) = 5 THEN '✅ 5 chiffres (OK)'
        WHEN LENGTH(code_postal) = 4 THEN '⚠️  4 chiffres'
        WHEN LENGTH(code_postal) < 4 THEN '❌ < 4 chiffres'
        WHEN LENGTH(code_postal) > 5 THEN '❌ > 5 chiffres'
        ELSE '❌ NULL ou vide'
    END as "Statut Code Postal",
    COUNT(*) as "Nombre",
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true'), 2) as "% Total"
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
GROUP BY 
    CASE 
        WHEN LENGTH(code_postal) = 5 THEN '✅ 5 chiffres (OK)'
        WHEN LENGTH(code_postal) = 4 THEN '⚠️  4 chiffres'
        WHEN LENGTH(code_postal) < 4 THEN '❌ < 4 chiffres'
        WHEN LENGTH(code_postal) > 5 THEN '❌ > 5 chiffres'
        ELSE '❌ NULL ou vide'
    END
ORDER BY COUNT(*) DESC;

\echo ''
\echo '4️⃣  GÉOCODAGE (GPS)'
\echo '───────────────────────────────────────────────────────────────'
SELECT 
    CASE 
        WHEN latitude IS NOT NULL AND longitude IS NOT NULL 
             AND latitude BETWEEN 41 AND 51.5 
             AND longitude BETWEEN -5.5 AND 10 
        THEN '✅ GPS Valide'
        WHEN latitude IS NOT NULL AND longitude IS NOT NULL 
        THEN '⚠️  GPS Hors France'
        ELSE '❌ Pas de GPS'
    END as "Statut GPS",
    COUNT(*) as "Nombre",
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true'), 2) as "% Total"
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
GROUP BY 
    CASE 
        WHEN latitude IS NOT NULL AND longitude IS NOT NULL 
             AND latitude BETWEEN 41 AND 51.5 
             AND longitude BETWEEN -5.5 AND 10 
        THEN '✅ GPS Valide'
        WHEN latitude IS NOT NULL AND longitude IS NOT NULL 
        THEN '⚠️  GPS Hors France'
        ELSE '❌ Pas de GPS'
    END
ORDER BY COUNT(*) DESC;

\echo ''
\echo '5️⃣  TOP 10 DÉPARTEMENTS'
\echo '───────────────────────────────────────────────────────────────'
SELECT 
    SUBSTRING(code_postal, 1, 2) as "Département",
    COUNT(*) as "Nombre Prospects",
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true'), 2) as "% Total"
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_postal IS NOT NULL
  AND LENGTH(code_postal) >= 2
GROUP BY SUBSTRING(code_postal, 1, 2)
ORDER BY COUNT(*) DESC
LIMIT 10;

\echo ''
\echo '6️⃣  DATES DE CRÉATION'
\echo '───────────────────────────────────────────────────────────────'
SELECT 
    CASE 
        WHEN date_creation IS NOT NULL THEN '✅ Date présente'
        ELSE '❌ Pas de date'
    END as "Statut Date",
    COUNT(*) as "Nombre",
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true'), 2) as "% Total"
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
GROUP BY 
    CASE 
        WHEN date_creation IS NOT NULL THEN '✅ Date présente'
        ELSE '❌ Pas de date'
    END
ORDER BY COUNT(*) DESC;

\echo ''
\echo '7️⃣  RÉPARTITION PAR ANNÉE DE CRÉATION'
\echo '───────────────────────────────────────────────────────────────'
SELECT 
    EXTRACT(YEAR FROM date_creation::date) as "Année",
    COUNT(*) as "Nombre",
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true' AND date_creation IS NOT NULL), 2) as "% (avec date)"
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND date_creation IS NOT NULL
GROUP BY EXTRACT(YEAR FROM date_creation::date)
ORDER BY "Année" DESC
LIMIT 15;

\echo ''
\echo '8️⃣  EXEMPLES DE PROSPECTS BIEN TRAITÉS'
\echo '───────────────────────────────────────────────────────────────'
SELECT 
    nom as "Nom",
    code_postal as "CP",
    commune as "Ville",
    secteur_activite as "Secteur",
    CASE 
        WHEN latitude IS NOT NULL THEN ROUND(latitude::numeric, 2)::text
        ELSE 'N/A'
    END as "Latitude",
    SUBSTRING(code_naf, 1, 5) as "NAF"
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND secteur_activite IS NOT NULL
  AND LENGTH(code_postal) = 5
  AND latitude IS NOT NULL
ORDER BY id DESC
LIMIT 10;

\echo ''
\echo '═══════════════════════════════════════════════════════════════'
\echo '✅ FIN DU RAPPORT'
\echo '═══════════════════════════════════════════════════════════════'
