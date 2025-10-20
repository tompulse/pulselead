-- Add heure_debut column to tournees table
ALTER TABLE public.tournees 
ADD COLUMN heure_debut time DEFAULT '09:00:00';