-- ═══════════════════════════════════════════════════════════════════
-- 🚀 CONFIGURATION COMPLÈTE EN 1 SEULE COMMANDE
-- Copie-colle ce script dans Supabase SQL Editor et exécute
-- ═══════════════════════════════════════════════════════════════════

SELECT '🚀 DÉBUT CONFIGURATION COMPLÈTE' as status;

-- ═══════════════════════════════════════════════════════════════════
-- PARTIE 1: CONVERSION DES TYPES (FIX erreur e.siret.replace)
-- ═══════════════════════════════════════════════════════════════════

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE 'PARTIE 1: CONVERSION DES TYPES';
  RAISE NOTICE '═══════════════════════════════════════════════';
  
  -- Convertir siret en TEXT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'siret'
      AND data_type NOT IN ('text', 'character varying')
  ) THEN
    ALTER TABLE nouveaux_sites ALTER COLUMN siret TYPE TEXT USING siret::TEXT;
    RAISE NOTICE '✅ siret converti en TEXT';
  ELSE
    RAISE NOTICE '✓ siret déjà TEXT';
  END IF;
  
  -- Convertir code_postal en TEXT
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'codePostalEtablissement') THEN
    ALTER TABLE nouveaux_sites ALTER COLUMN "codePostalEtablissement" TYPE TEXT USING "codePostalEtablissement"::TEXT;
    RAISE NOTICE '✅ codePostalEtablissement converti en TEXT';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'code_postal') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'nouveaux_sites' AND column_name = 'code_postal'
        AND data_type NOT IN ('text', 'character varying')
    ) THEN
      ALTER TABLE nouveaux_sites ALTER COLUMN code_postal TYPE TEXT USING code_postal::TEXT;
      RAISE NOTICE '✅ code_postal converti en TEXT';
    END IF;
  END IF;
  
  -- Convertir activitePrincipaleEtablissement en TEXT
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'activitePrincipaleEtablissement') THEN
    ALTER TABLE nouveaux_sites ALTER COLUMN "activitePrincipaleEtablissement" TYPE TEXT USING "activitePrincipaleEtablissement"::TEXT;
    RAISE NOTICE '✅ activitePrincipaleEtablissement converti en TEXT';
  END IF;
  
  -- Convertir categorie_juridique en TEXT
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'categorie_juridique') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'nouveaux_sites' AND column_name = 'categorie_juridique'
        AND data_type NOT IN ('text', 'character varying')
    ) THEN
      ALTER TABLE nouveaux_sites ALTER COLUMN categorie_juridique TYPE TEXT USING categorie_juridique::TEXT;
      RAISE NOTICE '✅ categorie_juridique converti en TEXT';
    END IF;
  END IF;
  
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- PARTIE 2: AJOUT COLONNES OBLIGATOIRES PULSE
-- ═══════════════════════════════════════════════════════════════════

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE 'PARTIE 2: AJOUT COLONNES PULSE';
  RAISE NOTICE '═══════════════════════════════════════════════';
  
  -- Colonne id (UUID, clé primaire)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'id') THEN
    ALTER TABLE nouveaux_sites ADD COLUMN id UUID DEFAULT gen_random_uuid();
    UPDATE nouveaux_sites SET id = gen_random_uuid() WHERE id IS NULL;
    ALTER TABLE nouveaux_sites ALTER COLUMN id SET NOT NULL;
    RAISE NOTICE '✅ Colonne id ajoutée';
  END IF;
  
  -- Colonne archived
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'archived') THEN
    ALTER TABLE nouveaux_sites ADD COLUMN archived BOOLEAN DEFAULT false;
    UPDATE nouveaux_sites SET archived = false;
    RAISE NOTICE '✅ Colonne archived ajoutée';
  END IF;
  
  -- Colonne random_order
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'random_order') THEN
    ALTER TABLE nouveaux_sites ADD COLUMN random_order FLOAT;
    UPDATE nouveaux_sites SET random_order = random();
    RAISE NOTICE '✅ Colonne random_order ajoutée';
  END IF;
  
  -- Colonne created_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'created_at') THEN
    ALTER TABLE nouveaux_sites ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    RAISE NOTICE '✅ Colonne created_at ajoutée';
  END IF;
  
  -- Colonne updated_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'updated_at') THEN
    ALTER TABLE nouveaux_sites ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    RAISE NOTICE '✅ Colonne updated_at ajoutée';
  END IF;
  
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- PARTIE 3: RENOMMAGE COLONNES
-- ═══════════════════════════════════════════════════════════════════

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE 'PARTIE 3: RENOMMAGE COLONNES';
  RAISE NOTICE '═══════════════════════════════════════════════';
  
  -- Renommer entreprise → nom
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'entreprise')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'nom') THEN
    ALTER TABLE nouveaux_sites RENAME COLUMN entreprise TO nom;
    RAISE NOTICE '✅ entreprise renommé en nom';
  END IF;
  
  -- Convertir siege (TEXT) → est_siege (BOOLEAN)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'siege'
      AND data_type IN ('text', 'character varying')
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN est_siege BOOLEAN;
    UPDATE nouveaux_sites SET est_siege = 
      CASE WHEN UPPER(siege) IN ('VRAI', 'TRUE', '1', 'V', 'OUI') THEN true ELSE false END;
    ALTER TABLE nouveaux_sites DROP COLUMN siege;
    RAISE NOTICE '✅ siege converti en est_siege (boolean)';
  END IF;
  
  -- Renommer colonnes longues si existent
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'codePostalEtablissement')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'code_postal') THEN
    ALTER TABLE nouveaux_sites RENAME COLUMN "codePostalEtablissement" TO code_postal;
    RAISE NOTICE '✅ codePostalEtablissement renommé en code_postal';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'libelleCommuneEtablissement')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'ville') THEN
    ALTER TABLE nouveaux_sites RENAME COLUMN "libelleCommuneEtablissement" TO ville;
    RAISE NOTICE '✅ libelleCommuneEtablissement renommé en ville';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'activitePrincipaleEtablissement')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'code_naf') THEN
    ALTER TABLE nouveaux_sites RENAME COLUMN "activitePrincipaleEtablissement" TO code_naf;
    RAISE NOTICE '✅ activitePrincipaleEtablissement renommé en code_naf';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'categorieEntreprise')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'categorie_entreprise') THEN
    ALTER TABLE nouveaux_sites RENAME COLUMN "categorieEntreprise" TO categorie_entreprise;
    RAISE NOTICE '✅ categorieEntreprise renommé en categorie_entreprise';
  END IF;
  
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- PARTIE 4: ACTIVER RLS + POLICY
-- ═══════════════════════════════════════════════════════════════════

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE 'PARTIE 4: SÉCURITÉ (RLS)';
  RAISE NOTICE '═══════════════════════════════════════════════';
