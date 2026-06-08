'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { format, addDays, subDays, parseISO, isPast, startOfDay } from 'date-fns'
import { nb } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  createTimeslot,
  createTimeslotsBulk,
  deleteTimeslot,
} from '@/app/actions/admin'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Timeslot {
  id: string
  date: string
  start_time: string
  end_time: string
  is_available: boolean
  created_at: string
  services: { name: string } | null
}

interface Service {
  id: string
  name: string
}

interface Props {
  timeslots: Timeslot[]
  services: Service[]
  weekStart: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEK_DAYS = [
  { label: 'Mandag', index: 0 },
  { label: 'Tirsdag', index: 1 },
  { label: 'Onsdag', index: 2 },
  { label: 'Torsdag', index: 3 },
  { label: 'Fredag', index: 4 },
  { label: 'Lørdag', index: 5 },
  { label: 'Søndag', index: 6 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSlotStatus(slot: Timeslot): 'available' | 'booked' | 'past' {
  const slotDate = parseISO(slot.date)
  if (isPast(startOfDay(addDays(slotDate, 1)))) return 'past'
  if (!slot.is_available) return 'booked'
  return 'available'
}

function isoDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

function generateDatesInRange(
  from: string,
  to: string,
  dayIndexes: number[],
): string[] {
  const start = parseISO(from)
  const end = parseISO(to)
  const dates: string[] = []
  let current = start
  while (current <= end) {
    // getDay() returns 0=Sunday … 6=Saturday; we use Mon=0…Sun=6
    const dayIdx = (current.getDay() + 6) % 7
    if (dayIndexes.includes(dayIdx)) {
      dates.push(isoDate(current))
    }
    current = addDays(current, 1)
  }
  return dates
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusDot({ status }: { status: 'available' | 'booked' | 'past' }) {
  return (
    <span
      className={cn('inline-block w-2.5 h-2.5 rounded-full flex-shrink-0', {
        'bg-green-500': status === 'available',
        'bg-orange-400': status === 'booked',
        'bg-gray-300': status === 'past',
      })}
      title={
        status === 'available'
          ? 'Ledig'
          : status === 'booked'
          ? 'Booket'
          : 'Passert'
      }
    />
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TimeslotsManager({ timeslots, services, weekStart }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // ── Single slot form state ──
  const [singleDate, setSingleDate] = useState('')
  const [singleStart, setSingleStart] = useState('09:00')
  const [singleEnd, setSingleEnd] = useState('10:00')
  const [singleService, setSingleService] = useState('')
  const [singleLoading, setSingleLoading] = useState(false)

  // ── Bulk form state ──
  const [bulkDays, setBulkDays] = useState<number[]>([])
  const [bulkStart, setBulkStart] = useState('09:00')
  const [bulkEnd, setBulkEnd] = useState('10:00')
  const [bulkFrom, setBulkFrom] = useState('')
  const [bulkTo, setBulkTo] = useState('')
  const [bulkService, setBulkService] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)

  // ── Deleting state ──
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ── Week navigation ──
  const weekStartDate = parseISO(weekStart)

  function navigateWeek(direction: 'prev' | 'next') {
    const newStart =
      direction === 'next'
        ? addDays(weekStartDate, 7)
        : subDays(weekStartDate, 7)
    router.push(`/admin/timeslots?weekStart=${isoDate(newStart)}`)
  }

  // ── Group timeslots by date ──
  const byDate = timeslots.reduce<Record<string, Timeslot[]>>((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = []
    acc[slot.date].push(slot)
    return acc
  }, {})

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i))

  // ── Feedback helper ──
  function showFeedback(type: 'success' | 'error', msg: string) {
    setFeedback({ type, msg })
    setTimeout(() => setFeedback(null), 4000)
  }

  // ── Handlers ──
  async function handleAddSingle(e: React.FormEvent) {
    e.preventDefault()
    if (!singleDate || !singleStart || !singleEnd) return
    setSingleLoading(true)
    const result = await createTimeslot({
      date: singleDate,
      start_time: singleStart,
      end_time: singleEnd,
      service_id: singleService || undefined,
    })
    setSingleLoading(false)
    if (result.error) {
      showFeedback('error', result.error)
    } else {
      showFeedback('success', 'Timeslot lagt til!')
      setSingleDate('')
      startTransition(() => router.refresh())
    }
  }

  async function handleAddBulk(e: React.FormEvent) {
    e.preventDefault()
    if (!bulkFrom || !bulkTo || bulkDays.length === 0 || !bulkStart || !bulkEnd) {
      showFeedback('error', 'Fyll ut alle felt og velg minst én dag.')
      return
    }
    const dates = generateDatesInRange(bulkFrom, bulkTo, bulkDays)
    if (dates.length === 0) {
      showFeedback('error', 'Ingen datoer passer de valgte dagene i dette intervallet.')
      return
    }
    setBulkLoading(true)
    const result = await createTimeslotsBulk({
      dates,
      start_time: bulkStart,
      end_time: bulkEnd,
      service_id: bulkService || undefined,
    })
    setBulkLoading(false)
    if (result.error) {
      showFeedback('error', result.error)
    } else {
      showFeedback('success', `${dates.length} timeslot(s) lagt til!`)
      setBulkDays([])
      setBulkFrom('')
      setBulkTo('')
      startTransition(() => router.refresh())
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const result = await deleteTimeslot(id)
    setDeletingId(null)
    if (result.error) {
      showFeedback('error', result.error)
    } else {
      startTransition(() => router.refresh())
    }
  }

  function toggleBulkDay(idx: number) {
    setBulkDays((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx],
    )
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={cn(
            'px-4 py-3 rounded-lg text-sm font-medium',
            feedback.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200',
          )}
        >
          {feedback.msg}
        </div>
      )}

      {/* ── Week navigator ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigateWeek('prev')}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Forrige uke"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-medium text-gray-800">
          {format(weekStartDate, "d. MMM", { locale: nb })}
          {' – '}
          {format(addDays(weekStartDate, 6), "d. MMM yyyy", { locale: nb })}
        </span>
        <button
          onClick={() => navigateWeek('next')}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Neste uke"
        >
          <ChevronRight size={18} />
        </button>
        {isPending && <Loader2 size={16} className="animate-spin text-gray-400" />}
      </div>

      {/* ── Weekly grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDates.map((date, i) => {
          const dateStr = isoDate(date)
          const slots = byDate[dateStr] ?? []
          const dayLabel = WEEK_DAYS[i].label
          const isToday = isoDate(new Date()) === dateStr

          return (
            <div
              key={dateStr}
              className={cn(
                'rounded-xl border bg-white p-3 min-h-[120px]',
                isToday ? 'border-[#C4A882] ring-1 ring-[#C4A882]/30' : 'border-gray-200',
              )}
            >
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {dayLabel}
              </p>
              <p className="text-sm font-medium text-gray-800 mb-3">
                {format(date, 'd. MMM', { locale: nb })}
              </p>

              <div className="space-y-1.5">
                {slots.length === 0 && (
                  <p className="text-xs text-gray-400 italic">Ingen slots</p>
                )}
                {slots.map((slot) => {
                  const status = getSlotStatus(slot)
                  return (
                    <div
                      key={slot.id}
                      className="flex items-center gap-1.5 group text-xs"
                    >
                      <StatusDot status={status} />
                      <span className="text-gray-700 flex-1 leading-tight">
                        {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                        {slot.services && (
                          <span className="block text-gray-400 truncate">
                            {slot.services.name}
                          </span>
                        )}
                      </span>
                      {status === 'available' && (
                        <button
                          onClick={() => handleDelete(slot.id)}
                          disabled={deletingId === slot.id}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 disabled:opacity-40"
                          aria-label="Slett timeslot"
                        >
                          {deletingId === slot.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Forms ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single slot form */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Plus size={16} className="text-[#C4A882]" />
            Legg til enkelt timeslot
          </h2>
          <form onSubmit={handleAddSingle} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Dato
              </label>
              <input
                type="date"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A882]/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Start
                </label>
                <input
                  type="time"
                  value={singleStart}
                  onChange={(e) => setSingleStart(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A882]/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Slutt
                </label>
                <input
                  type="time"
                  value={singleEnd}
                  onChange={(e) => setSingleEnd(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A882]/40"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tjeneste (valgfritt)
              </label>
              <select
                value={singleService}
                onChange={(e) => setSingleService(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A882]/40"
              >
                <option value="">Alle tjenester</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={singleLoading}
              className="w-full py-2 px-4 bg-[#C4A882] hover:bg-[#b39372] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {singleLoading && <Loader2 size={14} className="animate-spin" />}
              Legg til timeslot
            </button>
          </form>
        </div>

        {/* Bulk form */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Plus size={16} className="text-[#C4A882]" />
            Legg til mange timeslots
          </h2>
          <form onSubmit={handleAddBulk} className="space-y-3">
            {/* Day checkboxes */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Dager
              </label>
              <div className="flex flex-wrap gap-2">
                {WEEK_DAYS.map(({ label, index }) => (
                  <label
                    key={index}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs cursor-pointer transition-colors select-none',
                      bulkDays.includes(index)
                        ? 'bg-[#C4A882] border-[#C4A882] text-white'
                        : 'border-gray-200 text-gray-600 hover:border-[#C4A882]/50',
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={bulkDays.includes(index)}
                      onChange={() => toggleBulkDay(index)}
                    />
                    {label.slice(0, 3)}
                  </label>
                ))}
              </div>
            </div>

            {/* Time range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Start
                </label>
                <input
                  type="time"
                  value={bulkStart}
                  onChange={(e) => setBulkStart(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A882]/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Slutt
                </label>
                <input
                  type="time"
                  value={bulkEnd}
                  onChange={(e) => setBulkEnd(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A882]/40"
                />
              </div>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Fra dato
                </label>
                <input
                  type="date"
                  value={bulkFrom}
                  onChange={(e) => setBulkFrom(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A882]/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Til dato
                </label>
                <input
                  type="date"
                  value={bulkTo}
                  onChange={(e) => setBulkTo(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A882]/40"
                />
              </div>
            </div>

            {/* Service */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tjeneste (valgfritt)
              </label>
              <select
                value={bulkService}
                onChange={(e) => setBulkService(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A882]/40"
              >
                <option value="">Alle tjenester</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={bulkLoading}
              className="w-full py-2 px-4 bg-[#C4A882] hover:bg-[#b39372] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {bulkLoading && <Loader2 size={14} className="animate-spin" />}
              Generer timeslots
            </button>
          </form>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
          Ledig
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
          Booket
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" />
          Passert
        </span>
      </div>
    </div>
  )
}
