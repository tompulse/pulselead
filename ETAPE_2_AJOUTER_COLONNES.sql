-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 2 : AJOUTER COLONNES MANQUANTES (Version ultra-sûre)
-- ═══════════════════════════════════════════════════════════════════

SELECT '🚀 DÉBUT AJOUT COLONNES' as status;

-- 1️⃣ AJOUTER COLONNE id (UUID, CLÉ PRIMAIRE)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'id'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN id UUID DEFAULT gen_random_uuid();
    UPDATE nouveaux_sites SET id = gen_random_uuid() WHERE id IS NULL;
    ALTER TABLE nouveaux_sites ALTER COLUMN id SET NOT NULL;
    
    -- Essayer d'ajouter comme clé primaire (ignore si siret est déjà clé primaire)
    BEGIN
      ALTER TABLE nouveaux_sites ADD PRIMARY KEY (id);
      RAISE NOTICE '✅ Colonne id ajoutée et définie comme clé primaire';
    EXCEPTION
      WHEN others THEN
        RAISE NOTICE '✅ Colonne id ajoutée (autre clé primaire existante)';
    END;
  ELSE
    RAISE NOTICE '✓ Colonne id déjà présente';
  END IF;
END $$;

-- 2️⃣ AJOUTER COLONNE archived
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'archived'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN archived BOOLEAN DEFAULT false;
    UPDATE nouveaux_sites SET archived = false;
    RAISE NOTICE '✅ Colonne archived ajoutée';
  ELSE
    RAISE NOTICE '✓ Colonne archived déjà présente';
  END IF;
END $$;

-- 3️⃣ AJOUTER COLONNE random_order
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'random_order'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN random_order FLOAT;
    UPDATE nouveaux_sites SET random_order = random();
    RAISE NOTICE '✅ Colonne random_order ajoutée';
  ELSE
    RAISE NOTICE '✓ Colonne random_order déjà présente';
  END IF;
END $$;

-- 4️⃣ AJOUTER COLONNE created_at
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    RAISE NOTICE '✅ Colonne created_at ajoutée';
  ELSE
    RAISE NOTICE '✓ Colonne created_at déjà présente';
  END IF;
END $$;

-- 5️⃣ AJOUTER COLONNE updated_at
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    RAISE NOTICE '✅ Colonne updated_at ajoutée';
  ELSE
    RAISE NOTICE '✓ Colonne updated_at déjà présente';
  END IF;
END $$;

-- 6️⃣ RENOMMER 'entreprise' en 'nom' SI NÉCESSAIRE
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'entreprise'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'nom'
  ) THEN
    ALTER TABLE nouveaux_sites RENAME COLUMN entreprise TO nom;
    RAISE NOTICE '✅ Colonne entreprise renommée en nom';
  ELSE
    RAISE NOTICE '✓ Colonne nom OK';
  END IF;
END $$;

-- 7️⃣ CONVERTIR 'siege' (TEXT) en 'est_siege' (BOOLEAN)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' 
      AND column_name = 'siege'
      AND data_type IN ('text', 'character varying')
  ) THEN
    -- Ajouter nouvelle colonne boolean
    ALTER TABLE nouveaux_sites ADD COLUMN est_siege BOOLEAN;
    
    -- Convertir VRAI/FAUX en true/false
    UPDATE nouveaux_sites SET est_siege = 
      CASE 
        WHEN UPPER(siege) IN ('VRAI', 'TRUE', '1', 'V', 'T', 'OUI') THEN true
        ELSE false
      END;
    
    -- Supprimer ancienne colonne
    ALTER TABLE nouveaux_sites DROP COLUMN siege;
    
    RAISE NOTICE '✅ Colonne siege convertie en est_siege (boolean)';
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'est_siege'
  ) THEN
    -- Si ni siege ni est_siege n'existe, créer est_siege
    ALTER TABLE nouveaux_sites ADD COLUMN est_siege BOOLEAN DEFAULT false;
    RAISE NOTICE '✅ Colonne est_siege créée';
  ELSE
    RAISE NOTICE '✓ Colonne est_siege OK';
  END IF;
END $$;

-- 8️⃣ CONVERTIR siret EN TEXT (CRITIQUE pour PULSE)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' 
      AND column_name = 'siret'
      AND data_type NOT IN ('text', 'character varying')
  ) THEN
    ALTER TABLE nouveaux_sites ALTER COLUMN siret TYPE TEXT USING siret::TEXT;
    RAISE NOTICE '✅ siret converti en TEXT (fix e.siret.replace error)';
  ELSE
    RAISE NOTICE '✓ siret déjà TEXT';
  END IF;
END $$;

-- 9️⃣ CONVERTIR code_postal EN TEXT
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' 
      AND column_name IN ('code_postal', 'codePostalEtablissement')
      AND data_type NOT IN ('text', 'character varying')
  ) THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'code_postal') THEN
      ALTER TABLE nouveaux_sites ALTER COLUMN code_postal TYPE TEXT USING code_postal::TEXT;
      RAISE NOTICE '✅ code_postal converti en TEXT';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'codePostalEtablissement') THEN
      ALTER TABLE nouveaux_sites ALTER COLUMN "codePostalEtablissement" TYPE TEXT USING "codePostalEtablissement"::TEXT;
      RAISE NOTICE '✅ codePostalEtablissement converti en TEXT';
    END IF;
  ELSE
    RAISE NOTICE '✓ code_postal déjà TEXT';
  END IF;
END $$;

-- 🔟 VÉRIFICATION FINALE
SELECT '✅ COLONNES AJOUTÉES - Vérification:' as status;
SELECT 
  COUNT(*) as total_lignes,
  COUNT(id) as avec_id,
  COUNT(CASE WHEN archived = false THEN 1 END) as prospects_actifs
FROM nouveaux_sites;

SELECT '🎯 PROCHAINE ÉTAPE: Exécute ETAPE_3_RLS_INDEXES.sql' as action;
