-- 🔍 VÉRIFIER et CRÉER la colonne date_relance si nécessaire

-- 1️⃣ Vérifier la structure de lead_interactions
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'lead_interactions'
ORDER BY ordinal_position;

-- 2️⃣ Créer la colonne date_relance si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lead_interactions' 
    AND column_name = 'date_relance'
  ) THEN
    ALTER TABLE lead_interactions ADD COLUMN date_relance TIMESTAMPTZ;
    RAISE NOTICE 'Colonne date_relance créée';
  ELSE
    RAISE NOTICE 'Colonne date_relance existe déjà';
  END IF;
END $$;

-- 3️⃣ Créer un index sur date_relance pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_lead_interactions_date_relance 
ON lead_interactions(date_relance) 
WHERE date_relance IS NOT NULL;

-- 4️⃣ Vérification finale
SELECT 
  'État de lead_interactions' as info,
  COUNT(*) as total_interactions,
  COUNT(date_relance) as avec_date_relance,
  COUNT(*) - COUNT(date_relance) as sans_date_relance
FROM lead_interactions;

-- ✅ La colonne date_relance est maintenant disponible
