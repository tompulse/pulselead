import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export const QualifyAllButton = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();
  const pollingIntervalRef = useRef<number | null>(null);

  const getUnqualifiedCount = async () => {
    const { count } = await supabase
      .from('entreprises')
      .select('*', { count: 'exact', head: true })
      .is('categorie_qualifiee', null);
    return count || 0;
  };

  const handleQualify = async () => {
    setLoading(true);
    setProgress(0);
    setStats(null);
    setProcessedCount(0);

    try {
      // Compter les entreprises non qualifiées au départ
      const initialCount = await getUnqualifiedCount();
      setTotalCount(initialCount);

      toast({
        title: "🤖 Qualification en cours",
        description: `Qualification de ${initialCount} entreprises en lots de 50...`,
        duration: 3000,
      });

      let totalProcessed = 0;
      let totalSucceeded = 0;
      let totalFailed = 0;
      let remainingCount = initialCount;

      // Appeler la fonction en boucle tant qu'il reste des entreprises à qualifier
      while (remainingCount > 0) {
        const { data, error } = await supabase.functions.invoke("qualify-all-entreprises");

        if (error) {
          console.error("Erreur lors d'un appel:", error);
          totalFailed += 50; // Estimer les échecs
        } else {
          totalProcessed += data.processed || 0;
          totalSucceeded += data.succeeded || 0;
          totalFailed += data.failed || 0;
        }

        // Mettre à jour le progrès
        remainingCount = await getUnqualifiedCount();
        const processed = initialCount - remainingCount;
        setProcessedCount(processed);
        setProgress(Math.min(Math.round((processed / initialCount) * 100), 99));

        // Petite pause entre les appels pour éviter de surcharger
        if (remainingCount > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      setProgress(100);
      setStats({ total: initialCount, succeeded: totalSucceeded, failed: totalFailed });

      toast({
        title: "✅ Qualification terminée",
        description: `${totalSucceeded}/${initialCount} entreprises qualifiées avec succès`,
        duration: 5000,
      });

      // Recharger après 2 secondes
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error("Erreur de qualification:", error);
      
      toast({
        title: "❌ Erreur de qualification",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleQualify}
        disabled={loading}
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs border-primary/50 hover:bg-primary/10"
      >
        <Sparkles className={`w-3.5 h-3.5 ${loading ? "animate-pulse" : ""}`} />
        <span className="hidden lg:inline ml-1">
          {loading ? "Qualification..." : "Qualifier tout"}
        </span>
      </Button>
      
      {loading && (
        <div className="w-full space-y-1">
          <Progress value={progress} className="h-1" />
          <div className="text-xs text-muted-foreground text-center">
            {progress}% - {processedCount}/{totalCount} entreprises
          </div>
        </div>
      )}
      
      {stats && (
        <div className="text-xs text-muted-foreground">
          {stats.succeeded} qualifiées / {stats.failed} erreurs
        </div>
      )}
    </div>
  );
};
