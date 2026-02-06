-- 🔍 Vérifier que chaque prospect a une adresse et géocodage différents

-- 1️⃣ Vérifier quelques exemples
SELECT 
  nom,
  numero_voie,
  type_voie,
  libelle_voie,
  code_postal,
  ville,
  latitude,
  longitude,
  siret
FROM nouveaux_sites
WHERE nom IN ('DEMFA SERVICES', 'OCCIBARD', 'DRID''CLEAN', 'CARREFOUR CONTACT', 'AURA', 'AURELIE PIZZA')
ORDER BY nom;

-- 2️⃣ Compter les adresses en double
SELECT 
  numero_voie,
  type_voie,
  libelle_voie,
  code_postal,
  ville,
  COUNT(*) as nombre_doublons
FROM nouveaux_sites
GROUP BY numero_voie, type_voie, libelle_voie, code_postal, ville
HAVING COUNT(*) > 1
ORDER BY nombre_doublons DESC
LIMIT 10;

-- 3️⃣ Compter les coordonnées GPS en double
SELECT 
  latitude,
  longitude,
  COUNT(*) as nombre_doublons
FROM nouveaux_sites
WHERE latitude IS NOT NULL AND longitude IS NOT NULL
GROUP BY latitude, longitude
HAVING COUNT(*) > 1
ORDER BY nombre_doublons DESC
LIMIT 10;

-- 4️⃣ Stats globales
SELECT 
  COUNT(*) as total_entreprises,
  COUNT(DISTINCT CONCAT(numero_voie, type_voie, libelle_voie, code_postal, ville)) as adresses_uniques,
  COUNT(DISTINCT CONCAT(latitude, longitude)) as coords_uniques,
  COUNT(*) - COUNT(DISTINCT CONCAT(numero_voie, type_voie, libelle_voie, code_postal, ville)) as adresses_dupliquees,
  COUNT(*) - COUNT(DISTINCT CONCAT(latitude, longitude)) as coords_dupliquees
FROM nouveaux_sites;
