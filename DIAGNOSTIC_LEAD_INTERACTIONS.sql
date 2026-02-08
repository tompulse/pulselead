-- 🔍 DIAGNOSTIC: Vérifier les lead_interactions

-- 1. Compter toutes les interactions
SELECT 
  'Total interactions' as info,
  COUNT(*) as nombre
FROM lead_interactions;

-- 2. Compter par type
SELECT 
  'Par type' as info,
  type,
  COUNT(*) as nombre,
  COUNT(DISTINCT entreprise_id) as entreprises_distinctes
FROM lead_interactions
GROUP BY type
ORDER BY nombre DESC;

-- 3. Compter par statut
SELECT 
  'Par statut' as info,
  statut,
  COUNT(*) as nombre
FROM lead_interactions
GROUP BY statut
ORDER BY nombre DESC;

-- 4. Voir les 10 dernières interactions créées
SELECT 
  id,
  entreprise_id,
  type,
  statut,
  date_relance,
  notes,
  created_at
FROM lead_interactions
ORDER BY created_at DESC
LIMIT 10;

-- 5. Interactions depuis tournées
SELECT 
  'Depuis tournées' as info,
  COUNT(*) as nombre,
  COUNT(DISTINCT entreprise_id) as entreprises
FROM lead_interactions
WHERE notes LIKE '%tournée%';

-- 6. Vérifier s'il y a des interactions pour l'utilisateur actuel
SELECT 
  user_id,
  COUNT(*) as nombre_interactions
FROM lead_interactions
GROUP BY user_id;
