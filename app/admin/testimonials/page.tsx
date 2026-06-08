import { createClient } from '@/lib/supabase/server'
import TestimonialsManager from '@/components/admin/TestimonialsManager'

export interface Testimonial {
  id: string
  author_name: string
  content: string
  rating: number
  is_published: boolean
  sort_order: number
  created_at: string
}

export default async function TestimonialsPage() {
  const supabase = await createClient()
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .order('sort_order')
  return (
    <div className="p-6">
      <h1 className="text-2xl font-heading font-bold mb-6">Omtaler</h1>
      <TestimonialsManager testimonials={testimonials ?? []} />
    </div>
  )
}
