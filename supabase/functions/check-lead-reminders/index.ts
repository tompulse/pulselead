import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * FONCTION D'AUTOMATISATION DES RELANCES
 * 
 * UTILITÉ: Cette edge function vérifie automatiquement les leads qui nécessitent une relance
 * 
 * CRITÈRES DE RELANCE:
 * 1. Aucune interaction depuis 7 jours pour les leads "qualifiés"
 * 2. Aucune interaction depuis 3 jours pour les leads en "proposition" ou "négociation"
 * 3. Date de prochaine action dépassée
 * 4. Leads "chauds" (score > 70) sans contact depuis 5 jours
 * 
 * ACTIONS AUTOMATIQUES:
 * - Création d'une interaction de type "relance_auto"
 * - Notification par email (optionnel, nécessite configuration)
 * - Mise à jour du statut si nécessaire
 * 
 * À PLANIFIER EN CRON: Exécuter tous les jours à 9h du matin
 * Voir documentation: supabase-cron-edge-functions
 */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const today = new Date();
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Trouver les leads qui nécessitent une relance
    const { data: allLeads, error: leadsError } = await supabaseClient
      .from('lead_statuts')
      .select(`
        entreprise_id,
        user_id,
        statut_actuel,
        etape_pipeline,
        entreprises:entreprise_id (
          nom,
          score_lead
        )
      `)
      .in('statut_actuel', ['qualifie', 'proposition', 'negociation']);

    if (leadsError) throw leadsError;

    const remindersCreated = [];

    for (const lead of allLeads || []) {
      // Récupérer la dernière interaction
      const { data: lastInteraction } = await supabaseClient
        .from('lead_interactions')
        .select('created_at, date_prochaine_action')
        .eq('entreprise_id', lead.entreprise_id)
        .eq('user_id', lead.user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!lastInteraction) continue;

      const lastContactDate = new Date(lastInteraction.created_at);
      let needsReminder = false;
      let reminderReason = '';

      // Vérifier si date de prochaine action dépassée
      if (lastInteraction.date_prochaine_action) {
        const nextActionDate = new Date(lastInteraction.date_prochaine_action);
        if (nextActionDate < today) {
          needsReminder = true;
          reminderReason = 'Date de prochaine action dépassée';
        }
      }

      // Vérifier selon le statut
      if (!needsReminder) {
        switch (lead.statut_actuel) {
          case 'qualifie':
            if (lastContactDate < sevenDaysAgo) {
              needsReminder = true;
              reminderReason = 'Aucun contact depuis 7 jours (lead qualifié)';
            }
            break;
          case 'proposition':
          case 'negociation':
            if (lastContactDate < threeDaysAgo) {
              needsReminder = true;
              reminderReason = 'Aucun contact depuis 3 jours (lead en cours)';
            }
            break;
        }
      }

      // Vérifier les leads chauds
      const entreprise = Array.isArray(lead.entreprises) ? lead.entreprises[0] : lead.entreprises;
      if (!needsReminder && entreprise?.score_lead && entreprise.score_lead > 70) {
        if (lastContactDate < fiveDaysAgo) {
          needsReminder = true;
          reminderReason = 'Lead chaud sans contact depuis 5 jours';
        }
      }

      // Créer la relance automatique
      if (needsReminder) {
        const { error: insertError } = await supabaseClient
          .from('lead_interactions')
          .insert({
            entreprise_id: lead.entreprise_id,
            user_id: lead.user_id,
            type: 'autre',
            statut: 'a_recontacter',
            notes: `🤖 RELANCE AUTOMATIQUE: ${reminderReason}`,
            date_prochaine_action: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            prochaine_action: 'Contacter le lead',
          });

        if (!insertError) {
          remindersCreated.push({
            entreprise_id: lead.entreprise_id,
            entreprise_nom: entreprise?.nom,
            reason: reminderReason,
          });
        }
      }
    }

    // 2. Vérifier les leads sans score et les calculer
    const { data: leadsWithoutScore } = await supabaseClient
      .from('entreprises')
      .select('id')
      .is('score_lead', null)
      .limit(50);

    const scoresUpdated = [];

    for (const entreprise of leadsWithoutScore || []) {
      // Calculer un score basique (sera affiné par le hook useLeadScoring)
      const { data: interactions } = await supabaseClient
        .from('lead_interactions')
        .select('type')
        .eq('entreprise_id', entreprise.id);

      let score = 30; // Score de base
      if (interactions && interactions.length > 0) {
        score += Math.min(interactions.length * 5, 30);
      }

      await supabaseClient
        .from('entreprises')
        .update({ score_lead: score })
        .eq('id', entreprise.id);

      scoresUpdated.push(entreprise.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        reminders_created: remindersCreated.length,
        scores_updated: scoresUpdated.length,
        details: {
          reminders: remindersCreated,
          scores: scoresUpdated,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in check-lead-reminders:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
