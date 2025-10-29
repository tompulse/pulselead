import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer UN PETIT BATCH d'entreprises non qualifiées (50 max pour éviter timeout)
    const { data: entreprises, error: fetchError } = await supabase
      .from('entreprises')
      .select('id, activite, administration, forme_juridique, code_naf')
      .is('categorie_qualifiee', null)
      .limit(50);

    if (fetchError) throw fetchError;

    const total = entreprises?.length || 0;
    console.log(`Starting qualification of ${total} entreprises`);

    const results = {
      total,
      processed: 0,
      succeeded: 0,
      failed: 0,
      categories: {} as Record<string, number>,
      errors: [] as string[],
    };

    // Traiter toutes les entreprises du batch
    for (const entreprise of entreprises) {
        try {
          const prompt = `Tu dois répondre UNIQUEMENT avec le format exact: "categorie|confidence"

CONTEXTE ENTREPRISE:
Activité: ${entreprise.activite || 'Non spécifiée'}
Forme juridique: ${entreprise.forme_juridique || 'Non spécifiée'}
Code NAF: ${entreprise.code_naf || 'Non spécifié'}

CATÉGORIES (choisis UNE SEULE):
conseil-consulting, holding, immobilier, finance-assurance, juridique, maconnerie, plomberie-chauffage, electricite, menuiserie, peinture-revetements, commerce-detail, commerce-gros, e-commerce, restauration, cafes-bars, snack-fastfood, traiteur, livraison-coursier, transport-marchandises, vtc-taxi, informatique-dev, digital-web, marketing-pub, energie-renouvelable, environnement-recyclage, sante-medical, beaute-coiffure, industrie-fabrication, agriculture, education-formation, artisanat-reparation, services-personne, hotellerie, culture-spectacles, sport-loisirs, autre

RÈGLES STRICTES:
1. Réponds UNIQUEMENT: "categorie|confidence"
2. Confidence entre 50 et 100
3. PAS d'explication, PAS de texte supplémentaire
4. Exemples valides: "restauration|95" ou "immobilier|88"

TA RÉPONSE (format strict):`;


          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash-lite',
              messages: [{ role: 'user', content: prompt }],
            }),
          });

          if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            console.error(`AI Error for ${entreprise.id}:`, errorText);
            results.failed++;
            results.errors.push(`${entreprise.id}: ${errorText}`);
            continue;
          }

          const aiData = await aiResponse.json();
          const response = aiData.choices[0].message.content.trim();
          
          const [categorie, confidenceStr] = response.split('|');
          const confidence = parseInt(confidenceStr) || 50;
          const categorieClean = categorie.toLowerCase().trim();

          // Mettre à jour l'entreprise
          const { error: updateError } = await supabase
            .from('entreprises')
            .update({
              categorie_qualifiee: categorieClean,
              categorie_confidence: confidence,
              date_qualification: new Date().toISOString(),
            })
            .eq('id', entreprise.id);

          if (updateError) {
            console.error(`Update error for ${entreprise.id}:`, updateError);
            results.failed++;
            results.errors.push(`${entreprise.id}: ${updateError.message}`);
          } else {
            results.succeeded++;
            results.categories[categorieClean] = (results.categories[categorieClean] || 0) + 1;
          }

          results.processed++;

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error qualifying ${entreprise.id}:`, errorMessage);
          results.failed++;
          results.errors.push(`${entreprise.id}: ${errorMessage}`);
        }
      }

    console.log('Qualification complete:', results);

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in qualify-all-entreprises:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});