-- 🧹 NETTOYAGE COMPLET: Tournées et interactions CRM
-- Supprimer les conflits et données corrompues

-- 1️⃣ Vérifier l'état actuel
SELECT 
  'Tournées' as table_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE visites_effectuees IS NOT NULL) as avec_visites
FROM tournees;

SELECT 
  'Interactions CRM' as table_name,
  COUNT(*) as total,
  COUNT(DISTINCT entreprise_id) as entreprises_distinctes,
  COUNT(*) FILTER (WHERE type IN ('visite', 'rdv', 'a_revoir') OR statut = 'a_rappeler') as depuis_tournee
FROM lead_interactions;

-- 2️⃣ Nettoyer les doublons d'interactions (garder le plus récent)
WITH ranked_interactions AS (
  SELECT 
    id,
    entreprise_id,
    user_id,
    type,
    statut,
    ROW_NUMBER() OVER (
      PARTITION BY entreprise_id, user_id, type, statut
      ORDER BY created_at DESC
    ) as rn
  FROM lead_interactions
)
DELETE FROM lead_interactions
WHERE id IN (
  SELECT id FROM ranked_interactions WHERE rn > 1
);

-- 3️⃣ Réinitialiser les visites_effectuees de toutes les tournées
UPDATE tournees
SET visites_effectuees = '{}'::jsonb
WHERE visites_effectuees IS NOT NULL 
  AND visites_effectuees != '{}'::jsonb;

-- 4️⃣ Statistiques après nettoyage
SELECT 
  'Après nettoyage - Tournées' as info,
  COUNT(*) as total_tournees,
  COUNT(*) FILTER (WHERE visites_effectuees = '{}'::jsonb) as visites_reinitialisees
FROM tournees;

SELECT 
  'Après nettoyage - Interactions' as info,
  COUNT(*) as total_interactions,
  COUNT(DISTINCT entreprise_id) as entreprises_distinctes,
  COUNT(*) FILTER (WHERE type IN ('visite', 'rdv', 'a_revoir') OR statut = 'a_rappeler') as avec_statut_tournee
FROM lead_interactions;

-- 5️⃣ Vérifier les types d'interactions
SELECT 
  type,
  COUNT(*) as nombre,
  COUNT(DISTINCT entreprise_id) as entreprises_distinctes,
  COUNT(*) FILTER (WHERE date_relance IS NOT NULL) as avec_date_relance
FROM lead_interactions
GROUP BY type
ORDER BY nombre DESC;

-- ✅ Base de données nettoyée et prête pour un nouveau départ
