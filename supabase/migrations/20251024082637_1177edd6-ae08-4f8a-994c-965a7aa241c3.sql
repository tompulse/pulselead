-- Table pour suivre la progression de la qualification
CREATE TABLE IF NOT EXISTS public.qualification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'running', -- running, completed, failed
  total_count INTEGER NOT NULL DEFAULT 0,
  processed_count INTEGER NOT NULL DEFAULT 0,
  succeeded_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.qualification_jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own jobs
CREATE POLICY "Users can view their own qualification jobs"
ON public.qualification_jobs
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can create their own jobs
CREATE POLICY "Users can create their own qualification jobs"
ON public.qualification_jobs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can update any job
CREATE POLICY "Service role can update qualification jobs"
ON public.qualification_jobs
FOR UPDATE
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_qualification_jobs_updated_at
BEFORE UPDATE ON public.qualification_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.qualification_jobs;