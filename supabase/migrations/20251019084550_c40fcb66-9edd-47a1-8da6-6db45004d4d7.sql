-- Add enrichment columns to entreprises table
ALTER TABLE public.entreprises 
ADD COLUMN IF NOT EXISTS telephone text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS site_web text,
ADD COLUMN IF NOT EXISTS effectifs integer,
ADD COLUMN IF NOT EXISTS chiffre_affaires numeric,
ADD COLUMN IF NOT EXISTS forme_juridique text,
ADD COLUMN IF NOT EXISTS dirigeant text,
ADD COLUMN IF NOT EXISTS score_lead integer CHECK (score_lead >= 0 AND score_lead <= 100),
ADD COLUMN IF NOT EXISTS enrichi boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS date_enrichissement timestamp with time zone;

-- Add index for better query performance on enrichment status
CREATE INDEX IF NOT EXISTS idx_entreprises_enrichi ON public.entreprises(enrichi);

-- Add index for email searches
CREATE INDEX IF NOT EXISTS idx_entreprises_email ON public.entreprises(email) WHERE email IS NOT NULL;

COMMENT ON COLUMN public.entreprises.telephone IS 'Téléphone de l''entreprise';
COMMENT ON COLUMN public.entreprises.email IS 'Email de contact';
COMMENT ON COLUMN public.entreprises.site_web IS 'URL du site web';
COMMENT ON COLUMN public.entreprises.effectifs IS 'Nombre d''employés';
COMMENT ON COLUMN public.entreprises.chiffre_affaires IS 'Chiffre d''affaires annuel';
COMMENT ON COLUMN public.entreprises.forme_juridique IS 'Forme juridique (SAS, SARL, etc.)';
COMMENT ON COLUMN public.entreprises.dirigeant IS 'Nom du dirigeant principal';
COMMENT ON COLUMN public.entreprises.score_lead IS 'Score de qualité du lead (0-100)';
COMMENT ON COLUMN public.entreprises.enrichi IS 'Indique si l''entreprise a été enrichie';
COMMENT ON COLUMN public.entreprises.date_enrichissement IS 'Date du dernier enrichissement';