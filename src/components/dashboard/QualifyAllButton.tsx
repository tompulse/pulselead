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

  const pollProgress = async (initialUnqualified: number) => {
    // Vérifier combien d'entreprises ont été qualifiées
    const { count } = await supabase
      .from('entreprises')
      .select('*', { count: 'exact', head: true })
      .not('categorie_qualifiee', 'is', null);

    const qualified = count || 0;
    const processed = qualified;
    const progressPercent = Math.min(Math.round((processed / initialUnqualified) * 100), 99);
    
    setProcessedCount(processed);
    setProgress(progressPercent);
  };

  const handleQualify = async () => {
    setLoading(true);
    setProgress(0);
    setStats(null);
    setProcessedCount(0);

    try {
      // Compter les entreprises non qualifiées au départ
      const { count: unqualifiedCount } = await supabase
        .from('entreprises')
        .select('*', { count: 'exact', head: true })
        .is('categorie_qualifiee', null);

      const total = unqualifiedCount || 0;
      setTotalCount(total);

      toast({
        title: "🤖 Qualification en cours",
        description: `Qualification de ${total} entreprises en cours...`,
        duration: 3000,
      });

      // Démarrer le polling toutes les 2 secondes
      pollingIntervalRef.current = window.setInterval(() => {
        pollProgress(total);
      }, 2000);

      // Lancer la qualification
      const { data, error } = await supabase.functions.invoke("qualify-all-entreprises");

      // Arrêter le polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      if (error) throw error;

      setStats(data);
      setProgress(100);

      toast({
        title: "✅ Qualification terminée",
        description: `${data.succeeded}/${data.total} entreprises qualifiées avec succès`,
        duration: 5000,
      });

      // Recharger après 2 secondes
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error("Erreur de qualification:", error);
      
      // Arrêter le polling en cas d'erreur
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      
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
