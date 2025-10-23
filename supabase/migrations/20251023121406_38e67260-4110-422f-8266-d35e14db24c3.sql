-- Ajouter les champs de qualification IA à la table entreprises
ALTER TABLE public.entreprises 
ADD COLUMN IF NOT EXISTS categorie_qualifiee text,
ADD COLUMN IF NOT EXISTS categorie_confidence integer CHECK (categorie_confidence >= 0 AND categorie_confidence <= 100),
ADD COLUMN IF NOT EXISTS date_qualification timestamp with time zone;

-- Créer un index pour améliorer les performances de filtrage
CREATE INDEX IF NOT EXISTS idx_entreprises_categorie_qualifiee ON public.entreprises(categorie_qualifiee);

-- Commenter les colonnes
COMMENT ON COLUMN public.entreprises.categorie_qualifiee IS 'Catégorie qualifiée par IA basée sur l''analyse contextuelle complète';
COMMENT ON COLUMN public.entreprises.categorie_confidence IS 'Niveau de confiance de la qualification (0-100)';
COMMENT ON COLUMN public.entreprises.date_qualification IS 'Date de la dernière qualification par IA';