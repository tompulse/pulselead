import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-ENTERPRISE-INQUIRY] ${step}${detailsStr}`);
};

interface EnterpriseInquiryRequest {
  name: string;
  email: string;
  phone: string;
  teamSize: string;
  message: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const { name, email, phone, teamSize, message }: EnterpriseInquiryRequest = await req.json();
    logStep("Request data received", { name, email, phone, teamSize });

    if (!name || !email) {
      throw new Error("Nom et email sont requis");
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #0a0a0f; color: #ffffff; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 32px; font-weight: bold; color: #06b6d4; }
          .card { background: linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 16px; padding: 30px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #06b6d4; }
          .field { margin-bottom: 16px; }
          .label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255, 255, 255, 0.6); margin-bottom: 4px; }
          .value { font-size: 16px; color: #ffffff; padding: 10px; background: rgba(0, 0, 0, 0.3); border-radius: 8px; }
          .message-box { background: rgba(0, 0, 0, 0.4); border-left: 3px solid #06b6d4; padding: 15px; border-radius: 0 8px 8px 0; white-space: pre-wrap; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: rgba(255, 255, 255, 0.5); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">PULSE</div>
            <p style="color: rgba(255, 255, 255, 0.7);">Nouvelle demande entreprise</p>
          </div>
          
          <div class="card">
            <div class="title">📋 Informations du contact</div>
            
            <div class="field">
              <div class="label">Nom complet</div>
              <div class="value">${name}</div>
            </div>
            
            <div class="field">
              <div class="label">Email professionnel</div>
              <div class="value"><a href="mailto:${email}" style="color: #06b6d4; text-decoration: none;">${email}</a></div>
            </div>
            
            <div class="field">
              <div class="label">Téléphone</div>
              <div class="value">${phone || 'Non renseigné'}</div>
            </div>
            
            <div class="field">
              <div class="label">Taille de l'équipe commerciale</div>
              <div class="value">${teamSize || 'Non renseignée'}</div>
            </div>
          </div>
          
          <div class="card">
            <div class="title">💬 Message</div>
            <div class="message-box">${message || 'Aucun message spécifique'}</div>
          </div>
          
          <div class="footer">
            <p>Email envoyé automatiquement depuis PULSE</p>
            <p>Ce contact souhaite une offre Sur Mesure</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PULSE <noreply@pulse-lead.com>",
        to: ["tomiolovpro@gmail.com"],
        subject: `🏢 Nouvelle demande entreprise - ${name}`,
        html: htmlContent,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(emailData.message || "Failed to send email");
    }

    logStep("Email sent successfully", { emailId: emailData.id });

    return new Response(JSON.stringify({ success: true, emailId: emailData.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    logStep("ERROR in send-enterprise-inquiry", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
