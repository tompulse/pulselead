-- Add interlocuteur column to entreprises table
ALTER TABLE public.entreprises 
ADD COLUMN IF NOT EXISTS interlocuteur text;

COMMENT ON COLUMN public.entreprises.interlocuteur IS 'Nom de l''interlocuteur principal';