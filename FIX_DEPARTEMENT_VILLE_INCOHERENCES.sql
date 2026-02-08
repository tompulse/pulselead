-- 🔧 Corriger les incohérences entre département (code postal) et ville
-- Problème: Des villes du 33 (Le Haillan) apparaissent dans le département 75 (Paris)

-- 1️⃣ Identifier les incohérences majeures
SELECT 
  LEFT(code_postal, 2) as departement_code_postal,
  ville,
  COUNT(*) as nombre_entreprises,
  array_agg(DISTINCT code_postal) as codes_postaux_trouves,
  MIN(id) as exemple_id
FROM nouveaux_sites
WHERE code_postal IS NOT NULL 
  AND ville IS NOT NULL
  AND LENGTH(code_postal) = 5
GROUP BY LEFT(code_postal, 2), ville
HAVING LEFT(code_postal, 2) != (
  -- Vérifier si le département du code postal correspond bien à la ville
  CASE 
    -- Villes connues du 33 (Gironde)
    WHEN LOWER(ville) IN ('le haillan', 'bordeaux', 'mérignac', 'pessac', 'talence', 'bègles', 'villenave-d''ornon', 'gradignan', 'cenon', 'lormont', 'floirac', 'ambarès-et-lagrave', 'artigues-près-bordeaux', 'blanquefort', 'carbon-blanc', 'eysines', 'le bouscat', 'parempuyre', 'saint-médard-en-jalles', 'bruges', 'bassens', 'saint-louis-de-montferrand', 'ambares-et-lagrave') THEN '33'
    
    -- Villes de Paris et petite couronne
    WHEN LOWER(ville) IN ('paris') THEN '75'
    WHEN LOWER(ville) IN ('boulogne-billancourt', 'issy-les-moulineaux', 'meudon', 'sèvres', 'chaville', 'ville-d''avray', 'marnes-la-coquette', 'vaucresson', 'garches', 'saint-cloud', 'suresnes', 'puteaux', 'neuilly-sur-seine', 'levallois-perret', 'clichy', 'asnières-sur-seine', 'colombes', 'courbevoie', 'la garenne-colombes', 'nanterre', 'rueil-malmaison', 'gennevilliers', 'villeneuve-la-garenne', 'bois-colombes') THEN '92'
    WHEN LOWER(ville) IN ('montreuil', 'bagnolet', 'les lilas', 'le pré-saint-gervais', 'pantin', 'noisy-le-sec', 'romainville', 'bobigny', 'bondy', 'drancy', 'le blanc-mesnil', 'aulnay-sous-bois', 'sevran', 'livry-gargan', 'clichy-sous-bois', 'montfermeil', 'gagny', 'villemomble', 'rosny-sous-bois', 'noisy-le-grand', 'neuilly-plaisance', 'neuilly-sur-marne', 'gournay-sur-marne', 'les pavillons-sous-bois', 'saint-denis', 'aubervilliers', 'la courneuve', 'épinay-sur-seine', 'l''île-saint-denis', 'pierrefitte-sur-seine', 'stains', 'villetaneuse', 'saint-ouen-sur-seine', 'saint-ouen') THEN '93'
    WHEN LOWER(ville) IN ('vincennes', 'saint-mandé', 'charenton-le-pont', 'saint-maurice', 'maisons-alfort', 'alfortville', 'ivry-sur-seine', 'vitry-sur-seine', 'thiais', 'choisy-le-roi', 'orly', 'villeneuve-le-roi', 'ablon-sur-seine', 'villeneuve-saint-georges', 'valenton', 'limeil-brévannes', 'boissy-saint-léger', 'sucy-en-brie', 'la queue-en-brie', 'ormesson-sur-marne', 'noiseau', 'chennevières-sur-marne', 'le plessis-trévise', 'villiers-sur-marne', 'champigny-sur-marne', 'saint-maur-des-fossés', 'joinville-le-pont', 'nogent-sur-marne', 'fontenay-sous-bois', 'le perreux-sur-marne', 'cachan', 'arcueil', 'gentilly', 'le kremlin-bicêtre', 'créteil', 'bonneuil-sur-marne', 'saint-maur') THEN '94'
    
    -- Autres grandes villes
    WHEN LOWER(ville) IN ('lyon', 'villeurbanne', 'vénissieux', 'caluire-et-cuire', 'bron') THEN '69'
    WHEN LOWER(ville) IN ('marseille') THEN '13'
    WHEN LOWER(ville) IN ('toulouse', 'colomiers', 'tournefeuille', 'blagnac', 'cugnaux', 'balma', 'ramonville-saint-agne') THEN '31'
    WHEN LOWER(ville) IN ('nice', 'cannes', 'antibes', 'grasse') THEN '06'
    WHEN LOWER(ville) IN ('nantes', 'saint-herblain', 'rezé', 'saint-sébastien-sur-loire', 'orvault') THEN '44'
    WHEN LOWER(ville) IN ('lille', 'roubaix', 'tourcoing', 'villeneuve-d''ascq', 'dunkerque', 'marcq-en-barœul') THEN '59'
    WHEN LOWER(ville) IN ('strasbourg', 'schiltigheim', 'illkirch-graffenstaden', 'haguenau') THEN '67'
    WHEN LOWER(ville) IN ('montpellier', 'béziers', 'sète', 'lunel', 'agde') THEN '34'
    WHEN LOWER(ville) IN ('rennes', 'saint-malo', 'fougères', 'vitré') THEN '35'
    WHEN LOWER(ville) IN ('reims', 'épernay', 'châlons-en-champagne') THEN '51'
    
    ELSE LEFT(code_postal, 2)
  END
)
ORDER BY nombre_entreprises DESC
LIMIT 50;

