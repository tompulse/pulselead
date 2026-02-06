-- 🛡️ NETTOYAGE SÉCURISÉ DES DOUBLONS
-- Garde les IDs référencés dans tournées et CRM, supprime les doublons

-- Étape 1: Identifier les IDs à GARDER (référencés dans tournées ou CRM)
CREATE TEMP TABLE ids_a_garder AS
WITH ids_tournees AS (
  -- IDs dans les tournées (format BIGINT[])
  SELECT DISTINCT unnest(entreprises_ids) as id
  FROM tournees
  WHERE entreprises_ids IS NOT NULL
),
ids_crm AS (
  -- IDs dans le CRM (format UUID ou BIGINT selon migration)
  SELECT DISTINCT entreprise_id::BIGINT as id
  FROM lead_interactions
  WHERE entreprise_id IS NOT NULL
  UNION
  SELECT DISTINCT entreprise_id::BIGINT as id
  FROM lead_statuts
  WHERE entreprise_id IS NOT NULL
)
SELECT DISTINCT id FROM ids_tournees
UNION
SELECT DISTINCT id FROM ids_crm;

-- Étape 2: Pour chaque SIRET en double, garder 1 seul ID
CREATE TEMP TABLE ids_a_supprimer AS
WITH doublons AS (
  SELECT 
    siret,
    id,
    created_at,
    -- Priorité: 1=dans tournées/CRM, 2=plus récent
    CASE 
      WHEN id IN (SELECT id FROM ids_a_garder) THEN 1
      ELSE 2
    END as priorite,
    ROW_NUMBER() OVER (
      PARTITION BY siret 
      ORDER BY 
        CASE WHEN id IN (SELECT id FROM ids_a_garder) THEN 1 ELSE 2 END,
        created_at DESC
    ) as rang
  FROM nouveaux_sites
  WHERE siret IS NOT NULL 
    AND siret != ''
)
SELECT id
FROM doublons
WHERE rang > 1;  -- Garde rang=1, supprime le reste

-- Étape 3: Afficher ce qui va être supprimé
SELECT 
  COUNT(*) as nombre_a_supprimer,
  COUNT(*) FILTER (WHERE id NOT IN (SELECT id FROM ids_a_garder)) as doublons_sans_reference,
  COUNT(*) FILTER (WHERE id IN (SELECT id FROM ids_a_garder)) as doublons_avec_reference_ERREUR
FROM ids_a_supprimer;

-- ⚠️ SI doublons_avec_reference_ERREUR > 0, STOP ! Sinon continue:

-- Étape 4: SUPPRIMER les doublons (décommenter après vérification)
-- DELETE FROM nouveaux_sites
-- WHERE id IN (SELECT id FROM ids_a_supprimer);

-- Étape 5: Vérification post-nettoyage
-- SELECT 
--   COUNT(*) as total_apres,
--   COUNT(DISTINCT siret) as sirets_uniques,
--   COUNT(*) - COUNT(DISTINCT siret) as doublons_restants
-- FROM nouveaux_sites
-- WHERE siret IS NOT NULL AND siret != '';
