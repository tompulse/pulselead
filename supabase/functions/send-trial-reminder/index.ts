import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrialReminderRequest {
  email: string;
  firstName?: string;
  trialEndDate: string;
  portalUrl?: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, trialEndDate, portalUrl }: TrialReminderRequest = await req.json();

    if (!email || !trialEndDate) {
      throw new Error("Email and trialEndDate are required");
    }

    const formattedDate = formatDate(trialEndDate);
    const displayName = firstName || "cher utilisateur";
    const manageUrl = portalUrl || "https://pulse.lovable.app/security";

    const emailResponse = await resend.emails.send({
      from: "PULSE <onboarding@resend.dev>",
      to: [email],
      subject: "⏰ Votre essai PULSE se termine dans 3 jours",
      html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0D1422;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #00BFFF;">PULSE</h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background: linear-gradient(135deg, rgba(13, 20, 34, 0.95), rgba(20, 30, 50, 0.95)); border-radius: 16px; padding: 40px; border: 1px solid rgba(0, 191, 255, 0.2);">
              
              <!-- Icon -->
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 48px;">⏰</span>
              </div>
              
              <!-- Title -->
              <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #ffffff; text-align: center;">
                Votre essai se termine bientôt
              </h2>
              
              <!-- Message -->
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #b0b0b0;">
                Bonjour ${displayName},
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #b0b0b0;">
                Votre période d'essai gratuit PULSE se termine dans <strong style="color: #ffffff;">3 jours</strong>, le <strong style="color: #00BFFF;">${formattedDate}</strong>.
              </p>
              
              <!-- Alert Box -->
              <div style="background: rgba(255, 171, 0, 0.1); border: 1px solid rgba(255, 171, 0, 0.3); border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0; font-size: 15px; color: #ffab00; font-weight: 600;">
                  💳 Ce qui va se passer
                </p>
                <p style="margin: 12px 0 0 0; font-size: 14px; line-height: 1.6; color: #b0b0b0;">
                  À partir du <strong style="color: #ffffff;">${formattedDate}</strong>, votre carte bancaire sera automatiquement débitée de <strong style="color: #ffffff;">49€/mois</strong> pour continuer à profiter de PULSE.
                </p>
              </div>
              
              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #b0b0b0;">
                Si vous ne souhaitez pas être prélevé, vous pouvez annuler votre abonnement avant la fin de l'essai. Aucun frais ne vous sera facturé.
              </p>
              
              <!-- CTA Buttons -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${manageUrl}" style="display: inline-block; background: linear-gradient(135deg, #00BFFF, #0099CC); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; margin-bottom: 12px;">
                  ✨ Continuer avec PULSE
                </a>
              </div>
              
              <div style="text-align: center;">
                <a href="${manageUrl}" style="display: inline-block; color: #888888; text-decoration: underline; font-size: 14px;">
                  Gérer ou annuler mon abonnement
                </a>
              </div>
              
              <!-- What you'll lose -->
              <div style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 20px; margin-top: 32px;">
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #888888; font-weight: 600;">
                  En restant avec PULSE, vous gardez accès à :
                </p>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #b0b0b0; line-height: 1.8;">
                  <li>+850 nouvelles entreprises détectées chaque semaine</li>
                  <li>Création de tournées optimisées illimitées</li>
                  <li>CRM mobile avec suivi des interactions</li>
                  <li>Liste de prospects filtrée selon vos critères</li>
                </ul>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 20px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #666666;">
                Vous recevez cet email car vous vous êtes inscrit à PULSE.
              </p>
              <p style="margin: 0; font-size: 13px; color: #666666;">
                Des questions ? Contactez-nous à <a href="mailto:tomiolovpro@gmail.com" style="color: #00BFFF;">tomiolovpro@gmail.com</a>
              </p>
              <p style="margin: 16px 0 0 0; font-size: 12px; color: #444444;">
                PULSE — Vendez plus. Roulez moins.<br>
                Tom Iolov — 108 rue de Crimée, 75019 Paris, France
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

    console.log("Trial reminder email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending trial reminder email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
