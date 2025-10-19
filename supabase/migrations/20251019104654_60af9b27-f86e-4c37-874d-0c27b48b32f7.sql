-- Ajouter la colonne ville à la table entreprises
ALTER TABLE public.entreprises 
ADD COLUMN IF NOT EXISTS ville text;