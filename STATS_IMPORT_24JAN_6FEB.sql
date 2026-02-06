-- STATISTIQUES IMPORT 24 JANVIER - 6 FÉVRIER 2026
-- 6639 nouvelles entreprises créées en France

-- 1. Répartition par département (TOP 10)
SELECT 
    LEFT(code_postal, 2) AS departement,
    COUNT(*) AS nombre_entreprises,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM nouveaux_sites WHERE date_creation >= '2026-01-24' AND date_creation <= '2026-02-06'), 1) AS pourcentage
FROM nouveaux_sites
WHERE date_creation >= '2026-01-24' 
AND date_creation <= '2026-02-06'
AND code_postal IS NOT NULL
GROUP BY LEFT(code_postal, 2)
ORDER BY nombre_entreprises DESC
LIMIT 10;

-- 2. Répartition par secteur NAF (TOP 10)
SELECT 
    CASE 
        WHEN naf_section = 'A' THEN 'Agriculture, sylviculture et pêche'
        WHEN naf_section = 'B' THEN 'Industries extractives'
        WHEN naf_section = 'C' THEN 'Industrie manufacturière'
        WHEN naf_section = 'D' THEN 'Production et distribution d''électricité, gaz, vapeur'
        WHEN naf_section = 'E' THEN 'Production et distribution d''eau'
        WHEN naf_section = 'F' THEN 'Construction'
        WHEN naf_section = 'G' THEN 'Commerce; réparation d''automobiles'
        WHEN naf_section = 'H' THEN 'Transports et entreposage'
        WHEN naf_section = 'I' THEN 'Hébergement et restauration'
        WHEN naf_section = 'J' THEN 'Information et communication'
        WHEN naf_section = 'K' THEN 'Activités financières et d''assurance'
        WHEN naf_section = 'L' THEN 'Activités immobilières'
        WHEN naf_section = 'M' THEN 'Activités spécialisées, scientifiques et techniques'
        WHEN naf_section = 'N' THEN 'Activités de services administratifs et de soutien'
        WHEN naf_section = 'O' THEN 'Administration publique'
        WHEN naf_section = 'P' THEN 'Enseignement'
        WHEN naf_section = 'Q' THEN 'Santé humaine et action sociale'
        WHEN naf_section = 'R' THEN 'Arts, spectacles et activités récréatives'
        WHEN naf_section = 'S' THEN 'Autres activités de services'
        ELSE 'Non classé'
    END AS secteur,
    COUNT(*) AS nombre_entreprises,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM nouveaux_sites WHERE date_creation >= '2026-01-24' AND date_creation <= '2026-02-06'), 1) AS pourcentage
FROM nouveaux_sites
WHERE date_creation >= '2026-01-24' 
AND date_creation <= '2026-02-06'
GROUP BY naf_section
ORDER BY nombre_entreprises DESC
LIMIT 10;

-- 3. Répartition par taille d'entreprise
SELECT 
    categorie_entreprise,
    COUNT(*) AS nombre_entreprises,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM nouveaux_sites WHERE date_creation >= '2026-01-24' AND date_creation <= '2026-02-06'), 1) AS pourcentage
FROM nouveaux_sites
WHERE date_creation >= '2026-01-24' 
AND date_creation <= '2026-02-06'
GROUP BY categorie_entreprise
ORDER BY nombre_entreprises DESC;

-- 4. TOP 10 villes
SELECT 
    ville,
    COUNT(*) AS nombre_entreprises
FROM nouveaux_sites
WHERE date_creation >= '2026-01-24' 
AND date_creation <= '2026-02-06'
AND ville IS NOT NULL
GROUP BY ville
ORDER BY nombre_entreprises DESC
LIMIT 10;

-- 5. Répartition sièges vs établissements secondaires
SELECT 
    CASE WHEN est_siege THEN 'Siège social' ELSE 'Établissement secondaire' END AS type,
    COUNT(*) AS nombre,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM nouveaux_sites WHERE date_creation >= '2026-01-24' AND date_creation <= '2026-02-06'), 1) AS pourcentage
FROM nouveaux_sites
WHERE date_creation >= '2026-01-24' 
AND date_creation <= '2026-02-06'
GROUP BY est_siege;

-- 6. Évolution jour par jour
SELECT 
    date_creation,
    COUNT(*) AS nombre_creations
FROM nouveaux_sites
WHERE date_creation >= '2026-01-24' 
AND date_creation <= '2026-02-06'
GROUP BY date_creation
ORDER BY date_creation;

-- 7. Total global
SELECT 
    COUNT(*) AS total_entreprises,
    COUNT(DISTINCT LEFT(code_postal, 2)) AS nombre_departements,
    COUNT(DISTINCT ville) AS nombre_villes,
    COUNT(DISTINCT naf_section) AS nombre_secteurs
FROM nouveaux_sites
WHERE date_creation >= '2026-01-24' 
AND date_creation <= '2026-02-06';
