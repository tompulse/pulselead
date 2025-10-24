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
  const { toast } = useToast();

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
    setLoading(true);
    setActiveJob(null);

    try {
      const { data, error } = await supabase.functions.invoke("qualify-entreprises-background", {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "🤖 Qualification démarrée",
        description: `${data.totalCount} entreprises seront traitées en arrière-plan`,
        duration: 3000,
      });

      // Fetch the job to start tracking
      const { data: job, error: jobError } = await supabase
        .from('qualification_jobs')
        .select('*')
        .eq('id', data.jobId)
        .single();

      if (jobError) throw jobError;

      setActiveJob(job);

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

  const progress = activeJob
    ? Math.round((activeJob.processed_count / activeJob.total_count) * 100)
    : 0;

  return (
    <div className="relative">
      <Button
        onClick={handleQualify}
        disabled={loading}
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs border-accent/50 hover:bg-accent/10"
      >
        {activeJob?.status === 'completed' ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <Sparkles className={`w-3.5 h-3.5 ${loading ? "animate-pulse" : ""}`} />
        )}
        <span className="hidden lg:inline ml-1">
          {loading ? "En cours..." : "Qualifier tout"}
        </span>
      </Button>

      {activeJob && (activeJob.status === 'running' || activeJob.status === 'paused') && (
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
    </div>
  );
};
