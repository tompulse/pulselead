-- ANALYSER LES SECTIONS NAF MANQUANTES DANS LA BASE
-- Sections non couvertes par detailedCategories.ts mais potentiellement présentes dans la base

-- Liste des sections NAF non couvertes (à vérifier si elles ont des prospects)
WITH sections_manquantes AS (
  SELECT unnest(ARRAY[
    '04', '05', '06', '07', '08', '09', '12', '17', '18', '19', '21', '23', 
    '28', '29', '30', '31', '32', '33', '36', '37', '38', '39', '48', '50', 
    '51', '53', '58', '60', '61', '66', '72', '74', '75', '77', '79', '82', 
    '88', '92', '94', '97', '98', '99'
  ]) AS section
),
prospects_par_section AS (
  SELECT 
    LEFT(code_naf, 2) as section_naf,
    COUNT(*) as nombre_prospects
  FROM nouveaux_sites
  WHERE (archived IS NULL OR archived != 'true')
    AND code_naf IS NOT NULL
    AND LENGTH(code_naf) >= 2
  GROUP BY LEFT(code_naf, 2)
)
SELECT 
  sm.section as "Section NAF",
  COALESCE(ps.nombre_prospects, 0) as "Nombre de prospects"
FROM sections_manquantes sm
LEFT JOIN prospects_par_section ps ON sm.section = ps.section_naf
WHERE COALESCE(ps.nombre_prospects, 0) > 0
ORDER BY COALESCE(ps.nombre_prospects, 0) DESC;

-- Afficher aussi le total de prospects perdus
SELECT 
  'TOTAL PROSPECTS PERDUS' as info,
  COUNT(*) as nombre,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM nouveaux_sites WHERE archived IS NULL OR archived != 'true'), 2) as pourcentage
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_naf IS NOT NULL
  AND LENGTH(code_naf) >= 2
  AND LEFT(code_naf, 2) IN (
    '04', '05', '06', '07', '08', '09', '12', '17', '18', '19', '21', '23', 
    '28', '29', '30', '31', '32', '33', '36', '37', '38', '39', '48', '50', 
    '51', '53', '58', '60', '61', '66', '72', '74', '75', '77', '79', '82', 
    '88', '92', '94', '97', '98', '99'
  );

-- Voir quelques exemples de prospects perdus (top 5 par section)
SELECT 
  'EXEMPLES PAR SECTION' as info,
  LEFT(code_naf, 2) as section,
  code_naf,
  nom,
  commune,
  COUNT(*) OVER (PARTITION BY LEFT(code_naf, 2)) as total_section
FROM nouveaux_sites
WHERE (archived IS NULL OR archived != 'true')
  AND code_naf IS NOT NULL
  AND LENGTH(code_naf) >= 2
  AND LEFT(code_naf, 2) IN (
    '04', '05', '06', '07', '08', '09', '12', '17', '18', '19', '21', '23', 
    '28', '29', '30', '31', '32', '33', '36', '37', '38', '39', '48', '50', 
    '51', '53', '58', '60', '61', '66', '72', '74', '75', '77', '79', '82', 
    '88', '92', '94', '97', '98', '99'
  )
ORDER BY section, nom
LIMIT 50;
