import { Button } from "@/components/ui/button";
import { Building2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export const QualifyBuildingTypesButton = () => {
  const [isQualifying, setIsQualifying] = useState(false);
  const [progress, setProgress] = useState<{ processed: number; total: number } | null>(null);

  const qualifyBuildingTypes = async () => {
    setIsQualifying(true);
    setProgress({ processed: 0, total: 0 });

    try {
      // Get total count of entreprises without type_batiment
      const { count } = await supabase
        .from('entreprises')
        .select('*', { count: 'exact', head: true })
        .is('type_batiment', null);

      const total = count || 0;
      setProgress({ processed: 0, total });

      if (total === 0) {
        toast.success("✨ Tous les bâtiments sont déjà qualifiés !");
        setIsQualifying(false);
        return;
      }

      toast.info(`🏗️ Qualification de ${total} locaux en cours...`);

      let processed = 0;
      let hasMore = true;
      let errorOccurred = false;

      while (hasMore && !errorOccurred) {
        const { data, error } = await supabase.functions.invoke('qualify-building-types', {
          body: { batchSize: 50 }
        });

        if (error) {
          console.error('Error qualifying building types:', error);
          
          // Gestion spécifique des erreurs de rate limit et crédits
          if (error.message?.includes('Rate limit')) {
            toast.error("⏱️ Limite de requêtes atteinte. Veuillez patienter quelques instants et réessayer.");
            errorOccurred = true;
            break;
          } else if (error.message?.includes('Credits exhausted') || error.message?.includes('Payment required')) {
            toast.error("💳 Crédits épuisés. Veuillez ajouter des crédits dans Settings → Workspace → Usage.");
            errorOccurred = true;
            break;
          } else {
            throw error;
          }
        }

        processed += data.processed;
        hasMore = data.hasMore;
        
        setProgress({ processed, total });

        // Small delay between batches to avoid overwhelming the server
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (!errorOccurred) {
        toast.success(`✨ ${processed} locaux qualifiés avec succès !`);
        
        // Refresh the page to show updated data
        setTimeout(() => window.location.reload(), 1500);
      }
      
    } catch (error: any) {
      console.error('Error qualifying building types:', error);
      toast.error("Erreur lors de la qualification: " + error.message);
    } finally {
      setIsQualifying(false);
      setProgress(null);
    }
  };

  return (
    <Button
      onClick={qualifyBuildingTypes}
      disabled={isQualifying}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isQualifying ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {progress && `${progress.processed}/${progress.total}`}
        </>
      ) : (
        <>
          <Building2 className="h-4 w-4" />
          🏗️ Qualifier bâtiments
        </>
      )}
    </Button>
  );
};
