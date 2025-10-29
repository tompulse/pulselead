import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wand2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CategoryCount {
  [key: string]: number;
}

export const QualifyAllButton = () => {
  const [unqualifiedCount, setUnqualifiedCount] = useState<number>(0);
  const [qualifiedCount, setQualifiedCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryCount>({});
  const { toast } = useToast();

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

      setUnqualifiedCount(unqualified || 0);
      setQualifiedCount(qualified || 0);

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

  const handleQualify = async () => {
    if (unqualifiedCount === 0) {
      toast({
        title: "✅ Déjà terminé",
        description: "Toutes les entreprises sont qualifiées",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("qualify-all-entreprises", {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      const { total, succeeded, failed } = data;

      toast({
        title: "🤖 Batch terminé",
        description: `${succeeded} qualifiées / ${failed} échecs`,
      });

    } catch (error) {
      console.error("Erreur qualification:", error);
      toast({
        title: "❌ Erreur",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (unqualifiedCount === 0 && qualifiedCount === 0) {
    return null;
  }

  const percentage = qualifiedCount + unqualifiedCount > 0
    ? Math.round((qualifiedCount / (qualifiedCount + unqualifiedCount)) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleQualify}
        disabled={isProcessing || unqualifiedCount === 0}
        variant="default"
        size="sm"
        className="h-7 px-3 text-xs bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            <span>Qualification en cours...</span>
          </>
        ) : (
          <>
            <Wand2 className="w-3.5 h-3.5 mr-1.5" />
            <span>Qualifier 50 entreprises</span>
            {unqualifiedCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-white/20 text-white text-[10px] px-1">
                {unqualifiedCount.toLocaleString('fr-FR')} restantes
              </Badge>
            )}
          </>
        )}
      </Button>
      
      {qualifiedCount > 0 && (
        <div className="text-[10px] text-muted-foreground">
          <span className="font-medium">{percentage}%</span> · {qualifiedCount.toLocaleString('fr-FR')} / {(qualifiedCount + unqualifiedCount).toLocaleString('fr-FR')} qualifiées
        </div>
      )}

      {Object.keys(categoryDistribution).length > 0 && (
        <div className="text-[10px] text-muted-foreground max-h-20 overflow-y-auto">
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
