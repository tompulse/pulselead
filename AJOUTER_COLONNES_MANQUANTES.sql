-- ═══════════════════════════════════════════════════════════════════
-- AJOUTER COLONNES MANQUANTES pour PULSE SaaS
-- Exécute ce script après VERIFY_TABLE_SIMPLE.sql
-- ═══════════════════════════════════════════════════════════════════

-- 1. AJOUTER COLONNE id (UUID) - CLÉ PRIMAIRE
DO $$ 
BEGIN
  -- Vérifier si id existe déjà
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'nouveaux_sites' 
      AND column_name = 'id'
  ) THEN
    -- Ajouter colonne id
    ALTER TABLE nouveaux_sites ADD COLUMN id UUID DEFAULT gen_random_uuid();
    
    -- Générer des UUID pour les lignes existantes
    UPDATE nouveaux_sites SET id = gen_random_uuid() WHERE id IS NULL;
    
    -- Rendre NOT NULL et définir comme clé primaire
    ALTER TABLE nouveaux_sites ALTER COLUMN id SET NOT NULL;
    
    -- Si pas de clé primaire existante, définir id comme clé primaire
    BEGIN
      ALTER TABLE nouveaux_sites ADD PRIMARY KEY (id);
      RAISE NOTICE '✅ Colonne id ajoutée et définie comme clé primaire';
    EXCEPTION
      WHEN others THEN
        RAISE NOTICE '✅ Colonne id ajoutée (clé primaire déjà existante sur siret)';
    END;
  ELSE
    RAISE NOTICE '✓ Colonne id déjà présente';
  END IF;
END $$;

-- 2. AJOUTER COLONNE archived (OBLIGATOIRE pour PULSE)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'archived'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN archived BOOLEAN DEFAULT false;
    UPDATE nouveaux_sites SET archived = false WHERE archived IS NULL;
    RAISE NOTICE '✅ Colonne archived ajoutée';
  ELSE
    RAISE NOTICE '✓ Colonne archived déjà présente';
  END IF;
END $$;

-- 3. AJOUTER COLONNE random_order (Pour diversité affichage)
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

-- 4. AJOUTER COLONNE created_at (Horodatage)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    UPDATE nouveaux_sites SET created_at = now() WHERE created_at IS NULL;
    RAISE NOTICE '✅ Colonne created_at ajoutée';
  ELSE
    RAISE NOTICE '✓ Colonne created_at déjà présente';
  END IF;
END $$;

-- 5. AJOUTER COLONNE updated_at (Horodatage)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    UPDATE nouveaux_sites SET updated_at = now() WHERE updated_at IS NULL;
    RAISE NOTICE '✅ Colonne updated_at ajoutée';
  ELSE
    RAISE NOTICE '✓ Colonne updated_at déjà présente';
  END IF;
END $$;

-- 6. AJOUTER COLONNES NAF HIÉRARCHIE
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'naf_section'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN naf_section TEXT;
    RAISE NOTICE '✅ Colonne naf_section ajoutée';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'naf_division'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN naf_division TEXT;
    RAISE NOTICE '✅ Colonne naf_division ajoutée';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'naf_groupe'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN naf_groupe TEXT;
    RAISE NOTICE '✅ Colonne naf_groupe ajoutée';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'naf_classe'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN naf_classe TEXT;
    RAISE NOTICE '✅ Colonne naf_classe ajoutée';
  END IF;
END $$;

-- 7. AJOUTER COLONNE adresse SI MANQUANTE
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'adresse'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN adresse TEXT;
    
    -- Reconstruire l'adresse à partir des colonnes existantes
    UPDATE nouveaux_sites SET adresse = 
      TRIM(CONCAT_WS(' ', 
        COALESCE(numeroVoieEtablissement, numero_voie, ''),
        COALESCE(typeVoieEtablissement, type_voie, ''),
        COALESCE(libelleVoieEtablissement, libelle_voie, '')
      ))
    WHERE adresse IS NULL;
    
    RAISE NOTICE '✅ Colonne adresse ajoutée et remplie';
  ELSE
    RAISE NOTICE '✓ Colonne adresse déjà présente';
  END IF;
END $$;

-- 8. RENOMMER COLONNES SI NÉCESSAIRE (mapping CSV → PULSE)
DO $$ 
BEGIN
  -- Renommer 'entreprise' en 'nom' si nécessaire
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'entreprise'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'nom'
  ) THEN
    ALTER TABLE nouveaux_sites RENAME COLUMN entreprise TO nom;
    RAISE NOTICE '✅ Colonne entreprise renommée en nom';
  END IF;
  
  -- Renommer 'siege' en 'est_siege' si nécessaire
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'siege'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' AND column_name = 'est_siege'
  ) THEN
    -- D'abord convertir VRAI/FAUX en boolean
    ALTER TABLE nouveaux_sites ADD COLUMN est_siege BOOLEAN;
    UPDATE nouveaux_sites SET est_siege = 
      CASE 
        WHEN UPPER(siege::text) IN ('VRAI', 'TRUE', '1', 'V', 'T', 'OUI') THEN true
        ELSE false
      END;
    ALTER TABLE nouveaux_sites DROP COLUMN siege;
    RAISE NOTICE '✅ Colonne siege convertie en est_siege (boolean)';
  END IF;
  
  -- Renommer colonnes établissement vers format court
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'codePostalEtablissement') THEN
    ALTER TABLE nouveaux_sites RENAME COLUMN "codePostalEtablissement" TO code_postal;
    RAISE NOTICE '✅ Colonne codePostalEtablissement renommée';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'libelleCommuneEtablissement') THEN
    ALTER TABLE nouveaux_sites RENAME COLUMN "libelleCommuneEtablissement" TO ville;
    RAISE NOTICE '✅ Colonne libelleCommuneEtablissement renommée';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nouveaux_sites' AND column_name = 'activitePrincipaleEtablissement') THEN
    ALTER TABLE nouveaux_sites RENAME COLUMN "activitePrincipaleEtablissement" TO code_naf;
    RAISE NOTICE '✅ Colonne activitePrincipaleEtablissement renommée';
  END IF;
  
END $$;

-- 9. VÉRIFICATION FINALE
SELECT 
  '✅ COLONNES AJOUTÉES' as status,
  COUNT(*) as total_lignes,
  COUNT(DISTINCT id) as ids_uniques,
  COUNT(CASE WHEN archived = false THEN 1 END) as prospects_actifs
FROM nouveaux_sites;

-- 10. MESSAGE FINAL
DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '✅ Colonnes ajoutées avec succès!';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Prochaine étape: Exécute FIX_TABLE_POUR_PULSE.sql';
  RAISE NOTICE 'pour configurer RLS et indexes';
  RAISE NOTICE '';
END $$;
