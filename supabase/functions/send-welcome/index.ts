import { Resend } from 'https://esm.sh/resend@4.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const { email, name } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ error: 'Missing email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const subject = '🎉 Bienvenue sur LUMA !'
    const displayName = name || 'Bienvenue !'
    const html = `
      <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#0f172a;">
        <h1 style="margin:24px 0;">${displayName}</h1>
        <p>Votre compte a bien été créé. Nous sommes ravis de vous compter parmi nous ✨</p>
        <p>Vous pouvez dès maintenant accéder à votre tableau de bord.</p>
        <p style="margin-top:24px;">
          <a href="${(Deno.env.get('SUPABASE_URL') || '').replace('/project','')}/" target="_blank" style="background:#7c3aed;color:white;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block;">Ouvrir LUMA</a>
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>
        <p style="font-size:12px;color:#64748b;">Si vous n'êtes pas à l'origine de cette action, ignorez cet email.</p>
      </div>
    `

    const { error } = await resend.emails.send({
      from: 'LUMA <onboarding@resend.dev>',
      to: [email],
      subject,
      html,
    })

    if (error) throw error

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (error) {
    console.error('send-welcome error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})