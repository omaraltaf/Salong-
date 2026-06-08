'use server'

import { createClient } from '@/lib/supabase/server'
import { resend } from '@/lib/email'
import { contactSchema } from '@/lib/validations'
import { salonConfig } from '@/config/salon.config'
import type { ContactFormData } from '@/lib/validations'

export async function submitContact(data: ContactFormData) {
  const parsed = contactSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Ugyldig skjemadata.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.from('contact_submissions').insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    message: parsed.data.message,
    is_read: false,
  })

  if (error) {
    return { error: 'Noe gikk galt. Vennligst prøv igjen.' }
  }

  try {
    await resend.emails.send({
      from: `${salonConfig.name} <no-reply@bluepoint.no>`,
      to: process.env.ADMIN_EMAIL!,
      replyTo: parsed.data.email,
      subject: `Ny melding fra ${parsed.data.name} via nettsiden`,
      html: `
        <h2>Ny melding fra nettsiden</h2>
        <ul>
          <li><strong>Navn:</strong> ${parsed.data.name}</li>
          <li><strong>E-post:</strong> ${parsed.data.email}</li>
          ${parsed.data.phone ? `<li><strong>Telefon:</strong> ${parsed.data.phone}</li>` : ''}
        </ul>
        <h3>Melding:</h3>
        <p>${parsed.data.message.replace(/\n/g, '<br>')}</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/messages">Se melding i adminpanel</a></p>
      `,
    })
  } catch (emailError) {
    console.error('Email send failed:', emailError)
  }

  return { success: true }
}
