-- ═══════════════════════════════════════════════════════════════════
-- FIX: Convertir colonne siret en TEXT (Erreur e.siret.replace)
-- ═══════════════════════════════════════════════════════════════════

-- PROBLÈME: siret est probablement INTEGER/NUMERIC
-- SOLUTION: Le convertir en TEXT

-- 1️⃣ VÉRIFIER LE TYPE ACTUEL DE siret
SELECT 
  column_name,
  data_type,
  CASE 
    WHEN data_type IN ('text', 'character varying') THEN '✅ Type correct (TEXT)'
    WHEN data_type IN ('bigint', 'numeric', 'integer') THEN '❌ Type incorrect (NUMBER) - À corriger!'
    ELSE '⚠️ Type inhabituel: ' || data_type
  END as diagnostic
FROM information_schema.columns
WHERE table_name = 'nouveaux_sites' 
  AND column_name = 'siret';

-- 2️⃣ CONVERTIR siret en TEXT si c'est un nombre
DO $$ 
BEGIN
  -- Vérifier si siret est un type numérique
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' 
      AND column_name = 'siret'
      AND data_type IN ('bigint', 'numeric', 'integer', 'double precision')
  ) THEN
    -- Convertir en TEXT
    ALTER TABLE nouveaux_sites ALTER COLUMN siret TYPE TEXT USING siret::TEXT;
    RAISE NOTICE '✅ Colonne siret convertie en TEXT';
  ELSE
    RAISE NOTICE '✓ Colonne siret déjà en TEXT';
  END IF;
END $$;

-- 3️⃣ VÉRIFICATION FINALE
SELECT 
  '✅ CORRECTION TERMINÉE' as status,
  data_type as type_siret,
  COUNT(*) as nb_lignes
FROM information_schema.columns 
  CROSS JOIN nouveaux_sites
WHERE column_name = 'siret' 
  AND table_name = 'nouveaux_sites'
GROUP BY data_type;

-- 4️⃣ ÉCHANTILLON POUR VÉRIFIER
SELECT 
  '📋 Échantillon après conversion:' as titre,
  siret,
  pg_typeof(siret) as type_de_siret
FROM nouveaux_sites 
LIMIT 3;

SELECT '🎯 Rafraîchis PULSE maintenant (Ctrl+F5) et teste à nouveau!' as prochaine_etape;
