-- Ajouter les colonnes pour stocker les informations des dirigeants
-- Ces colonnes permettent de sauvegarder les infos enrichies via Pappers

-- Ajouter les colonnes si elles n'existent pas déjà
ALTER TABLE public.nouveaux_sites
ADD COLUMN IF NOT EXISTS dirigeant TEXT,
ADD COLUMN IF NOT EXISTS fonction_dirigeant TEXT,
ADD COLUMN IF NOT EXISTS enrichi_dirigeant BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS date_enrichissement_dirigeant TIMESTAMPTZ;

-- Créer un index pour les recherches sur les dirigeants enrichis
CREATE INDEX IF NOT EXISTS idx_nouveaux_sites_enrichi_dirigeant 
ON public.nouveaux_sites(enrichi_dirigeant) 
WHERE enrichi_dirigeant = true;

-- Commentaires pour la documentation
COMMENT ON COLUMN public.nouveaux_sites.dirigeant IS 'Nom complet du dirigeant principal (enrichi via Pappers ou saisi manuellement)';
COMMENT ON COLUMN public.nouveaux_sites.fonction_dirigeant IS 'Fonction du dirigeant (Gérant, Président, etc.)';
COMMENT ON COLUMN public.nouveaux_sites.enrichi_dirigeant IS 'Indique si les infos dirigeant ont été enrichies';
COMMENT ON COLUMN public.nouveaux_sites.date_enrichissement_dirigeant IS 'Date du dernier enrichissement des infos dirigeant';
