-- 🔧 Mise à jour des tailles d'entreprise
-- Tout ce qui n'est pas GE, ETI ou PME → "Taille inconnue, nouvelle entité"

-- Étape 1: Vérifier les valeurs actuelles
SELECT 
  categorie_entreprise,
  COUNT(*) as nombre
FROM nouveaux_sites
GROUP BY categorie_entreprise
ORDER BY nombre DESC;

-- Étape 2: Mettre à jour toutes les entreprises sans taille définie
UPDATE nouveaux_sites
SET categorie_entreprise = 'Taille inconnue, nouvelle entité'
WHERE categorie_entreprise IS NULL 
   OR categorie_entreprise = ''
   OR TRIM(categorie_entreprise) = ''
   OR categorie_entreprise NOT IN ('GE', 'ETI', 'PME');

-- Étape 3: Vérification post-update
SELECT 
  categorie_entreprise,
  COUNT(*) as nombre
FROM nouveaux_sites
GROUP BY categorie_entreprise
ORDER BY 
  CASE categorie_entreprise
    WHEN 'GE' THEN 1
    WHEN 'ETI' THEN 2
    WHEN 'PME' THEN 3
    WHEN 'Taille inconnue, nouvelle entité' THEN 4
    ELSE 5
  END;

-- ✅ Résultat: Seulement GE, ETI, PME, et "Taille inconnue, nouvelle entité"