-- 2️⃣ Focus sur les villes du 33 (Gironde) avec mauvais code postal
SELECT 
  id,
  nom,
  code_postal,
  ville,
  LEFT(code_postal, 2) as dept_actuel,
  'Devrait être 33xxx' as correction
FROM nouveaux_sites
WHERE LOWER(ville) IN (
  'le haillan', 'bordeaux', 'mérignac', 'pessac', 'talence', 'bègles', 
  'villenave-d''ornon', 'gradignan', 'cenon', 'lormont', 'floirac',
  'ambarès-et-lagrave', 'artigues-près-bordeaux', 'blanquefort', 
  'carbon-blanc', 'eysines', 'le bouscat', 'parempuyre', 
  'saint-médard-en-jalles', 'bruges', 'bassens', 'ambares-et-lagrave'
)
AND LEFT(code_postal, 2) != '33'
AND code_postal IS NOT NULL
ORDER BY ville, code_postal
LIMIT 100;

-- 3️⃣ Statistiques des incohérences
WITH incoherences AS (
  SELECT 
    LEFT(code_postal, 2) as dept_code_postal,
    CASE 
      WHEN LOWER(ville) IN ('le haillan', 'bordeaux', 'mérignac', 'pessac', 'talence', 'bègles', 'villenave-d''ornon', 'gradignan', 'cenon', 'lormont', 'floirac', 'ambarès-et-lagrave', 'artigues-près-bordeaux', 'blanquefort', 'carbon-blanc', 'eysines', 'le bouscat', 'parempuyre', 'saint-médard-en-jalles', 'bruges', 'bassens', 'saint-louis-de-montferrand', 'ambares-et-lagrave') THEN '33'
      WHEN LOWER(ville) IN ('paris') THEN '75'
      WHEN LOWER(ville) IN ('lyon', 'villeurbanne', 'vénissieux', 'caluire-et-cuire', 'bron') THEN '69'
      WHEN LOWER(ville) IN ('marseille') THEN '13'
      WHEN LOWER(ville) IN ('toulouse', 'colomiers', 'tournefeuille', 'blagnac', 'cugnaux', 'balma', 'ramonville-saint-agne') THEN '31'
      ELSE LEFT(code_postal, 2)
    END as dept_attendu,
    COUNT(*) as nombre
  FROM nouveaux_sites
  WHERE code_postal IS NOT NULL 
    AND ville IS NOT NULL
    AND LENGTH(code_postal) = 5
  GROUP BY dept_code_postal, dept_attendu
  HAVING LEFT(code_postal, 2) != CASE 
      WHEN LOWER(ville) IN ('le haillan', 'bordeaux', 'mérignac', 'pessac', 'talence', 'bègles', 'villenave-d''ornon', 'gradignan', 'cenon', 'lormont', 'floirac', 'ambarès-et-lagrave', 'artigues-près-bordeaux', 'blanquefort', 'carbon-blanc', 'eysines', 'le bouscat', 'parempuyre', 'saint-médard-en-jalles', 'bruges', 'bassens', 'saint-louis-de-montferrand', 'ambares-et-lagrave') THEN '33'
      WHEN LOWER(ville) IN ('paris') THEN '75'
      WHEN LOWER(ville) IN ('lyon', 'villeurbanne', 'vénissieux', 'caluire-et-cuire', 'bron') THEN '69'
      WHEN LOWER(ville) IN ('marseille') THEN '13'
      WHEN LOWER(ville) IN ('toulouse', 'colomiers', 'tournefeuille', 'blagnac', 'cugnaux', 'balma', 'ramonville-saint-agne') THEN '31'
      ELSE LEFT(code_postal, 2)
    END
)
SELECT 
  SUM(nombre) as total_incoherences,
  COUNT(DISTINCT dept_code_postal) as nb_depts_avec_erreurs
