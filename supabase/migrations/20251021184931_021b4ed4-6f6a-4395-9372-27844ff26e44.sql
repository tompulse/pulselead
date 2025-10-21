-- Create user_onboarding_progress table
CREATE TABLE IF NOT EXISTS public.user_onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 1,
  completed_steps JSONB DEFAULT '[]'::jsonb,
  skipped_tutorial BOOLEAN DEFAULT false,
  demo_data_loaded BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own onboarding progress"
  ON public.user_onboarding_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own onboarding progress"
  ON public.user_onboarding_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding progress"
  ON public.user_onboarding_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_onboarding_progress_updated_at
  BEFORE UPDATE ON public.user_onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();