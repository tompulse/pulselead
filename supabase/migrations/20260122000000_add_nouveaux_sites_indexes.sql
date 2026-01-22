-- Add performance indexes for nouveaux_sites table
-- This migration ONLY adds indexes - no data is modified, no columns added/removed
-- Indexes work like a book index: they help find data faster without changing the content

-- Enable pg_trgm extension for fuzzy text search (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Text search indexes using trigram for flexible matching
-- This speeds up ILIKE queries (case-insensitive search) on text columns
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_nom_trgm 
ON nouveaux_sites USING gin(nom gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_ville_trgm 
ON nouveaux_sites USING gin(ville gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_adresse_trgm 
ON nouveaux_sites USING gin(adresse gin_trgm_ops);

-- Exact match indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_siret 
ON nouveaux_sites(siret);

CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_code_postal 
ON nouveaux_sites(code_postal);

-- NAF code indexes for filtering by business category
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_naf_section 
ON nouveaux_sites(naf_section);

CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_naf_division 
ON nouveaux_sites(naf_division);

CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_naf_groupe 
ON nouveaux_sites(naf_groupe);

CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_naf_classe 
ON nouveaux_sites(naf_classe);

CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_code_naf 
ON nouveaux_sites(code_naf);

-- Filters indexes
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_categorie_entreprise 
ON nouveaux_sites(categorie_entreprise);

CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_categorie_juridique 
ON nouveaux_sites(categorie_juridique);

CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_est_siege 
ON nouveaux_sites(est_siege);

-- Date index for sorting and filtering by creation date
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_date_creation 
ON nouveaux_sites(date_creation DESC);

-- Geographic coordinates index for spatial queries
-- Only create if latitude and longitude columns exist and are valid
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_coords 
ON nouveaux_sites(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_naf_dept 
ON nouveaux_sites(naf_section, code_postal);

-- Add comment to track optimization
COMMENT ON TABLE nouveaux_sites IS 'Table optimized with performance indexes on 2026-01-22';
