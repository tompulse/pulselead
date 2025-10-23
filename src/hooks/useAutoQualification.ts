import { useEffect, useState } from 'react';
import { autoQualifyAllEntreprises, QualificationResults } from '@/utils/autoQualifyEntreprises';
import { useToast } from '@/hooks/use-toast';

export const useAutoQualification = () => {
  const [isQualifying, setIsQualifying] = useState(false);
  const [results, setResults] = useState<QualificationResults | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const qualify = async () => {
      // Charger résultats précédents s'il y en a
      const stored = sessionStorage.getItem('auto_qualification_results');
      if (stored) {
        try {
          const parsed: QualificationResults = JSON.parse(stored);
          setResults(parsed);
        } catch {}
      }

      setIsQualifying(true);

      toast({
        title: "🤖 Qualification IA démarrée",
        description: "Analyse de vos entreprises en cours...",
      });

      const final = await autoQualifyAllEntreprises((partial) => {
        setResults(partial);
        sessionStorage.setItem('auto_qualification_results', JSON.stringify(partial));
      });

      setIsQualifying(false);

      if (final && 'succeeded' in final && !(final as any).alreadyQualified) {
        toast({
          title: "✅ Qualification terminée !",
          description: `${final.succeeded} entreprises analysées avec succès`,
          duration: 5000,
        });
      }
    };

    // Lancer après un court délai pour ne pas bloquer le rendu initial
    const timer = setTimeout(qualify, 1200);
    return () => clearTimeout(timer);
  }, [toast]);

  return { isQualifying, results };
};

