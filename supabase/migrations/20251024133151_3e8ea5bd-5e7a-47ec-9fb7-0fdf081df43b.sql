-- Suppression définitive des entreprises non pertinentes
-- Cette migration supprime 19,727 entreprises identifiées comme non pertinentes :
-- 1. Immatriculation/Modification/Radiation (138 entreprises)
-- 2. Micro-livraison sans forme juridique (9,692 entreprises)
-- 3. SCI patrimoniales (9,914 entreprises)
-- Résultat attendu : 64,207 entreprises restantes (53,440 à qualifier)

DELETE FROM public.entreprises
WHERE 
  -- 1. Immatriculation/Modification/Radiation
  (
    activite ILIKE '%immatriculation%' 
    OR activite ILIKE '%modification%' 
    OR activite ILIKE '%radiation%'
  )
  OR 
  -- 2. Micro-livraison sans forme juridique
  (
    forme_juridique IS NULL 
    AND (
      activite ILIKE '%coursier%' 
      OR activite ILIKE '%livra%' 
      OR activite ILIKE '%vélo%' 
      OR activite ILIKE '%uber%' 
      OR activite ILIKE '%deliveroo%'
      OR activite ILIKE '%repas%'
    )
  )
  OR
  -- 3. SCI patrimoniales
  (
    forme_juridique = 'Société civile immobilière' 
    AND (
      activite ILIKE '%location%' 
      OR activite ILIKE '%gestion de biens%' 
      OR activite ILIKE '%immobilier%'
      OR activite ILIKE '%patrimoine%'
    )
  );