import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { batchSize = 50 } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`[qualify-building-types] Fetching batch of ${batchSize} entreprises...`);

    // Fetch entreprises that don't have type_batiment yet
    const { data: entreprises, error: fetchError } = await supabaseClient
      .from('entreprises')
      .select('id, nom, activite, code_naf, forme_juridique, effectifs, adresse, code_postal, ville')
      .is('type_batiment', null)
      .limit(batchSize);

    if (fetchError) {
      console.error('[qualify-building-types] Error fetching entreprises:', fetchError);
      throw fetchError;
    }

    if (!entreprises || entreprises.length === 0) {
      console.log('[qualify-building-types] No more entreprises to qualify');
      return new Response(
        JSON.stringify({ 
          success: true, 
          processed: 0, 
          hasMore: false,
          message: 'All entreprises are already qualified'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[qualify-building-types] Processing ${entreprises.length} entreprises`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const updates = [];
    let succeeded = 0;
    let failed = 0;

    for (const entreprise of entreprises) {
      try {
        const prompt = `Analyse cette entreprise française et détermine :

1. TYPE_BATIMENT (choisis parmi) :
   - boutique_commerce : Commerce de détail, magasin physique
   - restaurant_bar : Restaurant, bar, café, traiteur
   - bureau_services : Bureau de conseil, services, agence
   - atelier_usine : Atelier de fabrication, usine, industrie
   - base_travaux_btp : Entreprise BTP, construction, chantier
   - artisan_local_mixte : Artisan (plombier, électricien, menuisier...)
   - holding_siege : Holding, siège social, administration
   - cabinet_medical : Cabinet médical, paramédical
   - centre_formation : Centre de formation, école
   - exploitation_agricole : Exploitation agricole, ferme
   - hotel_hebergement : Hôtel, hébergement touristique
   - entrepot_logistique : Entrepôt, logistique, transport

2. ZONE_TYPE (choisis parmi) :
   - centre_ville : Centre-ville, rue commerçante
   - zone_industrielle : Zone industrielle, parc d'activités
   - zone_commerciale : Zone commerciale, retail park
   - rural : Zone rurale, périphérie

Données entreprise :
- Nom : ${entreprise.nom}
- Activité : ${entreprise.activite || 'Non renseignée'}
- Code NAF : ${entreprise.code_naf || 'Non renseigné'}
- Forme juridique : ${entreprise.forme_juridique || 'Non renseignée'}
- Adresse : ${entreprise.adresse || ''}, ${entreprise.code_postal || ''} ${entreprise.ville || ''}

Réponds UNIQUEMENT au format JSON strict sans markdown :
{ "type_batiment": "...", "zone_type": "..." }`;

        console.log(`[qualify-building-types] Calling Lovable AI for ${entreprise.nom}...`);

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 150
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`[qualify-building-types] AI API error for ${entreprise.nom}:`, aiResponse.status, errorText);
          
          if (aiResponse.status === 429) {
            throw new Error('Rate limit exceeded');
          } else if (aiResponse.status === 402) {
            throw new Error('Credits exhausted');
          }
          
          failed++;
          continue;
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content || '';

        console.log(`[qualify-building-types] AI response for ${entreprise.nom}:`, content);

        // Clean and parse the response
        let cleanedContent = content.trim();
        
        // Remove markdown code blocks if present
        if (cleanedContent.startsWith('```')) {
          cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        }
        
        // Parse JSON
        let result;
        try {
          result = JSON.parse(cleanedContent);
        } catch (parseError) {
          console.error(`[qualify-building-types] JSON parse error for ${entreprise.nom}:`, parseError);
          result = { type_batiment: 'bureau_services', zone_type: 'centre_ville' };
        }

        // Validate and default
        const validTypes = [
          'boutique_commerce', 'restaurant_bar', 'bureau_services', 'atelier_usine',
          'base_travaux_btp', 'artisan_local_mixte', 'holding_siege', 'cabinet_medical',
          'centre_formation', 'exploitation_agricole', 'hotel_hebergement', 'entrepot_logistique'
        ];
        
        const validZones = ['centre_ville', 'zone_industrielle', 'zone_commerciale', 'rural'];

        const type_batiment = validTypes.includes(result.type_batiment) 
          ? result.type_batiment 
          : 'bureau_services';
        
        const zone_type = validZones.includes(result.zone_type) 
          ? result.zone_type 
          : 'centre_ville';

        updates.push({
          id: entreprise.id,
          type_batiment,
          zone_type
        });

        succeeded++;
        console.log(`[qualify-building-types] Successfully qualified ${entreprise.nom}: ${type_batiment}, ${zone_type}`);
        
      } catch (error) {
        console.error(`[qualify-building-types] Error processing ${entreprise.nom}:`, error);
        failed++;
      }
    }

    // Batch update all entreprises
    if (updates.length > 0) {
      console.log(`[qualify-building-types] Updating ${updates.length} entreprises...`);
      
      for (const update of updates) {
        const { error: updateError } = await supabaseClient
          .from('entreprises')
          .update({
            type_batiment: update.type_batiment,
            zone_type: update.zone_type,
            date_qualification: new Date().toISOString()
          })
          .eq('id', update.id);

        if (updateError) {
          console.error(`[qualify-building-types] Update error for ${update.id}:`, updateError);
        }
      }
    }

    console.log(`[qualify-building-types] Batch completed: ${succeeded} succeeded, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: entreprises.length,
        succeeded,
        failed,
        hasMore: entreprises.length === batchSize
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[qualify-building-types] Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
