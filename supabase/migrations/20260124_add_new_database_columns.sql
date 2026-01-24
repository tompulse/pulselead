-- Migration pour nouvelle base de données (1er déc 2025 - 24 jan 2026)
-- Ajoute les colonnes manquantes pour l'import

-- Ajout colonnes section_naf et categorie_entreprise
ALTER TABLE public.entreprises 
ADD COLUMN IF NOT EXISTS section_naf TEXT,
ADD COLUMN IF NOT EXISTS categorie_entreprise TEXT CHECK (categorie_entreprise IN ('PME', 'ETI', 'GE'));

-- Index pour les nouveaux filtres
CREATE INDEX IF NOT EXISTS idx_entreprises_section_naf ON public.entreprises(section_naf);
CREATE INDEX IF NOT EXISTS idx_entreprises_categorie_entreprise ON public.entreprises(categorie_entreprise);

-- Index composite pour les recherches combinées
CREATE INDEX IF NOT EXISTS idx_entreprises_filters ON public.entreprises(code_postal, section_naf, categorie_entreprise, date_demarrage);

-- Commentaires
COMMENT ON COLUMN public.entreprises.section_naf IS 'Section NAF (lettre A-Z selon la nomenclature INSEE)';
COMMENT ON COLUMN public.entreprises.categorie_entreprise IS 'Catégorie d''entreprise selon l''effectif: PME, ETI ou GE';
