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

interface BookingReceivedProps {
  customerName: string
  serviceName: string
  date: string
  time: string
  salonName: string
  phone: string
}

export default function BookingReceived({
  customerName,
  serviceName,
  date,
  time,
  salonName,
  phone,
}: BookingReceivedProps) {
  return (
    <Html>
      <Head />
      <Preview>Vi har mottatt din forespørsel – {salonName}</Preview>
      <Body style={{ backgroundColor: '#FAFAF8', fontFamily: 'Georgia, serif', margin: 0 }}>
        <Container style={{ maxWidth: '580px', margin: '40px auto', padding: '0 20px' }}>
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
              Takk for din bestilling, {customerName}!
            </Heading>

            <Text style={{ color: '#555555', lineHeight: '1.7', fontSize: '15px' }}>
              Vi har mottatt din timeforespørsel og vil bekrefte den så snart som mulig.
              Du vil motta en ny e-post med bekreftelse når timen er godkjent.
            </Text>

            <Section
              style={{
                backgroundColor: '#F5F0EB',
                padding: '20px 24px',
                borderRadius: '6px',
                margin: '24px 0',
                borderLeft: '4px solid #C4A882',
              }}
            >
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

            <Text style={{ color: '#555555', fontSize: '14px', lineHeight: '1.6' }}>
              Har du spørsmål? Ring oss gjerne på{' '}
              <strong style={{ color: '#1A1A1A' }}>{phone}</strong>
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

BookingReceived.PreviewProps = {
  customerName: 'Mona Hansen',
  serviceName: 'Dameklipp',
  date: 'Mandag 15. januar 2024',
  time: '10:00',
  salonName: 'Blue Point AS',
  phone: '+47 XX XX XX XX',
} satisfies BookingReceivedProps
