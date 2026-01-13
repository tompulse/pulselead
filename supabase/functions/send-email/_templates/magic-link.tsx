import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'https://esm.sh/@react-email/components@0.0.22?deps=react@18.3.1'
import * as React from 'https://esm.sh/react@18.3.1'

interface MagicLinkEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
}

export const MagicLinkEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
}: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>Connectez-vous à PULSE avec ce lien magique</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🔐 Connexion à PULSE</Heading>
        
        <Text style={text}>
          Bonjour,
        </Text>
        
        <Text style={text}>
          Vous avez demandé à vous connecter à votre compte PULSE. 
          Cliquez sur le bouton ci-dessous pour vous connecter instantanément :
        </Text>

        <Link
          href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
          style={button}
        >
          Se connecter à PULSE
        </Link>

        <Text style={text}>
          Ou copiez-collez ce code de connexion temporaire :
        </Text>
        
        <code style={code}>{token}</code>

        <Text style={textSmall}>
          Ce lien et ce code sont valables pendant 1 heure.
        </Text>

        <Text style={textSmall}>
          Si vous n'avez pas demandé cette connexion, vous pouvez ignorer cet email en toute sécurité.
        </Text>

        <Text style={footer}>
          L'équipe PULSE
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = {
  backgroundColor: '#0A0F1E',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  maxWidth: '600px',
}

const h1 = {
  color: '#0A0F1E',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 30px',
  padding: '0',
}

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
}

const textSmall = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '16px 0',
}

const button = {
  backgroundColor: '#00FFF0',
  color: '#0A0F1E',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '16px 32px',
  borderRadius: '8px',
  margin: '32px 0',
}

const code = {
  display: 'inline-block',
  padding: '16px',
  width: '100%',
  backgroundColor: '#f4f4f4',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
  color: '#333333',
  fontSize: '18px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  letterSpacing: '2px',
  fontFamily: 'monospace',
}

const footer = {
  color: '#666666',
  fontSize: '14px',
  marginTop: '40px',
}