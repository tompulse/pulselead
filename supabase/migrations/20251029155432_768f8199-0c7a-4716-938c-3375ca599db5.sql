-- Créer une table pour gérer l'état de la qualification
CREATE TABLE IF NOT EXISTS qualification_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_running BOOLEAN NOT NULL DEFAULT false,
  total_count INTEGER NOT NULL DEFAULT 0,
  qualified_count INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  paused_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE qualification_status ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own qualification status"
  ON qualification_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own qualification status"
  ON qualification_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own qualification status"
  ON qualification_status FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE TRIGGER update_qualification_status_updated_at
  BEFORE UPDATE ON qualification_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index pour les requêtes fréquentes
CREATE INDEX idx_qualification_status_user_id ON qualification_status(user_id);
CREATE INDEX idx_qualification_status_is_running ON qualification_status(is_running);