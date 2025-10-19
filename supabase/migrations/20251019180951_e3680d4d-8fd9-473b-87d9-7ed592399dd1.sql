-- Create enum for interaction types
CREATE TYPE public.interaction_type AS ENUM ('appel', 'email', 'visite', 'rdv', 'autre');

-- Create enum for interaction status
CREATE TYPE public.interaction_statut AS ENUM ('a_rappeler', 'en_cours', 'gagne', 'perdu', 'sans_suite');

-- Create enum for lead status
CREATE TYPE public.lead_statut_enum AS ENUM ('nouveau', 'contacte', 'qualifie', 'proposition', 'negociation', 'gagne', 'perdu');

-- Create lead_interactions table
CREATE TABLE public.lead_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entreprise_id UUID NOT NULL REFERENCES public.entreprises(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type public.interaction_type NOT NULL,
  statut public.interaction_statut NOT NULL,
  notes TEXT,
  prochaine_action TEXT,
  date_prochaine_action TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead_statuts table
CREATE TABLE public.lead_statuts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entreprise_id UUID NOT NULL REFERENCES public.entreprises(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  statut_actuel public.lead_statut_enum NOT NULL DEFAULT 'nouveau',
  etape_pipeline INTEGER NOT NULL DEFAULT 1 CHECK (etape_pipeline >= 1 AND etape_pipeline <= 5),
  valeur_estimee NUMERIC,
  probabilite INTEGER DEFAULT 0 CHECK (probabilite >= 0 AND probabilite <= 100),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(entreprise_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_statuts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lead_interactions
CREATE POLICY "Users can view their own interactions"
ON public.lead_interactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interactions"
ON public.lead_interactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions"
ON public.lead_interactions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions"
ON public.lead_interactions
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for lead_statuts
CREATE POLICY "Users can view their own lead statuts"
ON public.lead_statuts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lead statuts"
ON public.lead_statuts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lead statuts"
ON public.lead_statuts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lead statuts"
ON public.lead_statuts
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_interactions_user ON public.lead_interactions(user_id, created_at DESC);
CREATE INDEX idx_interactions_entreprise ON public.lead_interactions(entreprise_id, created_at DESC);
CREATE INDEX idx_interactions_date_prochaine ON public.lead_interactions(user_id, date_prochaine_action) WHERE date_prochaine_action IS NOT NULL;
CREATE INDEX idx_statut_user ON public.lead_statuts(user_id, statut_actuel);
CREATE INDEX idx_statut_entreprise ON public.lead_statuts(entreprise_id);

-- Create trigger for automatic timestamp updates on lead_interactions
CREATE TRIGGER update_lead_interactions_updated_at
BEFORE UPDATE ON public.lead_interactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on lead_statuts
CREATE TRIGGER update_lead_statuts_updated_at
BEFORE UPDATE ON public.lead_statuts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();