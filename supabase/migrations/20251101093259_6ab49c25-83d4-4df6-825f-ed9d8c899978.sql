-- Créer la table pour les nouveaux sites
CREATE TABLE IF NOT EXISTS public.nouveaux_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siret TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  date_creation DATE,
  est_siege BOOLEAN DEFAULT false,
  categorie_juridique TEXT,
  categorie_entreprise TEXT, -- GE/PME/ETI
  complement_adresse TEXT,
  numero_voie TEXT,
  type_voie TEXT,
  libelle_voie TEXT,
  code_postal TEXT,
  ville TEXT,
  coordonnee_lambert_x NUMERIC,
  coordonnee_lambert_y NUMERIC,
  latitude NUMERIC,
  longitude NUMERIC,
  code_naf TEXT,
  adresse TEXT, -- Adresse complète reconstruite
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nouveaux_sites ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view nouveaux sites"
ON public.nouveaux_sites
FOR SELECT
TO authenticated
USING (true);

-- Trigger pour updated_at
CREATE TRIGGER update_nouveaux_sites_updated_at
BEFORE UPDATE ON public.nouveaux_sites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour les recherches
CREATE INDEX idx_nouveaux_sites_siret ON public.nouveaux_sites(siret);
CREATE INDEX idx_nouveaux_sites_code_postal ON public.nouveaux_sites(code_postal);
CREATE INDEX idx_nouveaux_sites_code_naf ON public.nouveaux_sites(code_naf);
CREATE INDEX idx_nouveaux_sites_categorie_entreprise ON public.nouveaux_sites(categorie_entreprise);
CREATE INDEX idx_nouveaux_sites_location ON public.nouveaux_sites(latitude, longitude);