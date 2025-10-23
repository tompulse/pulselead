import { useEffect, useState } from 'react';
import { autoQualifyAllEntreprises } from '@/utils/autoQualifyEntreprises';
import { useToast } from '@/hooks/use-toast';

export const useAutoQualification = () => {
  const [isQualifying, setIsQualifying] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const qualify = async () => {
      // Vérifier si la qualification a déjà été lancée dans cette session
      const hasRun = sessionStorage.getItem('auto_qualification_run');
      if (hasRun) {
        console.log('Qualification déjà effectuée dans cette session');
        // Récupérer les résultats stockés s'ils existent
        const storedResults = sessionStorage.getItem('auto_qualification_results');
        if (storedResults) {
          setResults(JSON.parse(storedResults));
        }
        return;
      }

      setIsQualifying(true);
      
      toast({
        title: "🤖 Qualification IA démarrée",
        description: "Analyse de vos entreprises en cours...",
      });

      const results = await autoQualifyAllEntreprises();
      setResults(results);
      setIsQualifying(false);

      // Stocker les résultats
      if (results) {
        sessionStorage.setItem('auto_qualification_results', JSON.stringify(results));
      }

      // Marquer comme exécuté pour cette session
      sessionStorage.setItem('auto_qualification_run', 'true');

      if (results && 'succeeded' in results && 'alreadyQualified' in results && !results.alreadyQualified) {
        toast({
          title: "✅ Qualification terminée !",
          description: `${results.succeeded} entreprises analysées avec succès`,
          duration: 5000,
        });
      }
    };

    // Lancer après un court délai pour ne pas bloquer le rendu initial
    const timer = setTimeout(qualify, 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  return { isQualifying, results };
};