END $$;

ALTER TABLE nouveaux_sites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view nouveaux sites" ON nouveaux_sites;
CREATE POLICY "Authenticated users can view nouveaux sites"
  ON nouveaux_sites FOR SELECT TO authenticated USING (true);

SELECT '✅ RLS activé + Policy créée' as status;

-- ═══════════════════════════════════════════════════════════════════
-- PARTIE 5: INDEXES (PERFORMANCE)
-- ═══════════════════════════════════════════════════════════════════

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE 'PARTIE 5: INDEXES (Performance)';
  RAISE NOTICE '═══════════════════════════════════════════════';
END $$;

CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_id ON nouveaux_sites(id);
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_siret ON nouveaux_sites(siret);
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_archived ON nouveaux_sites(archived) WHERE archived = false;
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_random_order ON nouveaux_sites(random_order);
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_code_postal ON nouveaux_sites(code_postal);
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_ville ON nouveaux_sites(ville);
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_code_naf ON nouveaux_sites(code_naf);

SELECT '✅ 7 indexes créés' as status;

-- ═══════════════════════════════════════════════════════════════════
-- VÉRIFICATION FINALE ET STATISTIQUES
-- ═══════════════════════════════════════════════════════════════════

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '🎉 CONFIGURATION TERMINÉE AVEC SUCCÈS!';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Types de colonnes corrigés (siret → TEXT)';
  RAISE NOTICE '✅ Colonnes PULSE ajoutées (id, archived, random_order)';
  RAISE NOTICE '✅ Colonnes renommées (entreprise → nom, etc.)';
  RAISE NOTICE '✅ RLS activé + Policy créée';
  RAISE NOTICE '✅ 7 indexes créés pour performance';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 PROCHAINE ÉTAPE:';
  RAISE NOTICE '   1. Rafraîchis PULSE (Ctrl+F5)';
  RAISE NOTICE '   2. Va dans Prospects';
  RAISE NOTICE '   3. Tes prospects sont là! 🚀';
  RAISE NOTICE '';
END $$;

-- Statistiques finales
SELECT 
  'STATISTIQUES FINALES' as titre,
  COUNT(*) as total_prospects,
  COUNT(CASE WHEN archived = false THEN 1 END) as prospects_actifs,
  COUNT(id) as avec_id_uuid,
  pg_typeof(siret) as type_siret,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'nouveaux_sites') as nb_policies,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'nouveaux_sites') as nb_indexes
FROM nouveaux_sites
LIMIT 1;

-- Échantillon de données
SELECT 
  '📋 ÉCHANTILLON (3 premières lignes):' as titre;

SELECT 
  id,
  siret,
  nom,
  ville,
  code_postal,
  archived
FROM nouveaux_sites 
LIMIT 3;

SELECT '🎉 C''EST PRÊT! Rafraîchis PULSE maintenant!' as message_final;
