-- 🛡️ PURGE COMPLÈTE sauf les entreprises du user actif
-- Garde UNIQUEMENT les IDs référencés dans tournées et CRM

-- Étape 1: Créer une liste de TOUS les IDs à GARDER
CREATE TEMP TABLE ids_a_garder AS
WITH ids_tournees AS (
  -- IDs dans les tournées (format BIGINT[])
  SELECT DISTINCT unnest(entreprises_ids) as id
  FROM tournees
  WHERE entreprises_ids IS NOT NULL
    AND array_length(entreprises_ids, 1) > 0
),
ids_crm_interactions AS (
  -- IDs dans lead_interactions
  SELECT DISTINCT entreprise_id::BIGINT as id
  FROM lead_interactions
  WHERE entreprise_id IS NOT NULL
),
ids_crm_statuts AS (
  -- IDs dans lead_statuts
  SELECT DISTINCT entreprise_id::BIGINT as id
  FROM lead_statuts
  WHERE entreprise_id IS NOT NULL
)
SELECT id FROM ids_tournees WHERE id IS NOT NULL
UNION
SELECT id FROM ids_crm_interactions WHERE id IS NOT NULL
UNION
SELECT id FROM ids_crm_statuts WHERE id IS NOT NULL;

-- Étape 2: Afficher ce qui va être gardé vs supprimé
SELECT 
  (SELECT COUNT(*) FROM nouveaux_sites) as total_actuel,
  (SELECT COUNT(*) FROM ids_a_garder) as a_garder_user_actif,
  (SELECT COUNT(*) FROM nouveaux_sites WHERE id NOT IN (SELECT id FROM ids_a_garder)) as a_supprimer,
  (SELECT COUNT(DISTINCT user_id) FROM tournees) as nombre_users_avec_tournees,
  (SELECT COUNT(*) FROM tournees) as nombre_tournees_total
;

-- Étape 3: Lister les SIRETs qui vont être gardés (pour vérification)
SELECT 
  ns.siret,
  ns.nom,
  ns.categorie_entreprise,
  'Tournée' as source
FROM nouveaux_sites ns
WHERE ns.id IN (
  SELECT DISTINCT unnest(entreprises_ids) 
  FROM tournees 
  WHERE entreprises_ids IS NOT NULL
)
UNION
SELECT 
  ns.siret,
  ns.nom,
  ns.categorie_entreprise,
  'CRM' as source
FROM nouveaux_sites ns
WHERE ns.id IN (SELECT entreprise_id::BIGINT FROM lead_interactions WHERE entreprise_id IS NOT NULL)
   OR ns.id IN (SELECT entreprise_id::BIGINT FROM lead_statuts WHERE entreprise_id IS NOT NULL)
ORDER BY source, nom
LIMIT 100;

-- ⚠️ VÉRIFIE les stats ci-dessus AVANT de continuer !
-- Si tout est OK, décommente ci-dessous:

-- Étape 4: SUPPRIMER tout sauf les IDs du user actif
-- DELETE FROM nouveaux_sites
-- WHERE id NOT IN (SELECT id FROM ids_a_garder);

-- Étape 5: Vérification post-purge
-- SELECT 
--   COUNT(*) as entreprises_restantes,
--   COUNT(DISTINCT siret) as sirets_uniques
-- FROM nouveaux_sites;

-- Étape 6: Drop la table temp
-- DROP TABLE IF EXISTS ids_a_garder;
