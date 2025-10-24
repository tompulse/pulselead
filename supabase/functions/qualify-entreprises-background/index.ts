import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process a single batch, then self-invoke until all are done.
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    // Parse body if present
    let body: { jobId?: string; batchSize?: number } = {};
    try {
      body = await req.json();
    } catch {
      // no body is fine
    }

    const BATCH_SIZE = Math.max(15, Math.min(100, body.batchSize ?? 30));
    const PARALLEL_REQUESTS = 5; // Process up to 5 entreprises in parallel for better speed
    const DELAY_BETWEEN_REQUESTS = 200; // 200ms delay between chunks to avoid rate limits

    // Helper to self invoke the function to process the next batch, fire-and-forget
    const scheduleNext = (jobId: string) => {
      // Intentionally not awaited to avoid holding the current request open
      serviceClient.functions
        .invoke('qualify-entreprises-background', { body: { jobId, batchSize: BATCH_SIZE } })
        .then(({ error }) => {
          if (error) console.error('Self-invoke error:', error);
        })
        .catch((e) => console.error('Self-invoke exception:', e));
    };

    // CONTINUE MODE: Subsequent invocations carry a jobId and run one batch
    if (body.jobId) {
      const jobId = body.jobId;

      // Load current job to accumulate counters
      const { data: job, error: jobFetchError } = await serviceClient
        .from('qualification_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobFetchError || !job) {
        console.error('Job not found:', jobId, jobFetchError);
        return new Response(JSON.stringify({ error: 'Job not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch one batch of unqualified entreprises
      const { data: entreprises, error: fetchError, count } = await serviceClient
        .from('entreprises')
        .select('id, activite, administration, forme_juridique', { count: 'exact' })
        .is('categorie_qualifiee', null)
        .order('created_at', { ascending: true })
        .limit(BATCH_SIZE);

      if (fetchError) throw fetchError;

      let processed = 0;
      let succeeded = 0;
      let failed = 0;
      const startTime = Date.now();
      const TIME_BUDGET_MS = 50000; // Extended to 50 seconds
      let pauseNeeded = false;
      let pauseCode = 0;

      // Process function for a single entreprise
      const processEntreprise = async (e: any) => {
        try {
          const prompt = `Analyse cette entreprise et détermine SA VRAIE catégorie d'activité principale.\n\nCONTEXTE:\n- Activité: ${e.activite || 'Non spécifiée'}\n- Administration: ${e.administration || 'Non spécifiée'}\n- Forme juridique: ${e.forme_juridique || 'Non spécifiée'}\n\nCATÉGORIES DISPONIBLES:\n- livraison: Coursier à vélo, livreur indépendant, auto-entrepreneur livraison (PAS de local commercial fixe)\n- restauration: Restaurant, bar, brasserie, snack avec LOCAL COMMERCIAL (même s'ils font aussi de la livraison)\n- construction: BTP, maçonnerie, plomberie, électricité, menuiserie, travaux\n- immobilier: SCI, location immobilière, agence immobilière, gestion de biens (PAS construction)\n- commerce: Magasin, boutique, vente au détail, négoce\n- energie: Énergie, électricité, photovoltaïque, pompe à chaleur\n- transport: VTC, taxi, transport de marchandises, logistique (PAS coursier vélo)\n- technologie: Informatique, logiciel, développement, web, digital\n- services: Conseil, consulting, formation, expertise, holding, gestion\n- sante: Médical, pharmacie, cosmétique, beauté, coiffure\n- industrie: Fabrication, production, manufacture, usine\n- communication: Marketing, publicité, communication, média\n- other: Aucune catégorie ne correspond\n\nRÈGLES IMPORTANTES:\n1. Un restaurant avec livraison = "restauration" (pas "livraison")\n2. Un coursier vélo indépendant = "livraison" (pas "restauration")\n3. Une SCI = "immobilier" (pas "construction")\n4. Un holding = "services" (pas la catégorie des entreprises détenues)\n\nRéponds UNIQUEMENT avec la catégorie (un seul mot) et ta confiance (0-100) au format: "categorie|confidence"\nExemple: "restauration|95" ou "livraison|90"`;

          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash-lite',
              messages: [{ role: 'user', content: prompt }],
            }),
          });

          if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            const status = aiResponse.status;
            if (status === 402 || status === 429) {
              console.log(`AI soft-fail for ${e.id}: ${status} - ${errorText}`);
              return { success: false, error: `AI API ${status}`, softFail: true, code: status };
            }
            console.error(`AI API error for ${e.id}: ${status} - ${errorText}`);
            return { success: false, error: `AI API ${status}` };
          }

          const aiData = await aiResponse.json();
          const response: string = aiData.choices?.[0]?.message?.content?.trim?.() ?? '';
          
          if (!response) {
            console.error(`Empty AI response for ${e.id}`);
            return { success: false, error: 'Empty response' };
          }

          const [categorieRaw, confidenceStr] = response.split('|');
          const categorie = (categorieRaw || 'other').toLowerCase().trim();
          const confidence = Math.max(0, Math.min(100, parseInt(confidenceStr || '50')));

          const { error: updateError } = await serviceClient
            .from('entreprises')
            .update({
              categorie_qualifiee: categorie,
              categorie_confidence: confidence,
              date_qualification: new Date().toISOString(),
            })
            .eq('id', e.id);

          if (updateError) {
            console.error(`DB update error for ${e.id}:`, updateError);
            return { success: false, error: 'DB update failed' };
          }
          return { success: true };
        } catch (err) {
          console.error('Process error for entreprise', e.id, ':', err);
          return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
        }
      };

      if (entreprises && entreprises.length > 0) {
        for (let i = 0; i < entreprises.length; i += PARALLEL_REQUESTS) {
          if (Date.now() - startTime > TIME_BUDGET_MS) break;

          const slice = entreprises.slice(i, i + PARALLEL_REQUESTS);
          const results = await Promise.all(slice.map(processEntreprise));
          processed += results.length;

          for (let r = 0; r < results.length; r++) {
            const result: any = results[r];
            const ent = slice[r];
            if (result?.success) {
              succeeded++;
            } else if (result?.softFail && (result.code === 402 || result.code === 429)) {
              pauseNeeded = true;
              pauseCode = result.code;
              console.log(`Pausing job due to AI ${result.code} on entreprise ${ent.id}`);
              break;
            } else {
              failed++;
              console.log(`Failed to process entreprise ${ent.id}: ${result?.error}`);
            }
          }

          if (pauseNeeded) break;

          // Small delay between chunks to avoid rate limits
          if (i + PARALLEL_REQUESTS < entreprises.length) {
            await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
          }
        }

        console.log(`Batch completed: ${succeeded} succeeded, ${failed} failed out of ${processed} processed`);
      }

      // Update job counters
      const newProcessed = (job.processed_count || 0) + processed;
      const newSucceeded = (job.succeeded_count || 0) + succeeded;
      const newFailed = (job.failed_count || 0) + failed;

      await serviceClient
        .from('qualification_jobs')
        .update({
          processed_count: newProcessed,
          succeeded_count: newSucceeded,
          failed_count: newFailed,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      // If we hit rate limits or ran out of credits, pause the job instead of failing
      if (pauseNeeded) {
        await serviceClient
          .from('qualification_jobs')
          .update({ status: 'paused', updated_at: new Date().toISOString() })
          .eq('id', jobId);

        const reason = pauseCode === 402 ? 'insufficient_credits' : 'rate_limited';
        return new Response(
          JSON.stringify({ message: 'paused', reason, jobId }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // If batch was empty, we're done
      if (!entreprises || entreprises.length === 0) {
        await serviceClient
          .from('qualification_jobs')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', jobId);

        console.log(`Job ${jobId} completed.`);
        return new Response(JSON.stringify({ message: 'completed', jobId }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Otherwise, schedule next batch immediately
      scheduleNext(jobId);
      return new Response(
        JSON.stringify({ message: 'batch_processed', jobId, batch: processed, remaining: (count ?? 0) - processed }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // START MODE: First call from the UI creates a job and kicks off background batches
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: authData, error: authError } = await serviceClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Count remaining to set total_count
    const { count: totalCount, error: countError } = await serviceClient
      .from('entreprises')
      .select('*', { count: 'exact', head: true })
      .is('categorie_qualifiee', null);
    if (countError) throw countError;

    const { data: job, error: jobError } = await serviceClient
      .from('qualification_jobs')
      .insert({ user_id: authData.user.id, status: 'running', total_count: totalCount || 0 })
      .select()
      .single();
    if (jobError) throw jobError;

    console.log(`Created job ${job.id} for ${totalCount} entreprises`);

    // Kick off the first batch
    scheduleNext(job.id);

    return new Response(
      JSON.stringify({ message: 'started', jobId: job.id, totalCount: totalCount || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in qualify-entreprises-background:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
