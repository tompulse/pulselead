-- ═══════════════════════════════════════════════════════════════════
-- VÉRIFICATION SIMPLE TABLE nouveaux_sites (Version sans ID)
-- ═══════════════════════════════════════════════════════════════════

-- 1. Vérifier que la table existe et compter les lignes
SELECT 
  '✅ Table existe' as status, 
  COUNT(*) as nb_lignes 
FROM nouveaux_sites;

-- 2. Lister TOUTES les colonnes présentes
SELECT 
  '📋 Colonnes actuelles:' as titre,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'nouveaux_sites'
ORDER BY ordinal_position;

-- 3. Vérifier RLS
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ RLS activé'
    ELSE '❌ RLS PAS activé - URGENT à corriger'
  END as rls_status,
  COUNT(*) as nb_policies
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'nouveaux_sites';

-- 4. Vérifier les colonnes ESSENTIELLES pour PULSE
SELECT 
  'siret' as colonne_obligatoire,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'nouveaux_sites' AND column_name = 'siret'
    ) THEN '✅ Présente'
    ELSE '❌ MANQUANTE'
  END as status
UNION ALL
SELECT 
  'id (UUID)',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'nouveaux_sites' AND column_name = 'id'
    ) THEN '✅ Présente'
    ELSE '⚠️ MANQUANTE - À ajouter'
  END
UNION ALL
SELECT 
  'archived',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'nouveaux_sites' AND column_name = 'archived'
    ) THEN '✅ Présente'
    ELSE '⚠️ MANQUANTE - À ajouter'
  END
UNION ALL
SELECT 
  'random_order',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'nouveaux_sites' AND column_name = 'random_order'
    ) THEN '✅ Présente'
    ELSE '⚠️ MANQUANTE - À ajouter'
  END;

-- 5. Échantillon de données (avec siret seulement)
SELECT 
  siret,
  COALESCE(nom, entreprise, 'Sans nom') as nom,
  ville,
  code_postal
FROM nouveaux_sites
LIMIT 5;

-- 6. Statistiques
SELECT 
  COUNT(*) as total_lignes,
  COUNT(DISTINCT siret) as siret_uniques,
  COUNT(latitude) as lignes_avec_gps
FROM nouveaux_sites;
