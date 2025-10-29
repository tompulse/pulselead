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
    let body: { jobId?: string; batchSize?: number; backoffMs?: number; parallel?: number } = {};
    try {
      body = await req.json();
    } catch {
      // no body is fine
    }

    const BATCH_SIZE = Math.max(10, Math.min(60, body.batchSize ?? 30));
    const DEFAULT_PARALLEL_REQUESTS = 3; // base parallelism
    const DEFAULT_DELAY_BETWEEN_REQUESTS = 400; // base inter-chunk delay
    const MAX_BACKOFF_MS = 60000; // 60s cap
    const backoffMs = Math.max(0, Math.min(MAX_BACKOFF_MS, body.backoffMs ?? 0));
    // Reduce parallelism under backoff to ease pressure
    const PARALLEL_REQUESTS = Math.max(1, Math.min(5, body.parallel ?? (backoffMs > 0 ? 2 : DEFAULT_PARALLEL_REQUESTS)));
    // When rate-limited, increase delay proportionally
    const DELAY_BETWEEN_REQUESTS = backoffMs > 0
      ? Math.max(DEFAULT_DELAY_BETWEEN_REQUESTS, Math.floor(backoffMs / 2))
      : DEFAULT_DELAY_BETWEEN_REQUESTS;

    // Helper to self invoke the function to process the next batch, fire-and-forget
    const scheduleNext = (jobId: string, nextBackoffMs: number = 0) => {
      // Intentionally not awaited to avoid holding the current request open
      serviceClient.functions
        .invoke('qualify-entreprises-background', { body: { jobId, batchSize: BATCH_SIZE, backoffMs: nextBackoffMs, parallel: PARALLEL_REQUESTS } })
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

      // If the job is not running (paused/completed/failed), exit without processing
      if (job.status !== 'running') {
        console.log(`Job ${jobId} is not running (status=${job.status}). Exiting batch.`);
        return new Response(
          JSON.stringify({ message: 'not_running', jobId, status: job.status }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Respect backoff before processing, if any
      if (backoffMs > 0) {
        console.log(`Backoff ${backoffMs}ms before processing next batch for job ${jobId}`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }

      // Fetch one batch of unqualified entreprises
      const { data: entreprises, error: fetchError, count, } = await serviceClient
        .from('entreprises')
        .select('id, activite, administration, forme_juridique, code_naf', { count: 'exact' })
        .is('categorie_qualifiee', null)
        .order('created_at', { ascending: true })
        .limit(BATCH_SIZE);

      // Also get the authoritative total row count to clamp totals
      const { count: totalAllBatch } = await serviceClient
        .from('entreprises')
        .select('*', { count: 'exact', head: true });

      if (fetchError) throw fetchError;

      let processed = 0;
      let succeeded = 0;
      let failed = 0;
      const startTime = Date.now();
      const TIME_BUDGET_MS = 50000; // Extended to 50 seconds
      let pauseNeeded = false; // only for 402 (credits)
      let pauseCode = 0;
      let rateLimited = false; // 429 handling with adaptive backoff

      // Process function for a single entreprise
      const processEntreprise = async (e: any) => {
        try {
          const prompt = `Analyse cette entreprise et détermine SA VRAIE catégorie d'activité principale.

CONTEXTE:
- Activité: ${e.activite || 'Non spécifiée'}
- Administration: ${e.administration || 'Non spécifiée'}
- Forme juridique: ${e.forme_juridique || 'Non spécifiée'}
- Code NAF: ${e.code_naf || 'Non spécifié'}

CATÉGORIES DISPONIBLES (34 catégories détaillées):

🏢 TERTIAIRE & SERVICES:
- conseil-consulting: Conseil, consulting, audit, expertise, stratégie
- holding: Holdings, participations, gestion financière
- immobilier: SCI, location immobilière, agence, foncier (PAS construction)
- finance-assurance: Banque, assurance, crédit, comptabilité
- juridique: Avocat, notaire, huissier, droit

🏗️ CONSTRUCTION & BATIMENT:
- maconnerie: Maçonnerie, gros œuvre, fondations, béton
- plomberie-chauffage: Plomberie, chauffage, sanitaire, climatisation
- electricite: Électricité, installation électrique
- menuiserie: Menuiserie, charpente, bois, ébénisterie
- peinture-revetements: Peinture, revêtements, carrelage, façade

🛍️ COMMERCE:
- commerce-detail: Magasin, boutique, vente détail
- commerce-gros: Grossiste, négoce, import-export
- e-commerce: Vente en ligne, marketplace

🍴 RESTAURATION:
- restauration: Restaurant avec LOCAL COMMERCIAL (même si livraison)
- cafes-bars: Café, bar, pub, débit de boisson
- snack-fastfood: Snack, fast-food, sandwicherie, food truck
- traiteur: Traiteur, pâtisserie, boulangerie

🚴 TRANSPORT & LIVRAISON:
- livraison-coursier: Coursier vélo, livreur indépendant (PAS de local commercial)
- transport-marchandises: Transport logistique, fret, déménagement
- vtc-taxi: VTC, taxi, chauffeur

💻 TECHNOLOGIE:
- informatique-dev: Informatique, développement, logiciel, programmation
- digital-web: Digital, web, internet, site web

📢 COMMUNICATION:
- marketing-pub: Marketing, publicité, communication, média

⚡ ENERGIE & ENVIRONNEMENT:
- energie-renouvelable: Photovoltaïque, solaire, pompe à chaleur
- environnement-recyclage: Recyclage, déchets, écologie

⚕️ SANTE:
- sante-medical: Santé, médical, pharmacie, paramédical
- beaute-coiffure: Coiffure, beauté, esthétique, cosmétique

🏭 INDUSTRIE:
- industrie-fabrication: Industrie, fabrication, production, manufacture

🌾 AGRICULTURE:
- agriculture: Agriculture, exploitation, viticulture, élevage

📚 EDUCATION:
- education-formation: Éducation, enseignement, formation, cours

🔧 ARTISANAT & SERVICES:
- artisanat-reparation: Artisanat, réparation, dépannage
- services-personne: Ménage, nettoyage, jardinage, aide domicile

🏨 HOTELLERIE:
- hotellerie: Hôtel, hébergement, gîte, chambre d'hôtes

🎬 CULTURE:
- culture-spectacles: Spectacle, musée, théâtre, cinéma, événementiel

⚽ SPORT:
- sport-loisirs: Sport, fitness, gym, club, loisirs

❓ AUTRES:
- autre: Aucune catégorie ne correspond vraiment
- activite-non-precisee: Impossible de déterminer l'activité

RÈGLES IMPORTANTES:
1. Restaurant avec livraison = "restauration" (PAS "livraison-coursier")
2. Coursier vélo indépendant = "livraison-coursier" 
3. SCI = "immobilier" (PAS "maconnerie")
4. Holding = "holding" (PAS la catégorie des entreprises détenues)
5. Utilise le code NAF pour affiner si disponible

Réponds UNIQUEMENT avec la catégorie (avec tirets) et ta confiance (0-100) au format: "categorie|confidence"
Exemple: "restauration|95" ou "livraison-coursier|90"`;

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

          for (let r = 0; r < results.length; r++) {
            const result: any = results[r];
            const ent = slice[r];
            if (result?.success) {
              succeeded++;
              processed++;
            } else if (result?.softFail && result.code === 402) {
              pauseNeeded = true;
              pauseCode = 402;
              console.log(`Pausing job due to insufficient credits (402) on entreprise ${ent.id}`);
              break;
            } else if (result?.softFail && result.code === 429) {
              rateLimited = true;
              console.log(`Rate limited (429) on entreprise ${ent.id}, will retry with backoff`);
              break;
            } else {
              failed++;
              processed++;
              console.log(`Failed to process entreprise ${ent.id}: ${result?.error}`);
            }
          }

          if (pauseNeeded || rateLimited) break;

          // Small delay between chunks to avoid rate limits
          if (i + PARALLEL_REQUESTS < entreprises.length) {
            await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
          }
        }

        console.log(`Batch completed: ${succeeded} succeeded, ${failed} failed out of ${processed} processed`);
      }

      // Update job counters - total_count is now dynamically updated based on remaining
      const newProcessed = (job.processed_count || 0) + processed;
      const newSucceeded = (job.succeeded_count || 0) + succeeded;
      const newFailed = (job.failed_count || 0) + failed;
      
      // Calculate remaining after this batch
      const remainingAfterBatch = Math.max(0, (count || 0) - processed);
      const updatedTotalRaw = newProcessed + remainingAfterBatch;
      const updatedTotal = Math.min(updatedTotalRaw, totalAllBatch || updatedTotalRaw);

      console.log(`Batch update: processed=${newProcessed}, succeeded=${newSucceeded}, failed=${newFailed}, remaining=${remainingAfterBatch}, updatedTotal=${updatedTotal}`);

      await serviceClient
        .from('qualification_jobs')
        .update({
          processed_count: newProcessed,
          succeeded_count: newSucceeded,
          failed_count: newFailed,
          total_count: updatedTotal,
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

      // If we were rate limited, retry automatically with adaptive backoff
      if (rateLimited) {
        const nextBackoff = Math.min(backoffMs > 0 ? backoffMs * 2 : 2000, MAX_BACKOFF_MS);
        scheduleNext(jobId, nextBackoff);
        return new Response(
          JSON.stringify({ message: 'rate_limited_retry', jobId, backoffMs: nextBackoff }),
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

    // START MODE: First call from the UI creates a job, or resumes an existing one
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

    // Control actions from UI (pause)
    if ((body as any)?.action === 'pause') {
      const { data: runningJobs } = await serviceClient
        .from('qualification_jobs')
        .select('*')
        .eq('user_id', authData.user.id)
        .eq('status', 'running')
        .order('created_at', { ascending: false })
        .limit(1);

      const jobToPause = runningJobs?.[0];
      if (!jobToPause) {
        return new Response(
          JSON.stringify({ message: 'no_running_job' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await serviceClient
        .from('qualification_jobs')
        .update({ status: 'paused', updated_at: new Date().toISOString() })
        .eq('id', jobToPause.id);

      return new Response(
        JSON.stringify({ message: 'paused', jobId: jobToPause.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CRITICAL: Get the REAL current count from the database
    const { count: actualUnqualifiedCount } = await serviceClient
      .from('entreprises')
      .select('*', { count: 'exact', head: true })
      .is('categorie_qualifiee', null);

    const { count: actualTotalAll } = await serviceClient
      .from('entreprises')
      .select('*', { count: 'exact', head: true });

    console.log(`Actual counts -> unqualified: ${actualUnqualifiedCount}, total: ${actualTotalAll}`);

    // If there's an existing job (running or paused), check if it's valid or needs cleanup
    const { data: existingJobs, error: existingErr } = await serviceClient
      .from('qualification_jobs')
      .select('*')
      .eq('user_id', authData.user.id)
      .in('status', ['running', 'paused'])
      .order('created_at', { ascending: false })
      .limit(1);

    const existing = existingJobs?.[0];

    if (existing) {
      // If nothing left to qualify, finalize the job immediately
      if ((actualUnqualifiedCount || 0) === 0) {
        await serviceClient
          .from('qualification_jobs')
          .update({ 
            status: 'completed',
            total_count: existing.processed_count,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        return new Response(
          JSON.stringify({ message: 'already_completed', jobId: existing.id, totalCount: existing.processed_count }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update the total_count to reflect current reality: processed + remaining, clamped to actual total
      const correctedTotalRaw = (existing.processed_count || 0) + (actualUnqualifiedCount || 0);
      const correctedTotal = Math.min(correctedTotalRaw, actualTotalAll || correctedTotalRaw);
      
      console.log(`Existing job ${existing.id}: processed=${existing.processed_count}, remaining=${actualUnqualifiedCount}, correctedTotal=${correctedTotal}`);

      await serviceClient
        .from('qualification_jobs')
        .update({ 
          total_count: correctedTotal,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (existing.status === 'paused') {
        await serviceClient
          .from('qualification_jobs')
          .update({ status: 'running', updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        console.log(`Resuming paused job ${existing.id}`);
        scheduleNext(existing.id);
        return new Response(
          JSON.stringify({ message: 'resumed', jobId: existing.id, totalCount: correctedTotal }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // If already running, nudge it
      console.log(`Job ${existing.id} already running, continuing`);
      scheduleNext(existing.id);
      return new Response(
        JSON.stringify({ message: 'already_running', jobId: existing.id, totalCount: correctedTotal }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No existing job - create a new one with accurate count
    if ((actualUnqualifiedCount || 0) === 0) {
      return new Response(
        JSON.stringify({ message: 'nothing_to_qualify', totalCount: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: job, error: jobError } = await serviceClient
      .from('qualification_jobs')
      .insert({ user_id: authData.user.id, status: 'running', total_count: actualUnqualifiedCount })
      .select()
      .single();
    if (jobError) throw jobError;

    console.log(`Created job ${job.id} for ${actualUnqualifiedCount} entreprises`);

    // Kick off the first batch
    scheduleNext(job.id);

    return new Response(
      JSON.stringify({ message: 'started', jobId: job.id, totalCount: actualUnqualifiedCount }),
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
