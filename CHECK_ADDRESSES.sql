-- 🔍 Vérifier les adresses des prospects affichés

SELECT 
  nom,
  numero_voie,
  type_voie,
  libelle_voie,
  code_postal,
  ville,
  adresse,
  LENGTH(code_postal) as longueur_cp
FROM nouveaux_sites
WHERE nom IN ('DEMFA SERVICES', 'OCCIBARD', 'DRID''CLEAN', 'CARREFOUR CONTACT', 'AURA')
ORDER BY nom;

-- Compter les problèmes de code postal
SELECT 
  LENGTH(code_postal::TEXT) as longueur,
  COUNT(*) as nombre_entreprises
FROM nouveaux_sites
WHERE code_postal IS NOT NULL
GROUP BY LENGTH(code_postal::TEXT)
ORDER BY longueur;
