'use server'

import { createClient } from '@/lib/supabase/server'
import { resend } from '@/lib/email'
import { revalidatePath } from 'next/cache'
import { salonConfig } from '@/config/salon.config'
import { formatDate, formatTime } from '@/lib/utils'

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function confirmBooking(bookingId: string) {
  const supabase = await createClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, services(*), timeslots(*)')
    .eq('id', bookingId)
    .single()

  if (!booking) return { error: 'Bestilling ikke funnet' }

  await supabase
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', bookingId)

  try {
    // booking.services and booking.timeslots are joined relations – Supabase's
    // generic .select() return type doesn't reflect nested shapes, so we cast
    // via unknown for these join-only fields only.
    const service = (booking as unknown as { services: { name: string } | null }).services
    const timeslot = (booking as unknown as {
      timeslots: { date: string; start_time: string } | null
    }).timeslots

    await resend.emails.send({
      from: `${salonConfig.name} <no-reply@bluepoint.no>`,
      to: booking.customer_email,
      subject: `Din time er bekreftet ✂️ – ${salonConfig.name}`,
      html: `
        <h2>Din time er bekreftet!</h2>
        <p>Hei ${booking.customer_name},</p>
        <p>Vi ser frem til å se deg!</p>
        <ul>
          <li><strong>Tjeneste:</strong> ${service?.name ?? 'Ukjent'}</li>
          <li><strong>Dato:</strong> ${formatDate(timeslot?.date ?? '')}</li>
          <li><strong>Tid:</strong> ${formatTime(timeslot?.start_time ?? '')}</li>
        </ul>
        <p>Ønsker du å avbestille, ta kontakt på telefon: ${salonConfig.phone}</p>
        <p>Mvh ${salonConfig.name}</p>
      `,
    })
  } catch (e) {
    console.error(e)
  }

  revalidatePath('/admin/bookings')
  revalidatePath('/admin/dashboard')
  return { success: true }
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, services(*), timeslots(*)')
    .eq('id', bookingId)
    .single()

  if (!booking) return { error: 'Bestilling ikke funnet' }

  await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)

  // Re-open the timeslot so it can be booked again
  if (booking.timeslot_id) {
    await supabase
      .from('timeslots')
      .update({ is_available: true })
      .eq('id', booking.timeslot_id)
  }

  try {
    await resend.emails.send({
      from: `${salonConfig.name} <no-reply@bluepoint.no>`,
      to: booking.customer_email,
      subject: `Din time er avbestilt – ${salonConfig.name}`,
      html: `
        <h2>Din time er avbestilt</h2>
        <p>Hei ${booking.customer_name},</p>
        <p>Vi beklager at vi måtte avbestille din time. Ta gjerne kontakt for å booke ny tid.</p>
        <p>Book ny time: <a href="${process.env.NEXT_PUBLIC_SITE_URL}">${process.env.NEXT_PUBLIC_SITE_URL}</a></p>
        <p>Mvh ${salonConfig.name}</p>
      `,
    })
  } catch (e) {
    console.error(e)
  }

  revalidatePath('/admin/bookings')
  revalidatePath('/admin/dashboard')
  return { success: true }
}

// ─── Services ─────────────────────────────────────────────────────────────────

export type ServiceCategory = 'dame' | 'herre' | 'barn' | 'behandling'

export interface CreateServiceInput {
  name: string
  description: string
  duration_minutes: number
  price_from: number
  price_to: number
  category: ServiceCategory
  icon: string
  is_active: boolean
}

export async function createService(data: CreateServiceInput) {
  const supabase = await createClient()
  const { error } = await supabase.from('services').insert(data)
  if (error) return { error: error.message }
  revalidatePath('/admin/services')
  revalidatePath('/')
  return { success: true }
}

export interface UpdateServiceInput {
  name?: string
  description?: string
  duration_minutes?: number
  price_from?: number
  price_to?: number
  category?: ServiceCategory
  icon?: string
  is_active?: boolean
  sort_order?: number
}

export async function updateService(id: string, data: UpdateServiceInput) {
  const supabase = await createClient()
  const { error } = await supabase.from('services').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/services')
  revalidatePath('/')
  return { success: true }
}

