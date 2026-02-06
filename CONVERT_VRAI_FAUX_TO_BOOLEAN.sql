-- 🔧 Conversion VRAI/FAUX → true/false

-- Étape 1: Vérifier le type actuel
SELECT 
  data_type,
  COUNT(*) as nombre
FROM information_schema.columns 
WHERE table_name = 'nouveaux_sites' 
  AND column_name = 'est_siege'
GROUP BY data_type;

-- Étape 2: Afficher les valeurs actuelles
SELECT 
  est_siege::TEXT as valeur_brute,
  COUNT(*) as nombre
FROM nouveaux_sites
GROUP BY est_siege::TEXT
ORDER BY nombre DESC;

-- Étape 3: Si c'est du TEXT avec VRAI/FAUX, convertir en boolean
DO $$
DECLARE
  col_type TEXT;
BEGIN
  -- Récupérer le type de la colonne
  SELECT data_type INTO col_type
  FROM information_schema.columns 
  WHERE table_name = 'nouveaux_sites' 
    AND column_name = 'est_siege';
  
  IF col_type IN ('text', 'character varying') THEN
    -- Convertir directement en boolean
    ALTER TABLE nouveaux_sites 
    ALTER COLUMN est_siege TYPE BOOLEAN 
    USING CASE 
      WHEN UPPER(est_siege) IN ('VRAI', 'TRUE', '1', 'OUI', 'V', 'T') THEN true
      ELSE false
    END;
    
    RAISE NOTICE '✅ Colonne convertie de TEXT vers BOOLEAN';
  ELSE
    RAISE NOTICE 'ℹ️ Colonne déjà en BOOLEAN (type: %)', col_type;
  END IF;
END $$;

-- Étape 4: Vérification finale
SELECT 
  est_siege,
  COUNT(*) as nombre,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as pourcentage
FROM nouveaux_sites
GROUP BY est_siege
ORDER BY est_siege DESC;

-- ✅ Résultat attendu:
-- true = ~41k (sièges)
-- false = ~4k (sites)
