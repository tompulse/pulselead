-- Table pour stocker les tournées planifiées
CREATE TABLE IF NOT EXISTS public.tournees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nom TEXT NOT NULL,
  date_planifiee DATE NOT NULL,
  statut TEXT NOT NULL DEFAULT 'planifiee' CHECK (statut IN ('planifiee', 'en_cours', 'terminee', 'annulee')),
  entreprises_ids UUID[] NOT NULL,
  ordre_optimise UUID[] NOT NULL,
  distance_totale_km NUMERIC,
  temps_estime_minutes INTEGER,
  point_depart_lat NUMERIC,
  point_depart_lng NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tournees ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own tournees"
  ON public.tournees
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tournees"
  ON public.tournees
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tournees"
  ON public.tournees
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tournees"
  ON public.tournees
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE TRIGGER update_tournees_updated_at
  BEFORE UPDATE ON public.tournees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();