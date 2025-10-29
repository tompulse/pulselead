import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Square, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const QualificationProgress = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [qualifiedCount, setQualifiedCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [categories, setCategories] = useState<Record<string, number>>({});
  const shouldContinueRef = useRef(false);
  const { toast } = useToast();

  // Charger les compteurs initiaux
  useEffect(() => {
    loadCounts();
  }, []);

  // Écouter les mises à jour en temps réel
  useEffect(() => {
    const channel = supabase
      .channel('qualification-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'entreprises',
          filter: 'categorie_qualifiee=neq.null'
        },
        () => {
          loadCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadCounts = async () => {
    // Total d'entreprises
    const { count: total } = await supabase
      .from('entreprises')
      .select('*', { count: 'exact', head: true });

    // Entreprises qualifiées
    const { count: qualified } = await supabase
      .from('entreprises')
      .select('*', { count: 'exact', head: true })
      .not('categorie_qualifiee', 'is', null);

    // Répartition par catégorie
    const { data: catData } = await supabase
      .from('entreprises')
      .select('categorie_qualifiee')
      .not('categorie_qualifiee', 'is', null);

    const catCounts: Record<string, number> = {};
    catData?.forEach(item => {
      if (item.categorie_qualifiee) {
        catCounts[item.categorie_qualifiee] = (catCounts[item.categorie_qualifiee] || 0) + 1;
      }
    });

    setTotalCount(total || 0);
    setQualifiedCount(qualified || 0);
    setCategories(catCounts);
  };

  const processBatch = async () => {
    const { data, error } = await supabase.functions.invoke('qualify-all-entreprises');
    
    if (error) {
      throw error;
    }

    return data;
  };

  const handleStart = async () => {
    shouldContinueRef.current = true;
    setIsRunning(true);
    setShowDialog(true);

    toast({
      title: "🤖 Qualification lancée",
      description: "Traitement automatique en cours...",
    });

    try {
      while (shouldContinueRef.current) {
        const result = await processBatch();
        
        await loadCounts();

        // Si plus rien à qualifier, arrêter
        if (result.total === 0) {
          shouldContinueRef.current = false;
          toast({
            title: "✅ Qualification terminée",
            description: `${qualifiedCount} entreprises qualifiées`,
          });
          break;
        }

        // Petite pause pour éviter de surcharger
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Erreur qualification:', error);
      toast({
        title: "❌ Erreur",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
      shouldContinueRef.current = false;
    }
  };

  const handleStop = () => {
    shouldContinueRef.current = false;
    setIsRunning(false);
    toast({
      title: "⏸️ Arrêt demandé",
      description: "Le traitement s'arrêtera après le batch en cours",
    });
  };

  const progress = totalCount > 0 ? (qualifiedCount / totalCount) * 100 : 0;
  const remaining = totalCount - qualifiedCount;

  const topCategories = Object.entries(categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15);

  if (totalCount === 0) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        variant="default"
        size="sm"
        className="h-7 px-3 text-xs bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70"
      >
        <Wand2 className="w-3.5 h-3.5 mr-1.5" />
        <span>Qualifier IA</span>
        {remaining > 0 && (
          <Badge variant="secondary" className="ml-2 bg-white/20 text-white text-[10px] px-1">
            {remaining.toLocaleString('fr-FR')}
          </Badge>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Qualification automatique par IA</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {qualifiedCount.toLocaleString('fr-FR')} / {totalCount.toLocaleString('fr-FR')} entreprises qualifiées
                </span>
                <span className="font-semibold text-lg">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-4" />
            </div>

            <div className="flex gap-2">
              {!isRunning && remaining > 0 && (
                <Button onClick={handleStart} className="flex-1">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Démarrer la qualification
                </Button>
              )}
              {isRunning && (
                <Button onClick={handleStop} variant="destructive" className="flex-1">
                  <Square className="w-4 h-4 mr-2" />
                  Arrêter
                </Button>
              )}
            </div>

            {isRunning && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Traitement en cours par batch de 50...</span>
              </div>
            )}

            {topCategories.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Catégories créées</h4>
                  <Badge variant="outline">{Object.keys(categories).length} catégories</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                  {topCategories.map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between bg-muted/50 p-2 rounded text-xs">
                      <span className="truncate">{cat}</span>
                      <Badge variant="secondary" className="ml-2 shrink-0">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
