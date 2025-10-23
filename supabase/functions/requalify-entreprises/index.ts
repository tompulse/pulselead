import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

    // Catégories valides
    const validCategories = [
      'livraison', 'restauration', 'construction', 'immobilier', 
      'commerce', 'energie', 'transport', 'technologie', 
      'services', 'sante', 'industrie', 'communication'
    ];

    // Trouver toutes les entreprises avec catégories invalides
    const { data: entreprises, error } = await supabase
      .from('entreprises')
      .select('id, nom, siret, activite, forme_juridique, administration, categorie_qualifiee')
      .or(`categorie_qualifiee.is.null,categorie_qualifiee.eq.other,categorie_qualifiee.eq.autre,categorie_qualifiee.eq.Autre,categorie_qualifiee.eq.agriculture,categorie_qualifiee.eq.viticulteur,categorie_qualifiee.eq.agricole,categorie_qualifiee.like.%impossible%,categorie_qualifiee.like.exploitation%,categorie_qualifiee.like.compte tenu%,categorie_qualifiee.like.il est impossible%`)
      .limit(1000);

    if (error) throw error;

    console.log(`Found ${entreprises?.length || 0} entreprises to requalify`);

    let processed = 0;
    let errors = 0;

    for (const ent of entreprises || []) {
      try {
        const prompt = `Tu es un expert en catégorisation d'entreprises. Analyse cette entreprise:

Nom: ${ent.nom}
SIRET: ${ent.siret}
Activité: ${ent.activite || 'Non spécifiée'}
Administration: ${ent.administration || 'Non spécifiée'}
Forme juridique: ${ent.forme_juridique || 'Non spécifiée'}

CATÉGORIES DISPONIBLES (tu DOIS choisir UNE de ces catégories):
- livraison: Coursiers, livreurs, transport de colis
- restauration: Restaurants, traiteurs, food trucks, cafés
- construction: BTP, travaux, rénovation, maçonnerie
- immobilier: SCI, agences, gestion locative, promotion
- commerce: Boutiques, vente, négoce, distribution
- energie: Électricité, gaz, panneaux solaires, énergie renouvelable
- transport: Taxis, VTC, transporteurs, déménagement
- technologie: IT, développement, services numériques
- services: Conseil, formation, services aux entreprises
- sante: Professions médicales, paramédicales, bien-être
- industrie: Fabrication, production, usines
- communication: Marketing, publicité, médias, graphisme

RÈGLES IMPORTANTES:
- Tu DOIS choisir la catégorie la PLUS PROCHE même si ce n'est pas parfait
- NE retourne JAMAIS "other" ou "autre"
- Si l'activité n'est pas claire, choisis "services" par défaut
- Privilégie toujours une catégorie spécifique

EXEMPLES:
- Restaurant = "restauration"
- Coursier vélo = "livraison"
- SCI = "immobilier"
- Plombier = "construction"
- Développeur freelance = "technologie"
- Coach = "services"
- Agriculture/viticulteur = "industrie"

Réponds UNIQUEMENT: "categorie|confidence" (ex: "restauration|95")`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
          }),
        });

        if (!aiResponse.ok) {
          console.error(`AI error for ${ent.id}:`, await aiResponse.text());
          errors++;
          continue;
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices[0]?.message?.content?.trim();
        
        if (!content) {
          console.error(`Empty response for ${ent.id}`);
          errors++;
          continue;
        }

        const [categorie, confidenceStr] = content.split('|');
        const confidence = parseInt(confidenceStr) || 50;

        // Valider que la catégorie est valide
        if (!validCategories.includes(categorie.toLowerCase())) {
          console.error(`Invalid category "${categorie}" for ${ent.id}, defaulting to services`);
          await supabase
            .from('entreprises')
            .update({
              categorie_qualifiee: 'services',
              categorie_confidence: 50,
              date_qualification: new Date().toISOString(),
            })
            .eq('id', ent.id);
        } else {
          await supabase
            .from('entreprises')
            .update({
              categorie_qualifiee: categorie.toLowerCase(),
              categorie_confidence: confidence,
              date_qualification: new Date().toISOString(),
            })
            .eq('id', ent.id);
        }

        processed++;
        
        // Pause pour éviter rate limiting
        if (processed % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (err) {
        console.error(`Error processing ${ent.id}:`, err);
        errors++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        errors,
        total: entreprises?.length || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Requalify error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
