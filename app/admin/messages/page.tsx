import { createClient } from '@/lib/supabase/server'
import MessagesTable from '@/components/admin/MessagesTable'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: messages } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })
  return (
    <div className="p-6">
      <h1 className="text-2xl font-heading font-bold mb-6">Meldinger</h1>
      <MessagesTable messages={messages ?? []} />
    </div>
  )
}
