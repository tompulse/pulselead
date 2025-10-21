import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * FONCTION DE LOGS D'AUDIT
 * 
 * UTILITÉ: Enregistre toutes les actions importantes des utilisateurs pour:
 * - Traçabilité des modifications (qui a fait quoi et quand)
 * - Détection d'anomalies et comportements suspects
 * - Conformité réglementaire (RGPD, audit trails)
 * - Debug et support client
 * 
 * ACTIONS TRACÉES:
 * - login/logout
 * - create/update/delete (entreprises, interactions, tournées)
 * - view (consultation de données sensibles)
 * - sync (synchronisation de données)
 * 
 * INFORMATIONS ENREGISTRÉES:
 * - user_id: Qui a fait l'action
 * - action: Type d'action
 * - resource_type + resource_id: Sur quelle ressource
 * - old_values + new_values: Avant/après (pour updates)
 * - ip_address + user_agent: Contexte de la requête
 * - timestamp: Quand
 */

interface AuditLogRequest {
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Authentifier l'utilisateur
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const body: AuditLogRequest = await req.json();

    // Valider les données
    if (!body.action || !body.resource_type) {
      throw new Error("Missing required fields: action, resource_type");
    }

    // Extraire IP et User-Agent
    const ipAddress = req.headers.get("x-forwarded-for") || 
                      req.headers.get("x-real-ip") || 
                      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Insérer le log
    const { error: insertError } = await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: body.action,
        resource_type: body.resource_type,
        resource_id: body.resource_id,
        old_values: body.old_values,
        new_values: body.new_values,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in audit-logger:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
