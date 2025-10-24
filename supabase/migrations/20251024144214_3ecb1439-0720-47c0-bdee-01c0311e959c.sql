-- Suppression des entreprises DOM-TOM et Corse
-- DOM-TOM : 1,570 entreprises (codes postaux 97xxx et 98xxx)
-- Corse : 185 entreprises (codes postaux 20xxx)
-- Total : 1,755 entreprises

DELETE FROM entreprises
WHERE SUBSTRING(code_postal FROM 1 FOR 2) IN ('97', '98', '20');