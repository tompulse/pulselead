-- 🧹 GARDER uniquement les grandes catégories NAF (01, 02, ..., 99)
-- Supprimer les sous-catégories (groupes et classes)

-- 1️⃣ Vérifier l'état actuel
SELECT 
  'Avant nettoyage' as statut,
  COUNT(*) as total,
  COUNT(naf_division) as avec_division,
  COUNT(naf_groupe) as avec_groupe,
  COUNT(naf_classe) as avec_classe
FROM nouveaux_sites;

-- 2️⃣ SUPPRIMER les sous-catégories (mettre à NULL)
UPDATE nouveaux_sites
SET 
  naf_groupe = NULL,
  naf_classe = NULL
WHERE naf_groupe IS NOT NULL OR naf_classe IS NOT NULL;

-- 3️⃣ S'assurer que naf_division est bien remplie (seulement 2 chiffres)
UPDATE nouveaux_sites
SET naf_division = LEFT(REGEXP_REPLACE(code_naf, '[^0-9]', '', 'g'), 2)
WHERE code_naf IS NOT NULL
  AND (naf_division IS NULL OR LENGTH(naf_division) != 2);

-- 4️⃣ Vérification après nettoyage
SELECT 
  'Après nettoyage' as statut,
  COUNT(*) as total,
  COUNT(naf_division) as avec_division,
  COUNT(naf_groupe) as avec_groupe,
  COUNT(naf_classe) as avec_classe
FROM nouveaux_sites;

-- 5️⃣ Distribution par division NAF (grandes catégories uniquement)
SELECT 
  naf_division,
  COUNT(*) as nombre_entreprises
FROM nouveaux_sites
WHERE naf_division IS NOT NULL
GROUP BY naf_division
ORDER BY naf_division;

-- ✅ Maintenant vous avez uniquement les grandes catégories: 01, 02, 03, ..., 99
-- ✅ Les sous-catégories (groupes et classes) sont supprimées
