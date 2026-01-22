import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface EnrichDirigeantButtonProps {
  siret: string;
  entrepriseId: string;
  currentDirigeant?: string | null;
  onSuccess?: () => void;
}

export const EnrichDirigeantButton = ({ 
  siret, 
  entrepriseId,
  currentDirigeant,
  onSuccess 
}: EnrichDirigeantButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [enriched, setEnriched] = useState(false);
  const queryClient = useQueryClient();

  const handleEnrich = async () => {
    if (!siret) {
      toast.error('SIRET manquant');
      return;
    }

    setLoading(true);

    try {
      // Appeler la Edge Function
      const { data, error } = await supabase.functions.invoke('enrich-dirigeant', {
        body: { siret }
      });

      if (error) {
        console.error('Erreur enrichissement:', error);
        throw new Error(error.message || 'Erreur lors de l\'enrichissement');
      }

      if (!data.success) {
        throw new Error(data.error || 'Impossible d\'enrichir cette entreprise');
      }

      // Succès !
      setEnriched(true);
      toast.success(
        `Dirigeant trouvé : ${data.dirigeant}`,
        {
          description: data.fonction ? `Fonction : ${data.fonction}` : undefined
        }
      );

      // Invalider le cache pour recharger les données
      queryClient.invalidateQueries({ queryKey: ['entreprise-detail', entrepriseId] });
      
      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      console.error('Erreur:', error);
      
      if (error.message.includes('404') || error.message.includes('non trouvé')) {
        toast.error('Données non disponibles', {
          description: 'Cette entreprise est trop récente. Les infos dirigeant seront disponibles prochainement.'
        });
      } else {
        toast.error('Erreur lors de l\'enrichissement', {
          description: error.message || 'Veuillez réessayer'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Si déjà enrichi, afficher un badge de succès
  if (currentDirigeant && !loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <CheckCircle className="w-4 h-4" />
        <span>Dirigeant enrichi</span>
      </div>
    );
  }

  return (
    <Button
      onClick={handleEnrich}
      disabled={loading || enriched}
      size="sm"
      variant="outline"
      className="gap-2 border-accent/40 text-accent hover:bg-accent/10"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Recherche...
        </>
      ) : enriched ? (
        <>
          <CheckCircle className="w-4 h-4" />
          Enrichi !
        </>
      ) : (
        <>
          <User className="w-4 h-4" />
          Trouver le gérant
        </>
      )}
    </Button>
  );
};
