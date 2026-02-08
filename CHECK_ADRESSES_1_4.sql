-- 🔍 Vérifier les adresses complètes des prospects 1 et 4

SELECT 
  id,
  nom,
  numero_voie,
  type_voie,
  libelle_voie,
  complement_adresse,
  code_postal,
  ville,
  adresse,
  latitude,
  longitude,
  siret
FROM nouveaux_sites
WHERE id IN (41, 45)
ORDER BY id;
