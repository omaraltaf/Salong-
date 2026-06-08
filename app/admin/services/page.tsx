import { createClient } from '@/lib/supabase/server'
import ServicesManager from '@/components/admin/ServicesManager'
import type { ServiceRow } from '@/types/database'

export default async function ServicesPage() {
  const supabase = await createClient()

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('sort_order')
    .order('name')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tjenester</h1>
      <ServicesManager services={(services ?? []) as ServiceRow[]} />
    </div>
  )
}
