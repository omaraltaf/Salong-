import { createClient } from '@/lib/supabase/server'
import TimeslotsManager from '@/components/admin/TimeslotsManager'

export default async function TimeslotsPage({
  searchParams,
}: {
  searchParams: { weekStart?: string }
}) {
  const supabase = await createClient()

  // Determine week start: from query param or default to current Monday
  let weekStart: Date
  if (searchParams.weekStart) {
    weekStart = new Date(searchParams.weekStart)
  } else {
    const today = new Date()
    weekStart = new Date(today)
    // ISO week: Monday = 1, Sunday = 0 → offset to Monday
    const dayOfWeek = today.getDay()
    const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    weekStart.setDate(today.getDate() + offsetToMonday)
  }

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const weekStartStr = weekStart.toISOString().split('T')[0]
  const weekEndStr = weekEnd.toISOString().split('T')[0]

  const { data: timeslots } = await supabase
    .from('timeslots')
    .select('*, services(name)')
    .gte('date', weekStartStr)
    .lte('date', weekEndStr)
    .order('date')
    .order('start_time')

  const { data: services } = await supabase
    .from('services')
    .select('id, name')
    .eq('is_active', true)
    .order('sort_order')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Timeslots</h1>
      <TimeslotsManager
        timeslots={timeslots ?? []}
        services={services ?? []}
        weekStart={weekStartStr}
      />
    </div>
  )
}
