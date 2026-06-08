import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface AdminNewMessageProps {
  name: string
  email: string
  phone: string
  message: string
  adminUrl: string
  salonName: string
}

export default function AdminNewMessage({
  name,
  email,
  phone,
  message,
  adminUrl,
  salonName,
}: AdminNewMessageProps) {
  return (
    <Html>
      <Head />
      <Preview>Ny melding fra {name} via nettsiden</Preview>
      <Body style={{ backgroundColor: '#FAFAF8', fontFamily: 'Georgia, serif', margin: 0 }}>
        <Container style={{ maxWidth: '580px', margin: '40px auto', padding: '0 20px' }}>
          {/* Header */}
          <Section
            style={{
              backgroundColor: '#2C2C2C',
              padding: '28px 32px',
              textAlign: 'center',
              borderRadius: '8px 8px 0 0',
            }}
          >
            <Text
              style={{
                color: '#C4A882',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                margin: '0 0 6px 0',
              }}
            >
              Administrasjon – {salonName}
            </Text>
            <Heading style={{ color: '#FFFFFF', fontSize: '22px', margin: 0 }}>
              Ny melding via nettsiden
            </Heading>
          </Section>

          {/* Alert banner */}
          <Section
            style={{
              backgroundColor: '#C4A882',
              padding: '12px 32px',
              textAlign: 'center',
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 'bold',
                margin: 0,
              }}
            >
              ✉️ {name} har sendt deg en melding via kontaktskjemaet
            </Text>
          </Section>

          {/* Body */}
          <Section
            style={{
              backgroundColor: '#FFFFFF',
              padding: '32px',
              borderRadius: '0 0 8px 8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            {/* Sender details */}
            <Heading
              as="h3"
              style={{
                color: '#2C2C2C',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                margin: '0 0 12px 0',
              }}
            >
              Avsenderinformasjon
            </Heading>
            <Section
              style={{
                backgroundColor: '#F5F0EB',
                padding: '20px 24px',
                borderRadius: '6px',
                margin: '0 0 24px 0',
              }}
            >
              <Text style={{ margin: '6px 0', color: '#1A1A1A', fontSize: '14px' }}>
                <strong>Navn:</strong> {name}
              </Text>
              <Text style={{ margin: '6px 0', color: '#1A1A1A', fontSize: '14px' }}>
                <strong>E-post:</strong>{' '}
                <a
                  href={`mailto:${email}`}
                  style={{ color: '#C4A882', textDecoration: 'none' }}
                >
                  {email}
                </a>
              </Text>
              {phone && (
                <Text style={{ margin: '6px 0', color: '#1A1A1A', fontSize: '14px' }}>
                  <strong>Telefon:</strong>{' '}
                  <a
                    href={`tel:${phone}`}
                    style={{ color: '#C4A882', textDecoration: 'none' }}
                  >
                    {phone}
                  </a>
                </Text>
              )}
            </Section>

            {/* Message */}
            <Heading
              as="h3"
              style={{
                color: '#2C2C2C',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                margin: '0 0 12px 0',
              }}
            >
              Meldingen
            </Heading>
            <Section
              style={{
                backgroundColor: '#FFFBF7',
                padding: '20px 24px',
                borderRadius: '6px',
                margin: '0 0 24px 0',
                border: '1px solid #E8D5C4',
                borderLeft: '4px solid #C4A882',
              }}
            >
              <Text
                style={{
                  color: '#333333',
                  fontSize: '15px',
                  lineHeight: '1.8',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {message}
              </Text>
            </Section>

            {/* Reply instruction */}
            <Section
              style={{
                backgroundColor: '#EFF6FF',
                padding: '16px 20px',
                borderRadius: '6px',
                margin: '0 0 24px 0',
                border: '1px solid #BFDBFE',
              }}
            >
              <Text
                style={{
                  color: '#1E40AF',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  margin: 0,
                }}
              >
                <strong>Svar direkte:</strong> Du kan svare på denne e-posten, eller
                kontakte {name} på{' '}
                <a
                  href={`mailto:${email}`}
                  style={{ color: '#1E40AF' }}
                >
                  {email}
                </a>
                {phone ? ` eller ringe ${phone}` : ''}.
              </Text>
            </Section>

            {/* Admin CTA */}
            <Section style={{ textAlign: 'center', margin: '8px 0 24px 0' }}>
              <a
                href={adminUrl}
                style={{
                  backgroundColor: '#2C2C2C',
                  color: '#FFFFFF',
                  padding: '13px 32px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  display: 'inline-block',
                }}
              >
                Gå til administrasjonspanelet
              </a>
            </Section>

            <Hr style={{ borderColor: '#E8D5C4', margin: '24px 0' }} />

            <Text
              style={{
                color: '#999999',
                fontSize: '12px',
                textAlign: 'center',
                margin: 0,
              }}
            >
              Dette er en automatisk melding fra {salonName} kontaktskjema.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

AdminNewMessage.PreviewProps = {
  name: 'Kari Nordmann',
  email: 'kari@example.com',
  phone: '+47 91 23 45 67',
  message:
    'Hei! Jeg lurer på om dere har mulighet til å ta imot meg på kort varsel denne uken. Er det ledig tid fredag ettermiddag?',
  adminUrl: 'https://bluepoint.no/admin/messages',
  salonName: 'Blue Point AS',
} satisfies AdminNewMessageProps
