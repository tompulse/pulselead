-- ═══════════════════════════════════════════════════════════════════
-- CONFIGURATION RLS ET INDEXES pour PULSE SaaS
-- ⚠️ Exécute d'abord AJOUTER_COLONNES_MANQUANTES.sql si colonnes manquent
-- ═══════════════════════════════════════════════════════════════════

-- 1. ACTIVER RLS (Row Level Security)
ALTER TABLE nouveaux_sites ENABLE ROW LEVEL SECURITY;

-- 2. CRÉER POLICY POUR AUTHENTICATED USERS
DROP POLICY IF EXISTS "Authenticated users can view nouveaux sites" ON nouveaux_sites;
CREATE POLICY "Authenticated users can view nouveaux sites"
  ON nouveaux_sites
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. CRÉER INDEX SUR archived (PERFORMANCE CRITIQUE)
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_archived 
  ON nouveaux_sites(archived) 
  WHERE archived = false;

-- 7. CRÉER INDEX SUR random_order (PERFORMANCE)
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_random_order 
  ON nouveaux_sites(random_order);

-- 8. CRÉER INDEX SUR siret (PERFORMANCE)
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_siret 
  ON nouveaux_sites(siret);

-- 9. CRÉER INDEX SUR code_postal (FILTRES)
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_code_postal 
  ON nouveaux_sites(code_postal);

-- 10. CRÉER INDEX SUR code_naf (FILTRES)
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_code_naf 
  ON nouveaux_sites(code_naf);

-- 11. CRÉER INDEX SUR ville (RECHERCHE)
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_ville 
  ON nouveaux_sites(ville);

-- 12. CRÉER INDEX SUR nom (RECHERCHE)
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_nom 
  ON nouveaux_sites USING gin(to_tsvector('french', nom));

-- 13. CRÉER INDEX SUR coordonnées GPS (TOURNÉES)
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_coords 
  ON nouveaux_sites(latitude, longitude) 
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 14. VÉRIFICATION FINALE
SELECT 
  '✅ CONFIGURATION TERMINÉE' as status,
  COUNT(*) as total_prospects,
  COUNT(CASE WHEN COALESCE(archived, false) = false THEN 1 END) as actifs,
  COUNT(latitude) as avec_gps
FROM nouveaux_sites;

-- 15. MESSAGE FINAL
DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '✅ Table nouveaux_sites configurée pour PULSE';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Prochaines étapes:';
  RAISE NOTICE '1. Rafraîchis ton app PULSE';
  RAISE NOTICE '2. Va dans Prospects';
  RAISE NOTICE '3. Tes 57k prospects devraient être visibles!';
  RAISE NOTICE '';
END $$;
