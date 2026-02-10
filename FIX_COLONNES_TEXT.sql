-- ═══════════════════════════════════════════════════════════════════
-- FIX COMPLET: Convertir toutes les colonnes textuelles en TEXT
-- ═══════════════════════════════════════════════════════════════════

-- Colonnes qui DOIVENT être TEXT pour PULSE:
-- - siret (utilisé avec .replace())
-- - code_postal (affiché comme string)
-- - code_naf (utilisé pour filtres)

SELECT '🔍 VÉRIFICATION DES TYPES DE COLONNES' as etape;

-- 1️⃣ VÉRIFIER TOUS LES TYPES
SELECT 
  column_name as colonne,
  data_type as type_actuel,
  CASE 
    WHEN column_name IN ('siret', 'code_postal', 'code_naf') 
         AND data_type NOT IN ('text', 'character varying') 
    THEN '❌ À CORRIGER'
    WHEN column_name IN ('siret', 'code_postal', 'code_naf')
    THEN '✅ OK'
    ELSE '✓'
  END as status
FROM information_schema.columns
WHERE table_name = 'nouveaux_sites'
  AND column_name IN ('siret', 'code_postal', 'code_naf', 'nom', 'ville', 
                      'entreprise', 'adresse', 'categorie_juridique')
ORDER BY 
  CASE column_name 
    WHEN 'siret' THEN 1
    WHEN 'code_postal' THEN 2
    WHEN 'code_naf' THEN 3
    ELSE 4
  END;

-- 2️⃣ CONVERTIR siret EN TEXT
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' 
      AND column_name = 'siret'
      AND data_type NOT IN ('text', 'character varying')
  ) THEN
    ALTER TABLE nouveaux_sites ALTER COLUMN siret TYPE TEXT USING siret::TEXT;
    RAISE NOTICE '✅ siret converti en TEXT';
  ELSE
    RAISE NOTICE '✓ siret déjà TEXT';
  END IF;
END $$;

-- 3️⃣ CONVERTIR code_postal EN TEXT
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' 
      AND column_name = 'code_postal'
      AND data_type NOT IN ('text', 'character varying')
  ) THEN
    ALTER TABLE nouveaux_sites ALTER COLUMN code_postal TYPE TEXT USING code_postal::TEXT;
    RAISE NOTICE '✅ code_postal converti en TEXT';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' 
      AND column_name = 'codePostalEtablissement'
      AND data_type NOT IN ('text', 'character varying')
  ) THEN
    ALTER TABLE nouveaux_sites ALTER COLUMN "codePostalEtablissement" TYPE TEXT USING "codePostalEtablissement"::TEXT;
    RAISE NOTICE '✅ codePostalEtablissement converti en TEXT';
  ELSE
    RAISE NOTICE '✓ code_postal déjà TEXT';
  END IF;
END $$;

-- 4️⃣ CONVERTIR code_naf EN TEXT
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' 
      AND column_name = 'code_naf'
      AND data_type NOT IN ('text', 'character varying')
  ) THEN
    ALTER TABLE nouveaux_sites ALTER COLUMN code_naf TYPE TEXT USING code_naf::TEXT;
    RAISE NOTICE '✅ code_naf converti en TEXT';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' 
      AND column_name = 'activitePrincipaleEtablissement'
      AND data_type NOT IN ('text', 'character varying')
  ) THEN
    ALTER TABLE nouveaux_sites ALTER COLUMN "activitePrincipaleEtablissement" TYPE TEXT USING "activitePrincipaleEtablissement"::TEXT;
    RAISE NOTICE '✅ activitePrincipaleEtablissement converti en TEXT';
  ELSE
    RAISE NOTICE '✓ code_naf déjà TEXT';
  END IF;
END $$;

-- 5️⃣ CONVERTIR categorie_juridique EN TEXT
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' 
      AND column_name = 'categorie_juridique'
      AND data_type NOT IN ('text', 'character varying')
  ) THEN
    ALTER TABLE nouveaux_sites ALTER COLUMN categorie_juridique TYPE TEXT USING categorie_juridique::TEXT;
    RAISE NOTICE '✅ categorie_juridique converti en TEXT';
  ELSE
    RAISE NOTICE '✓ categorie_juridique OK';
  END IF;
END $$;

-- 6️⃣ VÉRIFICATION FINALE
SELECT '✅ CONVERSIONS TERMINÉES' as status;

SELECT 
  column_name as colonne,
  data_type as type_final,
  '✅' as status
FROM information_schema.columns
WHERE table_name = 'nouveaux_sites'
  AND column_name IN ('siret', 'code_postal', 'code_naf', 'categorie_juridique')
ORDER BY column_name;

-- 7️⃣ TESTER UN ÉCHANTILLON
SELECT 
  siret,
  pg_typeof(siret) as type_siret,
  code_postal,
  pg_typeof(code_postal) as type_cp,
  code_naf,
  pg_typeof(code_naf) as type_naf
FROM nouveaux_sites 
LIMIT 3;

SELECT '🎯 PULSE devrait maintenant fonctionner!' as resultat;
SELECT 'Rafraîchis PULSE (Ctrl+F5) et teste la section Prospects' as action;
