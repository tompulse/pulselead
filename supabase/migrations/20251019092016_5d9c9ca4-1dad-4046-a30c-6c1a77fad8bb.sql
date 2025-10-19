-- Add new columns for enriched company data
ALTER TABLE public.entreprises 
ADD COLUMN IF NOT EXISTS numero_voie text,
ADD COLUMN IF NOT EXISTS type_voie text,
ADD COLUMN IF NOT EXISTS nom_voie text,
ADD COLUMN IF NOT EXISTS administration text,
ADD COLUMN IF NOT EXISTS capital numeric,
ADD COLUMN IF NOT EXISTS activite text;

COMMENT ON COLUMN public.entreprises.numero_voie IS 'Numéro de la voie';
COMMENT ON COLUMN public.entreprises.type_voie IS 'Type de voie (rue, avenue, etc.)';
COMMENT ON COLUMN public.entreprises.nom_voie IS 'Nom de la voie';
COMMENT ON COLUMN public.entreprises.administration IS 'Administration et interlocuteurs';
COMMENT ON COLUMN public.entreprises.capital IS 'Capital de l''entreprise';
COMMENT ON COLUMN public.entreprises.activite IS 'Description de l''activité';