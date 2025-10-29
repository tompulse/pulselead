import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wand2, Loader2 } from "lucide-react";
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
  const [activeJob, setActiveJob] = useState<QualificationJob | null>(null);
  const [unqualifiedCount, setUnqualifiedCount] = useState<number>(0);
  const { toast } = useToast();

  // Check for running job and count unqualified
  useEffect(() => {
    const fetchData = async () => {
      // Check for running job
      const { data: job } = await supabase
        .from('qualification_jobs')
        .select('*')
        .in('status', ['running', 'paused'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (job) {
        console.log('Active job found:', job);
        setActiveJob(job);
      }

      // Count unqualified
      const { count } = await supabase
        .from('entreprises')
        .select('*', { count: 'exact', head: true })
        .is('categorie_qualifiee', null);

      console.log('Unqualified count:', count);
      setUnqualifiedCount(count || 0);
    };

    fetchData();
  }, []);

  // Subscribe to job updates with realtime
  useEffect(() => {
    const channel = supabase
      .channel('qualification_jobs_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'qualification_jobs',
        },
        (payload) => {
          const updated = payload.new as QualificationJob;
          console.log('Job updated via realtime:', updated);
          setActiveJob(updated);

          if (updated.status === 'completed') {
            toast({
              title: "✅ Qualification terminée",
              description: `${updated.succeeded_count} entreprises qualifiées`,
            });
            setActiveJob(null);
            // Refresh unqualified count
            supabase
              .from('entreprises')
              .select('*', { count: 'exact', head: true })
              .is('categorie_qualifiee', null)
              .then(({ count }) => setUnqualifiedCount(count || 0));
          }

          if (updated.status === 'failed') {
            toast({
              title: "❌ Erreur",
              description: "Le processus a échoué",
              variant: "destructive",
            });
            setActiveJob(null);
          }

          if (updated.status === 'paused') {
            toast({
              title: "⏸️ En pause",
              description: "Crédits insuffisants. Réessayez plus tard.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleQualify = async () => {
    try {
      console.log('Starting qualification...');
      const { data, error } = await supabase.functions.invoke("qualify-entreprises-background", {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        console.error('Invoke error:', error);
        throw error;
      }

      console.log('Function response:', data);

      toast({
        title: "🤖 Qualification lancée",
        description: `${data.totalCount.toLocaleString('fr-FR')} entreprises à traiter`,
      });

      // Fetch job immediately to show it
      const { data: job } = await supabase
        .from('qualification_jobs')
        .select('*')
        .eq('id', data.jobId)
        .single();

      console.log('Job fetched:', job);
      if (job) setActiveJob(job);

    } catch (error) {
      console.error("Erreur qualification:", error);
      toast({
        title: "❌ Erreur",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      });
    }
  };

  const isRunning = activeJob?.status === 'running';
  const progress = activeJob && activeJob.total_count > 0
    ? Math.round((activeJob.processed_count / activeJob.total_count) * 100)
    : 0;

  if (unqualifiedCount === 0 && !activeJob) {
    return null;
  }

  return (
    <Button
      onClick={handleQualify}
      disabled={isRunning}
      variant="default"
      size="sm"
      className="h-7 px-3 text-xs bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70"
    >
      {isRunning ? (
        <>
          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          <span>{progress}%</span>
          <Badge variant="secondary" className="ml-2 bg-white/20 text-white text-[10px] px-1">
            {activeJob.processed_count.toLocaleString('fr-FR')}/{activeJob.total_count.toLocaleString('fr-FR')}
          </Badge>
        </>
      ) : (
        <>
          <Wand2 className="w-3.5 h-3.5 mr-1.5" />
          <span>Qualifier avec l'IA</span>
          {unqualifiedCount > 0 && (
            <Badge variant="secondary" className="ml-2 bg-white/20 text-white text-[10px] px-1">
              {unqualifiedCount.toLocaleString('fr-FR')}
            </Badge>
          )}
        </>
      )}
    </Button>
  );
};
