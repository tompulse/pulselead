-- Migration pour nouvelle base de données (1er déc 2025 - 24 jan 2026)
-- Ajoute les colonnes manquantes pour l'import + système d'archivage soft

-- Ajout colonnes section_naf et categorie_entreprise
ALTER TABLE public.entreprises 
ADD COLUMN IF NOT EXISTS section_naf TEXT,
ADD COLUMN IF NOT EXISTS categorie_entreprise TEXT CHECK (categorie_entreprise IN ('PME', 'ETI', 'GE'));

-- Ajout système d'archivage (soft delete)
-- Une entreprise archivée reste dans la DB mais n'apparaît plus dans l'onglet Prospects
-- Elle reste visible dans Tournées et CRM avec un badge visuel
ALTER TABLE public.entreprises
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS date_archive TIMESTAMP WITH TIME ZONE;

-- Index pour les nouveaux filtres
CREATE INDEX IF NOT EXISTS idx_entreprises_section_naf ON public.entreprises(section_naf);
CREATE INDEX IF NOT EXISTS idx_entreprises_categorie_entreprise ON public.entreprises(categorie_entreprise);
CREATE INDEX IF NOT EXISTS idx_entreprises_archived ON public.entreprises(archived);

-- Index composite pour les recherches combinées
CREATE INDEX IF NOT EXISTS idx_entreprises_filters ON public.entreprises(code_postal, section_naf, categorie_entreprise, date_demarrage, archived);

-- Commentaires
COMMENT ON COLUMN public.entreprises.section_naf IS 'Section NAF (lettre A-Z selon la nomenclature INSEE)';
COMMENT ON COLUMN public.entreprises.categorie_entreprise IS 'Catégorie d''entreprise selon l''effectif: PME, ETI ou GE';
COMMENT ON COLUMN public.entreprises.archived IS 'TRUE si l''entreprise n''est plus dans la base active (soft delete). Reste visible dans tournées/CRM avec badge.';
COMMENT ON COLUMN public.entreprises.date_archive IS 'Date à laquelle l''entreprise a été archivée';