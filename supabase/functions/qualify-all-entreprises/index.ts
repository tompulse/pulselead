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

    // Récupérer TOUTES les entreprises non qualifiées
    const { data: entreprises, error: fetchError } = await supabase
      .from('entreprises')
      .select('id, activite, administration, forme_juridique')
      .is('categorie_qualifiee', null)
      .limit(10000);

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

    // Traiter par batch de 100 pour éviter les timeouts
    const batchSize = 100;
    
    for (let i = 0; i < entreprises.length; i += batchSize) {
      const batch = entreprises.slice(i, i + batchSize);
      
      for (const entreprise of batch) {
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

          // Log progress every 100
          if (results.processed % 100 === 0) {
            console.log(`Progress: ${results.processed}/${total} (${Math.round(results.processed/total*100)}%)`);
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error qualifying ${entreprise.id}:`, errorMessage);
          results.failed++;
          results.errors.push(`${entreprise.id}: ${errorMessage}`);
        }
      }
      
      // Petite pause entre les batches
      await new Promise(resolve => setTimeout(resolve, 200));
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