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

    const { userId, email, trialEnd, firstName, lastName, amountAfterTrial } = await req.json();
    logStep("Sending welcome email", { userId, email, firstName, amountAfterTrial });

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
    
    // Montant après la période d'essai (par défaut 49€, mais peut être réduit avec un code promo)
    const displayAmount = amountAfterTrial ?? 49;

    const { data, error } = await resend.emails.send({
      from: "PULSE <noreply@mail.pulse-lead.com>",
      to: [email],
      subject: "🚀 Bienvenue sur PULSE - Ton essai gratuit a commencé !",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0D1422; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0D1422; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(0, 191, 255, 0.1), rgba(6, 182, 212, 0.05)); border: 1px solid rgba(0, 191, 255, 0.3); border-radius: 16px; overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 10px; text-align: center;">
                      <h1 style="margin: 0; font-size: 36px; font-weight: bold; color: #00BFFF;">
                        PULSE
                      </h1>
                      <p style="margin: 8px 0 0; font-size: 14px; color: #06b6d4; font-style: italic;">
                        Vends plus. Roule moins.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 30px 40px;">
                      <h2 style="margin: 0 0 20px; font-size: 26px; color: #ffffff; text-align: center;">
                        🎉 Bienvenue ${displayName} !
                      </h2>
                      
                      <p style="margin: 0 0 20px; font-size: 16px; color: #b0b0b0; line-height: 1.6;">
                        Ton essai gratuit de <strong style="color: #00BFFF;">7 jours</strong> a commencé ! Tu as maintenant accès à toutes les fonctionnalités pour transformer ta prospection terrain.
                      </p>
                      
                      ${trialEndDate ? `
                      <div style="background: rgba(0, 191, 255, 0.1); border: 1px solid rgba(0, 191, 255, 0.3); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
                        <p style="margin: 0; font-size: 15px; color: #00BFFF; font-weight: 600;">
                          📅 Ton essai se termine le : ${trialEndDate}
                        </p>
                      </div>
                      ` : ''}
                      
                      <h3 style="margin: 30px 0 20px; font-size: 18px; color: #ffffff;">
                        🚀 Commence dès maintenant :
                      </h3>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px;">
                        <tr>
                          <td style="padding: 12px 20px; border-bottom: 1px solid rgba(0, 191, 255, 0.1);">
                            <span style="color: #00BFFF; font-size: 20px; vertical-align: middle;">1️⃣</span>
                            <span style="color: #ffffff; font-size: 15px; margin-left: 12px; vertical-align: middle;">Explore la liste de prospects selon tes filtres</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 20px; border-bottom: 1px solid rgba(0, 191, 255, 0.1);">
                            <span style="color: #00BFFF; font-size: 20px; vertical-align: middle;">2️⃣</span>
                            <span style="color: #ffffff; font-size: 15px; margin-left: 12px; vertical-align: middle;">Crée ta première tournée optimisée</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 20px;">
                            <span style="color: #00BFFF; font-size: 20px; vertical-align: middle;">3️⃣</span>
                            <span style="color: #ffffff; font-size: 15px; margin-left: 12px; vertical-align: middle;">Enregistre tes visites et programme tes relances</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- CTA Button -->
                  <tr>
                    <td style="padding: 10px 40px 30px; text-align: center;">
                      <a href="https://pulse-lead.com/dashboard" style="display: inline-block; padding: 18px 48px; background: linear-gradient(135deg, #00BFFF, #06b6d4); color: #000000; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 191, 255, 0.3);">
                        Accéder à mon tableau de bord →
                      </a>
                    </td>
                  </tr>
                  
                  <!-- Help Section -->
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; text-align: center;">
                        <p style="margin: 0 0 16px; font-size: 16px; color: #ffffff; font-weight: 600;">
                          💬 Une question ? Je suis là pour toi !
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 8px;">
                              <a href="https://calendly.com/tomiolovpro/pulse" style="display: inline-block; padding: 12px 24px; background: rgba(0, 191, 255, 0.15); border: 1px solid rgba(0, 191, 255, 0.4); color: #00BFFF; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; margin-right: 10px;">
                                📅 Réserver une démo
                              </a>
                              <a href="https://wa.me/33760227532" style="display: inline-block; padding: 12px 24px; background: rgba(37, 211, 102, 0.15); border: 1px solid rgba(37, 211, 102, 0.4); color: #25D366; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                                💬 WhatsApp
                              </a>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; border-top: 1px solid rgba(0, 191, 255, 0.2); text-align: center; background: rgba(0,0,0,0.2);">
                      <p style="margin: 0 0 12px; font-size: 13px; color: #888888;">
                        ⚠️ <strong style="color: #ffab00;">Important :</strong> Ton essai se termine le ${trialEndDate || '[date]'}.<br>
                        À cette date, ta carte sera débitée de <strong style="color: #ffffff;">${displayAmount}€/mois</strong>.
                      </p>
                      <p style="margin: 0 0 16px; font-size: 13px; color: #888888;">
                        Annule à tout moment depuis <a href="https://pulse-lead.com/security" style="color: #00BFFF;">ton espace sécurité</a> — sans frais.
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #555555;">
                        © 2026 PULSE — Tom Iolov — 108 rue de Crimée, 75019 Paris<br>
                        SIRET 948 550 561 00039 — <a href="mailto:tomiolovpro@gmail.com" style="color: #06b6d4;">tomiolovpro@gmail.com</a>
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
