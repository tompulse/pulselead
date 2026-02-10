-- ═══════════════════════════════════════════════════════════════════
-- VÉRIFICATION COMPLÈTE TABLE nouveaux_sites pour PULSE SaaS
-- ═══════════════════════════════════════════════════════════════════

-- 1. VÉRIFIER QUE LA TABLE EXISTE
SELECT 'Table nouveaux_sites existe' as status, COUNT(*) as nb_lignes 
FROM nouveaux_sites;

-- 2. VÉRIFIER LES COLONNES OBLIGATOIRES
SELECT 
  CASE 
    WHEN COUNT(*) = 25 THEN '✅ Toutes les colonnes présentes'
    ELSE '⚠️ Colonnes manquantes: ' || (25 - COUNT(*))::text
  END as status,
  COUNT(*) as colonnes_presentes
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'nouveaux_sites'
  AND column_name IN (
    'id', 'siret', 'nom', 'date_creation', 'est_siege',
    'categorie_juridique', 'categorie_entreprise', 'complement_adresse',
    'numero_voie', 'type_voie', 'libelle_voie', 'code_postal', 'ville',
    'coordonnee_lambert_x', 'coordonnee_lambert_y', 'latitude', 'longitude',
    'code_naf', 'naf_section', 'naf_division', 'naf_groupe', 'naf_classe',
    'adresse', 'archived', 'random_order'
  );

-- 3. LISTE DES COLONNES ACTUELLES
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'nouveaux_sites'
ORDER BY ordinal_position;

-- 4. VÉRIFIER RLS (Row Level Security)
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ RLS activé avec ' || COUNT(*) || ' policies'
    ELSE '❌ RLS pas configuré - Les utilisateurs ne verront pas les prospects!'
  END as rls_status,
  COUNT(*) as nb_policies
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'nouveaux_sites';

-- 5. DÉTAILS DES POLICIES RLS
SELECT 
  policyname as policy,
  cmd as operation,
  CASE 
    WHEN roles::text = '{public}' THEN 'Public'
    WHEN roles::text = '{authenticated}' THEN 'Authenticated'
    ELSE roles::text
  END as qui_peut_acceder
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'nouveaux_sites';

-- 6. VÉRIFIER LES INDEX (Performance)
SELECT 
  CASE 
    WHEN COUNT(*) >= 5 THEN '✅ Indexes créés (' || COUNT(*) || ')'
    ELSE '⚠️ Peu d''indexes (' || COUNT(*) || ') - Performances réduites'
  END as index_status,
  COUNT(*) as nb_indexes
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'nouveaux_sites';

-- 7. LISTE DES INDEX
SELECT 
  indexname as index_nom,
  indexdef as definition
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'nouveaux_sites';

-- 8. VÉRIFIER COLONNE archived (Obligatoire)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'nouveaux_sites' 
        AND column_name = 'archived'
    ) THEN '✅ Colonne archived existe'
    ELSE '❌ ERREUR: Colonne archived manquante - Section Prospects ne fonctionnera pas!'
  END as status_archived;

-- 9. VÉRIFIER COLONNE random_order (Pour diversité affichage)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'nouveaux_sites' 
        AND column_name = 'random_order'
    ) THEN '✅ Colonne random_order existe'
    ELSE '⚠️ Colonne random_order manquante - Ajout recommandé pour diversité'
  END as status_random_order;

-- 10. ÉCHANTILLON DE DONNÉES
SELECT 
  id,
  siret,
  nom,
  ville,
  code_postal,
  code_naf,
  COALESCE(archived, false) as archived,
  latitude,
  longitude
FROM nouveaux_sites
LIMIT 5;

-- 11. STATISTIQUES GLOBALES
SELECT 
  COUNT(*) as total_prospects,
  COUNT(latitude) as avec_gps,
  COUNT(*) - COUNT(latitude) as sans_gps,
  COUNT(CASE WHEN archived = true THEN 1 END) as archives,
  COUNT(CASE WHEN COALESCE(archived, false) = false THEN 1 END) as actifs,
  COUNT(DISTINCT code_postal) as departements_uniques,
  COUNT(DISTINCT code_naf) as naf_uniques
FROM nouveaux_sites;

-- 12. RECOMMANDATIONS
SELECT 
  '🔍 VÉRIFICATIONS TERMINÉES' as titre,
  CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'nouveaux_sites'
    ) THEN '❌ URGENT: Active le RLS avec une policy pour authenticated users'
    WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'nouveaux_sites' AND column_name = 'archived'
    ) THEN '❌ URGENT: Ajoute la colonne archived (boolean default false)'
    ELSE '✅ Table prête pour PULSE SaaS'
  END as recommandation;
