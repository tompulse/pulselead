import { supabase } from '@/integrations/supabase/client';

export async function autoQualifyAllEntreprises() {
  console.log('🤖 Démarrage de la qualification automatique...');
  
  try {
    // Vérifier combien d'entreprises ne sont pas qualifiées
    const { count, error: countError } = await supabase
      .from('entreprises')
      .select('*', { count: 'exact', head: true })
      .is('categorie_qualifiee', null);

    if (countError) {
      console.error('Erreur lors du comptage:', countError);
      return null;
    }

    if (!count || count === 0) {
      console.log('✅ Toutes les entreprises sont déjà qualifiées');
      return {
        alreadyQualified: true,
        total: 0,
      };
    }

    console.log(`📊 ${count} entreprises à qualifier`);

    // Récupérer toutes les entreprises non qualifiées par batches
    const batchSize = 50;
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
          
          // Compter les catégories
          if (data.results) {
            for (const result of data.results) {
              if (result.success && result.categorie) {
                const cat = result.categorie.toLowerCase();
                categoryStats[cat] = (categoryStats[cat] || 0) + 1;
              }
            }
          }
        }

        totalProcessed += ids.length;
        const progress = Math.round((totalProcessed / count) * 100);
        console.log(`⏳ Progression: ${totalProcessed}/${count} (${progress}%) - Batch ${batch + 1}/${totalBatches}`);

      } catch (err) {
        console.error(`Exception batch ${batch + 1}:`, err);
        totalFailed += ids.length;
      }

      // Pause entre les batches pour éviter rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const results = {
      total: count,
      processed: totalProcessed,
      succeeded: totalSucceeded,
      failed: totalFailed,
      categories: categoryStats,
    };

    console.log('✅ Qualification terminée:', results);
    return results;

  } catch (error) {
    console.error('❌ Erreur globale:', error);
    return null;
  }
}
