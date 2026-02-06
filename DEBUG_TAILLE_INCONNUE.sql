-- 🐛 Debug du problème "Taille inconnue, nouvelle entité"

-- 1️⃣ Vérifier que les données sont bien en BDD
SELECT 
  categorie_entreprise,
  COUNT(*) as nombre
FROM nouveaux_sites
WHERE categorie_entreprise = 'Taille inconnue, nouvelle entité'
GROUP BY categorie_entreprise;

-- 2️⃣ Vérifier ce que la fonction RPC retourne
SELECT get_nouveaux_sites_filter_counts_dynamic(
  NULL, NULL, NULL, NULL, NULL, NULL, NULL
) -> 'taillesEntreprise';

-- 3️⃣ Test manuel de l'agrégation (comme dans la RPC)
WITH filtered_base AS (
  SELECT 
    id,
    categorie_entreprise,
    LEFT(code_postal, 2) as dept
  FROM nouveaux_sites
  WHERE code_postal IS NOT NULL 
    AND LENGTH(code_postal) >= 2
    AND LEFT(code_postal, 2) ~ '^[0-9]+$'
    AND LEFT(code_postal, 2) NOT IN ('00', '97', '98', '99')
)
SELECT 
  categorie_entreprise as key, 
  COUNT(*)::integer as cnt
FROM filtered_base
WHERE categorie_entreprise IS NOT NULL
GROUP BY categorie_entreprise
ORDER BY cnt DESC;
