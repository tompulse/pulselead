-- Requête pour lister tous les CODES NUMÉRIQUES de catégories juridiques présents dans la base de données
-- Ces codes sont au format 4 chiffres INSEE (ex: 5499, 5710, 6540)

-- 1. Liste de tous les codes numériques avec comptage
SELECT 
  categorie_juridique as code_insee,
  COUNT(*) as nombre_sites,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as pourcentage
FROM nouveaux_sites
WHERE categorie_juridique IS NOT NULL 
  AND categorie_juridique != 'Non spécifié'
  AND categorie_juridique ~ '^[0-9]{4}$'  -- Seulement les codes 4 chiffres
GROUP BY categorie_juridique
ORDER BY nombre_sites DESC;

-- 2. Statistiques globales
SELECT 
  COUNT(*) as total_sites,
  COUNT(DISTINCT categorie_juridique) as nombre_codes_distincts,
  COUNT(CASE WHEN categorie_juridique IS NULL OR categorie_juridique = 'Non spécifié' THEN 1 END) as sans_code
FROM nouveaux_sites;

-- 3. Liste simple de tous les codes numériques (triée)
SELECT DISTINCT categorie_juridique
FROM nouveaux_sites
WHERE categorie_juridique IS NOT NULL 
  AND categorie_juridique != 'Non spécifié'
  AND categorie_juridique ~ '^[0-9]{4}$'
ORDER BY categorie_juridique;

-- 4. Répartition par grande catégorie (premier chiffre)
SELECT 
  LEFT(categorie_juridique, 1) as categorie_niveau_1,
  CASE LEFT(categorie_juridique, 1)
    WHEN '0' THEN 'Organisme de placement collectif'
    WHEN '1' THEN 'Entrepreneur individuel'
    WHEN '2' THEN 'Groupement non doté de personnalité morale'
    WHEN '3' THEN 'Personne morale de droit étranger'
    WHEN '4' THEN 'Établissement public commercial'
    WHEN '5' THEN 'Société commerciale (SARL, SAS, SA, etc.)'
    WHEN '6' THEN 'GIE, coopératives, sociétés civiles'
    WHEN '7' THEN 'Administration publique'
    WHEN '8' THEN 'Organisme privé spécialisé'
    WHEN '9' THEN 'Associations, fondations'
    ELSE 'Autre'
  END as description,
  COUNT(*) as nombre_sites,
  COUNT(DISTINCT categorie_juridique) as nombre_codes_distincts
FROM nouveaux_sites
WHERE categorie_juridique ~ '^[0-9]{4}$'
GROUP BY LEFT(categorie_juridique, 1)
ORDER BY nombre_sites DESC;

-- 5. TOP 20 des codes les plus fréquents avec leur libellé
SELECT 
  categorie_juridique as code_insee,
  COUNT(*) as nombre_sites,
  CASE categorie_juridique
    -- Codes les plus courants
    WHEN '5499' THEN 'SARL (sans autre indication)'
    WHEN '5710' THEN 'SAS (Société par Actions Simplifiée)'
    WHEN '5485' THEN 'SELARL (Société d''exercice libéral à responsabilité limitée)'
    WHEN '5785' THEN 'SELAS (Société d''exercice libéral par actions simplifiée)'
    WHEN '6540' THEN 'SCI (Société civile immobilière)'
    WHEN '5202' THEN 'SNC (Société en nom collectif)'
    WHEN '5410' THEN 'SARL nationale'
    WHEN '5510' THEN 'SA (Société anonyme) à conseil d''administration'
    WHEN '5610' THEN 'SA à directoire'
    WHEN '6220' THEN 'GIE (Groupement d''intérêt économique)'
    WHEN '6598' THEN 'EARL (Exploitation agricole à responsabilité limitée)'
    WHEN '6599' THEN 'Autre société civile'
    WHEN '5470' THEN 'SPFPL SARL'
    WHEN '5770' THEN 'SPFPL SAS'
    WHEN '5306' THEN 'Société en commandite simple'
    WHEN '5308' THEN 'Société en commandite par actions'
    WHEN '6534' THEN 'GFA (Groupement foncier agricole)'
    WHEN '6536' THEN 'GF (Groupement forestier)'
    ELSE 'Voir classification INSEE'
  END as libelle
FROM nouveaux_sites
WHERE categorie_juridique ~ '^[0-9]{4}$'
GROUP BY categorie_juridique
ORDER BY nombre_sites DESC
LIMIT 20;
