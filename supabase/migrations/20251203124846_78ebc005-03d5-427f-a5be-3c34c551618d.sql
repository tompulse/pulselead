-- Supprimer la table entreprises qui n'est plus utilisée
DROP TABLE IF EXISTS public.entreprises CASCADE;

-- Supprimer aussi les fonctions associées qui ne sont plus nécessaires
DROP FUNCTION IF EXISTS public.get_filter_counts(text[], text[], text[], text[]);