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

interface WelcomeEmailProps {
  email: string
}

export const WelcomeEmail = ({ email }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Bienvenue sur LUMA - Éclaire les leviers de ta croissance</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎉 Bienvenue sur LUMA !</Heading>
        
        <Text style={text}>
          Bonjour,
        </Text>
        
        <Text style={text}>
          Merci de rejoindre LUMA, ta plateforme pour visualiser ton marché, 
          comprendre tes prospects et passer à l'action.
        </Text>

        <Section style={section}>
          <Text style={text}>
            <strong>Avec LUMA, tu peux :</strong>
          </Text>
          <Text style={listItem}>✨ Visualiser ton territoire commercial sur une carte interactive</Text>
          <Text style={listItem}>🎯 Prioriser tes prospects avec l'IA</Text>
          <Text style={listItem}>🗺️ Optimiser tes tournées commerciales avec GPS réel</Text>
          <Text style={listItem}>📊 Suivre toutes tes interactions clients</Text>
        </Section>

        <Text style={text}>
          Connecte-toi dès maintenant pour commencer à éclairer ta croissance !
        </Text>

        <Link
          href="https://lumacrm.lovable.app/dashboard"
          style={button}
        >
          Accéder à mon tableau de bord
        </Link>

        <Text style={footer}>
          À très bientôt,
          <br />
          L'équipe LUMA
        </Text>

        <Text style={footerSmall}>
          Cet email a été envoyé à {email}
        </Text>
      </Container>
    </Body>
  </Html>
)

export default WelcomeEmail

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

const listItem = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.8',
  margin: '8px 0',
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