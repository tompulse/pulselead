import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export const QualifySubcategoriesButton = () => {
  const [isQualifying, setIsQualifying] = useState(false);
  const [progress, setProgress] = useState<{ processed: number; total: number } | null>(null);

  const qualifySubcategories = async () => {
    setIsQualifying(true);
    setProgress({ processed: 0, total: 0 });

    try {
      // Get total count of entreprises needing qualification
      const { count } = await supabase
        .from('entreprises')
        .select('*', { count: 'exact', head: true })
        .is('sous_categorie', null)
        .not('categorie_qualifiee', 'is', null);

      const total = count || 0;
      setProgress({ processed: 0, total });

      if (total === 0) {
        toast.success("Toutes les entreprises sont déjà qualifiées !");
        setIsQualifying(false);
        return;
      }

      toast.info(`Qualification de ${total} entreprises en cours...`);

      let processed = 0;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase.functions.invoke('qualify-subcategories', {
          body: { batchSize: 100 }
        });

        if (error) {
          console.error('Error qualifying subcategories:', error);
          throw error;
        }

        processed += data.processed;
        hasMore = data.hasMore;
        
        setProgress({ processed, total });

        // Small delay between batches to avoid overwhelming the server
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast.success(`✨ ${processed} entreprises qualifiées avec succès !`);
      
      // Refresh the page to show updated filters
      window.location.reload();
      
    } catch (error: any) {
      console.error('Error qualifying subcategories:', error);
      toast.error("Erreur lors de la qualification: " + error.message);
    } finally {
      setIsQualifying(false);
      setProgress(null);
    }
  };

  return (
    <Button
      onClick={qualifySubcategories}
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
          <Sparkles className="h-4 w-4" />
          Qualifier sous-catégories
        </>
      )}
    </Button>
  );
};
