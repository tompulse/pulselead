import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-WELCOME] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      logStep("RESEND_API_KEY not configured, skipping email");
      return new Response(JSON.stringify({ success: false, reason: "No API key" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const { userId, email, trialEnd, firstName, lastName } = await req.json();
    logStep("Sending welcome email", { userId, email, firstName });

    if (!email) {
      throw new Error("No email provided");
    }

    const resend = new Resend(resendApiKey);
    
    // Format trial end date if provided
    let trialEndDate = '';
    if (trialEnd) {
      trialEndDate = new Date(trialEnd).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    // Utiliser le prénom si disponible, sinon fallback sur l'email
    const displayName = firstName || email.split('@')[0].replace(/[._]/g, ' ');

    const { data, error } = await resend.emails.send({
      // Important: en mode dev/test, utiliser un expéditeur Resend vérifié.
      // Pour envoyer depuis @pulse.lovable.app, il faut d'abord vérifier le domaine chez Resend.
      from: "PULSE <onboarding@resend.dev>",
      to: [email],
      subject: "🚀 Bienvenue sur PULSE - Votre essai gratuit a commencé !",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(6, 182, 212, 0.05)); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 16px; overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #0ea5e9;">
                        PULSE
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 20px 40px;">
                      <h2 style="margin: 0 0 20px; font-size: 24px; color: #ffffff; text-align: center;">
                        🎉 Bienvenue ${displayName} !
                      </h2>
                      
                      <p style="margin: 0 0 20px; font-size: 16px; color: #a1a1aa; line-height: 1.6;">
                        Votre essai gratuit de 7 jours a commencé ! Vous avez maintenant accès à toutes les fonctionnalités pour transformer votre prospection terrain.
                      </p>
                      
                      ${trialEndDate ? `
                      <div style="background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #06b6d4; font-weight: 600;">
                          📅 Votre essai se termine le : ${trialEndDate}
                        </p>
                      </div>
                      ` : ''}
                      
                      <h3 style="margin: 30px 0 15px; font-size: 18px; color: #ffffff;">
                        Commencez dès maintenant :
                      </h3>
                      
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 10px 0;">
                            <span style="color: #06b6d4; font-size: 20px;">🗺️</span>
                            <span style="color: #ffffff; font-size: 14px; margin-left: 10px;">Visualisez vos prospects sur la carte interactive</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0;">
                            <span style="color: #06b6d4; font-size: 20px;">🚀</span>
                            <span style="color: #ffffff; font-size: 14px; margin-left: 10px;">Créez votre première tournée optimisée</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0;">
                            <span style="color: #06b6d4; font-size: 20px;">📱</span>
                            <span style="color: #ffffff; font-size: 14px; margin-left: 10px;">Enregistrez vos visites et programmez vos relances</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- CTA Button -->
                  <tr>
                    <td style="padding: 20px 40px 40px; text-align: center;">
                      <a href="https://pulse.lovable.app/dashboard" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: #000000; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 8px;">
                        Accéder à mon tableau de bord
                      </a>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 40px; border-top: 1px solid rgba(6, 182, 212, 0.2); text-align: center;">
                      <p style="margin: 0; font-size: 12px; color: #71717a;">
                        Vous ne serez débité qu'à la fin de votre période d'essai.<br>
                        Annulez à tout moment depuis votre espace client.
                      </p>
                      <p style="margin: 15px 0 0; font-size: 12px; color: #52525b;">
                        © 2026 PULSE - Prospection Territoriale Intelligente
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      logStep("Error sending email", { error });
      throw error;
    }

    logStep("Email sent successfully", { emailId: data?.id });

    return new Response(JSON.stringify({ success: true, emailId: data?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : JSON.stringify(error);

    logStep("ERROR in send-welcome", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
