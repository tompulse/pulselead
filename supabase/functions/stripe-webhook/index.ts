import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

const unixToISOString = (unixSeconds?: number | null): string | null => {
  if (typeof unixSeconds !== "number") return null;
  const ms = unixSeconds * 1000;
  if (!Number.isFinite(ms)) return null;
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKeyLive = Deno.env.get("STRIPE_SECRET_KEY");
    const stripeKeyTest = Deno.env.get("STRIPE_SECRET_TEST") ?? stripeKeyLive;

    const webhookSecretTest = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const webhookSecretLive = Deno.env.get("STRIPE_WEBHOOK_SECRET_LIVE"); // optionnel (prod)

    if (!stripeKeyTest && !stripeKeyLive) throw new Error("No Stripe secret key is set");
    if (!webhookSecretTest && !webhookSecretLive) throw new Error("No Stripe webhook secret is set");

    // Utilisé uniquement pour vérifier la signature (la clé n'est pas utilisée pour ce calcul)
    const stripeForWebhook = new Stripe(stripeKeyTest ?? stripeKeyLive!, { apiVersion: "2025-08-27.basil" });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No Stripe signature found");

    const body = await req.text();
    let event: Stripe.Event;

    try {
      if (webhookSecretTest) {
        event = await stripeForWebhook.webhooks.constructEventAsync(body, signature, webhookSecretTest);
        logStep("Webhook signature verified", { mode: "test" });
      } else {
        throw new Error("No STRIPE_WEBHOOK_SECRET (test) configured");
      }
    } catch (err: any) {
      // Fallback: si on a un secret live, on tente aussi
      if (webhookSecretLive) {
        try {
          event = await stripeForWebhook.webhooks.constructEventAsync(body, signature, webhookSecretLive);
          logStep("Webhook signature verified", { mode: "live" });
        } catch (err2: any) {
          logStep("Webhook signature verification failed", { error: err2?.message ?? String(err2) });
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }
      } else {
        logStep("Webhook signature verification failed", { error: err?.message ?? String(err) });
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    }

    // Important: utiliser la clé Stripe qui correspond au mode de l'événement
    const stripeApiKey = event.livemode ? stripeKeyLive : stripeKeyTest;
    if (!stripeApiKey) {
      throw new Error(event.livemode ? "STRIPE_SECRET_KEY (live) is not set" : "STRIPE_SECRET_TEST is not set");
    }

    const stripe = new Stripe(stripeApiKey, { apiVersion: "2025-08-27.basil" });

    logStep("Webhook received", { type: event.type });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", { sessionId: session.id, customerId: session.customer });

        const userId = session.metadata?.user_id;
        if (!userId) {
          logStep("No user_id in metadata, skipping");
          break;
        }

        // Get subscription details
        const subscriptionId = session.subscription as string;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;
          
          // Plan unique mensuel
          const plan = 'monthly';

          // En mode trial, utiliser trial_start/trial_end au lieu de current_period_start/end
          const startDate = subscription.status === 'trialing' && subscription.trial_start
            ? unixToISOString(subscription.trial_start)
            : unixToISOString(subscription.current_period_start);
          
          const endDate = subscription.status === 'trialing' && subscription.trial_end
            ? unixToISOString(subscription.trial_end)
            : unixToISOString(subscription.current_period_end);

          const subscriptionData = {
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscriptionId,
            subscription_status: subscription.status, // 'trialing' for 7-day trial
            subscription_plan: plan,
            subscription_start_date: startDate,
            subscription_end_date: endDate,
            updated_at: new Date().toISOString(),
          };

          const { error: upsertError } = await supabaseAdmin
            .from('user_subscriptions')
            .upsert(subscriptionData, { onConflict: 'user_id' });

          if (upsertError) {
            logStep("Error upserting subscription", { error: upsertError.message });
          } else {
            logStep("Subscription saved", subscriptionData);
          }

          // Send welcome email for trial start
          if (subscription.status === 'trialing') {
            const trialEndIso = unixToISOString(subscription.trial_end ?? null);

            try {
              await supabaseAdmin.functions.invoke('send-welcome', {
                body: {
                  userId,
                  email: session.customer_email || session.customer_details?.email,
                  trialEnd: trialEndIso,
                },
              });
              logStep("Welcome email triggered", { trialEnd: trialEndIso });
            } catch (emailError: any) {
              logStep("Error sending welcome email", { error: emailError?.message ?? String(emailError) });
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription updated", { subscriptionId: subscription.id, status: subscription.status });

        const { data: existingSub } = await supabaseAdmin
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (existingSub) {
          const { error } = await supabaseAdmin
            .from('user_subscriptions')
            .update({
              subscription_status: subscription.status,
              subscription_end_date: unixToISOString(subscription.current_period_end),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);

          if (error) {
            logStep("Error updating subscription", { error: error.message });
          } else {
            logStep("Subscription status updated", { status: subscription.status });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription cancelled", { subscriptionId: subscription.id });

        const { error } = await supabaseAdmin
          .from('user_subscriptions')
          .update({
            subscription_status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          logStep("Error marking subscription cancelled", { error: error.message });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Payment failed", { invoiceId: invoice.id, customerId: invoice.customer });

        const { error } = await supabaseAdmin
          .from('user_subscriptions')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', invoice.customer as string);

        if (error) {
          logStep("Error updating subscription to past_due", { error: error.message });
        }
        break;
      }

      // Gestion du paiement réussi après trial (conversion trialing -> active)
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        logStep("Invoice paid", { invoiceId: invoice.id, subscriptionId });

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          // Mettre à jour le statut vers 'active' après paiement réussi
          const { error } = await supabaseAdmin
            .from('user_subscriptions')
            .update({
              subscription_status: subscription.status, // 'active'
              subscription_end_date: unixToISOString(subscription.current_period_end),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);

          if (error) {
            logStep("Error updating subscription after payment", { error: error.message });
          } else {
            logStep("Subscription activated after payment", { status: subscription.status });
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
