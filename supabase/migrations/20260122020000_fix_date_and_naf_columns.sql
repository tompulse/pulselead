-- Fix date_creation column type and populate NAF columns
-- Migration created on 2026-01-22 after data import
-- This migration fixes issues with imported data from external sources

-- ==========================================
-- 1. Fix date_creation column type
-- ==========================================
-- The column was TEXT, but we need DATE for proper sorting and filtering

-- First, set NULL values to a default date
UPDATE nouveaux_sites 
SET date_creation = '2020-01-01' 
WHERE date_creation IS NULL OR date_creation = '';

-- Convert TEXT to DATE type (existing valid dates will be preserved)
ALTER TABLE nouveaux_sites 
ALTER COLUMN date_creation TYPE DATE 
USING CASE 
  WHEN date_creation ~ '^\d{4}-\d{2}-\d{2}$' THEN date_creation::DATE
  ELSE '2020-01-01'::DATE
END;

COMMENT ON COLUMN nouveaux_sites.date_creation IS 'Date de création de l''établissement (converti en type DATE le 2026-01-22)';

-- ==========================================
-- 2. Populate NAF columns from code_naf
-- ==========================================
-- Extract NAF hierarchy from code_naf (format: XX.XXX)
-- Example: 47.11D → section=4, division=47, groupe=471, classe=4711

UPDATE nouveaux_sites
SET 
  naf_section = SUBSTRING(code_naf FROM 1 FOR 1),
  naf_division = SUBSTRING(REPLACE(code_naf, '.', '') FROM 1 FOR 2),
  naf_groupe = SUBSTRING(REPLACE(code_naf, '.', '') FROM 1 FOR 3),
  naf_classe = SUBSTRING(REPLACE(code_naf, '.', '') FROM 1 FOR 4)
WHERE 
  code_naf IS NOT NULL 
  AND code_naf != ''
  AND (naf_section IS NULL OR naf_division IS NULL OR naf_groupe IS NULL OR naf_classe IS NULL);

-- Verify counts
DO $$
DECLARE
  total_count INTEGER;
  naf_populated_count INTEGER;
  dates_populated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM nouveaux_sites;
  SELECT COUNT(*) INTO naf_populated_count FROM nouveaux_sites WHERE naf_section IS NOT NULL;
  SELECT COUNT(*) INTO dates_populated_count FROM nouveaux_sites WHERE date_creation IS NOT NULL;
  
  RAISE NOTICE 'Migration completed: % total rows, % with NAF data, % with dates', 
    total_count, naf_populated_count, dates_populated_count;
END $$;
