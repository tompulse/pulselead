-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 1 : VÉRIFICATION ULTRA-SIMPLE (Fonctionne avec n'importe quelle structure)
-- ═══════════════════════════════════════════════════════════════════

-- 1️⃣ COMPTER LES LIGNES
SELECT '1️⃣ Nombre de lignes dans la table:' as etape;
SELECT COUNT(*) as total_lignes FROM nouveaux_sites;

-- 2️⃣ LISTER TOUTES LES COLONNES
SELECT '2️⃣ Colonnes présentes dans ta table:' as etape;
SELECT 
  column_name as colonne,
  data_type as type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'nouveaux_sites'
ORDER BY ordinal_position;

-- 3️⃣ VOIR UN ÉCHANTILLON (3 lignes)
SELECT '3️⃣ Aperçu des données (3 premières lignes):' as etape;
SELECT * FROM nouveaux_sites LIMIT 3;

-- 4️⃣ VÉRIFIER COLONNE 'siret'
SELECT '4️⃣ Vérification colonne SIRET:' as etape;
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'nouveaux_sites' AND column_name = 'siret'
    ) THEN '✅ Colonne siret présente'
    ELSE '❌ ERREUR: Colonne siret manquante!'
  END as status;

-- 5️⃣ COMPTER LES SIRET UNIQUES
SELECT '5️⃣ Nombre de SIRET uniques:' as etape;
SELECT COUNT(DISTINCT siret) as siret_uniques FROM nouveaux_sites;

-- 6️⃣ VÉRIFIER RLS (Sécurité)
SELECT '6️⃣ Vérification Row Level Security:' as etape;
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ RLS activé (' || COUNT(*) || ' policies)'
    ELSE '❌ RLS PAS ACTIVÉ - À corriger!'
  END as status_rls
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'nouveaux_sites';

-- 7️⃣ RÉSUMÉ FINAL
SELECT '7️⃣ RÉSUMÉ - Colonnes à ajouter pour PULSE:' as etape;
SELECT 
  'id' as colonne_necessaire,
  'UUID, clé primaire' as description,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'id')
    THEN '✅ Présente'
    ELSE '❌ À AJOUTER'
  END as status
UNION ALL
SELECT 
  'archived',
  'Boolean, filtre prospects actifs',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'archived')
    THEN '✅ Présente'
    ELSE '❌ À AJOUTER'
  END
UNION ALL
SELECT 
  'random_order',
  'Float, diversité affichage',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'random_order')
    THEN '✅ Présente'
    ELSE '❌ À AJOUTER'
  END
UNION ALL
SELECT 
  'RLS Policy',
  'Sécurité accès données',
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'nouveaux_sites')
    THEN '✅ Activé'
    ELSE '❌ À ACTIVER'
  END;

-- 8️⃣ PROCHAINE ÉTAPE
SELECT '8️⃣ PROCHAINE ÉTAPE:' as etape;
SELECT 'Si colonnes manquent → Exécute AJOUTER_COLONNES_MANQUANTES.sql' as action;
