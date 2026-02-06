-- Vérifier si la contrainte UNIQUE existe
SELECT 
    conname AS constraint_name,
    contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'public.nouveaux_sites'::regclass
AND contype = 'u';

-- Si pas de résultat, créer la contrainte
-- MAIS il faut d'abord vérifier qu'il n'y a pas de doublons existants
SELECT 
    siret, 
    COUNT(*) as nb,
    string_agg(nom, ' | ') as noms
FROM nouveaux_sites
GROUP BY siret
HAVING COUNT(*) > 1
LIMIT 10;

-- Si aucun doublon, créer la contrainte :
-- ALTER TABLE public.nouveaux_sites ADD CONSTRAINT nouveaux_sites_siret_key UNIQUE (siret);
