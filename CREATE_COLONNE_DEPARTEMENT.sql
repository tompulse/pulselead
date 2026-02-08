-- 🆕 CRÉER la colonne departement et la remplir correctement
-- Fix: Filtrage par département qui montre des entreprises du mauvais département

-- 1️⃣ Créer la colonne departement si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nouveaux_sites' 
    AND column_name = 'departement'
  ) THEN
    ALTER TABLE nouveaux_sites ADD COLUMN departement VARCHAR(3);
    RAISE NOTICE 'Colonne departement créée';
  ELSE
    RAISE NOTICE 'Colonne departement existe déjà';
  END IF;
END $$;

-- 2️⃣ Remplir la colonne departement à partir des codes postaux
UPDATE nouveaux_sites
SET departement = CASE 
  -- DOM-TOM: codes postaux à 3 chiffres (97xxx pour DOM, 98xxx pour TOM)
  WHEN code_postal ~ '^9[78]' AND LENGTH(code_postal) >= 3 THEN LEFT(code_postal, 3)
  -- Métropole et Corse: codes postaux à 2 chiffres (01-95, 2A, 2B)
  WHEN LENGTH(code_postal) >= 2 THEN LEFT(code_postal, 2)
  ELSE NULL
END
WHERE code_postal IS NOT NULL;

-- 3️⃣ Statistiques après remplissage
SELECT 
  'Total entreprises' as statut,
  COUNT(*) as nombre
FROM nouveaux_sites

UNION ALL

SELECT 
  'Avec departement rempli' as statut,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE departement IS NOT NULL

UNION ALL

SELECT 
  'Sans departement (pas de code postal)' as statut,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE departement IS NULL;

-- 4️⃣ Répartition par département
SELECT 
  departement,
  COUNT(*) as nombre_entreprises,
  COUNT(DISTINCT ville) as nb_villes,
  array_agg(DISTINCT ville ORDER BY ville) FILTER (WHERE ville IN ('paris', 'lyon', 'marseille', 'toulouse', 'nice', 'nantes', 'bordeaux', 'le haillan')) as villes_importantes
FROM nouveaux_sites
WHERE departement IS NOT NULL
GROUP BY departement
ORDER BY departement;

-- 5️⃣ Créer un index sur departement pour optimiser les filtres
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_departement 
ON nouveaux_sites(departement);

-- 6️⃣ Vérifier quelques départements spécifiques
SELECT 
  departement,
  ville,
  code_postal,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE departement IN ('75', '33', '13', '84', '69')
  AND ville IS NOT NULL
GROUP BY departement, ville, code_postal
ORDER BY departement, ville
LIMIT 50;

-- ✅ La colonne departement est maintenant créée et remplie
-- ✅ Le filtrage par département va maintenant fonctionner correctement
