-- 🎲 Ajouter une colonne random_order pour mélanger les prospects

-- Étape 1: Ajouter la colonne si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' 
      AND column_name = 'random_order'
  ) THEN
    ALTER TABLE nouveaux_sites 
    ADD COLUMN random_order DOUBLE PRECISION;
    
    RAISE NOTICE '✅ Colonne random_order ajoutée';
  ELSE
    RAISE NOTICE 'ℹ️ Colonne random_order existe déjà';
  END IF;
END $$;

-- Étape 2: Générer des valeurs aléatoires pour chaque prospect
UPDATE nouveaux_sites
SET random_order = RANDOM();

-- Étape 3: Créer un index pour accélérer les requêtes
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_random_order 
ON nouveaux_sites(random_order);

-- Étape 4: Vérifier la distribution
SELECT 
  FLOOR(random_order * 10) as bucket,
  COUNT(*) as nombre
FROM nouveaux_sites
GROUP BY FLOOR(random_order * 10)
ORDER BY bucket;

-- ✅ Maintenant tu peux trier par random_order pour avoir un ordre mélangé mais stable
