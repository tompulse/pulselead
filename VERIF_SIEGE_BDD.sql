-- 🔍 Vérifier toutes les colonnes qui pourraient contenir l'info siège

-- 1️⃣ Vérifier les colonnes de la table
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'nouveaux_sites' 
  AND column_name LIKE '%siege%'
ORDER BY column_name;

-- 2️⃣ Voir les valeurs actuelles de est_siege
SELECT 
  est_siege,
  COUNT(*) as nombre
FROM nouveaux_sites
GROUP BY est_siege;

-- 3️⃣ Afficher quelques exemples
SELECT 
  siret,
  nom,
  est_siege,
  ville
FROM nouveaux_sites
LIMIT 20;
