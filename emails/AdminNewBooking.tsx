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

interface AdminNewBookingProps {
  customerName: string
  customerEmail: string
  customerPhone: string
  serviceName: string
  date: string
  time: string
  notes: string
  adminUrl: string
  salonName: string
}

export default function AdminNewBooking({
  customerName,
  customerEmail,
  customerPhone,
  serviceName,
  date,
  time,
  notes,
  adminUrl,
  salonName,
}: AdminNewBookingProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Ny timeforespørsel fra {customerName} – {salonName}
      </Preview>
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
              Ny timeforespørsel
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
              🗓 En ny kunde har sendt en bestillingsforespørsel
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
            {/* Customer details */}
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
              Kundeinformasjon
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
                <strong>Navn:</strong> {customerName}
              </Text>
              <Text style={{ margin: '6px 0', color: '#1A1A1A', fontSize: '14px' }}>
                <strong>E-post:</strong>{' '}
                <a
                  href={`mailto:${customerEmail}`}
                  style={{ color: '#C4A882', textDecoration: 'none' }}
                >
                  {customerEmail}
                </a>
              </Text>
              <Text style={{ margin: '6px 0', color: '#1A1A1A', fontSize: '14px' }}>
                <strong>Telefon:</strong>{' '}
                <a
                  href={`tel:${customerPhone}`}
                  style={{ color: '#C4A882', textDecoration: 'none' }}
                >
                  {customerPhone}
                </a>
              </Text>
            </Section>

            {/* Booking details */}
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
              Bestillingsdetaljer
            </Heading>
            <Section
              style={{
                backgroundColor: '#F5F0EB',
                padding: '20px 24px',
                borderRadius: '6px',
                margin: '0 0 24px 0',
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

            {/* Notes */}
            {notes && (
              <>
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
                  Melding fra kunde
                </Heading>
                <Section
                  style={{
                    backgroundColor: '#FFFBF7',
                    padding: '16px 20px',
                    borderRadius: '6px',
                    margin: '0 0 24px 0',
                    border: '1px solid #E8D5C4',
                  }}
                >
                  <Text
                    style={{
                      color: '#555555',
                      fontSize: '14px',
                      lineHeight: '1.7',
                      margin: 0,
                      fontStyle: 'italic',
                    }}
                  >
                    &ldquo;{notes}&rdquo;
                  </Text>
                </Section>
              </>
            )}

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

            <Text
              style={{
                color: '#888888',
                fontSize: '13px',
                lineHeight: '1.6',
                textAlign: 'center',
              }}
            >
              Husk å bekrefte eller avslå forespørselen innen rimelig tid.
            </Text>

            <Hr style={{ borderColor: '#E8D5C4', margin: '24px 0' }} />

            <Text
              style={{
                color: '#999999',
                fontSize: '12px',
                textAlign: 'center',
                margin: 0,
              }}
            >
              Dette er en automatisk melding fra {salonName} booking-system.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

AdminNewBooking.PreviewProps = {
  customerName: 'Mona Hansen',
  customerEmail: 'mona.hansen@example.com',
  customerPhone: '+47 99 88 77 66',
  serviceName: 'Dameklipp',
  date: 'Mandag 15. januar 2024',
  time: '10:00',
  notes: 'Jeg ønsker gjerne litt lag og volum.',
  adminUrl: 'https://bluepoint.no/admin/bookings',
  salonName: 'Blue Point AS',
} satisfies AdminNewBookingProps
