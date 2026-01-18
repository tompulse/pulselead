import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-PAYMENT-CONFIRMATION] ${step}${detailsStr}`);
};

interface PaymentConfirmationRequest {
  email: string;
  firstName?: string;
  nextPaymentDate?: string;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
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

    const { email, firstName, nextPaymentDate }: PaymentConfirmationRequest = await req.json();
    logStep("Sending payment confirmation email", { email, firstName });

    if (!email) {
      throw new Error("No email provided");
    }

    const resend = new Resend(resendApiKey);
    const displayName = firstName || email.split('@')[0].replace(/[._]/g, ' ');
    const formattedNextPayment = formatDate(nextPaymentDate);

    const { data, error } = await resend.emails.send({
      from: "PULSE <noreply@mail.pulse-lead.com>",
      to: [email],
      subject: "🎉 Bienvenue dans la famille PULSE !",
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
                        Vendez plus. Roulez moins.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Celebration -->
                  <tr>
                    <td style="padding: 30px 40px; text-align: center;">
                      <div style="font-size: 64px; margin-bottom: 20px;">🎉</div>
                      <h2 style="margin: 0 0 16px; font-size: 28px; color: #ffffff;">
                        Bienvenue dans la famille PULSE, ${displayName} !
                      </h2>
                      <p style="margin: 0; font-size: 16px; color: #b0b0b0; line-height: 1.6;">
                        Votre paiement a été confirmé avec succès.<br>
                        Vous faites désormais partie de la communauté des commerciaux qui vendent plus en roulant moins !
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Payment Confirmation Box -->
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 24px; text-align: center;">
                        <p style="margin: 0 0 8px; font-size: 14px; color: #10b981; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                          ✓ Paiement confirmé
                        </p>
                        <p style="margin: 0 0 12px; font-size: 32px; color: #ffffff; font-weight: bold;">
                          79€<span style="font-size: 16px; color: #888888;">/mois</span>
                        </p>
                        ${formattedNextPayment ? `
                        <p style="margin: 0; font-size: 14px; color: #888888;">
                          Prochain prélèvement : ${formattedNextPayment}
                        </p>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Features Included -->
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px;">
                        <p style="margin: 0 0 16px; font-size: 16px; color: #ffffff; font-weight: 600;">
                          🎁 Votre abonnement "Commercial Solo" inclut :
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 8px 0; color: #b0b0b0; font-size: 14px;">
                              <span style="color: #10b981; margin-right: 8px;">✓</span>
                              Liste de prospects filtrée (+1 900 entreprises/semaine)
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #b0b0b0; font-size: 14px;">
                              <span style="color: #10b981; margin-right: 8px;">✓</span>
                              Tournées optimisées IA illimitées
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #b0b0b0; font-size: 14px;">
                              <span style="color: #10b981; margin-right: 8px;">✓</span>
                              CRM mobile terrain complet
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #b0b0b0; font-size: 14px;">
                              <span style="color: #10b981; margin-right: 8px;">✓</span>
                              Filtres par NAF, département, taille
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #b0b0b0; font-size: 14px;">
                              <span style="color: #10b981; margin-right: 8px;">✓</span>
                              Pipeline Kanban visuel
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #b0b0b0; font-size: 14px;">
                              <span style="color: #10b981; margin-right: 8px;">✓</span>
                              Suivi des relances programmées
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- CTA Button -->
                  <tr>
                    <td style="padding: 0 40px 30px; text-align: center;">
                      <a href="https://pulselead.lovable.app/dashboard" style="display: inline-block; padding: 18px 48px; background: linear-gradient(135deg, #00BFFF, #06b6d4); color: #000000; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 191, 255, 0.3);">
                        Accéder à mon espace →
                      </a>
                    </td>
                  </tr>
                  
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; border-top: 1px solid rgba(0, 191, 255, 0.2); text-align: center; background: rgba(0,0,0,0.2);">
                      <p style="margin: 0 0 12px; font-size: 13px; color: #888888;">
                        Vous pouvez gérer votre abonnement à tout moment depuis<br>
                        <a href="https://pulselead.lovable.app/security" style="color: #00BFFF;">votre espace sécurité</a>
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

    logStep("Payment confirmation email sent successfully", { emailId: data?.id });

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

    logStep("ERROR in send-payment-confirmation", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
