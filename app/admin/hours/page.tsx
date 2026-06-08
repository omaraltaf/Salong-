import { createClient } from '@/lib/supabase/server'
import HoursManager from '@/components/admin/HoursManager'
import type { OpeningHoursRow } from '@/types/database'

export default async function HoursPage() {
  const supabase = await createClient()

  const { data: hours } = await supabase
    .from('opening_hours')
    .select('*')
    .order('day_of_week')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Åpningstider</h1>
      <HoursManager hours={(hours ?? []) as OpeningHoursRow[]} />
    </div>
  )
}
