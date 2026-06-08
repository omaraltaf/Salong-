'use client'

import { useState, useMemo, useTransition } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { confirmBooking, cancelBooking } from '@/app/actions/admin'
import { formatDate, formatTime, cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Booking = {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  service_id: string | null
  timeslot_id: string | null
  notes: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
  services: { name: string } | null
  timeslots: { date: string; start_time: string } | null
}

interface BookingsTableProps {
  bookings: Booking[]
}

type FilterTab = 'all' | 'pending' | 'confirmed' | 'cancelled'

const PAGE_SIZE = 20

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Booking['status'] }) {
  const styles: Record<Booking['status'], string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  const labels: Record<Booking['status'], string> = {
    pending: 'Venter',
    confirmed: 'Bekreftet',
    cancelled: 'Avlyst',
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}

// ─── Action buttons ───────────────────────────────────────────────────────────

function ActionButtons({ booking }: { booking: Booking }) {
  const [isPending, startTransition] = useTransition()

  if (booking.status !== 'pending') return <span className="text-gray-400 text-xs">—</span>

  function handleConfirm() {
    startTransition(async () => {
      await confirmBooking(booking.id)
    })
  }

  function handleCancel() {
    startTransition(async () => {
      await cancelBooking(booking.id)
    })
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleConfirm}
        disabled={isPending}
        className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-800 hover:bg-green-200 font-medium transition-colors disabled:opacity-50"
      >
        Bekreft
      </button>
      <button
        onClick={handleCancel}
        disabled={isPending}
        className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 font-medium transition-colors disabled:opacity-50"
      >
        Avlys
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BookingsTable({ bookings }: BookingsTableProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'Alle' },
    { key: 'pending', label: 'Venter' },
    { key: 'confirmed', label: 'Bekreftet' },
    { key: 'cancelled', label: 'Avlyst' },
  ]

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    return bookings.filter((b) => {
      const matchesTab =
        activeTab === 'all' || b.status === activeTab
      const matchesSearch =
        !query ||
        b.customer_name.toLowerCase().includes(query) ||
        b.customer_email.toLowerCase().includes(query)
      return matchesTab && matchesSearch
    })
  }, [bookings, activeTab, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleTabChange(tab: FilterTab) {
    setActiveTab(tab)
    setPage(1)
  }

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Filter tabs */}
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-[#C4A882]/15 text-[#9a7c5f]'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:ml-auto">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Søk på navn eller e-post…"
            className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C4A882]/40 focus:border-[#C4A882] w-64 transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              {['Kunde', 'Tjeneste', 'Dato', 'Tid', 'Telefon', 'Status', 'Handlinger'].map((col) => (
                <th
                  key={col}
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.length > 0 ? (
              paginated.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3">
                    <div className="font-medium text-gray-900">{b.customer_name}</div>
                    <div className="text-xs text-gray-500">{b.customer_email}</div>
                  </td>
                  <td className="px-6 py-3 text-gray-600 whitespace-nowrap">
                    {b.services?.name ?? '—'}
                  </td>
                  <td className="px-6 py-3 text-gray-600 whitespace-nowrap">
                    {b.timeslots ? formatDate(b.timeslots.date) : '—'}
                  </td>
                  <td className="px-6 py-3 text-gray-600 whitespace-nowrap">
                    {b.timeslots ? formatTime(b.timeslots.start_time) : '—'}
                  </td>
                  <td className="px-6 py-3 text-gray-600 whitespace-nowrap">
                    {b.customer_phone}
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-6 py-3">
                    <ActionButtons booking={b} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                  Ingen bestillinger funnet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Viser {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} av{' '}
            {filtered.length} bestillinger
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Forrige side"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis')
                acc.push(p)
                return acc
              }, [])
              .map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item as number)}
                    className={cn(
                      'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                      page === item
                        ? 'bg-[#C4A882] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {item}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Neste side"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
