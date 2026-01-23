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

interface EmailConfirmationProps {
  email: string
  confirmationUrl: string
}

export const EmailConfirmation = ({ email, confirmationUrl }: EmailConfirmationProps) => (
  <Html>
    <Head />
    <Preview>Confirmez votre adresse email pour accéder à PULSE</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>📧 Confirmez votre email</Heading>
        
        <Text style={text}>
          Bonjour,
        </Text>
        
        <Text style={text}>
          Merci de vous être inscrit sur <strong>PULSE</strong> ! Pour activer votre compte 
          et commencer à optimiser votre prospection terrain, il vous suffit de confirmer 
          votre adresse email.
        </Text>

        <Section style={section}>
          <Text style={sectionText}>
            Cliquez sur le bouton ci-dessous pour confirmer votre email et accéder 
            immédiatement à votre tableau de bord :
          </Text>
        </Section>

        <Link
          href={confirmationUrl}
          style={button}
        >
          Confirmer mon email
        </Link>

        <Text style={text}>
          Ou copiez-collez ce lien dans votre navigateur :
        </Text>

        <Text style={linkText}>
          {confirmationUrl}
        </Text>

        <Text style={disclaimer}>
          ⚠️ Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte PULSE, 
          vous pouvez ignorer cet email en toute sécurité.
        </Text>

        <Text style={footer}>
          À très bientôt,
          <br />
          L'équipe PULSE
        </Text>

        <Text style={footerSmall}>
          Cet email a été envoyé à {email}
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailConfirmation

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
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 30px',
  padding: '0',
  lineHeight: '1.2',
}

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
}

const section = {
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  borderLeft: '4px solid #00FFF0',
}

const sectionText = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0',
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

const linkText = {
  color: '#00FFF0',
  fontSize: '13px',
  wordBreak: 'break-all' as const,
  margin: '8px 0 24px',
}

const disclaimer = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '32px 0',
  padding: '16px',
  backgroundColor: '#fff3cd',
  borderRadius: '6px',
  borderLeft: '4px solid #ffc107',
}

const footer = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.6',
  marginTop: '40px',
}

const footerSmall = {
  color: '#999999',
  fontSize: '12px',
  marginTop: '24px',
}
