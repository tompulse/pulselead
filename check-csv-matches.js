import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

// Configuration Supabase
const SUPABASE_URL = 'https://ywavxjmbsywpjzchuuho.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3YXZ4am1ic3l3cGp6Y2h1dWhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMTQ1NTksImV4cCI6MjA4NDU5MDU1OX0.1u0MTmVkKfzGVfbHYVxJlIOT9e-Wn9FL9EDdDhT-5rg';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkMatches() {
  console.log('🔍 Lecture du fichier CSV...');
  
  // Lire le fichier CSV
  const csvContent = fs.readFileSync('/Users/raws/Downloads/Export_Portail_Data_Du_22-01-2026.csv', 'utf-8');
  
  // Parser le CSV (en ignorant les 3 premières lignes qui sont des métadonnées)
  const lines = csvContent.split('\n');
  const dataLines = lines.slice(3).join('\n'); // Ignore les 3 premières lignes
  
  const records = parse(dataLines, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ';',
    quote: '"',
    relax_column_count: true,
  });

  console.log(`✅ ${records.length} entreprises dans le CSV`);

  // Extraire les SIREN et Représentants
  const csvData = records
    .filter(record => record.SIREN && record.SIREN.trim() !== '')
    .map(record => {
      const siren = record.SIREN.trim().replace(/'/g, ''); // Enlève les apostrophes
      const representants = record['Représentants'] ? record['Représentants'].trim() : '';
      const denomination = record['Dénomination / Nom'] ? record['Dénomination / Nom'].trim() : '';
      
      return {
        siren,
        representants,
        denomination,
      };
    })
    .filter(item => item.siren.length === 9); // SIREN doit faire 9 chiffres

  console.log(`✅ ${csvData.length} SIREN valides extraits`);

  // Récupérer tous les SIREN/SIRET de la base nouveaux_sites
  console.log('🔍 Récupération des SIREN/SIRET de la base Supabase...');
  
  const { data: prospects, error } = await supabase
    .from('nouveaux_sites')
    .select('id, siret, nom, dirigeant');

  if (error) {
    console.error('❌ Erreur Supabase:', error);
    return;
  }

  console.log(`✅ ${prospects.length} prospects dans la base`);

  // Extraire les SIREN des SIRET (les 9 premiers chiffres)
  const prospectsWithSiren = prospects.map(p => ({
    ...p,
    siren: p.siret ? p.siret.substring(0, 9) : null,
  })).filter(p => p.siren);

  console.log(`✅ ${prospectsWithSiren.length} prospects avec SIREN valide`);

  // Créer un Map pour les données CSV (SIREN -> Représentants)
  const csvMap = new Map();
  csvData.forEach(item => {
    csvMap.set(item.siren, item);
  });

  // Trouver les matches
  let matchCount = 0;
  let withDirigeant = 0;
  let withoutDirigeant = 0;
  let newDirigeants = 0;

  const matches = prospectsWithSiren.filter(prospect => {
    const match = csvMap.get(prospect.siren);
    if (match) {
      matchCount++;
      if (match.representants && match.representants.length > 0) {
        withDirigeant++;
        if (!prospect.dirigeant || prospect.dirigeant.trim() === '') {
          newDirigeants++;
        }
      } else {
        withoutDirigeant++;
      }
      return true;
    }
    return false;
  });

  console.log('\n📊 RÉSULTATS :');
  console.log('=====================================');
  console.log(`✅ Prospects dans la base : ${prospects.length}`);
  console.log(`✅ Entreprises dans le CSV : ${csvData.length}`);
  console.log(`✅ CORRESPONDANCES TROUVÉES : ${matchCount}`);
  console.log(`   └─ Avec dirigeant dans le CSV : ${withDirigeant}`);
  console.log(`   └─ Sans dirigeant dans le CSV : ${withoutDirigeant}`);
  console.log(`\n🎉 NOUVEAUX DIRIGEANTS À AJOUTER : ${newDirigeants}`);
  console.log('=====================================\n');

  // Afficher quelques exemples
  console.log('📋 Exemples de matches :');
  matches.slice(0, 10).forEach(match => {
    const csvInfo = csvMap.get(match.siren);
    console.log(`\n- ${match.nom} (SIRET: ${match.siret})`);
    console.log(`  SIREN: ${match.siren}`);
    console.log(`  Dirigeant actuel: ${match.dirigeant || 'Aucun'}`);
    console.log(`  Dirigeant CSV: ${csvInfo.representants || 'Aucun'}`);
  });

  console.log('\n💡 CONCLUSION :');
  if (newDirigeants > 0) {
    console.log(`✅ Tu peux enrichir ${newDirigeants} prospects avec ce CSV ! 🎉`);
    console.log(`💰 Économie : ${newDirigeants * 0.08}€ (crédits Pappers non utilisés)`);
  } else {
    console.log(`⚠️ Aucun nouveau dirigeant à ajouter avec ce CSV.`);
  }

  // Calculer le pourcentage de couverture
  const coveragePercent = (matchCount / prospects.length) * 100;
  console.log(`\n📊 Taux de couverture : ${coveragePercent.toFixed(2)}% de ta base`);
}

checkMatches().catch(console.error);
