-- Create entreprises table for storing company data
CREATE TABLE public.entreprises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siret TEXT NOT NULL UNIQUE,
  nom TEXT NOT NULL,
  adresse TEXT,
  code_postal TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  code_naf TEXT,
  statut TEXT CHECK (statut IN ('creation', 'cession', 'fermeture')),
  date_demarrage DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.entreprises ENABLE ROW LEVEL SECURITY;

-- Create policies - allow all authenticated users to read
CREATE POLICY "Authenticated users can view entreprises"
  ON public.entreprises
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index for faster queries
CREATE INDEX idx_entreprises_code_postal ON public.entreprises(code_postal);
CREATE INDEX idx_entreprises_statut ON public.entreprises(statut);
CREATE INDEX idx_entreprises_date_demarrage ON public.entreprises(date_demarrage);
CREATE INDEX idx_entreprises_code_naf ON public.entreprises(code_naf);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_entreprises_updated_at
  BEFORE UPDATE ON public.entreprises
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();