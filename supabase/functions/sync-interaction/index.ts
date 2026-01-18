import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InteractionRequest {
  entreprise_id: string;
  type: 'appel' | 'email' | 'visite' | 'rdv' | 'autre' | 'a_revoir' | 'a_rappeler';
  statut?: 'a_rappeler' | 'en_cours' | 'gagne' | 'perdu' | 'sans_suite';
  notes?: string;
  date_relance?: string;
  nouveau_statut_lead?: 'nouveau' | 'contacte' | 'qualifie' | 'proposition' | 'negociation' | 'gagne' | 'perdu';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('[sync-interaction] Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: InteractionRequest = await req.json();
    console.log('[sync-interaction] Creating interaction for user:', user.id, 'entreprise:', body.entreprise_id, 'type:', body.type);

    // 1. Insert interaction in lead_interactions table
    const interactionData: any = {
      entreprise_id: body.entreprise_id,
      user_id: user.id,
      type: body.type,
      statut: body.statut || 'en_cours',
      notes: body.notes || null,
      date_relance: body.date_relance || null,
    };

    const { data: interaction, error: interactionError } = await supabaseClient
      .from('lead_interactions')
      .insert(interactionData)
      .select()
      .single();

    if (interactionError) {
      console.error('[sync-interaction] Error creating interaction:', interactionError);
      return new Response(JSON.stringify({ error: interactionError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[sync-interaction] Interaction created:', interaction.id);

    // 2. Update or create lead status in lead_statuts table
    if (body.nouveau_statut_lead) {
      // Calculate score based on status
      const scoreMap: Record<string, number> = {
        nouveau: 10,
        contacte: 25,
        qualifie: 50,
        proposition: 70,
        negociation: 85,
        gagne: 100,
        perdu: 0,
      };

      const score = scoreMap[body.nouveau_statut_lead] ?? 0;

      // Check if lead status exists
      const { data: existingStatus } = await supabaseClient
        .from('lead_statuts')
        .select('id')
        .eq('entreprise_id', body.entreprise_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingStatus) {
        // Update existing
        const { error: updateError } = await supabaseClient
          .from('lead_statuts')
          .update({
            statut: body.nouveau_statut_lead,
            score,
            notes: body.notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingStatus.id);

        if (updateError) {
          console.error('[sync-interaction] Error updating lead status:', updateError);
        } else {
          console.log('[sync-interaction] Lead status updated to:', body.nouveau_statut_lead);
        }
      } else {
        // Insert new
        const { error: insertError } = await supabaseClient
          .from('lead_statuts')
          .insert({
            entreprise_id: body.entreprise_id,
            user_id: user.id,
            statut: body.nouveau_statut_lead,
            score,
            notes: body.notes || null,
          });

        if (insertError) {
          console.error('[sync-interaction] Error inserting lead status:', insertError);
        } else {
          console.log('[sync-interaction] Lead status created:', body.nouveau_statut_lead);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        interaction,
        message: 'Interaction enregistrée avec succès',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[sync-interaction] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Une erreur est survenue',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
