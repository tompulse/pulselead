-- ═══════════════════════════════════════════════════════════════════
-- SCRIPT DE CORRECTION TABLE nouveaux_sites pour PULSE SaaS
-- Exécute ce script si VERIFY_TABLE_NOUVEAUX_SITES.sql détecte des problèmes
-- ═══════════════════════════════════════════════════════════════════

-- 1. AJOUTER COLONNE archived SI MANQUANTE (OBLIGATOIRE)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'nouveaux_sites' 
      AND column_name = 'archived'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN archived BOOLEAN DEFAULT false;
    UPDATE nouveaux_sites SET archived = false WHERE archived IS NULL;
    RAISE NOTICE '✅ Colonne archived ajoutée';
  ELSE
    RAISE NOTICE '✓ Colonne archived déjà présente';
  END IF;
END $$;

-- 2. AJOUTER COLONNE random_order SI MANQUANTE (Recommandé)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'nouveaux_sites' 
      AND column_name = 'random_order'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN random_order FLOAT DEFAULT random();
    UPDATE nouveaux_sites SET random_order = random() WHERE random_order IS NULL;
    RAISE NOTICE '✅ Colonne random_order ajoutée';
  ELSE
    RAISE NOTICE '✓ Colonne random_order déjà présente';
  END IF;
END $$;

-- 3. AJOUTER COLONNES NAF HIÉRARCHIE SI MANQUANTES
DO $$ 
BEGIN
  -- naf_section
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'naf_section'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN naf_section TEXT;
    RAISE NOTICE '✅ Colonne naf_section ajoutée';
  END IF;
  
  -- naf_division
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'naf_division'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN naf_division TEXT;
    RAISE NOTICE '✅ Colonne naf_division ajoutée';
  END IF;
  
  -- naf_groupe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'naf_groupe'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN naf_groupe TEXT;
    RAISE NOTICE '✅ Colonne naf_groupe ajoutée';
  END IF;
  
  -- naf_classe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'naf_classe'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN naf_classe TEXT;
    RAISE NOTICE '✅ Colonne naf_classe ajoutée';
  END IF;
END $$;

-- 4. ACTIVER RLS SI PAS DÉJÀ ACTIVÉ
ALTER TABLE nouveaux_sites ENABLE ROW LEVEL SECURITY;

-- 5. CRÉER POLICY POUR AUTHENTICATED USERS
DROP POLICY IF EXISTS "Authenticated users can view nouveaux sites" ON nouveaux_sites;
CREATE POLICY "Authenticated users can view nouveaux sites"
  ON nouveaux_sites
  FOR SELECT
  TO authenticated
  USING (true);

-- 6. CRÉER INDEX SUR archived (PERFORMANCE CRITIQUE)
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
