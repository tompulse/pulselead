import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function processRequalification() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let successCount = 0;
  let errorCount = 0;
  let processedCount = 0;
  const batchSize = 20;
  let hasMore = true;

  console.log('Starting background requalification...');

  while (hasMore) {
    const { data: entreprises, error: fetchError } = await supabase
      .from('entreprises')
      .select('id, nom, activite, categorie_qualifiee, categorie_detaillee')
      .eq('categorie_detaillee', 'resto-restaurant')
      .is('code_naf', null)
      .limit(batchSize);

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      break;
    }

    if (!entreprises || entreprises.length === 0) {
      hasMore = false;
      break;
    }

    for (const entreprise of entreprises) {
      try {
        const prompt = `Analyse cette entreprise et détermine sa VRAIE catégorie d'activité principale.

Nom: ${entreprise.nom}
Activité: ${entreprise.activite || 'Non spécifiée'}

Catégories disponibles:
- restauration (restaurants, cafés, food)
- boulangerie_patisserie (boulangeries, pâtisseries)
- commerce_alimentaire (supermarchés, épiceries)
- immobilier (agences immobilières, location, gestion immobilière)
- services_professionnels (conseil, expertise, services aux entreprises)
- construction (BTP, travaux, rénovation)
- sante (médical, paramédical, pharmacie)
- automobile (garages, concessionnaires, pièces auto)
- hebergement (hôtels, locations saisonnières)
- commerce_detail (magasins, boutiques non-alimentaires)
- beaute_bien_etre (coiffure, esthétique, spa)
- autre (si aucune catégorie ne correspond)

RÈGLES IMPORTANTES:
- Si "immobilier", "location", "agence immobilière" → immobilier
- Si "boulangerie", "pâtisserie" → boulangerie_patisserie
- Si activité générique type "location biens" → immobilier
- Ignore les mentions juridiques standards

Réponds UNIQUEMENT avec le nom de la catégorie, sans explication.`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'Tu es un expert en classification d\'entreprises. Réponds uniquement avec le nom de la catégorie.' },
              { role: 'user', content: prompt }
            ],
          }),
        });

        if (!aiResponse.ok) {
          console.error(`AI error for ${entreprise.id}:`, await aiResponse.text());
          errorCount++;
          continue;
        }

        const aiData = await aiResponse.json();
        const newCategory = aiData.choices[0].message.content.trim().toLowerCase();

        console.log(`${entreprise.nom} → ${newCategory}`);

        // Update only if category changed and is not restauration
        if (newCategory !== entreprise.categorie_qualifiee && newCategory !== 'restauration') {
          const { error: updateError } = await supabase
            .from('entreprises')
            .update({
              categorie_qualifiee: newCategory,
              categorie_detaillee: newCategory,
              date_qualification: new Date().toISOString(),
            })
            .eq('id', entreprise.id);

          if (updateError) {
            console.error(`Update error for ${entreprise.id}:`, updateError);
            errorCount++;
          } else {
            successCount++;
          }
        }

        processedCount++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error processing ${entreprise.id}:`, error);
        errorCount++;
      }
    }

    console.log(`Batch complete: ${processedCount} processed, ${successCount} requalified, ${errorCount} errors`);
    
    // If we got fewer than batchSize, we're done
    if (entreprises.length < batchSize) {
      hasMore = false;
    }
  }

  console.log(`Requalification complete: ${processedCount} processed, ${successCount} requalified, ${errorCount} errors`);
  return { processedCount, successCount, errorCount };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Start background task - let it run without awaiting
    processRequalification().catch(err => {
      console.error('Background requalification error:', err);
    });

    // Return immediate response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Re-qualification lancée en arrière-plan',
        status: 'processing'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Requalification error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
