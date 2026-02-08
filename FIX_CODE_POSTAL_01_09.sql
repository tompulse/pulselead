-- 🔧 CORRIGER les codes postaux à 4 chiffres (départements 01-09)
-- Problème: Les codes postaux des départements 01 à 09 manquent le 0 initial

-- 1️⃣ Diagnostic: Identifier les codes postaux à 4 chiffres
SELECT 
  'Codes postaux à 4 chiffres' as probleme,
  COUNT(*) as nombre_entreprises,
  array_agg(DISTINCT code_postal ORDER BY code_postal) FILTER (WHERE code_postal IS NOT NULL) as exemples_codes
FROM nouveaux_sites
WHERE code_postal IS NOT NULL
  AND LENGTH(code_postal) = 4
  AND code_postal ~ '^[0-9]{4}$';

-- 2️⃣ Exemples d'entreprises concernées
SELECT 
  id,
  nom,
  code_postal as code_avant,
  '0' || code_postal as code_apres,
  ville,
  departement
FROM nouveaux_sites
WHERE code_postal IS NOT NULL
  AND LENGTH(code_postal) = 4
  AND code_postal ~ '^[0-9]{4}$'
ORDER BY code_postal
LIMIT 20;

-- 3️⃣ CORRECTION: Ajouter le 0 initial aux codes postaux à 4 chiffres
UPDATE nouveaux_sites
SET code_postal = '0' || code_postal
WHERE code_postal IS NOT NULL
  AND LENGTH(code_postal) = 4
  AND code_postal ~ '^[0-9]{4}$';

-- 4️⃣ Recalculer la colonne departement pour les codes corrigés
UPDATE nouveaux_sites
SET departement = CASE 
  -- DOM-TOM: codes postaux à 3 chiffres (97xxx pour DOM, 98xxx pour TOM)
  WHEN code_postal ~ '^9[78]' AND LENGTH(code_postal) >= 3 THEN LEFT(code_postal, 3)
  -- Métropole et Corse: codes postaux à 2 chiffres (01-95, 2A, 2B)
  WHEN LENGTH(code_postal) >= 2 THEN LEFT(code_postal, 2)
  ELSE NULL
END
WHERE code_postal IS NOT NULL
  AND (code_postal LIKE '01%' 
    OR code_postal LIKE '02%' 
    OR code_postal LIKE '03%'
    OR code_postal LIKE '04%'
    OR code_postal LIKE '05%'
    OR code_postal LIKE '06%'
    OR code_postal LIKE '07%'
    OR code_postal LIKE '08%'
    OR code_postal LIKE '09%');

-- 5️⃣ Vérification après correction
SELECT 
  'Après correction' as statut,
  COUNT(*) as total_entreprises,
  COUNT(*) FILTER (WHERE LENGTH(code_postal) = 4) as codes_4_chiffres_restants,
  COUNT(*) FILTER (WHERE LENGTH(code_postal) = 5) as codes_5_chiffres,
  COUNT(*) FILTER (WHERE departement IN ('01', '02', '03', '04', '05', '06', '07', '08', '09')) as depts_01_a_09
FROM nouveaux_sites
WHERE code_postal IS NOT NULL;

-- 6️⃣ Distribution des départements 01 à 09
SELECT 
  departement,
  COUNT(*) as nombre_entreprises,
  array_agg(DISTINCT ville ORDER BY ville) FILTER (WHERE ville IS NOT NULL) LIMIT 5 as exemples_villes
FROM nouveaux_sites
WHERE departement IN ('01', '02', '03', '04', '05', '06', '07', '08', '09')
GROUP BY departement
ORDER BY departement;

-- 7️⃣ Vérifier qu'il ne reste plus de codes à 4 chiffres
SELECT 
  code_postal,
  COUNT(*) as nombre,
  array_agg(DISTINCT ville) FILTER (WHERE ville IS NOT NULL) LIMIT 3 as villes
FROM nouveaux_sites
WHERE code_postal IS NOT NULL
  AND LENGTH(code_postal) = 4
GROUP BY code_postal
ORDER BY code_postal
LIMIT 10;

-- ✅ Les départements 01 à 09 devraient maintenant apparaître dans les filtres !
