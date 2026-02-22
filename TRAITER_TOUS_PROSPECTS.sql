-- ═══════════════════════════════════════════════════════════════════
-- TRAITEMENT COMPLET DES 9000 PROSPECTS - SCRIPT SQL TOUT-EN-UN
-- Copier-coller ce fichier entier dans Supabase SQL Editor ou psql
-- ═══════════════════════════════════════════════════════════════════

-- ÉTAPE 1: Ajouter la colonne secteur_activite
-- ─────────────────────────────────────────────────────────────────
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'nouveaux_sites' 
        AND column_name = 'secteur_activite'
    ) THEN
        ALTER TABLE nouveaux_sites 
        ADD COLUMN secteur_activite TEXT;
        
        RAISE NOTICE '✅ Colonne secteur_activite ajoutée';
    ELSE
        RAISE NOTICE '✅ Colonne secteur_activite existe déjà';
    END IF;
END $$;

-- Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_secteur_activite 
ON nouveaux_sites(secteur_activite);

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 2: CORRIGER LES CODES POSTAUX
-- ─────────────────────────────────────────────────────────────────

-- Ajouter 0 devant les codes à 4 chiffres
UPDATE nouveaux_sites
SET code_postal = '0' || TRIM(code_postal)
WHERE (archived IS NULL OR archived != 'true')
  AND code_postal IS NOT NULL
  AND LENGTH(TRIM(code_postal)) = 4
  AND code_postal ~ '^[0-9]{4}$';

-- Nettoyer les codes postaux (enlever caractères non numériques)
UPDATE nouveaux_sites
SET code_postal = REGEXP_REPLACE(code_postal, '[^0-9]', '', 'g')
WHERE (archived IS NULL OR archived != 'true')
  AND code_postal IS NOT NULL
  AND code_postal ~ '[^0-9]';

-- Padding avec 0 pour codes < 5 chiffres
UPDATE nouveaux_sites
SET code_postal = LPAD(code_postal, 5, '0')
WHERE (archived IS NULL OR archived != 'true')
  AND code_postal IS NOT NULL
  AND LENGTH(code_postal) < 5
  AND code_postal ~ '^[0-9]+$';

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 3: ASSIGNER LES SECTEURS D'ACTIVITÉ
-- ─────────────────────────────────────────────────────────────────

BEGIN;

-- 1. Alimentaire (sections 10, 11)
UPDATE nouveaux_sites
SET secteur_activite = 'Alimentaire'
WHERE SUBSTRING(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 1, 2) IN ('10', '11')
  AND (archived IS NULL OR archived != 'true');

-- 2. BTP & Construction (sections 16, 23, 41, 42, 43)
UPDATE nouveaux_sites
SET secteur_activite = 'BTP & Construction'
WHERE SUBSTRING(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 1, 2) IN ('16', '23', '41', '42', '43')
  AND (archived IS NULL OR archived != 'true');

-- 3. Automobile (sections 29, 30, 45)
UPDATE nouveaux_sites
SET secteur_activite = 'Automobile'
WHERE SUBSTRING(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 1, 2) IN ('29', '30', '45')
  AND (archived IS NULL OR archived != 'true');

-- 4. Commerce & Distribution (sections 46, 47)
UPDATE nouveaux_sites
SET secteur_activite = 'Commerce & Distribution'
WHERE SUBSTRING(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 1, 2) IN ('46', '47')
  AND (archived IS NULL OR archived != 'true');

-- 5. Hôtellerie & Restauration (sections 55, 56)
UPDATE nouveaux_sites
SET secteur_activite = 'Hôtellerie & Restauration'
WHERE SUBSTRING(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 1, 2) IN ('55', '56')
  AND (archived IS NULL OR archived != 'true');

-- 6. Transport & Logistique (sections 49, 50, 51, 52, 53)
UPDATE nouveaux_sites
SET secteur_activite = 'Transport & Logistique'
WHERE SUBSTRING(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 1, 2) IN ('49', '50', '51', '52', '53')
  AND (archived IS NULL OR archived != 'true');

-- 7. Informatique & Digital (sections 58, 59, 60, 61, 62, 63)
UPDATE nouveaux_sites
SET secteur_activite = 'Informatique & Digital'
WHERE SUBSTRING(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 1, 2) IN ('58', '59', '60', '61', '62', '63')
  AND (archived IS NULL OR archived != 'true');

-- 8. Santé & Médical (sections 86, 87, 88)
UPDATE nouveaux_sites
SET secteur_activite = 'Santé & Médical'
WHERE SUBSTRING(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 1, 2) IN ('86', '87', '88')
  AND (archived IS NULL OR archived != 'true');

-- 9. Services personnels (sections 95, 96)
UPDATE nouveaux_sites
SET secteur_activite = 'Services personnels'
WHERE SUBSTRING(REPLACE(REPLACE(code_naf, '.', ''), ' ', ''), 1, 2) IN ('95', '96')
  AND (archived IS NULL OR archived != 'true');

-- 10. Autres (toutes les autres sections)
UPDATE nouveaux_sites
SET secteur_activite = 'Autres'
WHERE (secteur_activite IS NULL OR secteur_activite = '')
  AND code_naf IS NOT NULL
  AND (archived IS NULL OR archived != 'true');

-- 11. Mettre "Autres" pour ceux sans code NAF
UPDATE nouveaux_sites
SET secteur_activite = 'Autres'
WHERE (code_naf IS NULL OR code_naf = '')
  AND (archived IS NULL OR archived != 'true');

COMMIT;

-- ═══════════════════════════════════════════════════════════════════
-- RAPPORT FINAL
-- ─────────────────────────────────────────────────────────────────

-- Total prospects
SELECT 
    '📊 TOTAL PROSPECTS ACTIFS' as info,
    COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true');

-- Répartition par secteur
SELECT 
    '🏢 RÉPARTITION PAR SECTEUR' as titre,
    secteur_activite,
    COUNT(*) as nombre,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true'), 2) as pourcentage
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
GROUP BY secteur_activite
ORDER BY nombre DESC;

-- Qualité codes postaux
SELECT 
    '📮 CODES POSTAUX' as titre,
    CASE 
        WHEN LENGTH(code_postal) = 5 THEN '✅ 5 chiffres (OK)'
        WHEN LENGTH(code_postal) = 4 THEN '⚠️  4 chiffres'
        ELSE '❌ Invalide'
    END as statut,
    COUNT(*) as nombre
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
GROUP BY 
    CASE 
        WHEN LENGTH(code_postal) = 5 THEN '✅ 5 chiffres (OK)'
        WHEN LENGTH(code_postal) = 4 THEN '⚠️  4 chiffres'
        ELSE '❌ Invalide'
    END
ORDER BY nombre DESC;

-- Exemples de prospects traités
SELECT 
    '📝 EXEMPLES' as titre,
    nom,
    code_postal,
    commune,
    secteur_activite,
    SUBSTRING(code_naf, 1, 5) as code_naf
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND secteur_activite IS NOT NULL
ORDER BY id DESC
LIMIT 10;

-- ═══════════════════════════════════════════════════════════════════
-- ✅ TRAITEMENT TERMINÉ !
-- ═══════════════════════════════════════════════════════════════════
