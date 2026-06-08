import { createClient } from '@/lib/supabase/server'
import SocialLinksManager from '@/components/admin/SocialLinksManager'

export default async function SocialPage() {
  const supabase = await createClient()
  const { data: links } = await supabase
    .from('social_links')
    .select('*')
    .order('platform')
  return (
    <div className="p-6">
      <h1 className="text-2xl font-heading font-bold mb-6">Sosiale medier</h1>
      <SocialLinksManager links={links ?? []} />
    </div>
  )
}
