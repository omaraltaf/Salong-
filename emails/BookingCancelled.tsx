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

interface BookingCancelledProps {
  customerName: string
  serviceName: string
  date: string
  time: string
  salonName: string
  phone: string
  websiteUrl: string
}

export default function BookingCancelled({
  customerName,
  serviceName,
  date,
  time,
  salonName,
  phone,
  websiteUrl,
}: BookingCancelledProps) {
  return (
    <Html>
      <Head />
      <Preview>Din time er avbestilt – {salonName}</Preview>
      <Body style={{ backgroundColor: '#FAFAF8', fontFamily: 'Georgia, serif', margin: 0 }}>
        <Container style={{ maxWidth: '580px', margin: '40px auto', padding: '0 20px' }}>
          {/* Header */}
          <Section
            style={{
              backgroundColor: '#C4A882',
              padding: '32px',
              textAlign: 'center',
              borderRadius: '8px 8px 0 0',
            }}
          >
            <Heading style={{ color: '#FFFFFF', fontSize: '28px', margin: 0 }}>
              {salonName}
            </Heading>
          </Section>

          {/* Cancelled banner */}
          <Section
            style={{
              backgroundColor: '#dc2626',
              padding: '14px 32px',
              textAlign: 'center',
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 'bold',
                margin: 0,
                letterSpacing: '0.5px',
              }}
            >
              ✕ Din time er avbestilt
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
            <Heading
              as="h2"
              style={{ color: '#1A1A1A', fontSize: '22px', marginTop: 0 }}
            >
              Hei, {customerName}
            </Heading>

            <Text style={{ color: '#555555', lineHeight: '1.7', fontSize: '15px' }}>
              Vi bekrefter at din time har blitt avbestilt. Vi beklager at det ikke
              passet denne gangen, og håper å se deg snart!
            </Text>

            {/* Cancelled booking summary */}
            <Section
              style={{
                backgroundColor: '#FEF2F2',
                padding: '20px 24px',
                borderRadius: '6px',
                margin: '24px 0',
                borderLeft: '4px solid #dc2626',
              }}
            >
              <Text
                style={{
                  margin: '0 0 10px 0',
                  color: '#7f1d1d',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Avbestilt time
              </Text>
              <Text style={{ margin: '6px 0', color: '#1A1A1A', fontSize: '14px' }}>
                <strong>Tjeneste:</strong> {serviceName}
              </Text>
              <Text style={{ margin: '6px 0', color: '#1A1A1A', fontSize: '14px' }}>
                <strong>Dato:</strong> {date}
              </Text>
              <Text style={{ margin: '6px 0', color: '#1A1A1A', fontSize: '14px' }}>
                <strong>Tid:</strong> {time}
              </Text>
            </Section>

            {/* Rebook CTA */}
            <Section
              style={{
                backgroundColor: '#F5F0EB',
                padding: '20px 24px',
                borderRadius: '6px',
                margin: '16px 0',
                textAlign: 'center',
              }}
            >
              <Text
                style={{
                  color: '#555555',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  margin: '0 0 12px 0',
                }}
              >
                Ønsker du å bestille en ny time?
              </Text>
              <Text style={{ margin: 0 }}>
                <a
                  href={websiteUrl}
                  style={{
                    backgroundColor: '#C4A882',
                    color: '#FFFFFF',
                    padding: '12px 28px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'inline-block',
                  }}
                >
                  Book en ny time
                </a>
              </Text>
            </Section>

            <Text style={{ color: '#555555', fontSize: '14px', lineHeight: '1.6' }}>
              Har du spørsmål? Ikke nøl med å ringe oss på{' '}
              <strong style={{ color: '#1A1A1A' }}>{phone}</strong>.
            </Text>

            <Hr style={{ borderColor: '#E8D5C4', margin: '28px 0' }} />

            <Text
              style={{
                color: '#999999',
                fontSize: '13px',
                textAlign: 'center',
                margin: 0,
              }}
            >
              Med vennlig hilsen, {salonName}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

BookingCancelled.PreviewProps = {
  customerName: 'Mona Hansen',
  serviceName: 'Dameklipp',
  date: 'Mandag 15. januar 2024',
  time: '10:00',
  salonName: 'Blue Point AS',
  phone: '+47 XX XX XX XX',
  websiteUrl: 'https://bluepoint.no',
} satisfies BookingCancelledProps
