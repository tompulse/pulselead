// SCRIPT DE DEBUG À COLLER DANS LA CONSOLE DU NAVIGATEUR
// Appuyez sur F12, puis collez ce code dans la console

(async function debugFiltres() {
  console.clear();
  console.log('🔍 DEBUG FILTRES ALIMENTAIRE\n');
  
  // 1. Test import de getCategoryFromNaf
  try {
    const { getCategoryFromNaf } = await import('/src/utils/nafToCategory.ts');
    console.log('✅ getCategoryFromNaf chargé');
    
    // Tester quelques codes NAF
    const testCodes = ['10.71A', '10.71Z', '10.11Z', '11.01Z', '56.10C', '47.11B'];
    console.log('\n📋 Test mapping NAF → Catégorie:');
    testCodes.forEach(code => {
      const cat = getCategoryFromNaf(code);
      const isAlimentaire = cat.startsWith('alimentaire');
      console.log(`  ${code} → ${cat} ${isAlimentaire ? '✅' : '❌'}`);
    });
  } catch (e) {
    console.error('❌ Erreur import getCategoryFromNaf:', e);
  }
  
  // 2. Test DETAILED_CATEGORIES
  try {
    const { DETAILED_CATEGORIES } = await import('/src/utils/detailedCategories.ts');
    const alimentaireCats = DETAILED_CATEGORIES.filter(c => c.key.startsWith('alimentaire'));
    console.log(`\n🍞 Catégories alimentaires: ${alimentaireCats.length}`);
    alimentaireCats.forEach(cat => {
      console.log(`  ${cat.emoji} ${cat.label} (${cat.nafCodes.join(', ')})`);
    });
  } catch (e) {
    console.error('❌ Erreur import DETAILED_CATEGORIES:', e);
  }
  
  // 3. Vérifier la requête Supabase
  console.log('\n🔌 Test requête Supabase...');
  try {
    const { supabase } = await import('/src/integrations/supabase/client.ts');
    const { data, count, error } = await supabase
      .from('nouveaux_sites')
      .select('code_naf', { count: 'exact' })
      .or('archived.is.null,archived.neq.true')
      .limit(100);
    
    if (error) {
      console.error('❌ Erreur Supabase:', error);
    } else {
      console.log(`✅ ${count} prospects dans la base`);
      
      // Tester combien sont alimentaires
      const { getCategoryFromNaf } = await import('/src/utils/nafToCategory.ts');
      const alimentaires = data.filter(row => 
        getCategoryFromNaf(row.code_naf).startsWith('alimentaire')
      );
      console.log(`✅ ${alimentaires.length}/100 premiers sont alimentaires`);
    }
  } catch (e) {
    console.error('❌ Erreur requête:', e);
  }
  
  console.log('\n✅ Debug terminé !');
})();
