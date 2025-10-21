import React from 'https://esm.sh/react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'https://esm.sh/resend@4.0.0'
import { renderAsync } from 'https://esm.sh/@react-email/components@0.0.22?deps=react@18.3.1'
import { WelcomeEmail } from './_templates/welcome.tsx'
import { MagicLinkEmail } from './_templates/magic-link.tsx'
import { ResetPasswordEmail } from './_templates/reset-password.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEN_EMAIL_HOOK_SECRET') as string

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
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    const wh = new Webhook(hookSecret)
    
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: {
        email: string
      }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
      }
    }

    console.log('Email event:', { email_action_type, email: user.email })

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    let html = ''
    let subject = ''

    // Déterminer le type d'email à envoyer
    switch (email_action_type) {
      case 'signup':
        html = await renderAsync(
          React.createElement(WelcomeEmail, {
            email: user.email,
          })
        )
        subject = '🎉 Bienvenue sur LUMA !'
        break

      case 'magiclink':
        html = await renderAsync(
          React.createElement(MagicLinkEmail, {
            supabase_url: supabaseUrl,
            email_action_type,
            redirect_to,
            token_hash,
            token,
          })
        )
        subject = '🔐 Votre lien de connexion LUMA'
        break

      case 'recovery':
        html = await renderAsync(
          React.createElement(ResetPasswordEmail, {
            supabase_url: supabaseUrl,
            token_hash,
            token,
            redirect_to,
          })
        )
        subject = '🔑 Réinitialisation de votre mot de passe'
        break

      default:
        console.warn('Unknown email action type:', email_action_type)
        return new Response(
          JSON.stringify({ error: 'Unknown email action type' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
    }

    // Envoyer l'email via Resend
    const { error } = await resend.emails.send({
      from: 'LUMA <onboarding@resend.dev>',
      to: [user.email],
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log('Email sent successfully:', { type: email_action_type, to: user.email })

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  } catch (error) {
    console.error('Error in send-email function:', error)
    return new Response(
      JSON.stringify({
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  }
})