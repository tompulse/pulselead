-- Supprimer la colonne sous_categorie de la table entreprises
ALTER TABLE public.entreprises DROP COLUMN IF EXISTS sous_categorie;