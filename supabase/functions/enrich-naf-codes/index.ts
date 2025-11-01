import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { table } = await req.json();
    const targetTable = table || 'entreprises';

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer toutes les entreprises sans code NAF
    const { data: entreprises, error: fetchError } = await supabase
      .from(targetTable)
      .select('id, siret, code_naf')
      .or('code_naf.is.null,code_naf.eq.');

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${entreprises?.length || 0} ${targetTable} without NAF codes`);

    let successCount = 0;
    let errorCount = 0;

    // Traiter par lots de 10
    const batchSize = 10;
    for (let i = 0; i < (entreprises?.length || 0); i += batchSize) {
      const batch = entreprises!.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (entreprise) => {
        try {
          if (!entreprise.siret || entreprise.siret.length !== 14) {
            errorCount++;
            return;
          }

          // Appeler l'API Sirene de l'INSEE (gratuite, publique)
          const sireneUrl = `https://api.insee.fr/entreprises/sirene/V3.11/siret/${entreprise.siret}`;
          
          const sireneResponse = await fetch(sireneUrl, {
            headers: {
              'Accept': 'application/json'
            }
          });

          if (sireneResponse.ok) {
            const sireneData = await sireneResponse.json();
            const codeNaf = sireneData.etablissement?.uniteLegale?.activitePrincipaleUniteLegale;

            if (codeNaf) {
              // Mettre à jour l'entreprise avec le code NAF
              const { error: updateError } = await supabase
                .from(targetTable)
                .update({ code_naf: codeNaf })
                .eq('id', entreprise.id);

              if (updateError) {
                console.error(`Update error for ${entreprise.id}:`, updateError);
                errorCount++;
              } else {
                successCount++;
              }
            } else {
              errorCount++;
            }
          } else {
            console.error(`API error for SIRET ${entreprise.siret}:`, sireneResponse.status);
            errorCount++;
          }

          // Pause pour respecter les rate limits de l'API INSEE
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`Error enriching ${entreprise.id}:`, error);
          errorCount++;
        }
      }));
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Enrichissement NAF terminé: ${successCount} succès, ${errorCount} erreurs`,
        successCount,
        errorCount,
        total: entreprises?.length || 0
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
