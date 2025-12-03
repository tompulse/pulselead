-- Create lead_statuts table for tracking prospect status
CREATE TABLE public.lead_statuts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entreprise_id UUID NOT NULL,
  statut TEXT NOT NULL DEFAULT 'nouveau',
  score INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, entreprise_id)
);

-- Create lead_interactions table for tracking interactions
CREATE TABLE public.lead_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entreprise_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'autre',
  statut TEXT NOT NULL DEFAULT 'en_cours',
  notes TEXT,
  date_interaction TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date_relance TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_statuts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for lead_statuts
CREATE POLICY "Users can view their own lead statuts" 
ON public.lead_statuts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lead statuts" 
ON public.lead_statuts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lead statuts" 
ON public.lead_statuts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lead statuts" 
ON public.lead_statuts FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for lead_interactions
CREATE POLICY "Users can view their own interactions" 
ON public.lead_interactions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interactions" 
ON public.lead_interactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions" 
ON public.lead_interactions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions" 
ON public.lead_interactions FOR DELETE 
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_lead_statuts_updated_at
BEFORE UPDATE ON public.lead_statuts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lead_interactions_updated_at
BEFORE UPDATE ON public.lead_interactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();