import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Nomenclature NAF officielle - mapping code NAF 2 chiffres vers catégorie
// Aligné avec src/utils/nafCategories.ts
const NAF_TO_CATEGORY: Record<string, string> = {
  // Agriculture & Forêt
  '01': 'agriculture',
  '02': 'agriculture',
  '03': 'agriculture',
  // Industrie alimentaire
  '10': 'industrie_alimentaire',
  '11': 'industrie_alimentaire',
  '12': 'industrie_alimentaire',
  // Textile & Habillement
  '13': 'textile',
  '14': 'textile',
  '15': 'textile',
  // Bois & Papier
  '16': 'bois_papier',
  '17': 'bois_papier',
  '18': 'bois_papier',
  // Chimie & Pharmacie
  '19': 'chimie',
  '20': 'chimie',
  '21': 'chimie',
  // Plastique & Caoutchouc
  '22': 'plastique',
  '23': 'plastique',
  // Métallurgie & Mécanique
  '24': 'metallurgie',
  '25': 'metallurgie',
  '28': 'metallurgie',
  // Informatique & Électronique (fabrication)
  '26': 'informatique',
  '27': 'informatique',
  // Automobile & Transport (fabrication)
  '29': 'automobile',
  '30': 'automobile',
  // Meubles & Autres industries
  '31': 'meubles',
  '32': 'meubles',
  '33': 'meubles',
  // Énergie & Eau
  '35': 'energie',
  '36': 'energie',
  '37': 'energie',
  '38': 'energie',
  '39': 'energie',
  // Construction & BTP
  '41': 'construction',
  '42': 'construction',
  '43': 'construction',
  // Commerce Automobile
  '45': 'commerce_auto',
  // Commerce de Gros
  '46': 'commerce_gros',
  // Commerce de Détail
  '47': 'commerce_detail',
  // Transport & Logistique
  '49': 'transport',
  '50': 'transport',
  '51': 'transport',
  '52': 'transport',
  '53': 'transport',
  // Hôtellerie & Restauration
  '55': 'hotellerie',
  '56': 'hotellerie',
  // Communication & Médias
  '58': 'communication',
  '59': 'communication',
  '60': 'communication',
  '61': 'communication',
  // Services Informatiques
  '62': 'informatique_services',
  '63': 'informatique_services',
  // Finance & Assurance
  '64': 'finance',
  '65': 'finance',
  '66': 'finance',
  // Immobilier
  '68': 'immobilier',
  // Services Juridiques & Comptables
  '69': 'juridique',
  '70': 'juridique',
  // Architecture & Ingénierie
  '71': 'architecture',
  '72': 'architecture',
  '73': 'architecture',
  '74': 'architecture',
  '75': 'architecture',
  // Services Administratifs
  '77': 'services_admin',
  '78': 'services_admin',
  '79': 'services_admin',
  '80': 'services_admin',
  '81': 'services_admin',
  '82': 'services_admin',
  // Administration Publique
  '84': 'administration',
  // Enseignement & Formation
  '85': 'enseignement',
  // Santé & Action Sociale
  '86': 'sante',
  '87': 'sante',
  '88': 'sante',
  // Culture & Loisirs
  '90': 'culture',
  '91': 'culture',
  '92': 'culture',
  '93': 'culture',
  // Autres Services
  '94': 'autres_services',
  '95': 'autres_services',
  '96': 'autres_services',
  // Services aux Ménages
  '97': 'menages',
  '98': 'menages',
  // Organisations Internationales
  '99': 'international',
};

function getCategoryFromNaf(codeNaf: string | null): string | null {
  if (!codeNaf) return null;
  // Extraire les 2 premiers caractères du code NAF
  const prefix = codeNaf.replace(/[^0-9]/g, '').substring(0, 2);
  return NAF_TO_CATEGORY[prefix] || null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const batchSize = 1000;
    let offset = 0;
    let hasMore = true;

    console.log('Starting NAF harmonization for nouveaux_sites...');

    while (hasMore) {
      // Récupérer un lot
      const { data: sites, error: fetchError } = await supabase
        .from('nouveaux_sites')
        .select('id, code_naf, categorie_detaillee')
        .range(offset, offset + batchSize - 1);

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        break;
      }

      if (!sites || sites.length === 0) {
        hasMore = false;
        break;
      }

      console.log(`Processing batch at offset ${offset}, ${sites.length} records...`);

      // Préparer les updates
      const updates: { id: string; categorie_detaillee: string }[] = [];

      for (const site of sites) {
        const newCategory = getCategoryFromNaf(site.code_naf);
        
        if (newCategory && newCategory !== site.categorie_detaillee) {
          updates.push({ id: site.id, categorie_detaillee: newCategory });
        } else if (!newCategory && site.code_naf) {
          skippedCount++;
        }
      }

      // Appliquer les updates par petits lots pour éviter timeout
      for (let i = 0; i < updates.length; i += 50) {
        const batch = updates.slice(i, i + 50);
        
        await Promise.all(batch.map(async (update) => {
          const { error } = await supabase
            .from('nouveaux_sites')
            .update({ categorie_detaillee: update.categorie_detaillee })
            .eq('id', update.id);

          if (error) {
            errorCount++;
          } else {
            successCount++;
          }
        }));
      }

      offset += batchSize;
      
      if (sites.length < batchSize) {
        hasMore = false;
      }
    }

    console.log(`Harmonization complete: ${successCount} updated, ${errorCount} errors, ${skippedCount} skipped (unknown NAF)`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Harmonisation NAF terminée: ${successCount} mises à jour, ${errorCount} erreurs, ${skippedCount} ignorés`,
        successCount,
        errorCount,
        skippedCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in harmonize-categories:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
