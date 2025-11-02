import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Obtenir un token OAuth2 de l'INSEE (avec fallbacks si l'URL change)
async function getInseeToken(): Promise<string> {
  const consumerKey = Deno.env.get('INSEE_CONSUMER_KEY');
  const consumerSecret = Deno.env.get('INSEE_CONSUMER_SECRET');
  
  if (!consumerKey || !consumerSecret) {
    throw new Error('INSEE credentials not configured');
  }

  const credentials = btoa(`${consumerKey}:${consumerSecret}`);

  // Plusieurs hôtes/chemins observés dans la doc et migrations récentes
  const candidateEndpoints = [
    'https://portail-api.insee.fr/token',
    'https://api.insee.fr/token',
    'https://api.insee.fr/oauth/token',
    'https://api.insee.fr/oauth/v2/token',
  ];

  let lastErrorText = '';
  let lastStatus = 0;

  for (const url of candidateEndpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: 'grant_type=client_credentials',
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`INSEE token obtained successfully via ${url}`);
        return data.access_token;
      }

      lastStatus = response.status;
      lastErrorText = await response.text();
      console.error('INSEE token error:', {
        tried: url,
        status: response.status,
        statusText: response.statusText,
        body: lastErrorText,
        consumerKey: consumerKey.substring(0, 8) + '...'
      });

      // Si 404 avec message de dépréciation, on tente l'URL suivante
      // Pour 401 (credentials invalides), inutile d'essayer les autres
      if (response.status === 401) break;
    } catch (e) {
      console.error(`INSEE token fetch exception on ${url}:`, e);
      lastErrorText = e instanceof Error ? e.message : String(e);
    }
  }

  throw new Error(`Failed to get INSEE token after trying ${candidateEndpoints.length} endpoints. Last status: ${lastStatus} - ${lastErrorText}`);
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
  
// Préparer l'authentification
const integrationApiKey = Deno.env.get('INSEE_API_KEY_INTEGRATION');
let inseeToken: string | null = null;

if (!integrationApiKey) {
  // Obtenir le token INSEE (legacy OAuth2 client_credentials)
  try {
    inseeToken = await getInseeToken();
    console.log('INSEE token obtained successfully');
  } catch (error) {
    console.error('Failed to obtain INSEE token:', error);
    throw error;
  }
} else {
  console.log('Using INSEE integration API key header');
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

// Préparer l'appel SIRENE (nouvelle API + fallback)
const useIntegration = !!integrationApiKey;
const headers: Record<string, string> = { Accept: 'application/json' };
if (useIntegration) {
  headers['X-INSEE-Api-Key-Integration'] = integrationApiKey!;
} else if (inseeToken) {
  headers['Authorization'] = `Bearer ${inseeToken}`;
} else {
  throw new Error('No INSEE credentials available for SIRENE call');
}

const candidateSireneUrls = [
  `https://api.insee.fr/api-sirene/3.11/siret/${entreprise.siret}`,
  `https://api.insee.fr/entreprises/sirene/V3.11/siret/${entreprise.siret}`
];

let sireneResponse: Response | null = null;
for (const url of candidateSireneUrls) {
  const resp = await fetch(url, { headers });
  if (resp.ok) {
    if (url !== candidateSireneUrls[0]) {
      console.log(`SIRENE fetched via fallback URL for ${entreprise.siret}: ${url}`);
    }
    sireneResponse = resp;
    break;
  } else {
    // Backoff si rate limit
    if (resp.status === 429) {
      console.log('Rate limit hit, waiting 3s...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    console.error(`SIRENE error for ${entreprise.siret} on ${url}: ${resp.status}`);
  }
}

if (!sireneResponse) {
  totalErrors++;
  return;
}

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
