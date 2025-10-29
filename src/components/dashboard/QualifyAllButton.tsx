import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QualificationJob {
  id: string;
  status: string;
  total_count: number;
  processed_count: number;
  succeeded_count: number;
  failed_count: number;
}

export const QualifyAllButton = () => {
  const [loading, setLoading] = useState(false);
  const [activeJob, setActiveJob] = useState<QualificationJob | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const { toast } = useToast();

  // Check for existing running job on mount
  useEffect(() => {
    const checkForRunningJob = async () => {
      const { data: job } = await supabase
        .from('qualification_jobs')
        .select('*')
        .in('status', ['running', 'paused'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (job) {
        setActiveJob(job);
        setLoading(job.status === 'running');
        // Ne pas afficher la popup automatiquement au chargement
      }
    };

    checkForRunningJob();
  }, []);

  // Subscribe to job updates via Realtime
  useEffect(() => {
    if (!activeJob) return;

    const channel = supabase
      .channel(`qualification_job_${activeJob.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'qualification_jobs',
          filter: `id=eq.${activeJob.id}`,
        },
        (payload) => {
          const updated = payload.new as QualificationJob;
          setActiveJob(updated);

          // Show completion notification
          if (updated.status === 'completed') {
            toast({
              title: "✅ Qualification terminée !",
              description: `${updated.succeeded_count} entreprises qualifiées avec succès`,
              duration: 5000,
            });
            setLoading(false);
            
            // Reload after a short delay
            setTimeout(() => window.location.reload(), 2000);
          }

          if (updated.status === 'failed') {
            toast({
              title: "❌ Erreur de qualification",
              description: "Le processus a rencontré une erreur",
              variant: "destructive",
              duration: 5000,
            });
            setLoading(false);
          }

          if (updated.status === 'paused') {
            toast({
              title: "⏸️ Qualification mise en pause",
              description: "Crédits IA insuffisants ou limite de requêtes atteinte. Réessayez plus tard.",
              duration: 6000,
            });
            setLoading(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeJob, toast]);

  const handleQualify = async () => {
    // Si un job est actif, on toggle la popup
    if (activeJob && (activeJob.status === 'running' || activeJob.status === 'paused')) {
      setShowPopup(!showPopup);
      return;
    }

    setLoading(true);
    setActiveJob(null);
    setShowPopup(true);

    try {
      const { data, error } = await supabase.functions.invoke("qualify-entreprises-background", {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      const message = data.message === 'resumed' ? '▶️ Qualification reprise' : 
                      data.message === 'already_running' ? '🔄 Qualification en cours' :
                      '🤖 Qualification démarrée';

      toast({
        title: message,
        description: `${data.totalCount} entreprises au total`,
        duration: 3000,
      });

      // Fetch the job to start tracking
      const { data: job, error: jobError } = await supabase
        .from('qualification_jobs')
        .select('*')
        .eq('id', data.jobId)
        .maybeSingle();

      if (jobError) throw jobError;
      if (job) setActiveJob(job);

    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "❌ Erreur",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
        duration: 3000,
      });
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!activeJob) return;
    
    try {
      const { error } = await supabase
        .from('qualification_jobs')
        .update({ status: 'paused', updated_at: new Date().toISOString() })
        .eq('id', activeJob.id);

      if (error) throw error;

      toast({
        title: "⏸️ Qualification mise en pause",
        description: "Vous pouvez la reprendre plus tard",
        duration: 3000,
      });
      setLoading(false);
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "❌ Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'arrêt",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const progress = activeJob
    ? Math.round((activeJob.processed_count / activeJob.total_count) * 100)
    : 0;

  const isRunning = activeJob?.status === 'running' && loading;
  const isPaused = activeJob?.status === 'paused';
  const isCompleted = activeJob?.status === 'completed' && progress === 100;

  return (
    <div className="relative flex gap-2">
      <Button
        onClick={handleQualify}
        disabled={isRunning || isCompleted}
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs border-accent/50 hover:bg-accent/10"
      >
        {isCompleted ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <Sparkles className={`w-3.5 h-3.5 ${isRunning ? "animate-pulse" : ""}`} />
        )}
        <span className="hidden lg:inline ml-1">
          {isCompleted ? "Toutes qualifiées" : isPaused ? "Reprendre" : isRunning ? "En cours..." : "Qualifier tout"}
        </span>
      </Button>

      {isRunning && (
        <Button
          onClick={handleStop}
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs border-destructive/50 hover:bg-destructive/10"
        >
          <span className="hidden lg:inline">Arrêter</span>
        </Button>
      )}

      {activeJob && (activeJob.status === 'running' || activeJob.status === 'paused') && !isCompleted && showPopup && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-background border rounded-md p-3 shadow-lg z-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium">Qualification IA {activeJob.status === 'paused' ? '(en pause)' : ''}</p>
            <p className="text-xs text-muted-foreground">{progress}%</p>
          </div>
          <Progress value={progress} className="w-full mb-2" />
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>Traité: {activeJob.processed_count} / {activeJob.total_count}</p>
            <p>✅ Succès: {activeJob.succeeded_count} | ❌ Échecs: {activeJob.failed_count}</p>
          </div>
          {activeJob.status === 'paused' ? (
            <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
              ⏸️ En pause: crédits IA insuffisants ou limite de requêtes atteinte
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
              💡 Vous pouvez fermer cette page, le processus continue en arrière-plan
            </p>
          )}
        </div>
      )}

      {isCompleted && showPopup && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-background border rounded-md p-3 shadow-lg z-50">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <p className="text-xs font-medium text-green-600">Toutes les entreprises sont qualifiées !</p>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>✅ {activeJob.succeeded_count} entreprises qualifiées avec succès</p>
            {activeJob.failed_count > 0 && <p>❌ {activeJob.failed_count} échecs</p>}
          </div>
        </div>
      )}
    </div>
  );
};
