import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[CHECK-TRIAL-REMINDERS] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting trial reminder check");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate the date 3 days from now
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    // Format dates for comparison (start and end of the target day)
    const targetDayStart = new Date(threeDaysFromNow);
    targetDayStart.setHours(0, 0, 0, 0);
    
    const targetDayEnd = new Date(threeDaysFromNow);
    targetDayEnd.setHours(23, 59, 59, 999);

    logStep("Looking for trials ending between", { 
      start: targetDayStart.toISOString(), 
      end: targetDayEnd.toISOString() 
    });

    // Find all users in trial status whose trial ends in 3 days
    const { data: trialsEndingSoon, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('user_id, subscription_end_date, stripe_customer_id')
      .eq('subscription_status', 'trialing')
      .gte('subscription_end_date', targetDayStart.toISOString())
      .lte('subscription_end_date', targetDayEnd.toISOString());

    if (fetchError) {
      throw new Error(`Failed to fetch trials: ${fetchError.message}`);
    }

    logStep("Found trials ending soon", { count: trialsEndingSoon?.length || 0 });

    if (!trialsEndingSoon || trialsEndingSoon.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No trials to remind", count: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const results: { userId: string; success: boolean; error?: string }[] = [];

    for (const trial of trialsEndingSoon) {
      try {
        // Get user email from auth.users
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(trial.user_id);

        if (userError || !userData?.user?.email) {
          logStep("Failed to get user email", { userId: trial.user_id, error: userError?.message });
          results.push({ userId: trial.user_id, success: false, error: "User not found" });
          continue;
        }

        const userEmail = userData.user.email;
        const userName = userData.user.user_metadata?.full_name || userData.user.user_metadata?.name;

        logStep("Sending reminder to", { email: userEmail, trialEnd: trial.subscription_end_date });

        // Call send-trial-reminder function
        const reminderResponse = await fetch(`${supabaseUrl}/functions/v1/send-trial-reminder`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            email: userEmail,
            userName: userName,
            trialEndDate: trial.subscription_end_date,
            portalUrl: 'https://pulse.lovable.app/parametres'
          }),
        });

        if (!reminderResponse.ok) {
          const errorData = await reminderResponse.json();
          throw new Error(errorData.error || 'Failed to send reminder');
        }

        // Log the reminder in audit_logs
        await supabase.from('audit_logs').insert({
          user_id: trial.user_id,
          action: 'trial_reminder_sent',
          resource_type: 'subscription',
          resource_id: trial.user_id,
          new_values: {
            email: userEmail,
            trial_end_date: trial.subscription_end_date,
            sent_at: new Date().toISOString()
          }
        });

        results.push({ userId: trial.user_id, success: true });
        logStep("Reminder sent successfully", { userId: trial.user_id });

      } catch (error: any) {
        logStep("Error sending reminder", { userId: trial.user_id, error: error.message });
        results.push({ userId: trial.user_id, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    logStep("Reminder check complete", { successCount, failCount });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${successCount} reminders, ${failCount} failed`,
        results 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("[CHECK-TRIAL-REMINDERS] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
