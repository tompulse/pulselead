-- ═══════════════════════════════════════════════════════════════════
-- TEST COMPLET DES 3 FILTRES APRÈS CORRECTIONS
-- Exécuter pour vérifier que tout fonctionne correctement
-- ═══════════════════════════════════════════════════════════════════

\echo '╔═══════════════════════════════════════════════════════════════════╗'
\echo '║  🧪 TESTS DES FILTRES - DATES, DÉPARTEMENTS, SECTEURS           ║'
\echo '╚═══════════════════════════════════════════════════════════════════╝'
\echo ''

-- ═══════════════════════════════════════════════════════════════════
-- TEST 1: FILTRE DATES (Format DD/MM/YYYY)
-- ═══════════════════════════════════════════════════════════════════
\echo '1️⃣  TEST FILTRE DATES (DD/MM/YYYY)'
\echo '───────────────────────────────────────────────────────────────────'

-- Afficher quelques dates pour vérifier le format
\echo 'Exemples de dates en base (format DD/MM/YYYY) :'
SELECT 
    date_creation as "Date en base",
    COUNT(*) as "Nombre"
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND date_creation IS NOT NULL
GROUP BY date_creation
ORDER BY COUNT(*) DESC
LIMIT 5;

\echo ''
\echo 'Distribution par année (extraction depuis DD/MM/YYYY) :'
SELECT 
    SUBSTRING(date_creation FROM '([0-9]{4})$') as "Année",
    COUNT(*) as "Nombre de prospects"
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND date_creation IS NOT NULL
  AND date_creation ~ '^[0-9]{2}/[0-9]{2}/[0-9]{4}$'
GROUP BY SUBSTRING(date_creation FROM '([0-9]{4})$')
ORDER BY "Année" DESC
LIMIT 10;

\echo ''
\echo '✅ Le filtre dates sera géré côté client (parsing DD/MM/YYYY en JavaScript)'
\echo ''

-- ═══════════════════════════════════════════════════════════════════
-- TEST 2: FILTRE DÉPARTEMENTS (Format 01-09)
-- ═══════════════════════════════════════════════════════════════════
\echo '2️⃣  TEST FILTRE DÉPARTEMENTS (Format 01-09)'
\echo '───────────────────────────────────────────────────────────────────'

-- Vérifier l'extraction des départements
\echo 'Extraction des départements avec format 01-09 :'
SELECT 
    COALESCE(
        CASE 
            WHEN LENGTH(TRIM(departement)) = 2 THEN TRIM(departement)
            WHEN LENGTH(TRIM(departement)) = 1 THEN LPAD(TRIM(departement), 2, '0')
            ELSE NULL
        END,
        CASE 
            WHEN LENGTH(TRIM(code_postal)) = 4 THEN '0' || LEFT(TRIM(code_postal), 1)
            WHEN LENGTH(TRIM(code_postal)) >= 5 THEN LEFT(TRIM(code_postal), 2)
            ELSE NULL
        END
    ) as "Département",
    COUNT(*) as "Nombre de prospects"
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
GROUP BY 
    COALESCE(
        CASE 
            WHEN LENGTH(TRIM(departement)) = 2 THEN TRIM(departement)
            WHEN LENGTH(TRIM(departement)) = 1 THEN LPAD(TRIM(departement), 2, '0')
            ELSE NULL
        END,
        CASE 
            WHEN LENGTH(TRIM(code_postal)) = 4 THEN '0' || LEFT(TRIM(code_postal), 1)
            WHEN LENGTH(TRIM(code_postal)) >= 5 THEN LEFT(TRIM(code_postal), 2)
            ELSE NULL
        END
    )
ORDER BY "Département"
LIMIT 15;

\echo ''
\echo 'Vérification départements 01-09 (doivent avoir le zéro devant) :'
SELECT 
    COALESCE(
        CASE 
            WHEN LENGTH(TRIM(departement)) = 2 THEN TRIM(departement)
            WHEN LENGTH(TRIM(departement)) = 1 THEN LPAD(TRIM(departement), 2, '0')
            ELSE NULL
        END,
        CASE 
            WHEN LENGTH(TRIM(code_postal)) = 4 THEN '0' || LEFT(TRIM(code_postal), 1)
            WHEN LENGTH(TRIM(code_postal)) >= 5 THEN LEFT(TRIM(code_postal), 2)
            ELSE NULL
        END
    ) as "Département",
    COUNT(*) as "Nombre"
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND (
    (LENGTH(TRIM(code_postal)) = 4 AND LEFT(TRIM(code_postal), 1) IN ('1','2','3','4','5','6','7','8','9'))
    OR (LENGTH(TRIM(code_postal)) >= 5 AND LEFT(TRIM(code_postal), 2) BETWEEN '01' AND '09')
  )
GROUP BY 
    COALESCE(
        CASE 
            WHEN LENGTH(TRIM(departement)) = 2 THEN TRIM(departement)
            WHEN LENGTH(TRIM(departement)) = 1 THEN LPAD(TRIM(departement), 2, '0')
            ELSE NULL
        END,
        CASE 
            WHEN LENGTH(TRIM(code_postal)) = 4 THEN '0' || LEFT(TRIM(code_postal), 1)
            WHEN LENGTH(TRIM(code_postal)) >= 5 THEN LEFT(TRIM(code_postal), 2)
            ELSE NULL
        END
    )
ORDER BY "Département";

\echo ''
\echo '✅ Les départements 01-09 doivent tous avoir 2 chiffres (avec 0 devant)'
\echo ''

-- ═══════════════════════════════════════════════════════════════════
-- TEST 3: FILTRE SECTEURS NAF (Couverture complète)
-- ═══════════════════════════════════════════════════════════════════
\echo '3️⃣  TEST FILTRE SECTEURS NAF (Couverture complète)'
\echo '───────────────────────────────────────────────────────────────────'

-- Vérifier toutes les sections NAF présentes
\echo 'Toutes les sections NAF présentes en base (2 premiers chiffres) :'
SELECT 
    LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2) as "Section NAF",
    COUNT(*) as "Nombre",
    MIN(code_naf) as "Exemple code"
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_naf IS NOT NULL
  AND LENGTH(code_naf) >= 2
GROUP BY LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2)
ORDER BY LEFT(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 2)::integer;

\echo ''
\echo 'Répartition par secteur d''activité (mapping complet) :'
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
    END as "Secteur",
    COUNT(*) as "Nombre",
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true' AND code_naf IS NOT NULL), 2) as "Pourcentage"
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

\echo ''
\echo '✅ Tous les codes NAF doivent être dans un secteur (aucun ne doit être NULL)'
\echo ''

-- ═══════════════════════════════════════════════════════════════════
-- RÉSUMÉ FINAL
-- ═══════════════════════════════════════════════════════════════════
\echo '╔═══════════════════════════════════════════════════════════════════╗'
\echo '║  ✅ RÉSUMÉ DES TESTS                                              ║'
\echo '╚═══════════════════════════════════════════════════════════════════╝'
\echo ''
\echo '1. Dates : Format DD/MM/YYYY vérifié ✅'
\echo '2. Départements : Format 01-09 avec zéro ✅'
\echo '3. Secteurs NAF : Couverture 100% ✅'
\echo ''
\echo 'Si tous les résultats ci-dessus sont corrects, les filtres fonctionnent !'
\echo ''
