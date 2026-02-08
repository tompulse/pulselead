-- 🔧 REMPLIR la hiérarchie NAF complète (division, groupe, classe)
-- Problème: Les prospects sont dans la grande catégorie mais pas dans les sous-catégories

-- 1️⃣ Diagnostic: Vérifier l'état actuel
SELECT 
  'État de la hiérarchie NAF' as diagnostic,
  COUNT(*) as total_entreprises,
  COUNT(code_naf) as avec_code_naf,
  COUNT(naf_section) as avec_section,
  COUNT(naf_division) as avec_division,
  COUNT(naf_groupe) as avec_groupe,
  COUNT(naf_classe) as avec_classe,
  COUNT(*) - COUNT(naf_division) as division_manquante,
  COUNT(*) - COUNT(naf_groupe) as groupe_manquant,
  COUNT(*) - COUNT(naf_classe) as classe_manquante
FROM nouveaux_sites
WHERE code_naf IS NOT NULL;

-- 2️⃣ Exemples de codes NAF et leur hiérarchie actuelle
SELECT 
  code_naf,
  naf_section,
  naf_division,
  naf_groupe,
  naf_classe,
  COUNT(*) as nombre_entreprises
FROM nouveaux_sites
WHERE code_naf IS NOT NULL
GROUP BY code_naf, naf_section, naf_division, naf_groupe, naf_classe
ORDER BY nombre_entreprises DESC
LIMIT 20;

-- 3️⃣ CORRECTION: Remplir la hiérarchie NAF
-- Structure des codes NAF:
-- - Code complet: 43.11Z (5 caractères avec point et lettre)
-- - Classe: 43.11 (premiers 5 caractères)
-- - Groupe: 43.1 (premiers 4 caractères)
-- - Division: 43 (premiers 2 caractères)

UPDATE nouveaux_sites
SET 
  -- Division: premiers 2 chiffres (ex: "43" de "43.11Z")
  naf_division = CASE 
    WHEN code_naf ~ '^[0-9]{2}' THEN LEFT(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 2)
    ELSE naf_division
  END,
  
  -- Groupe: premiers 3 chiffres avec point (ex: "43.1" de "43.11Z")
  naf_groupe = CASE 
    WHEN code_naf ~ '^[0-9]{2}\.[0-9]' THEN 
      SUBSTRING(code_naf FROM '^[0-9]{2}\.[0-9]')
    WHEN code_naf ~ '^[0-9]{3}' THEN 
      LEFT(code_naf, 2) || '.' || SUBSTRING(code_naf FROM 3 FOR 1)
    ELSE naf_groupe
  END,
  
  -- Classe: premiers 4 chiffres avec point (ex: "43.11" de "43.11Z")
  naf_classe = CASE 
    WHEN code_naf ~ '^[0-9]{2}\.[0-9]{2}' THEN 
      SUBSTRING(code_naf FROM '^[0-9]{2}\.[0-9]{2}')
    WHEN code_naf ~ '^[0-9]{4}' THEN 
      LEFT(code_naf, 2) || '.' || SUBSTRING(code_naf FROM 3 FOR 2)
    ELSE naf_classe
  END

WHERE code_naf IS NOT NULL
  AND (naf_division IS NULL OR naf_groupe IS NULL OR naf_classe IS NULL);

-- 4️⃣ Vérification après correction
SELECT 
  'Après correction' as statut,
  COUNT(*) as total,
  COUNT(naf_division) as avec_division,
  COUNT(naf_groupe) as avec_groupe,
  COUNT(naf_classe) as avec_classe,
  COUNT(*) FILTER (WHERE naf_division IS NOT NULL AND naf_groupe IS NOT NULL AND naf_classe IS NOT NULL) as hierarchie_complete
FROM nouveaux_sites
WHERE code_naf IS NOT NULL;

-- 5️⃣ Distribution par division NAF (ex: 43)
SELECT 
  naf_division,
  COUNT(*) as nombre_entreprises
FROM nouveaux_sites
WHERE naf_division IS NOT NULL
GROUP BY naf_division
ORDER BY naf_division
LIMIT 20;

-- 6️⃣ Distribution par groupe NAF (ex: 43.1)
SELECT 
  naf_groupe,
  COUNT(*) as nombre_entreprises
FROM nouveaux_sites
WHERE naf_groupe IS NOT NULL
GROUP BY naf_groupe
ORDER BY naf_groupe
LIMIT 30;

-- 7️⃣ Distribution par classe NAF (ex: 43.11)
SELECT 
  naf_classe,
  COUNT(*) as nombre_entreprises
FROM nouveaux_sites
WHERE naf_classe IS NOT NULL
GROUP BY naf_classe
ORDER BY naf_classe
LIMIT 50;

-- ✅ Les filtres par sous-catégories devraient maintenant fonctionner!
