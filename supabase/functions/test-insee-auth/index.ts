import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sirets } = await req.json();
    
    if (!sirets || !Array.isArray(sirets)) {
      return new Response(
        JSON.stringify({ error: 'sirets array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const inseeApiKey = Deno.env.get('INSEE_API_KEY_INTEGRATION');
    
    if (!inseeApiKey) {
      return new Response(
        JSON.stringify({ error: 'INSEE_API_KEY_INTEGRATION not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const results = [];

    console.log('Testing with INSEE_API_KEY_INTEGRATION:', inseeApiKey.substring(0, 10) + '...');

    for (const siret of sirets.slice(0, 10)) {
      const testCases = [
        { name: 'X-INSEE-Api-Key-Integration', headers: { 'X-INSEE-Api-Key-Integration': inseeApiKey } },
        { name: 'X-INSEE-Api-Key', headers: { 'X-INSEE-Api-Key': inseeApiKey } },
        { name: 'Authorization Bearer', headers: { 'Authorization': `Bearer ${inseeApiKey}` } },
      ];

      for (const testCase of testCases) {
        try {
          const url = `https://api.insee.fr/api-sirene/3.11/siret/${siret}`;
          const headers: Record<string, string> = {
            'Accept': 'application/json'
          };
          Object.assign(headers, testCase.headers);
          
          const response = await fetch(url, { headers });

          const bodyText = await response.text();
          let parsedBody;
          try {
            parsedBody = JSON.parse(bodyText);
          } catch {
            parsedBody = bodyText;
          }

          results.push({
            siret,
            method: testCase.name,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: parsedBody,
            success: response.ok
          });

          console.log(`${testCase.name} for ${siret}: ${response.status} ${response.statusText}`);
          
          // Si succès, on peut arrêter de tester les autres méthodes pour ce SIRET
          if (response.ok) break;
        } catch (error) {
          results.push({
            siret,
            method: testCase.name,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ results, total: results.length }, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Test error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
