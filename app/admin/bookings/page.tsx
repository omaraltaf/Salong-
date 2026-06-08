import { createClient } from '@/lib/supabase/server'
import BookingsTable from '@/components/admin/BookingsTable'
import type { Booking } from '@/components/admin/BookingsTable'

export default async function BookingsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      id,
      customer_name,
      customer_email,
      customer_phone,
      service_id,
      timeslot_id,
      notes,
      status,
      created_at,
      services ( name ),
      timeslots ( date, start_time )
    `
    )
    .order('created_at', { ascending: false })
    .returns<Booking[]>()

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-600 text-sm">Kunne ikke laste bestillinger: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1
        className="text-2xl font-bold text-gray-900 mb-6"
        style={{ fontFamily: 'Playfair Display, serif' }}
      >
        Bestillinger
      </h1>
      <BookingsTable bookings={data ?? []} />
    </div>
  )
}
