import { createClient } from '@/lib/supabase/server'
import ContentManager from '@/components/admin/ContentManager'

export default async function ContentPage() {
  const supabase = await createClient()
  const { data: blocks } = await supabase.from('content_blocks').select('*').order('key')
  return (
    <div className="p-6">
      <h1 className="text-2xl font-heading font-bold mb-6">Innhold</h1>
      <ContentManager blocks={blocks ?? []} />
    </div>
  )
}
