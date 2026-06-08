import { createClient } from '@/lib/supabase/server'
import PricingManager from '@/components/admin/PricingManager'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: services } = await supabase
    .from('services')
    .select('*, pricing(*)')
    .eq('is_active', true)
    .order('sort_order')
  return (
    <div className="p-6">
      <h1 className="text-2xl font-heading font-bold mb-6">Priser</h1>
      <PricingManager services={services ?? []} />
    </div>
  )
}
