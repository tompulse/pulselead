-- Supprimer les tables qui dépendent de entreprises
DROP TABLE IF EXISTS public.lead_interactions CASCADE;
DROP TABLE IF EXISTS public.lead_statuts CASCADE;
DROP TABLE IF EXISTS public.tournee_visites CASCADE;

-- Supprimer la table entreprises
DROP TABLE IF EXISTS public.entreprises CASCADE;

-- Supprimer la fonction get_filter_counts qui était pour entreprises
DROP FUNCTION IF EXISTS public.get_filter_counts(text[], text[], text[], text[]);