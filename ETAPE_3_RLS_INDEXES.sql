-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 3 : ACTIVER RLS ET CRÉER INDEXES (Performance + Sécurité)
-- ═══════════════════════════════════════════════════════════════════

SELECT '🚀 DÉBUT CONFIGURATION RLS + INDEXES' as status;

-- 1️⃣ ACTIVER ROW LEVEL SECURITY
ALTER TABLE nouveaux_sites ENABLE ROW LEVEL SECURITY;
SELECT '✅ RLS activé' as status;

-- 2️⃣ SUPPRIMER ANCIENNES POLICIES (si existent)
DROP POLICY IF EXISTS "Authenticated users can view nouveaux sites" ON nouveaux_sites;
DROP POLICY IF EXISTS "Enable read access for all users" ON nouveaux_sites;
SELECT '✅ Anciennes policies supprimées' as status;

-- 3️⃣ CRÉER POLICY POUR UTILISATEURS AUTHENTIFIÉS
CREATE POLICY "Authenticated users can view nouveaux sites"
  ON nouveaux_sites
  FOR SELECT
  TO authenticated
  USING (true);
SELECT '✅ Policy créée pour authenticated users' as status;

-- 4️⃣ CRÉER INDEX SUR archived (CRITICAL)
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_archived 
  ON nouveaux_sites(archived) 
  WHERE archived = false;
SELECT '✅ Index archived créé' as status;

-- 5️⃣ CRÉER INDEX SUR random_order
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_random_order 
  ON nouveaux_sites(random_order);
SELECT '✅ Index random_order créé' as status;

-- 6️⃣ CRÉER INDEX SUR siret
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_siret 
  ON nouveaux_sites(siret);
SELECT '✅ Index siret créé' as status;

-- 7️⃣ CRÉER INDEX SUR id
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_id 
  ON nouveaux_sites(id);
SELECT '✅ Index id créé' as status;

-- 8️⃣ CRÉER INDEXES OPTIONNELS (si colonnes existent)
DO $$
BEGIN
  -- Index sur code_postal
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'code_postal') THEN
    CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_code_postal ON nouveaux_sites(code_postal);
    RAISE NOTICE '✅ Index code_postal créé';
  END IF;
  
  -- Index sur ville
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'ville') THEN
    CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_ville ON nouveaux_sites(ville);
    RAISE NOTICE '✅ Index ville créé';
  END IF;
  
  -- Index sur code_naf
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'code_naf') THEN
    CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_code_naf ON nouveaux_sites(code_naf);
    RAISE NOTICE '✅ Index code_naf créé';
  END IF;
  
  -- Index sur latitude/longitude (pour tournées GPS)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'latitude') THEN
    CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_coords 
      ON nouveaux_sites(latitude, longitude) 
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
    RAISE NOTICE '✅ Index coords GPS créé';
  END IF;
END $$;

-- 9️⃣ VÉRIFICATION FINALE
SELECT '✅ CONFIGURATION TERMINÉE' as status;

SELECT 
  'RLS' as element,
  COUNT(*) as nombre,
  'policies actives' as description
FROM pg_policies 
WHERE tablename = 'nouveaux_sites'
UNION ALL
SELECT 
  'INDEXES',
  COUNT(*),
  'indexes créés'
FROM pg_indexes 
WHERE tablename = 'nouveaux_sites';

-- 🎉 STATISTIQUES FINALES
SELECT 
  COUNT(*) as total_prospects,
  COUNT(CASE WHEN archived = false THEN 1 END) as prospects_actifs,
  COUNT(id) as avec_id,
  'Prêt pour PULSE!' as status
FROM nouveaux_sites;

SELECT '🎉 TABLE PRÊTE! Rafraîchis PULSE et va dans Prospects' as prochaine_etape;
