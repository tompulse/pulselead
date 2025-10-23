import { supabase } from '@/integrations/supabase/client';

export type QualificationResults = {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  categories: Record<string, number>;
  alreadyQualified?: boolean;
};

export async function autoQualifyAllEntreprises(
  onProgress?: (partial: QualificationResults) => void
) {
  console.log('🤖 Démarrage de la qualification automatique...');
  
  try {
    const { count, error: countError } = await supabase
      .from('entreprises')
      .select('*', { count: 'exact', head: true })
      .is('categorie_qualifiee', null);

    if (countError) {
      console.error('Erreur lors du comptage:', countError);
      return null;
    }

    if (!count || count === 0) {
      const done: QualificationResults = { alreadyQualified: true, total: 0, processed: 0, succeeded: 0, failed: 0, categories: {} };
      onProgress?.(done);
      console.log('✅ Toutes les entreprises sont déjà qualifiées');
      return done;
    }

    console.log(`📊 ${count} entreprises à qualifier`);

    const batchSize = 10; // Réduit pour éviter les timeouts
    let totalProcessed = 0;
    let totalSucceeded = 0;
    let totalFailed = 0;
    const categoryStats: Record<string, number> = {};

    const totalBatches = Math.ceil(count / batchSize);

    for (let batch = 0; batch < totalBatches; batch++) {
      const from = batch * batchSize;
      const to = from + batchSize - 1;

      const { data: entreprises, error: fetchError } = await supabase
        .from('entreprises')
        .select('id')
        .is('categorie_qualifiee', null)
        .range(from, to);

      if (fetchError || !entreprises || entreprises.length === 0) {
        console.error(`Erreur batch ${batch + 1}:`, fetchError);
        continue;
      }

      const ids = entreprises.map(e => e.id);

      try {
        const { data, error } = await supabase.functions.invoke('qualify-entreprise', {
          body: { entrepriseIds: ids }
        });

        if (error) {
          console.error(`Erreur appel fonction batch ${batch + 1}:`, error);
          totalFailed += ids.length;
        } else if (data) {
          totalSucceeded += data.succeeded || 0;
          totalFailed += data.failed || 0;
          
          if (data.results) {
            for (const result of data.results) {
              if (result.success && result.categorie) {
                const cat = String(result.categorie).toLowerCase();
                categoryStats[cat] = (categoryStats[cat] || 0) + 1;
              }
            }
          }
        }

        totalProcessed += ids.length;
        const snapshot: QualificationResults = {
          total: count,
          processed: totalProcessed,
          succeeded: totalSucceeded,
          failed: totalFailed,
          categories: { ...categoryStats },
        };
        onProgress?.(snapshot);
        
        console.log(`⏳ Progression: ${totalProcessed}/${count} (${Math.round((totalProcessed / count) * 100)}%) - Batch ${batch + 1}/${totalBatches}`);

      } catch (err) {
        console.error(`Exception batch ${batch + 1}:`, err);
        totalFailed += ids.length;
        const snapshot: QualificationResults = {
          total: count,
          processed: totalProcessed,
          succeeded: totalSucceeded,
          failed: totalFailed,
          categories: { ...categoryStats },
        };
        onProgress?.(snapshot);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const results: QualificationResults = {
      total: count,
      processed: totalProcessed,
      succeeded: totalSucceeded,
      failed: totalFailed,
      categories: categoryStats,
    };

    onProgress?.(results);
    console.log('✅ Qualification terminée:', results);
    return results;

  } catch (error) {
    console.error('❌ Erreur globale:', error);
    return null;
  }
}
