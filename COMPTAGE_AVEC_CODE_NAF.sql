-- Comptage national des prospects en utilisant les VRAIES colonnes
-- Basé sur: siege (text), archived (text), code_naf (text)

-- ═══════════════════════════════════════════════════════════
-- 1. RÉSUMÉ GÉNÉRAL
-- ═══════════════════════════════════════════════════════════
SELECT 
  '📊 TOTAL PROSPECTS' as categorie,
  COUNT(*) as nombre,
  COUNT(DISTINCT CASE WHEN UPPER(siege) IN ('VRAI', 'TRUE', 'V', '1', 'OUI') THEN siret END) as sieges,
  COUNT(DISTINCT CASE WHEN UPPER(siege) NOT IN ('VRAI', 'TRUE', 'V', '1', 'OUI') OR siege IS NULL THEN siret END) as sites
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true');

-- ═══════════════════════════════════════════════════════════
-- 2. PAR TYPE D'ÉTABLISSEMENT (Siège vs Site)
-- ═══════════════════════════════════════════════════════════
SELECT 
  '🏢 Type: ' || CASE 
    WHEN UPPER(siege) IN ('VRAI', 'TRUE', 'V', '1', 'OUI') THEN 'Siège' 
    WHEN UPPER(siege) IN ('FAUX', 'FALSE', 'F', '0', 'NON') THEN 'Site'
    WHEN siege IS NULL THEN 'Non spécifié'
    ELSE 'Autre (' || siege || ')'
  END as categorie,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
GROUP BY CASE 
  WHEN UPPER(siege) IN ('VRAI', 'TRUE', 'V', '1', 'OUI') THEN 'Siège' 
  WHEN UPPER(siege) IN ('FAUX', 'FALSE', 'F', '0', 'NON') THEN 'Site'
  WHEN siege IS NULL THEN 'Non spécifié'
  ELSE 'Autre (' || siege || ')'
END
ORDER BY COUNT(*) DESC;

-- ═══════════════════════════════════════════════════════════
-- 3. PAR SECTION NAF (2 premiers caractères du code_naf)
-- ═══════════════════════════════════════════════════════════
SELECT 
  '📋 Section NAF: ' || LEFT(code_naf, 2) as categorie,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_naf IS NOT NULL 
  AND LENGTH(code_naf) >= 2
GROUP BY LEFT(code_naf, 2)
ORDER BY COUNT(*) DESC;

-- ═══════════════════════════════════════════════════════════
-- 4. PAR DIVISION NAF (4 premiers caractères) - TOP 20
-- ═══════════════════════════════════════════════════════════
SELECT 
  '📊 Division NAF: ' || LEFT(code_naf, 4) as categorie,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_naf IS NOT NULL 
  AND LENGTH(code_naf) >= 4
GROUP BY LEFT(code_naf, 4)
ORDER BY COUNT(*) DESC
LIMIT 20;

-- ═══════════════════════════════════════════════════════════
-- 5. PAR CODE NAF COMPLET - TOP 20
-- ═══════════════════════════════════════════════════════════
SELECT 
  '🏷️ Code NAF: ' || code_naf as categorie,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_naf IS NOT NULL
GROUP BY code_naf
ORDER BY COUNT(*) DESC
LIMIT 20;

-- ═══════════════════════════════════════════════════════════
-- 6. PAR DÉPARTEMENT (depuis code_postal, normalisé)
-- ═══════════════════════════════════════════════════════════
SELECT 
  '📍 Département: ' || CASE 
    WHEN LENGTH(code_postal) = 4 THEN '0' || LEFT(code_postal, 1)
    WHEN LENGTH(code_postal) >= 5 THEN LEFT(code_postal, 2)
    ELSE 'Inconnu'
  END as categorie,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_postal IS NOT NULL
GROUP BY CASE 
  WHEN LENGTH(code_postal) = 4 THEN '0' || LEFT(code_postal, 1)
  WHEN LENGTH(code_postal) >= 5 THEN LEFT(code_postal, 2)
  ELSE 'Inconnu'
END
ORDER BY COUNT(*) DESC;

-- ═══════════════════════════════════════════════════════════
-- 7. PAR COMMUNE - TOP 20
-- ═══════════════════════════════════════════════════════════
SELECT 
  '🏘️ Commune: ' || commune as categorie,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND commune IS NOT NULL
GROUP BY commune
ORDER BY COUNT(*) DESC
LIMIT 20;

-- ═══════════════════════════════════════════════════════════
-- 8. STATISTIQUES DE COMPLÉTUDE DES DONNÉES
-- ═══════════════════════════════════════════════════════════
SELECT 
  '📈 COMPLÉTUDE DES DONNÉES' as titre,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE archived IS NULL OR archived != 'true') as non_archives,
  ROUND(100.0 * COUNT(code_naf) / COUNT(*), 1) as pct_avec_code_naf,
  ROUND(100.0 * COUNT(code_postal) / COUNT(*), 1) as pct_avec_code_postal,
  ROUND(100.0 * COUNT(commune) / COUNT(*), 1) as pct_avec_commune,
  ROUND(100.0 * COUNT(CASE WHEN siege IS NOT NULL THEN 1 END) / COUNT(*), 1) as pct_avec_type_etab,
  ROUND(100.0 * COUNT(departement) / COUNT(*), 1) as pct_avec_departement,
  ROUND(100.0 * COUNT(coordonnee_lambert_x) / COUNT(*), 1) as pct_avec_coordonnees
FROM nouveaux_sites;
