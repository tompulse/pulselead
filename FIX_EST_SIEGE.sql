-- 🔧 Correction de la colonne est_siege

-- Étape 1: Vérifier le type actuel de la colonne
SELECT 
  column_name, 
  data_type, 
  udt_name
FROM information_schema.columns 
WHERE table_name = 'nouveaux_sites' 
  AND column_name = 'est_siege';

-- Étape 2: Vérifier les valeurs actuelles
SELECT 
  est_siege::TEXT as valeur_texte,
  COUNT(*) as nombre
FROM nouveaux_sites
GROUP BY est_siege::TEXT
ORDER BY nombre DESC;

-- Étape 3: Si la colonne est TEXT, la convertir en BOOLEAN
-- D'abord changer le type si nécessaire
DO $$
BEGIN
  -- Vérifier si la colonne existe et est de type TEXT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' 
      AND column_name = 'est_siege'
      AND data_type IN ('text', 'character varying')
  ) THEN
    -- Nettoyer les valeurs avant conversion
    UPDATE nouveaux_sites 
    SET est_siege = CASE 
      WHEN UPPER(est_siege::TEXT) IN ('VRAI', 'TRUE', '1', 'OUI', 'V') THEN 'true'
      WHEN UPPER(est_siege::TEXT) IN ('FAUX', 'FALSE', '0', 'NON', 'F') THEN 'false'
      ELSE 'false'
    END
    WHERE est_siege IS NOT NULL;
    
    -- Convertir en BOOLEAN
    ALTER TABLE nouveaux_sites 
    ALTER COLUMN est_siege TYPE BOOLEAN 
    USING CASE 
      WHEN est_siege::TEXT IN ('true', 't', 'TRUE', '1') THEN true
      ELSE false
    END;
    
    RAISE NOTICE '✅ Colonne convertie en BOOLEAN';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' 
      AND column_name = 'est_siege'
      AND data_type = 'boolean'
  ) THEN
    RAISE NOTICE '✅ Colonne déjà en BOOLEAN, vérification des valeurs...';
  END IF;
END $$;

-- Étape 4: Si la colonne est déjà BOOLEAN, mettre false par défaut pour les NULL
UPDATE nouveaux_sites
SET est_siege = false
WHERE est_siege IS NULL;

-- Étape 5: Vérification finale
SELECT 
  est_siege,
  COUNT(*) as nombre,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as pourcentage
FROM nouveaux_sites
GROUP BY est_siege
ORDER BY est_siege DESC;

-- ✅ Résultat: true = siège, false = site
