-- Supprimer les sites des DOM-TOM (codes postaux commençant par 97)
DELETE FROM nouveaux_sites 
WHERE code_postal LIKE '97%'
   OR code_postal LIKE '98%';