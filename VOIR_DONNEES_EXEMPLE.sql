-- Voir quelques exemples de données pour comprendre la structure
SELECT *
FROM nouveaux_sites
LIMIT 5;

-- Compter combien de lignes au total
SELECT COUNT(*) as total_lignes
FROM nouveaux_sites;

-- Voir quelles colonnes ont des données (non NULL)
SELECT 
  COUNT(*) as total,
  COUNT(code_naf) as avec_code_naf,
  COUNT(categorie_juridique) as avec_categorie_juridique,
  COUNT(code_postal) as avec_code_postal,
  COUNT(est_siege) as avec_est_siege,
  COUNT(ville) as avec_ville,
  COUNT(nom) as avec_nom,
  COUNT(siret) as avec_siret
FROM nouveaux_sites;
