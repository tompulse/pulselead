-- ═══════════════════════════════════════════════════════════════════
-- SUPPRESSION COMPLÈTE DE LA TABLE nouveaux_sites
-- ⚠️ ATTENTION : Cette opération est IRRÉVERSIBLE
-- ⚠️ Toutes les données de la table seront perdues
-- ═══════════════════════════════════════════════════════════════════

-- 1. Supprimer les policies RLS
DROP POLICY IF EXISTS "Authenticated users can view nouveaux sites" ON public.nouveaux_sites;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.nouveaux_sites;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.nouveaux_sites;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.nouveaux_sites;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.nouveaux_sites;

-- 2. Supprimer les triggers
DROP TRIGGER IF EXISTS update_nouveaux_sites_updated_at ON public.nouveaux_sites;

-- 3. Supprimer les indexes (automatiquement supprimés avec DROP TABLE CASCADE, mais explicite pour la clarté)
DROP INDEX IF EXISTS public.idx_nouveaux_sites_siret;
DROP INDEX IF EXISTS public.idx_nouveaux_sites_code_postal;
DROP INDEX IF EXISTS public.idx_nouveaux_sites_code_naf;
DROP INDEX IF EXISTS public.idx_nouveaux_sites_categorie_entreprise;
DROP INDEX IF EXISTS public.idx_nouveaux_sites_location;
DROP INDEX IF EXISTS public.idx_nouveaux_sites_date_creation;
DROP INDEX IF EXISTS public.idx_nouveaux_sites_ville;
DROP INDEX IF EXISTS public.idx_nouveaux_sites_est_siege;
DROP INDEX IF EXISTS public.idx_nouveaux_sites_departement;
DROP INDEX IF EXISTS public.idx_nouveaux_sites_coords;

-- 4. Supprimer la table et toutes ses dépendances
DROP TABLE IF EXISTS public.nouveaux_sites CASCADE;

-- 5. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Table nouveaux_sites supprimée avec succès';
  RAISE NOTICE '✅ Tous les indexes, triggers et policies ont été supprimés';
  RAISE NOTICE '⚠️  Toutes les données ont été effacées définitivement';
END $$;
