'use client'

import { useState, useTransition } from 'react'
import { updateOpeningHours } from '@/app/actions/admin'

const DAY_LABELS: Record<number, string> = {
  1: 'Mandag',
  2: 'Tirsdag',
  3: 'Onsdag',
  4: 'Torsdag',
  5: 'Fredag',
  6: 'Lørdag',
  0: 'Søndag',
}

const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

type OpeningHour = {
  id: string
  day_of_week: number
  open_time: string | null
  close_time: string | null
  is_closed: boolean
}

interface HoursManagerProps {
  hours: OpeningHour[]
}

export default function HoursManager({ hours }: HoursManagerProps) {
  const [state, setState] = useState<OpeningHour[]>(
    DISPLAY_ORDER.map((day) => {
      const existing = hours.find((h) => h.day_of_week === day)
      return (
        existing ?? {
          id: '',
          day_of_week: day,
          open_time: '09:00',
          close_time: '17:00',
          is_closed: false,
        }
      )
    })
  )

  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function update(day: number, field: keyof OpeningHour, value: string | boolean) {
    setState((prev) =>
      prev.map((h) =>
        h.day_of_week === day ? { ...h, [field]: value } : h
      )
    )
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateOpeningHours(
        state.map((h) => ({
          ...(h.id ? { id: h.id } : {}),
          day_of_week: h.day_of_week,
          open_time: h.is_closed ? null : h.open_time,
          close_time: h.is_closed ? null : h.close_time,
          is_closed: h.is_closed,
        }))
      )
      if (result.error) {
        setFeedback({ type: 'error', message: result.error })
      } else {
        setFeedback({ type: 'success', message: 'Åpningstider lagret!' })
      }
      setTimeout(() => setFeedback(null), 3000)
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
              <th className="pb-3 font-medium">Dag</th>
              <th className="pb-3 font-medium">Stengt</th>
              <th className="pb-3 font-medium">Åpner</th>
              <th className="pb-3 font-medium">Stenger</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {state.map((hour) => (
              <tr key={hour.day_of_week} className="text-sm">
                <td className="py-4 pr-4 font-medium text-gray-900 w-32">
                  {DAY_LABELS[hour.day_of_week]}
                </td>
                <td className="py-4 pr-6 w-20">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hour.is_closed}
                      onChange={(e) => update(hour.day_of_week, 'is_closed', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30 cursor-pointer"
                    />
                    <span className="text-gray-600 text-xs">Stengt</span>
                  </label>
                </td>
                <td className="py-4 pr-4">
                  <input
                    type="time"
                    value={hour.open_time ?? '09:00'}
                    disabled={hour.is_closed}
                    onChange={(e) => update(hour.day_of_week, 'open_time', e.target.value)}
                    className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </td>
                <td className="py-4">
                  <input
                    type="time"
                    value={hour.close_time ?? '17:00'}
                    disabled={hour.is_closed}
                    onChange={(e) => update(hour.day_of_week, 'close_time', e.target.value)}
                    className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        {feedback ? (
          <p className={`text-sm font-medium ${feedback.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
            {feedback.message}
          </p>
        ) : (
          <span />
        )}
        <button
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Lagrer...' : 'Lagre åpningstider'}
        </button>
      </div>
    </div>
  )
}
