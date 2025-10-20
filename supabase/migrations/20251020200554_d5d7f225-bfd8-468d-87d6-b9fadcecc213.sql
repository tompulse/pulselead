-- Ajouter des colonnes pour le suivi de la prospection dans tournees
ALTER TABLE tournees ADD COLUMN IF NOT EXISTS visites_effectuees jsonb DEFAULT '[]'::jsonb;

-- Table pour les notes de visite
CREATE TABLE IF NOT EXISTS tournee_visites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournee_id UUID NOT NULL REFERENCES tournees(id) ON DELETE CASCADE,
  entreprise_id UUID NOT NULL REFERENCES entreprises(id),
  user_id UUID NOT NULL,
  ordre_visite INTEGER,
  notes TEXT,
  rdv_pris BOOLEAN DEFAULT false,
  a_revoir BOOLEAN DEFAULT false,
  statut TEXT DEFAULT 'non_visite',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE tournee_visites ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own tournee visites"
ON tournee_visites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tournee visites"
ON tournee_visites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tournee visites"
ON tournee_visites FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tournee visites"
ON tournee_visites FOR DELETE
USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE TRIGGER update_tournee_visites_updated_at
BEFORE UPDATE ON tournee_visites
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();