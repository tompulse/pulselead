import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Obtenir un token OAuth2 de l'INSEE
async function getInseeToken(): Promise<string> {
  const consumerKey = Deno.env.get('INSEE_CONSUMER_KEY');
  const consumerSecret = Deno.env.get('INSEE_CONSUMER_SECRET');
  
  if (!consumerKey || !consumerSecret) {
    throw new Error('INSEE credentials not configured');
  }

  const credentials = btoa(`${consumerKey}:${consumerSecret}`);
  
  const response = await fetch('https://api.insee.fr/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Failed to get INSEE token: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function processEnrichment(targetTable: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let totalSuccess = 0;
  let totalErrors = 0;
  let processedCount = 0;
  const batchSize = 50;
  let hasMore = true;

  console.log(`Starting NAF enrichment for ${targetTable}...`);
  
  // Obtenir le token INSEE
  let inseeToken: string;
  try {
    inseeToken = await getInseeToken();
    console.log('INSEE token obtained successfully');
  } catch (error) {
    console.error('Failed to obtain INSEE token:', error);
    throw error;
  }

  while (hasMore) {
    // Récupérer un lot d'entreprises sans NAF
    const { data: entreprises, error: fetchError } = await supabase
      .from(targetTable)
      .select('id, siret, code_naf')
      .or('code_naf.is.null,code_naf.eq.')
      .limit(batchSize);

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      break;
    }

    if (!entreprises || entreprises.length === 0) {
      hasMore = false;
      break;
    }

    console.log(`Processing batch of ${entreprises.length} records...`);

    // Traiter ce lot en parallèle (par groupes de 3 pour respecter rate limits INSEE: 30/min)
    for (let i = 0; i < entreprises.length; i += 3) {
      const miniBatch = entreprises.slice(i, i + 3);
      
      await Promise.all(miniBatch.map(async (entreprise) => {
        try {
          if (!entreprise.siret || entreprise.siret.length !== 14) {
            totalErrors++;
            return;
          }

          // Appeler l'API Sirene de l'INSEE avec authentification
          const sireneUrl = `https://api.insee.fr/entreprises/sirene/V3.11/siret/${entreprise.siret}`;
          
          const sireneResponse = await fetch(sireneUrl, {
            headers: { 
              'Accept': 'application/json',
              'Authorization': `Bearer ${inseeToken}`
            }
          });

          if (sireneResponse.ok) {
            const sireneData = await sireneResponse.json();
            const codeNaf = sireneData.etablissement?.uniteLegale?.activitePrincipaleUniteLegale;

            if (codeNaf) {
              const { error: updateError } = await supabase
                .from(targetTable)
                .update({ code_naf: codeNaf })
                .eq('id', entreprise.id);

              if (updateError) {
                console.error(`Update error for ${entreprise.id}:`, updateError);
                totalErrors++;
              } else {
                totalSuccess++;
              }
            } else {
              totalErrors++;
            }
          } else {
            // Si rate limit (429), on attend plus longtemps
            if (sireneResponse.status === 429) {
              console.log('Rate limit hit, waiting 3s...');
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
            console.error(`API error for ${entreprise.siret}: ${sireneResponse.status}`);
            totalErrors++;
          }

        } catch (error) {
          console.error(`Error enriching ${entreprise.id}:`, error);
          totalErrors++;
        }
      }));

      // Pause plus longue entre chaque mini-lot pour respecter le rate limit INSEE (30/min = 2s/req)
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    processedCount += entreprises.length;
    console.log(`Batch complete: ${processedCount} processed, ${totalSuccess} enriched, ${totalErrors} errors`);

    // Si on a moins d'enregistrements que batchSize, on a fini
    if (entreprises.length < batchSize) {
      hasMore = false;
    }
  }

  console.log(`Enrichment complete: ${processedCount} processed, ${totalSuccess} enriched, ${totalErrors} errors`);
  return { processedCount, totalSuccess, totalErrors };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const targetTable = body.table || 'entreprises';

    // Lancer en arrière-plan
    processEnrichment(targetTable).catch(err => {
      console.error('Background enrichment error:', err);
    });

    // Réponse immédiate
    return new Response(
      JSON.stringify({
        success: true,
        message: `Enrichissement NAF lancé en arrière-plan pour la table ${targetTable}`,
        status: 'processing'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enrich-naf-codes:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
