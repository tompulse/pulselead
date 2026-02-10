-- ═══════════════════════════════════════════════════════════════════
-- VÉRIFICATION TABLE nouveaux_sites - Prête pour import CSV
-- ═══════════════════════════════════════════════════════════════════

-- 1. Vérifier que la table existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name = 'nouveaux_sites';

-- Si aucun résultat, la table n'existe pas → utilise DROP_NOUVEAUX_SITES.sql puis crée-la

-- 2. Vérifier les colonnes de la table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'nouveaux_sites'
ORDER BY ordinal_position;

-- 3. Vérifier les indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'nouveaux_sites';

-- 4. Vérifier les policies RLS
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'nouveaux_sites';

-- 5. Compter les lignes existantes
SELECT COUNT(*) as total_lignes 
FROM public.nouveaux_sites;

-- 6. Vérifier l'espace disque disponible
SELECT 
  pg_size_pretty(pg_total_relation_size('public.nouveaux_sites')) as taille_table,
  pg_size_pretty(pg_database_size(current_database())) as taille_database;

-- 7. Tester un insert simple (sera rollback)
BEGIN;
INSERT INTO public.nouveaux_sites (
  siret, 
  nom, 
  date_creation,
  est_siege,
  categorie_juridique,
  categorie_entreprise,
  code_postal,
  ville,
  code_naf
) VALUES (
  '12345678900001',
  'TEST ENTREPRISE',
  '2025-01-01',
  true,
  '5499',
  'PME',
  '75001',
  'PARIS',
  '47.59B'
);
ROLLBACK;

-- Si tout fonctionne sans erreur, la table est prête ! ✅
SELECT '✅ Table nouveaux_sites est prête pour l''import CSV' as status;
