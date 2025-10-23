import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export const QualifyAllButton = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  const handleQualify = async () => {
    setLoading(true);
    setProgress(0);
    setStats(null);

    try {
      toast({
        title: "🤖 Qualification en cours",
        description: "L'IA qualifie toutes les entreprises non qualifiées...",
        duration: 3000,
      });

      const { data, error } = await supabase.functions.invoke("qualify-all-entreprises");

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
        <div className="w-full">
          <Progress value={progress} className="h-1" />
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
