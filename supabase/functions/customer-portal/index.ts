import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripeSecretTest = Deno.env.get("STRIPE_SECRET_TEST");

    const stripeCandidates: Array<{ label: string; key: string }> = [];
    if (stripeSecretKey) stripeCandidates.push({ label: "STRIPE_SECRET_KEY", key: stripeSecretKey });
    if (stripeSecretTest && stripeSecretTest !== stripeSecretKey) {
      stripeCandidates.push({ label: "STRIPE_SECRET_TEST", key: stripeSecretTest });
    }

    if (stripeCandidates.length === 0) throw new Error("STRIPE secret key is not set");
    logStep("Stripe key(s) verified", { candidates: stripeCandidates.map((c) => c.label) });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const origin = req.headers.get("origin") || "https://pulse.lovable.app";

    const isMissingCustomerOrResource = (err: any) => {
      const msg = String(err?.message ?? err?.raw?.message ?? "");
      const code = String(err?.code ?? err?.raw?.code ?? "");
      return code === "resource_missing" || msg.includes("No such customer") || msg.includes("No such subscription");
    };

    // Get what we have in DB (may be stale or from another Stripe environment)
    const { data: subscriptionRow } = await supabaseClient
      .from("user_subscriptions")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const dbCustomerId = subscriptionRow?.stripe_customer_id ?? null;
    const dbSubscriptionId = subscriptionRow?.stripe_subscription_id ?? null;

    logStep("Database Stripe IDs check", {
      hasCustomerId: !!dbCustomerId,
      hasSubscriptionId: !!dbSubscriptionId,
    });

    const createPortalSession = async (stripe: Stripe, customerId: string) => {
      return await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${origin}/security`,
      });
    };

    const repairCustomerId = async (customerId: string) => {
      // Best effort: keep DB in sync for next time
      const { error: updateError } = await supabaseClient
        .from("user_subscriptions")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id);

      if (updateError) {
        logStep("Warning: could not repair customer ID in database", { error: updateError.message });
      } else {
        logStep("Repaired customer ID in database");
      }
    };

    // Try both Stripe environments (if both keys are present) until we find a matching customer.
    for (const candidate of stripeCandidates) {
      const stripe = new Stripe(candidate.key, { apiVersion: "2025-08-27.basil" });
      logStep("Trying Stripe candidate", { candidate: candidate.label });

      // 1) Try DB customer id
      if (dbCustomerId) {
        try {
          const portalSession = await createPortalSession(stripe, dbCustomerId);
          await repairCustomerId(dbCustomerId);
          logStep("Customer portal session created", {
            candidate: candidate.label,
            source: "db_customer_id",
            sessionId: portalSession.id,
          });
          return new Response(JSON.stringify({ url: portalSession.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } catch (err: any) {
          if (isMissingCustomerOrResource(err)) {
            logStep("DB customer id not found in this Stripe candidate", {
              candidate: candidate.label,
              customerId: dbCustomerId,
            });
          } else {
            throw err;
          }
        }
      }

      // 2) Try DB subscription id -> derive customer
      if (dbSubscriptionId) {
        try {
          const sub = await stripe.subscriptions.retrieve(dbSubscriptionId);
          const customerFromSub = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
          if (customerFromSub) {
            const portalSession = await createPortalSession(stripe, customerFromSub);
            await repairCustomerId(customerFromSub);
            logStep("Customer portal session created", {
              candidate: candidate.label,
              source: "db_subscription_id",
              sessionId: portalSession.id,
            });
            return new Response(JSON.stringify({ url: portalSession.url }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            });
          }
        } catch (err: any) {
          if (isMissingCustomerOrResource(err)) {
            logStep("DB subscription id not found in this Stripe candidate", {
              candidate: candidate.label,
              subscriptionId: dbSubscriptionId,
            });
          } else {
            throw err;
          }
        }
      }

      // 3) Fallback: search by email
      try {
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });
        const customerFromEmail = customers.data?.[0]?.id;
        if (customerFromEmail) {
          const portalSession = await createPortalSession(stripe, customerFromEmail);
          await repairCustomerId(customerFromEmail);
          logStep("Customer portal session created", {
            candidate: candidate.label,
            source: "email_search",
            sessionId: portalSession.id,
          });
          return new Response(JSON.stringify({ url: portalSession.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      } catch (err: any) {
        if (isMissingCustomerOrResource(err)) {
          logStep("Email search customer not valid in this Stripe candidate", { candidate: candidate.label });
        } else {
          throw err;
        }
      }
    }

    throw new Error(
      "Aucun client Stripe associé à votre compte n'a été trouvé (test/live). Si vous venez de souscrire, réessayez dans 30 secondes, sinon contactez le support."
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
