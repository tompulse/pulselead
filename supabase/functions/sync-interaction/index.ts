import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InteractionRequest {
  entreprise_id: string;
  type: 'appel' | 'email' | 'visite' | 'rdv' | 'autre';
  statut: 'a_rappeler' | 'en_cours' | 'gagne' | 'perdu' | 'sans_suite';
  notes?: string;
  prochaine_action?: string;
  date_prochaine_action?: string;
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
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: InteractionRequest = await req.json();
    console.log('Creating interaction for user:', user.id, 'entreprise:', body.entreprise_id);

    // 1. Insert interaction
    const { data: interaction, error: interactionError } = await supabaseClient
      .from('lead_interactions')
      .insert({
        entreprise_id: body.entreprise_id,
        user_id: user.id,
        type: body.type,
        statut: body.statut,
        notes: body.notes,
        prochaine_action: body.prochaine_action,
        date_prochaine_action: body.date_prochaine_action,
      })
      .select()
      .single();

    if (interactionError) {
      console.error('Error creating interaction:', interactionError);
      return new Response(JSON.stringify({ error: interactionError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Interaction created:', interaction.id);

    // 2. Update or create lead status
    if (body.nouveau_statut_lead) {
      const etapePipeline = {
        nouveau: 1,
        contacte: 2,
        qualifie: 3,
        proposition: 4,
        negociation: 5,
        gagne: 5,
        perdu: 5,
      }[body.nouveau_statut_lead];

      // Calculate probability based on status
      const probabilite = {
        nouveau: 10,
        contacte: 25,
        qualifie: 50,
        proposition: 70,
        negociation: 85,
        gagne: 100,
        perdu: 0,
      }[body.nouveau_statut_lead];

      const { error: statusError } = await supabaseClient
        .from('lead_statuts')
        .upsert(
          {
            entreprise_id: body.entreprise_id,
            user_id: user.id,
            statut_actuel: body.nouveau_statut_lead,
            etape_pipeline: etapePipeline,
            probabilite,
          },
          { onConflict: 'entreprise_id,user_id' }
        );

      if (statusError) {
        console.error('Error updating lead status:', statusError);
      } else {
        console.log('Lead status updated to:', body.nouveau_statut_lead);
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
    console.error('Unexpected error:', error);
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
