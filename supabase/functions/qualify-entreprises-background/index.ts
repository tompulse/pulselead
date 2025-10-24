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

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Count unqualified entreprises
    const { count: totalCount, error: countError } = await supabase
      .from('entreprises')
      .select('*', { count: 'exact', head: true })
      .is('categorie_qualifiee', null);

    if (countError) throw countError;

    // Create job record
    const { data: job, error: jobError } = await supabase
      .from('qualification_jobs')
      .insert({
        user_id: user.id,
        status: 'running',
        total_count: totalCount || 0,
      })
      .select()
      .single();

    if (jobError) throw jobError;

    console.log(`Created job ${job.id} for ${totalCount} entreprises`);

    // Background task to process all entreprises
    const backgroundTask = async () => {
      const batchSize = 50;
      let processedCount = 0;
      let succeededCount = 0;
      let failedCount = 0;

      try {
        while (true) {
          // Fetch batch
          const { data: entreprises, error: fetchError } = await supabase
            .from('entreprises')
            .select('id, activite, administration, forme_juridique')
            .is('categorie_qualifiee', null)
            .limit(batchSize);

          if (fetchError) throw fetchError;

          if (!entreprises || entreprises.length === 0) {
            // All done
            await supabase
              .from('qualification_jobs')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
              })
              .eq('id', job.id);
            
            console.log(`Job ${job.id} completed. Total: ${processedCount}, Succeeded: ${succeededCount}, Failed: ${failedCount}`);
            break;
          }

          // Process batch
          for (const entreprise of entreprises) {
            try {
              const prompt = `Analyse cette entreprise et détermine SA VRAIE catégorie d'activité principale.

CONTEXTE:
- Activité: ${entreprise.activite || 'Non spécifiée'}
- Administration: ${entreprise.administration || 'Non spécifiée'}
- Forme juridique: ${entreprise.forme_juridique || 'Non spécifiée'}

CATÉGORIES DISPONIBLES:
- livraison: Coursier à vélo, livreur indépendant, auto-entrepreneur livraison (PAS de local commercial fixe)
- restauration: Restaurant, bar, brasserie, snack avec LOCAL COMMERCIAL (même s'ils font aussi de la livraison)
- construction: BTP, maçonnerie, plomberie, électricité, menuiserie, travaux
- immobilier: SCI, location immobilière, agence immobilière, gestion de biens (PAS construction)
- commerce: Magasin, boutique, vente au détail, négoce
- energie: Énergie, électricité, photovoltaïque, pompe à chaleur
- transport: VTC, taxi, transport de marchandises, logistique (PAS coursier vélo)
- technologie: Informatique, logiciel, développement, web, digital
- services: Conseil, consulting, formation, expertise, holding, gestion
- sante: Médical, pharmacie, cosmétique, beauté, coiffure
- industrie: Fabrication, production, manufacture, usine
- communication: Marketing, publicité, communication, média
- other: Aucune catégorie ne correspond

RÈGLES IMPORTANTES:
1. Un restaurant avec livraison = "restauration" (pas "livraison")
2. Un coursier vélo indépendant = "livraison" (pas "restauration")
3. Une SCI = "immobilier" (pas "construction")
4. Un holding = "services" (pas la catégorie des entreprises détenues)

Réponds UNIQUEMENT avec la catégorie (un seul mot) et ta confiance (0-100) au format: "categorie|confidence"
Exemple: "restauration|95" ou "livraison|90"`;

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
                failedCount++;
                continue;
              }

              const aiData = await aiResponse.json();
              const response = aiData.choices[0].message.content.trim();
              
              const [categorie, confidenceStr] = response.split('|');
              const confidence = parseInt(confidenceStr) || 50;
              const categorieClean = categorie.toLowerCase().trim();

              const { error: updateError } = await supabase
                .from('entreprises')
                .update({
                  categorie_qualifiee: categorieClean,
                  categorie_confidence: confidence,
                  date_qualification: new Date().toISOString(),
                })
                .eq('id', entreprise.id);

              if (updateError) {
                failedCount++;
              } else {
                succeededCount++;
              }

              processedCount++;

              // Update job progress every 10 entreprises
              if (processedCount % 10 === 0) {
                await supabase
                  .from('qualification_jobs')
                  .update({
                    processed_count: processedCount,
                    succeeded_count: succeededCount,
                    failed_count: failedCount,
                  })
                  .eq('id', job.id);
              }

            } catch (error) {
              console.error(`Error qualifying ${entreprise.id}:`, error);
              failedCount++;
              processedCount++;
            }
          }

          // Small delay between batches
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error(`Job ${job.id} failed:`, error);
        await supabase
          .from('qualification_jobs')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', job.id);
      }
    };

    // Start background task (fire and forget)
    backgroundTask().catch(err => {
      console.error('Background task error:', err);
    });

    // Return immediately
    return new Response(
      JSON.stringify({ 
        message: 'Qualification started in background',
        jobId: job.id,
        totalCount: totalCount || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in qualify-entreprises-background:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
