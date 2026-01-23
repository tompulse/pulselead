import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-CONFIRMATION] ${step}${detailsStr}`);
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

    const { email, confirmationUrl } = await req.json();
    logStep("Sending confirmation email", { email });

    if (!email || !confirmationUrl) {
      throw new Error("Email and confirmationUrl are required");
    }

    const resend = new Resend(resendApiKey);

    const { data, error } = await resend.emails.send({
      from: "PULSE <noreply@mail.pulse-lead.com>",
      to: [email],
      subject: "📧 Confirmez votre email pour accéder à PULSE",
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
                        📧 Confirmez votre email
                      </h2>
                      
                      <p style="margin: 0 0 20px; font-size: 16px; color: #b0b0b0; line-height: 1.6;">
                        Bonjour,
                      </p>
                      
                      <p style="margin: 0 0 20px; font-size: 16px; color: #b0b0b0; line-height: 1.6;">
                        Merci de vous être inscrit sur <strong style="color: #00BFFF;">PULSE</strong> ! Pour activer votre compte 
                        et commencer à optimiser votre prospection terrain, il vous suffit de confirmer 
                        votre adresse email.
                      </p>
                      
                      <div style="background: rgba(0, 191, 255, 0.1); border-left: 4px solid #00BFFF; border-radius: 8px; padding: 20px; margin: 24px 0;">
                        <p style="margin: 0; font-size: 15px; color: #ffffff; line-height: 1.6;">
                          Cliquez sur le bouton ci-dessous pour confirmer votre email et accéder 
                          immédiatement à votre tableau de bord.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- CTA Button -->
                  <tr>
                    <td style="padding: 10px 40px 30px; text-align: center;">
                      <a href="${confirmationUrl}" style="display: inline-block; padding: 18px 48px; background: linear-gradient(135deg, #00BFFF, #06b6d4); color: #000000; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 191, 255, 0.3);">
                        Confirmer mon email →
                      </a>
                    </td>
                  </tr>
                  
                  <!-- Alternative Link -->
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <p style="margin: 0 0 12px; font-size: 14px; color: #888888; text-align: center;">
                        Ou copiez-collez ce lien dans votre navigateur :
                      </p>
                      <p style="margin: 0; font-size: 13px; color: #00BFFF; word-break: break-all; text-align: center;">
                        ${confirmationUrl}
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Warning -->
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <div style="background: rgba(255, 171, 0, 0.1); border: 1px solid rgba(255, 171, 0, 0.3); border-radius: 8px; padding: 16px;">
                        <p style="margin: 0; font-size: 14px; color: #ffab00; line-height: 1.6; text-align: center;">
                          ⚠️ Ce lien expire dans <strong>24 heures</strong>. Si vous n'avez pas créé de compte PULSE, 
                          vous pouvez ignorer cet email en toute sécurité.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; border-top: 1px solid rgba(0, 191, 255, 0.2); text-align: center; background: rgba(0,0,0,0.2);">
                      <p style="margin: 0 0 12px; font-size: 14px; color: #888888;">
                        À très bientôt,<br>
                        L'équipe PULSE
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #555555;">
                        Cet email a été envoyé à ${email}
                      </p>
                      <p style="margin: 16px 0 0; font-size: 12px; color: #555555;">
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
      logStep("Error sending confirmation email", { error });
      throw error;
    }

    logStep("Confirmation email sent successfully", { emailId: data?.id });

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

    logStep("ERROR in send-confirmation-email", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
