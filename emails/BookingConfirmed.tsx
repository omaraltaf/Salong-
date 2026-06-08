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

interface BookingConfirmedProps {
  customerName: string
  serviceName: string
  date: string
  time: string
  salonName: string
  phone: string
  address: string
}

export default function BookingConfirmed({
  customerName,
  serviceName,
  date,
  time,
  salonName,
  phone,
  address,
}: BookingConfirmedProps) {
  return (
    <Html>
      <Head />
      <Preview>Din time er bekreftet ✂️ – {salonName}</Preview>
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

          {/* Confirmed banner */}
          <Section
            style={{
              backgroundColor: '#16a34a',
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
              ✓ Din time er bekreftet
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
              Hei, {customerName}!
            </Heading>

            <Text style={{ color: '#555555', lineHeight: '1.7', fontSize: '15px' }}>
              Vi gleder oss til å se deg! Din time er nå bekreftet. Her er detaljene:
            </Text>

            {/* Booking summary */}
            <Section
              style={{
                backgroundColor: '#F0FDF4',
                padding: '20px 24px',
                borderRadius: '6px',
                margin: '24px 0',
                borderLeft: '4px solid #16a34a',
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
              <Text style={{ margin: '6px 0', color: '#1A1A1A', fontSize: '14px' }}>
                <strong>Adresse:</strong> {address}
              </Text>
            </Section>

            {/* Calendar note */}
            <Section
              style={{
                backgroundColor: '#F5F0EB',
                padding: '16px 20px',
                borderRadius: '6px',
                margin: '16px 0',
              }}
            >
              <Text
                style={{
                  color: '#555555',
                  fontSize: '14px',
                  margin: 0,
                  lineHeight: '1.6',
                }}
              >
                📅 <strong>Legg til i kalender:</strong> Husk å legge til timen i
                din kalender så du ikke glemmer den!
              </Text>
            </Section>

            {/* Cancellation instructions */}
            <Text style={{ color: '#555555', fontSize: '14px', lineHeight: '1.6' }}>
              Dersom du trenger å avbestille eller endre timen, vennligst gi oss
              beskjed <strong>minst 24 timer i forveien</strong> ved å ringe{' '}
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

BookingConfirmed.PreviewProps = {
  customerName: 'Mona Hansen',
  serviceName: 'Dameklipp',
  date: 'Mandag 15. januar 2024',
  time: '10:00',
  salonName: 'Blue Point AS',
  phone: '+47 XX XX XX XX',
  address: 'Skedsmokorset, Norway',
} satisfies BookingConfirmedProps