export async function deleteService(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/services')
  revalidatePath('/')
  return { success: true }
}

// ─── Timeslots ────────────────────────────────────────────────────────────────

export interface CreateTimeslotInput {
  date: string
  start_time: string
  end_time: string
  service_id?: string
}

export async function createTimeslot(data: CreateTimeslotInput) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('timeslots')
    .insert({ ...data, is_available: true })
  if (error) return { error: error.message }
  revalidatePath('/admin/timeslots')
  return { success: true }
}

export interface CreateTimeslotsBulkInput {
  dates: string[]
  start_time: string
  end_time: string
  service_id?: string
}

export async function createTimeslotsBulk(data: CreateTimeslotsBulkInput) {
  const supabase = await createClient()
  const rows = data.dates.map((date) => ({
    date,
    start_time: data.start_time,
    end_time: data.end_time,
    service_id: data.service_id,
    is_available: true,
  }))
  const { error } = await supabase.from('timeslots').insert(rows)
  if (error) return { error: error.message }
  revalidatePath('/admin/timeslots')
  return { success: true }
}

export async function deleteTimeslot(id: string) {
  const supabase = await createClient()
  // Only delete if still available (not booked)
  const { error } = await supabase
    .from('timeslots')
    .delete()
    .eq('id', id)
    .eq('is_available', true)
  if (error) return { error: error.message }
  revalidatePath('/admin/timeslots')
  return { success: true }
}

// ─── Content blocks ───────────────────────────────────────────────────────────

export async function updateContentBlock(key: string, value: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_blocks')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) return { error: error.message }
  revalidatePath('/')
  return { success: true }
}

// ─── Opening hours ────────────────────────────────────────────────────────────

export interface OpeningHourInput {
  id?: string
  day_of_week: number
  open_time: string | null
  close_time: string | null
  is_closed: boolean
}

export async function updateOpeningHours(hours: OpeningHourInput[]) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('opening_hours')
    .upsert(hours, { onConflict: 'id' })
  if (error) return { error: error.message }
  revalidatePath('/')
  revalidatePath('/admin/hours')
  return { success: true }
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export interface CreateTestimonialInput {
  author_name: string
  content: string
  rating: number
}

export async function createTestimonial(data: CreateTestimonialInput) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('testimonials')
    .insert({ ...data, is_published: false })
  if (error) return { error: error.message }
  revalidatePath('/admin/testimonials')
  return { success: true }
}

export interface UpdateTestimonialInput {
  author_name?: string
  content?: string
  rating?: number
  is_published?: boolean
  sort_order?: number
}

export async function updateTestimonial(id: string, data: UpdateTestimonialInput) {
  const supabase = await createClient()
  const { error } = await supabase.from('testimonials').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/testimonials')
  revalidatePath('/')
  return { success: true }
}

export async function deleteTestimonial(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('testimonials').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/testimonials')
  return { success: true }
}

// ─── Social links ─────────────────────────────────────────────────────────────

export interface CreateSocialLinkInput {
  platform: string
  url: string
}

export async function createSocialLink(data: CreateSocialLinkInput) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('social_links')
    .insert({ ...data, is_active: true })
  if (error) return { error: error.message }
  revalidatePath('/admin/social')
  revalidatePath('/')
  return { success: true }
}

export interface UpdateSocialLinkInput {
  platform?: string
  url?: string
  is_active?: boolean
}

export async function updateSocialLink(id: string, data: UpdateSocialLinkInput) {
  const supabase = await createClient()
  const { error } = await supabase.from('social_links').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/social')
  return { success: true }
}

export async function deleteSocialLink(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('social_links').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/social')
  return { success: true }
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function markMessageRead(id: string, is_read: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('contact_submissions')
    .update({ is_read })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/messages')
  return { success: true }
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

export interface CreatePricingTierInput {
  service_id: string
  label: string
  price: number
}

export async function createPricingTier(data: CreatePricingTierInput) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('pricing')
    .insert({ ...data, is_active: true })
  if (error) return { error: error.message }
  revalidatePath('/admin/pricing')
  return { success: true }
}

export async function deletePricingTier(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('pricing').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/pricing')
  return { success: true }
}
