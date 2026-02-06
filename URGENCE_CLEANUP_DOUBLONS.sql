-- URGENCE : NETTOYAGE DES DOUBLONS

-- 1. Compter les entreprises totales (devrait être ~48k, pas 55k+)
SELECT COUNT(*) as total_entreprises FROM nouveaux_sites;

-- 2. Compter les doublons de SIRET
SELECT 
    siret,
    COUNT(*) as nombre_doublons,
    MAX(created_at) as derniere_creation
FROM nouveaux_sites
GROUP BY siret
HAVING COUNT(*) > 1
ORDER BY nombre_doublons DESC
LIMIT 20;

-- 3. Identifier les "Entreprise sans nom" (créées par le dernier import raté)
SELECT 
    COUNT(*) as nombre_sans_nom
FROM nouveaux_sites
WHERE nom = 'Entreprise sans nom';

-- 4. SUPPRIMER les doublons (garde le plus ancien avec données CRM/tournées)
-- On supprime les versions les plus récentes sans garder celles avec des relations
DELETE FROM nouveaux_sites
WHERE id IN (
    SELECT id
    FROM (
        SELECT 
            id,
            siret,
            created_at,
            ROW_NUMBER() OVER (PARTITION BY siret ORDER BY created_at ASC) as rn
        FROM nouveaux_sites
    ) t
    WHERE rn > 1
);

-- 5. Vérifier après nettoyage
SELECT COUNT(*) as total_apres_nettoyage FROM nouveaux_sites;

-- 6. Vérifier qu'il n'y a plus de doublons
SELECT 
    siret,
    COUNT(*) as nombre
FROM nouveaux_sites
GROUP BY siret
HAVING COUNT(*) > 1;

-- 7. Créer la contrainte UNIQUE (si elle n'existe pas)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'nouveaux_sites_siret_key'
        AND contype = 'u'
    ) THEN
        ALTER TABLE public.nouveaux_sites 
        ADD CONSTRAINT nouveaux_sites_siret_key UNIQUE (siret);
        RAISE NOTICE 'Contrainte UNIQUE ajoutée sur siret';
    ELSE
        RAISE NOTICE 'Contrainte UNIQUE existe déjà';
    END IF;
END $$;
