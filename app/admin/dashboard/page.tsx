import { createClient } from '@/lib/supabase/server'
import { formatDate, formatTime } from '@/lib/utils'
import { confirmBooking, cancelBooking } from '@/app/actions/admin'
import {
  Clock,
  CalendarCheck,
  CalendarDays,
  Mail,
} from 'lucide-react'

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  colorClass: string
}

function StatCard({ label, value, icon, colorClass }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'pending' | 'confirmed' | 'cancelled' }) {
  const map = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  const labels = {
    pending: 'Venter',
    confirmed: 'Bekreftet',
    cancelled: 'Avlyst',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>
      {labels[status]}
    </span>
  )
}

// ─── Booking action buttons (client island) ───────────────────────────────────

function BookingActions({ bookingId, status }: { bookingId: string; status: 'pending' | 'confirmed' | 'cancelled' }) {
  if (status !== 'pending') return null
  return (
    <form className="flex gap-2">
      <button
        formAction={async () => {
          'use server'
          await confirmBooking(bookingId)
        }}
        className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-800 hover:bg-green-200 font-medium transition-colors"
      >
        Bekreft
      </button>
      <button
        formAction={async () => {
          'use server'
          await cancelBooking(bookingId)
        }}
        className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 font-medium transition-colors"
      >
        Avlys
      </button>
    </form>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type BookingWithRelations = {
  id: string
  customer_name: string
  status: 'pending' | 'confirmed' | 'cancelled'
  services: { name: string } | null
  timeslots: { date: string; start_time: string } | null
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const weekEnd = new Date(today)
  weekEnd.setDate(today.getDate() + 7)
  const weekEndStr = weekEnd.toISOString().split('T')[0]

  // Parallel data fetches
  const [
    { count: pendingCount },
    { count: todayCount },
    { count: weekCount },
    { count: unreadMessages },
    { data: upcomingBookings },
    { data: pendingBookings },
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),

    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'confirmed')
      .in(
        'timeslot_id',
        (
          await supabase
            .from('timeslots')
            .select('id')
            .eq('date', todayStr)
        ).data?.map((t) => t.id) ?? []
      ),

    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'confirmed')
      .in(
        'timeslot_id',
        (
          await supabase
            .from('timeslots')
            .select('id')
            .gte('date', todayStr)
            .lte('date', weekEndStr)
        ).data?.map((t) => t.id) ?? []
      ),

    supabase
      .from('contact_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false),

    supabase
      .from('bookings')
      .select('id, customer_name, status, services(name), timeslots(date, start_time)')
      .eq('status', 'confirmed')
      .in(
        'timeslot_id',
        (
          await supabase
            .from('timeslots')
            .select('id')
            .gte('date', todayStr)
            .lte('date', weekEndStr)
            .order('date')
        ).data?.map((t) => t.id) ?? []
      )
      .limit(10)
      .returns<BookingWithRelations[]>(),

    supabase
      .from('bookings')
      .select('id, customer_name, status, services(name), timeslots(date, start_time)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10)
      .returns<BookingWithRelations[]>(),
  ])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
        Dashboard
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Venter på behandling"
          value={pendingCount ?? 0}
          icon={<Clock size={22} className="text-amber-600" />}
          colorClass="bg-amber-100"
        />
        <StatCard
          label="Bekreftet i dag"
          value={todayCount ?? 0}
          icon={<CalendarCheck size={22} className="text-green-600" />}
          colorClass="bg-green-100"
        />
        <StatCard
          label="Bekreftet denne uken"
          value={weekCount ?? 0}
          icon={<CalendarDays size={22} className="text-blue-600" />}
          colorClass="bg-blue-100"
        />
        <StatCard
          label="Uleste meldinger"
          value={unreadMessages ?? 0}
          icon={<Mail size={22} className="text-red-600" />}
          colorClass="bg-red-100"
        />
      </div>

      {/* Upcoming bookings */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Kommende bestillinger</h2>
          <p className="text-xs text-gray-500 mt-0.5">Neste 7 dager – bekreftede</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Kunde</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tjeneste</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Dato</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tid</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {upcomingBookings && upcomingBookings.length > 0 ? (
                upcomingBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 font-medium text-gray-900">{b.customer_name}</td>
                    <td className="px-6 py-3 text-gray-600">{b.services?.name ?? '—'}</td>
                    <td className="px-6 py-3 text-gray-600">
                      {b.timeslots ? formatDate(b.timeslots.date) : '—'}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {b.timeslots ? formatTime(b.timeslots.start_time) : '—'}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">
                    Ingen kommende bestillinger
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending bookings */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Venter på behandling</h2>
          <p className="text-xs text-gray-500 mt-0.5">Nye bestillinger som trenger svar</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Kunde</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tjeneste</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Dato</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tid</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Handlinger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pendingBookings && pendingBookings.length > 0 ? (
                pendingBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 font-medium text-gray-900">{b.customer_name}</td>
                    <td className="px-6 py-3 text-gray-600">{b.services?.name ?? '—'}</td>
                    <td className="px-6 py-3 text-gray-600">
                      {b.timeslots ? formatDate(b.timeslots.date) : '—'}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {b.timeslots ? formatTime(b.timeslots.start_time) : '—'}
                    </td>
                    <td className="px-6 py-3">
                      <BookingActions bookingId={b.id} status={b.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">
                    Ingen ventende bestillinger
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
