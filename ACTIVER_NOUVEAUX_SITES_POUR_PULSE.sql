-- ═══════════════════════════════════════════════════════════════════
-- Rendre la table nouveaux_sites visible par tous les users PULSE
-- À exécuter une fois dans Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- 1. Activer RLS
ALTER TABLE nouveaux_sites ENABLE ROW LEVEL SECURITY;

-- 2. Policy : tout utilisateur connecté peut lire les prospects
DROP POLICY IF EXISTS "Authenticated users can view nouveaux sites" ON nouveaux_sites;
DROP POLICY IF EXISTS "Enable read access for all users" ON nouveaux_sites;

CREATE POLICY "Authenticated users can view nouveaux sites"
  ON nouveaux_sites
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. Colonnes optionnelles si absentes (pour un affichage optimal)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'nouveaux_sites' AND column_name = 'archived') THEN
    ALTER TABLE nouveaux_sites ADD COLUMN archived boolean DEFAULT false;
    RAISE NOTICE 'Colonne archived ajoutée';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'nouveaux_sites' AND column_name = 'random_order') THEN
    ALTER TABLE nouveaux_sites ADD COLUMN random_order double precision DEFAULT random();
    RAISE NOTICE 'Colonne random_order ajoutée';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'nouveaux_sites' AND column_name = 'id') THEN
    ALTER TABLE nouveaux_sites ADD COLUMN id uuid DEFAULT gen_random_uuid();
    RAISE NOTICE 'Colonne id ajoutée';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'nouveaux_sites' AND column_name = 'nom')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'nouveaux_sites' AND column_name = 'entreprise') THEN
    ALTER TABLE nouveaux_sites ADD COLUMN nom text;
    UPDATE nouveaux_sites SET nom = entreprise WHERE nom IS NULL;
    RAISE NOTICE 'Colonne nom ajoutée (copie de entreprise)';
  END IF;
END $$;

SELECT 'OK – Les users PULSE peuvent voir les prospects (nouveaux_sites).' AS status;
