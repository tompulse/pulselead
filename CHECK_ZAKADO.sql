-- 🔍 Vérifier ZAKADO

SELECT 
  siret,
  nom,
  est_siege,
  ville,
  CASE WHEN est_siege = true THEN 'TRUE en BDD' ELSE 'FALSE en BDD' END as valeur_bdd
FROM nouveaux_sites
WHERE nom ILIKE '%ZAKADO%'
LIMIT 5;
