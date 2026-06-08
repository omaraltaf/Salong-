import { createClient } from '@/lib/supabase/server'
import GalleryManager from '@/components/admin/GalleryManager'

export default async function GalleryPage() {
  const supabase = await createClient()
  const { data: items } = await supabase
    .from('gallery')
    .select('*')
    .order('sort_order')
  return (
    <div className="p-6">
      <h1 className="text-2xl font-heading font-bold mb-6">Galleri</h1>
      <GalleryManager items={items ?? []} />
    </div>
  )
}
