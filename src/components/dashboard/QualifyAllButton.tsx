import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wand2, Loader2, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface CategoryCount {
  [key: string]: number;
}

export const QualifyAllButton = () => {
  const [unqualifiedCount, setUnqualifiedCount] = useState<number>(0);
  const [qualifiedCount, setQualifiedCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryCount>({});
  const { toast } = useToast();
  const shouldContinue = useRef(false);

  // Fetch counts and subscribe to changes
  useEffect(() => {
    const fetchCounts = async () => {
      const { count: unqualified } = await supabase
        .from('entreprises')
        .select('*', { count: 'exact', head: true })
        .is('categorie_qualifiee', null);

      const { count: qualified } = await supabase
        .from('entreprises')
        .select('*', { count: 'exact', head: true })
        .not('categorie_qualifiee', 'is', null);

      const { count: total } = await supabase
        .from('entreprises')
        .select('*', { count: 'exact', head: true });

      setUnqualifiedCount(unqualified || 0);
      setQualifiedCount(qualified || 0);
      setTotalCount(total || 0);

      // Get category distribution
      const { data: categories } = await supabase
        .from('entreprises')
        .select('categorie_qualifiee')
        .not('categorie_qualifiee', 'is', null);

      if (categories) {
        const distribution: CategoryCount = {};
        categories.forEach((item) => {
          const cat = item.categorie_qualifiee;
          if (cat) {
            distribution[cat] = (distribution[cat] || 0) + 1;
          }
        });
        setCategoryDistribution(distribution);
      }
    };

    fetchCounts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('entreprises-qualification')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'entreprises',
          filter: 'categorie_qualifiee=neq.null'
        },
        () => {
          fetchCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const processBatch = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("qualify-all-entreprises", {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Erreur qualification:", error);
      throw error;
    }
  };

  const handleQualify = async () => {
    if (unqualifiedCount === 0) {
      toast({
        title: "✅ Déjà terminé",
        description: "Toutes les entreprises sont qualifiées",
      });
      return;
    }

    shouldContinue.current = true;
    setIsProcessing(true);

    try {
      while (shouldContinue.current && unqualifiedCount > 0) {
        const result = await processBatch();
        
        if (!shouldContinue.current) break;

        // Wait a bit before next batch to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (shouldContinue.current) {
        toast({
          title: "✅ Qualification terminée",
          description: `Toutes les entreprises ont été qualifiées`,
        });
      }
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      });
    } finally {
      shouldContinue.current = false;
      setIsProcessing(false);
    }
  };

  const handleStop = () => {
    shouldContinue.current = false;
    setIsProcessing(false);
    toast({
      title: "⏸️ Arrêté",
      description: "Qualification mise en pause",
    });
  };

  if (totalCount === 0) {
    return null;
  }

  const percentage = totalCount > 0 ? Math.round((qualifiedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={isProcessing ? handleStop : handleQualify}
        disabled={!isProcessing && unqualifiedCount === 0}
        variant={isProcessing ? "destructive" : "default"}
        size="sm"
        className="h-7 px-3 text-xs"
      >
        {isProcessing ? (
          <>
            <Square className="w-3.5 h-3.5 mr-1.5" />
            <span>Arrêter</span>
          </>
        ) : (
          <>
            <Wand2 className="w-3.5 h-3.5 mr-1.5" />
            <span>Qualifier automatiquement</span>
            {unqualifiedCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-white/20 text-white text-[10px] px-1">
                {unqualifiedCount.toLocaleString('fr-FR')}
              </Badge>
            )}
          </>
        )}
      </Button>
      
      {totalCount > 0 && (
        <div className="space-y-1">
          <Progress value={percentage} className="h-2" />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span className="font-medium">{percentage}% qualifiées</span>
            <span>{qualifiedCount.toLocaleString('fr-FR')} / {totalCount.toLocaleString('fr-FR')}</span>
          </div>
        </div>
      )}

      {Object.keys(categoryDistribution).length > 0 && (
        <div className="text-[10px] text-muted-foreground max-h-20 overflow-y-auto space-y-0.5">
          {Object.entries(categoryDistribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([cat, count]) => (
              <div key={cat} className="flex justify-between gap-2">
                <span className="truncate">{cat}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
