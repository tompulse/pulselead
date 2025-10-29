-- Reset all qualification data
UPDATE entreprises SET categorie_qualifiee = NULL, categorie_confidence = NULL, date_qualification = NULL;

-- Drop the qualification_jobs table
DROP TABLE IF EXISTS qualification_jobs CASCADE;