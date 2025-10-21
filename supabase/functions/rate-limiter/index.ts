import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * FONCTION DE RATE LIMITING
 * 
 * UTILITÉ: Protège l'application contre les abus en limitant le nombre de requêtes par utilisateur
 * 
 * LIMITES PAR DÉFAUT:
 * - sync-entreprises: 5 requêtes par heure (synchronisation coûteuse)
 * - format-lead-details: 100 requêtes par heure (utilise IA)
 * - check-lead-reminders: 10 requêtes par heure (automatisation)
 * - Autres: 1000 requêtes par heure
 * 
 * FENÊTRE GLISSANTE: 1 heure
 * 
 * RÉPONSE SI LIMITE DÉPASSÉE:
 * - HTTP 429 (Too Many Requests)
 * - Header Retry-After avec le temps d'attente
 * 
 * UTILISATION:
 * Appeler cette fonction au début de chaque edge function sensible
 */

interface RateLimitRequest {
  endpoint: string;
  max_requests?: number;
  window_minutes?: number;
}

const DEFAULT_LIMITS: Record<string, number> = {
  "sync-entreprises": 5,
  "format-lead-details": 100,
  "check-lead-reminders": 10,
  "optimize-tournee": 50,
  "default": 1000,
};

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

    const body: RateLimitRequest = await req.json();
    const endpoint = body.endpoint;
    const maxRequests = body.max_requests || DEFAULT_LIMITS[endpoint] || DEFAULT_LIMITS.default;
    const windowMinutes = body.window_minutes || 60;

    // Vérifier le rate limit actuel
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

    const { data: existing, error: selectError } = await supabaseClient
      .from('rate_limits')
      .select('*')
      .eq('user_id', user.id)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart.toISOString())
      .maybeSingle();

    if (selectError) throw selectError;

    if (existing) {
      // Vérifier si la limite est dépassée
      if (existing.request_count >= maxRequests) {
        const retryAfter = Math.ceil(
          (new Date(existing.window_start).getTime() + windowMinutes * 60 * 1000 - Date.now()) / 1000
        );

        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded",
            retry_after_seconds: retryAfter,
            limit: maxRequests,
            window_minutes: windowMinutes,
          }),
          {
            headers: { 
              ...corsHeaders, 
              "Content-Type": "application/json",
              "Retry-After": retryAfter.toString(),
            },
            status: 429,
          }
        );
      }

      // Incrémenter le compteur
      const { error: updateError } = await supabaseClient
        .from('rate_limits')
        .update({ 
          request_count: existing.request_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ 
          success: true,
          remaining: maxRequests - existing.request_count - 1,
          limit: maxRequests,
          reset_at: new Date(new Date(existing.window_start).getTime() + windowMinutes * 60 * 1000).toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      // Créer une nouvelle entrée
      const { error: insertError } = await supabaseClient
        .from('rate_limits')
        .insert({
          user_id: user.id,
          endpoint: endpoint,
          request_count: 1,
          window_start: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({ 
          success: true,
          remaining: maxRequests - 1,
          limit: maxRequests,
          reset_at: new Date(Date.now() + windowMinutes * 60 * 1000).toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Error in rate-limiter:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
