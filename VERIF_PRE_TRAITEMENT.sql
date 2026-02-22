-- VÉRIFICATION PRÉ-TRAITEMENT
-- Lance ce script AVANT le traitement pour voir ce qui doit être fait

\echo '╔═══════════════════════════════════════════════════════════════════╗'
\echo '║  🔍 ANALYSE PRÉ-TRAITEMENT - État actuel des prospects          ║'
\echo '╚═══════════════════════════════════════════════════════════════════╝'
\echo ''

-- Total de prospects actifs
\echo '📊 TOTAL PROSPECTS ACTIFS:'
SELECT COUNT(*) as total_prospects
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true');

\echo ''
\echo '═══════════════════════════════════════════════════════════════════'
\echo ''

-- Problèmes à résoudre
\echo '❌ PROBLÈMES À CORRIGER:'
\echo ''

\echo '1. Codes postaux à 4 chiffres (besoin de 0 devant):'
SELECT 
    COUNT(*) as "Nombre à corriger",
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true'), 2) || '%' as "Pourcentage"
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_postal IS NOT NULL
  AND LENGTH(TRIM(code_postal)) = 4
  AND code_postal ~ '^[0-9]{4}$';

\echo ''
\echo '2. Prospects sans GPS (à géocoder):'
SELECT 
    COUNT(*) as "Nombre sans GPS",
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true'), 2) || '%' as "Pourcentage"
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND (latitude IS NULL OR longitude IS NULL);

\echo ''
\echo '3. Prospects sans secteur d''activité:'
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'secteur_activite')
        THEN (
            SELECT COUNT(*)::text
            FROM nouveaux_sites
            WHERE (archived IS NULL OR archived != 'true')
              AND (secteur_activite IS NULL OR secteur_activite = '')
        )
        ELSE 'Colonne secteur_activite inexistante (sera créée)'
    END as "Nombre sans secteur";

\echo ''
\echo '4. Prospects sans date de création:'
SELECT 
    COUNT(*) as "Nombre sans date",
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true'), 2) || '%' as "Pourcentage"
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND (date_creation IS NULL OR date_creation::text = '');

\echo ''
\echo '═══════════════════════════════════════════════════════════════════'
\echo ''

-- Exemples de prospects à traiter
\echo '📝 EXEMPLES DE PROSPECTS À TRAITER (premiers 10):'
\echo ''
SELECT 
    id as "ID",
    LEFT(nom, 30) as "Nom",
    code_postal as "CP",
    LEFT(commune, 20) as "Ville",
    CASE 
        WHEN latitude IS NULL THEN '❌'
        ELSE '✅'
    END as "GPS",
    LEFT(code_naf, 5) as "NAF"
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND (
    (code_postal IS NOT NULL AND LENGTH(TRIM(code_postal)) = 4)
    OR (latitude IS NULL OR longitude IS NULL)
  )
ORDER BY id DESC
LIMIT 10;

\echo ''
\echo '╔═══════════════════════════════════════════════════════════════════╗'
\echo '║  ✅ PRÊT POUR LE TRAITEMENT                                       ║'
\echo '║                                                                   ║'
\echo '║  Lancez maintenant:                                               ║'
\echo '║  ./traiter_prospects.sh                                           ║'
\echo '╚═══════════════════════════════════════════════════════════════════╝'
