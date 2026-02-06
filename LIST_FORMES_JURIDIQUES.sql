-- Requête pour lister tous les codes de formes juridiques présents dans la base de données
-- Exécutez cette requête dans votre Dashboard Supabase (SQL Editor)

-- 1. Liste distincte de toutes les formes juridiques avec leur nombre
SELECT 
  forme_juridique,
  COUNT(*) as nombre_entreprises,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as pourcentage
FROM entreprises
WHERE forme_juridique IS NOT NULL
GROUP BY forme_juridique
ORDER BY nombre_entreprises DESC;

-- 2. Statistiques globales
SELECT 
  COUNT(*) as total_entreprises,
  COUNT(DISTINCT forme_juridique) as nombre_formes_juridiques_distinctes,
  COUNT(CASE WHEN forme_juridique IS NULL THEN 1 END) as sans_forme_juridique
FROM entreprises;

-- 3. Liste simple de toutes les formes juridiques (triée alphabétiquement)
SELECT DISTINCT forme_juridique
FROM entreprises
WHERE forme_juridique IS NOT NULL
ORDER BY forme_juridique;
