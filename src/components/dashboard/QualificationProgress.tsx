import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Square, Loader2, Play, Pause } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCategoryLabel } from "@/utils/detailedCategories";

interface QualificationStatus {
  id: string;
  is_running: boolean;
  total_count: number;
  qualified_count: number;
  started_at: string | null;
  paused_at: string | null;
}

export const QualificationProgress = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [qualifiedCount, setQualifiedCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [statusId, setStatusId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Record<string, number>>({});
  const shouldContinueRef = useRef(false);
  const { toast } = useToast();

  // Charger les compteurs et le statut
  useEffect(() => {
    loadStatus();
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

  const loadStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Charger le statut existant
    const { data: status } = await supabase
      .from('qualification_status')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (status) {
      setStatusId(status.id);
      setIsPaused(status.is_running === false && status.started_at !== null);
    }

    await loadCounts();
  };

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

    // Répartition par catégorie - récupérer TOUTES les lignes avec range étendu
    const { data: catData } = await supabase
      .from('entreprises')
      .select('categorie_qualifiee')
      .not('categorie_qualifiee', 'is', null)
      .range(0, 50000); // Récupérer jusqu'à 50k lignes pour avoir tous les vrais totaux

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

  const saveStatus = async (running: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const statusData = {
      user_id: user.id,
      is_running: running,
      total_count: totalCount,
      qualified_count: qualifiedCount,
      started_at: running ? new Date().toISOString() : undefined,
      paused_at: !running && statusId ? new Date().toISOString() : null,
    };

    if (statusId) {
      await supabase
        .from('qualification_status')
        .update(statusData)
        .eq('id', statusId);
    } else {
      const { data } = await supabase
        .from('qualification_status')
        .insert(statusData)
        .select()
        .single();
      
      if (data) setStatusId(data.id);
    }
  };

  const processBatch = async () => {
    const { data, error } = await supabase.functions.invoke('qualify-all-entreprises');
    
    if (error) {
      throw error;
    }

    return data;
  };

  const runQualification = async () => {
    shouldContinueRef.current = true;
    setIsRunning(true);
    setIsPaused(false);
    await saveStatus(true);

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
          await saveStatus(false);
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
      await saveStatus(false);
    } finally {
      if (!shouldContinueRef.current) {
        setIsRunning(false);
      }
    }
  };

  const handleStart = async () => {
    setShowDialog(true);
    toast({
      title: "🤖 Qualification lancée",
      description: "Traitement automatique en cours...",
    });
    await runQualification();
  };

  const handleResume = async () => {
    setShowDialog(true);
    toast({
      title: "▶️ Reprise de la qualification",
      description: "Le traitement continue...",
    });
    await runQualification();
  };

  const handlePause = async () => {
    shouldContinueRef.current = false;
    setIsRunning(false);
    setIsPaused(true);
    await saveStatus(false);
    toast({
      title: "⏸️ Qualification mise en pause",
      description: "Vous pouvez reprendre plus tard",
    });
  };

  const progress = totalCount > 0 ? (qualifiedCount / totalCount) * 100 : 0;
  const remaining = totalCount - qualifiedCount;

  const allCategories = Object.entries(categories)
    .sort(([, a], [, b]) => b - a);


  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        variant="default"
        size="sm"
        className="h-7 px-3 text-xs bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70"
      >
        {isPaused ? (
          <>
            <Play className="w-3.5 h-3.5 mr-1.5" />
            <span>Reprendre IA</span>
          </>
        ) : (
          <>
            <Wand2 className="w-3.5 h-3.5 mr-1.5" />
            <span>Qualifier IA</span>
          </>
        )}
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
              {!isRunning && !isPaused && (
                <Button onClick={handleStart} className="flex-1">
                  <Wand2 className="w-4 h-4 mr-2" />
                  {remaining > 0 ? 'Démarrer la qualification' : 'Relancer la qualification'}
                </Button>
              )}
              {!isRunning && isPaused && (
                <Button onClick={handleResume} className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Reprendre la qualification
                </Button>
              )}
              {isRunning && (
                <Button onClick={handlePause} variant="outline" className="flex-1">
                  <Pause className="w-4 h-4 mr-2" />
                  Mettre en pause
                </Button>
              )}
            </div>

            {isRunning && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Traitement en cours par batch de 50...</span>
              </div>
            )}

            {isPaused && !isRunning && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                <Pause className="w-4 h-4" />
                <span>Qualification en pause - Cliquez sur "Reprendre" pour continuer</span>
              </div>
            )}

            {allCategories.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Répartition par catégorie</h4>
                  <Badge variant="outline">{Object.keys(categories).length} catégories distinctes</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2">
                  {allCategories.slice(0, 20).map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between bg-muted/50 p-2 rounded text-xs">
                      <span className="truncate font-medium">{getCategoryLabel(cat)}</span>
                      <Badge variant="secondary" className="ml-2 shrink-0 font-semibold">
                        {count.toLocaleString('fr-FR')}
                      </Badge>
                    </div>
                  ))}
                  {allCategories.length > 20 && (
                    <div className="col-span-2 text-xs text-muted-foreground text-center py-2">
                      ... et {allCategories.length - 20} autres catégories
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
