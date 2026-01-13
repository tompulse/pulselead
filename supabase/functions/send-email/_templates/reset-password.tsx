import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'https://esm.sh/@react-email/components@0.0.22?deps=react@18.3.1'
import * as React from 'https://esm.sh/react@18.3.1'

interface ResetPasswordEmailProps {
  supabase_url: string
  token_hash: string
  token: string
  redirect_to: string
}

export const ResetPasswordEmail = ({
  supabase_url,
  token_hash,
  token,
  redirect_to,
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Réinitialisez votre mot de passe PULSE</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🔑 Réinitialisation de mot de passe</Heading>
        
        <Text style={text}>
          Bonjour,
        </Text>
        
        <Text style={text}>
          Vous avez demandé à réinitialiser votre mot de passe PULSE.
        </Text>

        <Section style={warningBox}>
          <Text style={warningText}>
            ⚠️ Si vous n'avez pas fait cette demande, ignorez cet email et votre mot de passe restera inchangé.
          </Text>
        </Section>

        <Text style={text}>
          Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
        </Text>

        <Link
          href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=recovery&redirect_to=${redirect_to}`}
          style={button}
        >
          Réinitialiser mon mot de passe
        </Link>

        <Text style={text}>
          Ou copiez-collez ce code de récupération :
        </Text>
        
        <code style={code}>{token}</code>

        <Text style={textSmall}>
          Ce lien et ce code sont valables pendant 1 heure pour des raisons de sécurité.
        </Text>

        <Section style={tipsBox}>
          <Text style={tipsTitle}>💡 Conseils pour un mot de passe sécurisé :</Text>
          <Text style={tipItem}>• Au moins 8 caractères</Text>
          <Text style={tipItem}>• Mélange de majuscules et minuscules</Text>
          <Text style={tipItem}>• Inclure des chiffres et symboles</Text>
          <Text style={tipItem}>• Éviter les informations personnelles</Text>
        </Section>

        <Text style={footer}>
          L'équipe PULSE
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ResetPasswordEmail

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

const warningBox = {
  backgroundColor: '#FFF3CD',
  padding: '16px',
  borderRadius: '8px',
  borderLeft: '4px solid #FFC107',
  margin: '24px 0',
}

const warningText = {
  color: '#856404',
  fontSize: '14px',
  margin: '0',
  fontWeight: '500',
}

const tipsBox = {
  backgroundColor: '#E8F5F7',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
}

const tipsTitle = {
  color: '#0A0F1E',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 12px',
}

const tipItem = {
  color: '#333333',
  fontSize: '14px',
  margin: '6px 0',
  lineHeight: '1.5',
}

const footer = {
  color: '#666666',
  fontSize: '14px',
  marginTop: '40px',
}