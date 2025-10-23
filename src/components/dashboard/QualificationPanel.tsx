import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Brain, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const QualificationPanel = () => {
  const { toast } = useToast();
  const [isQualifying, setIsQualifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    succeeded: 0,
    failed: 0,
  });

  const startQualification = async () => {
    try {
      setIsQualifying(true);
      setProgress(0);
      
      // Récupérer toutes les entreprises non qualifiées
      const { data: entreprises, error: fetchError } = await supabase
        .from('entreprises')
        .select('id')
        .is('categorie_qualifiee', null);

      if (fetchError) throw fetchError;

      const total = entreprises?.length || 0;
      setStats({ total, processed: 0, succeeded: 0, failed: 0 });

      if (total === 0) {
        toast({
          title: "Aucune entreprise à qualifier",
          description: "Toutes les entreprises ont déjà été qualifiées.",
        });
        setIsQualifying(false);
        return;
      }

      toast({
        title: "Qualification lancée",
        description: `Analyse de ${total} entreprises en cours...`,
      });

      // Traiter par batch de 50
      const batchSize = 50;
      let totalProcessed = 0;
      let totalSucceeded = 0;
      let totalFailed = 0;

      for (let i = 0; i < entreprises.length; i += batchSize) {
        const batch = entreprises.slice(i, i + batchSize);
        const batchIds = batch.map(e => e.id);

        const { data, error } = await supabase.functions.invoke('qualify-entreprise', {
          body: { entrepriseIds: batchIds }
        });

        if (error) {
          console.error('Batch error:', error);
          totalFailed += batch.length;
        } else {
          totalSucceeded += data.succeeded || 0;
          totalFailed += data.failed || 0;
        }

        totalProcessed += batch.length;
        setProgress((totalProcessed / total) * 100);
        setStats({
          total,
          processed: totalProcessed,
          succeeded: totalSucceeded,
          failed: totalFailed,
        });

        // Pause entre les batch pour éviter le rate limiting
        if (i + batchSize < entreprises.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast({
        title: "Qualification terminée",
        description: `${totalSucceeded} entreprises qualifiées avec succès, ${totalFailed} échecs.`,
      });

    } catch (error) {
      console.error('Error during qualification:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsQualifying(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Qualification Intelligente des Activités
        </CardTitle>
        <CardDescription>
          Utilise l'IA pour analyser et catégoriser précisément chaque entreprise selon son activité réelle
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isQualifying && stats.total === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              L'IA analysera le contexte complet de chaque entreprise (activité, administration, forme juridique) 
              pour déterminer sa vraie catégorie.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Distingue restaurant avec livraison vs coursier indépendant</li>
              <li>Différencie SCI immobilière vs entreprise BTP</li>
              <li>Identifie les holdings vs entreprises opérationnelles</li>
            </ul>
          </div>
        )}

        {isQualifying && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progression</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">{stats.processed}</div>
                <div className="text-xs text-muted-foreground">Traitées</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                  {stats.succeeded}
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div className="text-xs text-muted-foreground">Réussies</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-destructive flex items-center justify-center gap-1">
                  {stats.failed}
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div className="text-xs text-muted-foreground">Échecs</div>
              </div>
            </div>
          </div>
        )}

        {!isQualifying && stats.processed > 0 && (
          <div className="p-4 bg-primary/5 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Qualification terminée
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.succeeded} / {stats.total} entreprises qualifiées avec succès
            </div>
          </div>
        )}

        <Button 
          onClick={startQualification} 
          disabled={isQualifying}
          className="w-full"
        >
          {isQualifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Qualification en cours...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Lancer la qualification IA
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};