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
          const prompt = `Analyse cette entreprise et détermine SA VRAIE catégorie d'activité principale.

CONTEXTE:
- Activité: ${entreprise.activite || 'Non spécifiée'}
- Administration: ${entreprise.administration || 'Non spécifiée'}
- Forme juridique: ${entreprise.forme_juridique || 'Non spécifiée'}
- Code NAF: ${entreprise.code_naf || 'Non spécifié'}

CATÉGORIES DISPONIBLES (34 catégories détaillées):
🏢 TERTIAIRE: conseil-consulting, holding, immobilier, finance-assurance, juridique
🏗️ CONSTRUCTION: maconnerie, plomberie-chauffage, electricite, menuiserie, peinture-revetements
🛍️ COMMERCE: commerce-detail, commerce-gros, e-commerce
🍴 RESTAURATION: restauration, cafes-bars, snack-fastfood, traiteur
🚴 TRANSPORT: livraison-coursier, transport-marchandises, vtc-taxi
💻 TECH: informatique-dev, digital-web
📢 COMMUNICATION: marketing-pub
⚡ ENERGIE: energie-renouvelable, environnement-recyclage
⚕️ SANTE: sante-medical, beaute-coiffure
🏭 INDUSTRIE: industrie-fabrication
🌾 AGRICULTURE: agriculture
📚 EDUCATION: education-formation
🔧 SERVICES: artisanat-reparation, services-personne
🏨 HOTELLERIE: hotellerie
🎬 CULTURE: culture-spectacles
⚽ SPORT: sport-loisirs
❓ AUTRES: autre, activite-non-precisee

RÈGLES:
1. Restaurant avec livraison = "restauration"
2. Coursier vélo = "livraison-coursier"
3. SCI = "immobilier"
4. Holding = "holding"
5. Utilise le code NAF pour affiner

Format: "categorie|confidence"
Exemple: "restauration|95"`;

          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash-lite',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.3,
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