import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapping NAF prefix (2 digits) -> categorie_activite standard
const NAF_TO_CATEGORY: Record<string, string> = {
  '01': 'agriculture',
  '02': 'agriculture',
  '03': 'agriculture',
  '10': 'industrie-alimentaire',
  '11': 'industrie-alimentaire',
  '12': 'industrie-alimentaire',
  '13': 'textile-habillement',
  '14': 'textile-habillement',
  '15': 'textile-habillement',
  '16': 'bois-papier',
  '17': 'bois-papier',
  '18': 'bois-papier',
  '19': 'chimie-pharmacie',
  '20': 'chimie-pharmacie',
  '21': 'chimie-pharmacie',
  '22': 'plastique-caoutchouc',
  '23': 'plastique-caoutchouc',
  '24': 'metallurgie-mecanique',
  '25': 'metallurgie-mecanique',
  '26': 'informatique-electronique',
  '27': 'informatique-electronique',
  '28': 'metallurgie-mecanique',
  '29': 'automobile-transport',
  '30': 'automobile-transport',
  '31': 'meubles-autres',
  '32': 'meubles-autres',
  '33': 'meubles-autres',
  '35': 'energie-eau',
  '36': 'energie-eau',
  '37': 'energie-eau',
  '38': 'energie-eau',
  '39': 'energie-eau',
  '41': 'construction-btp',
  '42': 'construction-btp',
  '43': 'construction-btp',
  '45': 'commerce-automobile',
  '46': 'commerce-gros',
  '47': 'commerce-detail',
  '49': 'transport-logistique',
  '50': 'transport-logistique',
  '51': 'transport-logistique',
  '52': 'transport-logistique',
  '53': 'transport-logistique',
  '55': 'hotellerie-restauration',
  '56': 'hotellerie-restauration',
  '58': 'communication-medias',
  '59': 'communication-medias',
  '60': 'communication-medias',
  '61': 'communication-medias',
  '62': 'services-informatiques',
  '63': 'services-informatiques',
  '64': 'finance-assurance',
  '65': 'finance-assurance',
  '66': 'finance-assurance',
  '68': 'immobilier',
  '69': 'juridique-comptable',
  '70': 'juridique-comptable',
  '71': 'architecture-ingenierie',
  '72': 'architecture-ingenierie',
  '73': 'architecture-ingenierie',
  '74': 'architecture-ingenierie',
  '75': 'architecture-ingenierie',
  '77': 'services-administratifs',
  '78': 'services-administratifs',
  '79': 'services-administratifs',
  '80': 'services-administratifs',
  '81': 'services-administratifs',
  '82': 'services-administratifs',
  '84': 'administration-publique',
  '85': 'enseignement-formation',
  '86': 'sante-action-sociale',
  '87': 'sante-action-sociale',
  '88': 'sante-action-sociale',
  '90': 'culture-loisirs',
  '91': 'culture-loisirs',
  '92': 'culture-loisirs',
  '93': 'culture-loisirs',
  '94': 'autres-services',
  '95': 'autres-services',
  '96': 'autres-services',
  '97': 'services-menages',
  '98': 'services-menages',
  '99': 'organisations-internationales',
};

// Mapping entreprises.categorie_qualifiee -> categorie_activite standard
const QUALIF_TO_CATEGORY: Record<string, string> = {
  'immobilier': 'immobilier',
  'holding': 'finance-assurance',
  'commerce-detail': 'commerce-detail',
  'conseil-consulting': 'juridique-comptable',
  'commerce-gros': 'commerce-gros',
  'informatique-dev': 'services-informatiques',
  'restauration': 'hotellerie-restauration',
  'agriculture': 'agriculture',
  'artisanat-reparation': 'meubles-autres',
  'energie-renouvelable': 'energie-eau',
  'maconnerie': 'construction-btp',
  'digital-web': 'services-informatiques',
  'education-formation': 'enseignement-formation',
  'industrie-fabrication': 'metallurgie-mecanique',
  'snack-fastfood': 'hotellerie-restauration',
  'sante-medical': 'sante-action-sociale',
  'transport-marchandises': 'transport-logistique',
  'beaute-coiffure': 'autres-services',
  'services-personne': 'autres-services',
  'finance-assurance': 'finance-assurance',
};

function getCategoryFromNaf(codeNaf: string): string | null {
  if (!codeNaf || codeNaf.length < 2) return null;
  const prefix = codeNaf.substring(0, 2);
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

    // 1. Harmoniser les nouveaux_sites basé sur code_naf
    console.log('Harmonizing nouveaux_sites...');
    const { data: nouveauxSites, error: nsError } = await supabase
      .from('nouveaux_sites')
      .select('id, code_naf')
      .not('code_naf', 'is', null);

    if (nsError) throw nsError;

    for (const site of nouveauxSites || []) {
      const category = getCategoryFromNaf(site.code_naf);
      if (category) {
        const { error } = await supabase
          .from('nouveaux_sites')
          .update({ categorie_entreprise: category })
          .eq('id', site.id);

        if (error) {
          console.error(`Error updating nouveaux_sites ${site.id}:`, error);
          errorCount++;
        } else {
          successCount++;
        }
      }
    }

    // 2. Harmoniser les entreprises basé sur categorie_qualifiee
    console.log('Harmonizing entreprises...');
    const { data: entreprises, error: entError } = await supabase
      .from('entreprises')
      .select('id, categorie_qualifiee')
      .not('categorie_qualifiee', 'is', null);

    if (entError) throw entError;

    for (const entreprise of entreprises || []) {
      const category = QUALIF_TO_CATEGORY[entreprise.categorie_qualifiee];
      if (category) {
        const { error } = await supabase
          .from('entreprises')
          .update({ activite: category })
          .eq('id', entreprise.id);

        if (error) {
          console.error(`Error updating entreprises ${entreprise.id}:`, error);
          errorCount++;
        } else {
          successCount++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Harmonisation terminée: ${successCount} succès, ${errorCount} erreurs`,
        successCount,
        errorCount
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
