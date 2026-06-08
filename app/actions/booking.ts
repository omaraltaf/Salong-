'use server'

import { createClient } from '@/lib/supabase/server'
import { resend } from '@/lib/email'
import { bookingSchema } from '@/lib/validations'
import { salonConfig } from '@/config/salon.config'
import { formatDate, formatTime } from '@/lib/utils'
import type { BookingFormData } from '@/lib/validations'

export async function createBooking(data: BookingFormData) {
  const parsed = bookingSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Ugyldig skjemadata. Vennligst fyll ut alle felt korrekt.' }
  }

  const supabase = await createClient()

  // Get timeslot and service details
  const { data: timeslot } = await supabase
    .from('timeslots')
    .select('*, services(*)')
    .eq('id', parsed.data.timeslot_id)
    .single()

  if (!timeslot || !timeslot.is_available) {
    return { error: 'Denne timen er ikke lenger tilgjengelig. Vennligst velg en annen.' }
  }

  // Create booking
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      timeslot_id: parsed.data.timeslot_id,
      customer_name: parsed.data.customer_name,
      customer_email: parsed.data.customer_email,
      customer_phone: parsed.data.customer_phone,
      service_id: parsed.data.service_id,
      notes: parsed.data.notes,
      status: 'pending',
    })
    .select()
    .single()

  if (bookingError) {
    return { error: 'Noe gikk galt. Vennligst prøv igjen.' }
  }

  // Mark timeslot as unavailable
  await supabase
    .from('timeslots')
    .update({ is_available: false })
    .eq('id', parsed.data.timeslot_id)

  // Send emails (fire and forget, don't block on email errors)
  const serviceName = (timeslot as any).services?.name ?? 'Ukjent tjeneste'
  const dateStr = formatDate(timeslot.date)
  const timeStr = formatTime(timeslot.start_time)

  try {
    await Promise.all([
      resend.emails.send({
        from: `${salonConfig.name} <no-reply@bluepoint.no>`,
        to: parsed.data.customer_email,
        subject: `Vi har mottatt din forespørsel – ${salonConfig.name}`,
        html: `
          <h2>Takk for din bestilling, ${parsed.data.customer_name}!</h2>
          <p>Vi har mottatt din timeforespørsel og vil bekrefte den snart.</p>
          <ul>
            <li><strong>Tjeneste:</strong> ${serviceName}</li>
            <li><strong>Dato:</strong> ${dateStr}</li>
            <li><strong>Tid:</strong> ${timeStr}</li>
          </ul>
          <p>Du vil motta en bekreftelse på e-post så snart vi har godkjent bookingen.</p>
          <p>Mvh ${salonConfig.name}</p>
        `,
      }),
      resend.emails.send({
        from: `${salonConfig.name} <no-reply@bluepoint.no>`,
        to: process.env.ADMIN_EMAIL!,
        subject: `Ny timeforespørsel fra ${parsed.data.customer_name} – ${salonConfig.name}`,
        html: `
          <h2>Ny timeforespørsel</h2>
          <ul>
            <li><strong>Navn:</strong> ${parsed.data.customer_name}</li>
            <li><strong>E-post:</strong> ${parsed.data.customer_email}</li>
            <li><strong>Telefon:</strong> ${parsed.data.customer_phone}</li>
            <li><strong>Tjeneste:</strong> ${serviceName}</li>
            <li><strong>Dato:</strong> ${dateStr}</li>
            <li><strong>Tid:</strong> ${timeStr}</li>
            ${parsed.data.notes ? `<li><strong>Notat:</strong> ${parsed.data.notes}</li>` : ''}
          </ul>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/bookings">Åpne adminpanel</a></p>
        `,
      }),
    ])
  } catch (emailError) {
    // Email failed - booking still succeeded
    console.error('Email send failed:', emailError)
  }

  return { success: true, bookingId: booking.id }
}
