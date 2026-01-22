import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Configuration Supabase
const SUPABASE_URL = 'https://ywavxjmbsywpjzchuuho.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3YXZ4am1ic3l3cGp6Y2h1dWhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMTQ1NTksImV4cCI6MjA4NDU5MDU1OX0.1u0MTmVkKfzGVfbHYVxJlIOT9e-Wn9FL9EDdDhT-5rg';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkMatches() {
  console.log('🔍 Lecture du fichier CSV...');
  
  // Lire le fichier CSV
  const csvContent = fs.readFileSync('/Users/raws/Downloads/Export_Portail_Data_Du_22-01-2026.csv', 'utf-8');
  
  const lines = csvContent.split('\n');
  
  // Les en-têtes sont à la ligne 3 (index 2)
  // Les données commencent à la ligne 4 (index 3)
  
  const csvData = [];
  
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Extraire les champs (simplifié)
    // Format: "Nom";Date;'SIREN;"Représentants";"Adresse";...
    const parts = line.split(';');
    
    if (parts.length >= 4) {
      const denomination = parts[0].replace(/"/g, '').trim();
      const sirenRaw = parts[2].trim();
      const siren = sirenRaw.replace(/'/g, '').replace(/"/g, '').trim();
      const representants = parts[3].replace(/"/g, '').trim();
      
      if (siren && siren.length === 9 && /^\d+$/.test(siren)) {
        csvData.push({
          siren,
          representants,
          denomination
        });
      }
    }
  }

  console.log(`✅ ${csvData.length} SIREN valides extraits du CSV`);
  
  // Afficher quelques exemples
  console.log('\n📋 Exemples du CSV :');
  csvData.slice(0, 5).forEach(item => {
    console.log(`- ${item.denomination} (SIREN: ${item.siren})`);
    console.log(`  Dirigeant: ${item.representants || 'Aucun'}`);
  });

  // Récupérer tous les SIREN/SIRET de la base nouveaux_sites
  console.log('\n🔍 Récupération des SIREN/SIRET de la base Supabase...');
  
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

  // Créer un Map pour les données CSV (SIREN -> Données)
  const csvMap = new Map();
  csvData.forEach(item => {
    csvMap.set(item.siren, item);
  });

  // Trouver les matches
  let matchCount = 0;
  let withDirigeant = 0;
  let withoutDirigeant = 0;
  let newDirigeants = 0;

  const matches = [];
  
  prospectsWithSiren.forEach(prospect => {
    const match = csvMap.get(prospect.siren);
    if (match) {
      matchCount++;
      matches.push({ prospect, csvInfo: match });
      
      if (match.representants && match.representants.length > 0) {
        withDirigeant++;
        if (!prospect.dirigeant || prospect.dirigeant.trim() === '') {
          newDirigeants++;
        }
      } else {
        withoutDirigeant++;
      }
    }
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
  if (matches.length > 0) {
    console.log('📋 Exemples de matches (10 premiers) :');
    matches.slice(0, 10).forEach(({ prospect, csvInfo }) => {
      console.log(`\n- ${prospect.nom} (SIRET: ${prospect.siret})`);
      console.log(`  SIREN: ${prospect.siren}`);
      console.log(`  Dirigeant actuel: ${prospect.dirigeant || 'Aucun'}`);
      console.log(`  Dirigeant CSV: ${csvInfo.representants || 'Aucun'}`);
    });
  }

  console.log('\n💡 CONCLUSION :');
  if (newDirigeants > 0) {
    console.log(`✅ Tu peux enrichir ${newDirigeants} prospects avec ce CSV ! 🎉`);
    console.log(`💰 Économie : ${(newDirigeants * 0.08).toFixed(2)}€ (crédits Pappers non utilisés)`);
  } else {
    console.log(`⚠️ Aucun nouveau dirigeant à ajouter avec ce CSV.`);
  }

  // Calculer le pourcentage de couverture
  const coveragePercent = (matchCount / prospects.length) * 100;
  console.log(`\n📊 Taux de couverture : ${coveragePercent.toFixed(2)}% de ta base`);
  
  // Calculer le taux de dirigeants si on enrichit
  const totalDirigeants = prospects.filter(p => p.dirigeant && p.dirigeant.trim() !== '').length;
  const apresEnrichissement = totalDirigeants + newDirigeants;
  const tauxFinal = (apresEnrichissement / prospects.length) * 100;
  console.log(`\n🎯 Taux de dirigeants après enrichissement : ${tauxFinal.toFixed(2)}%`);
  console.log(`   (${totalDirigeants} actuels + ${newDirigeants} nouveaux = ${apresEnrichissement} au total)`);
}

checkMatches().catch(console.error);
