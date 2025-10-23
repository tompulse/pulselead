import { useEffect, useState } from 'react';
import { autoQualifyAllEntreprises } from '@/utils/autoQualifyEntreprises';

export const useAutoQualification = () => {
  const [isQualifying, setIsQualifying] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const qualify = async () => {
      // Vérifier si la qualification a déjà été lancée dans cette session
      const hasRun = sessionStorage.getItem('auto_qualification_run');
      if (hasRun) {
        console.log('Qualification déjà effectuée dans cette session');
        return;
      }

      setIsQualifying(true);
      const results = await autoQualifyAllEntreprises();
      setResults(results);
      setIsQualifying(false);

      // Marquer comme exécuté pour cette session
      sessionStorage.setItem('auto_qualification_run', 'true');
    };

    // Lancer après un court délai pour ne pas bloquer le rendu initial
    const timer = setTimeout(qualify, 2000);
    return () => clearTimeout(timer);
  }, []);

  return { isQualifying, results };
};