FROM incoherences;

-- ⚠️ OPTION A: Supprimer les entrées avec incohérences flagrantes
-- DELETE FROM nouveaux_sites
-- WHERE LOWER(ville) IN (
--   'le haillan', 'bordeaux', 'mérignac', 'pessac', 'talence', 'bègles', 
--   'villenave-d''ornon', 'gradignan', 'cenon', 'lormont', 'floirac',
--   'ambarès-et-lagrave', 'artigues-près-bordeaux', 'blanquefort', 
--   'carbon-blanc', 'eysines', 'le bouscat', 'parempuyre', 
--   'saint-médard-en-jalles', 'bruges', 'bassens', 'ambares-et-lagrave'
-- )
-- AND LEFT(code_postal, 2) != '33'
-- AND code_postal IS NOT NULL;

-- ⚠️ OPTION B: Mettre le code postal à NULL pour forcer un re-géocodage
-- UPDATE nouveaux_sites
-- SET code_postal = NULL,
--     latitude = NULL,
--     longitude = NULL
-- WHERE LOWER(ville) IN (
--   'le haillan', 'bordeaux', 'mérignac', 'pessac', 'talence', 'bègles', 
--   'villenave-d''ornon', 'gradignan', 'cenon', 'lormont', 'floirac',
--   'ambarès-et-lagrave', 'artigues-près-bordeaux', 'blanquefort', 
--   'carbon-blanc', 'eysines', 'le bouscat', 'parempuyre', 
--   'saint-médard-en-jalles', 'bruges', 'bassens', 'ambares-et-lagrave'
-- )
-- AND LEFT(code_postal, 2) != '33'
-- AND code_postal IS NOT NULL;

-- 4️⃣ Vérification finale après correction
SELECT 
  LEFT(code_postal, 2) as departement,
  COUNT(*) as nombre_entreprises,
  COUNT(DISTINCT ville) as nb_villes
FROM nouveaux_sites
WHERE code_postal IS NOT NULL
GROUP BY LEFT(code_postal, 2)
ORDER BY departement;
