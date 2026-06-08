import { createClient } from '@/lib/supabase/server'
import { salonConfig } from '@/config/salon.config'
import Navbar from '@/components/sections/Navbar'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Services from '@/components/sections/Services'
import Pricing from '@/components/sections/Pricing'
import Booking from '@/components/sections/Booking'
import Testimonials from '@/components/sections/Testimonials'
import Contact from '@/components/sections/Contact'
import Footer from '@/components/sections/Footer'

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch all data in parallel
  const [
    { data: contentBlocks },
    { data: services },
    { data: servicesWithPricing },
    { data: timeslots },
    { data: testimonials },
    { data: gallery },
    { data: openingHours },
    { data: socialLinks },
  ] = await Promise.all([
    supabase.from('content_blocks').select('*'),
    supabase.from('services').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('services').select('*, pricing(*)').eq('is_active', true).order('sort_order'),
    supabase.from('timeslots').select('*').eq('is_available', true).gte('date', new Date().toISOString().split('T')[0]),
    supabase.from('testimonials').select('*').eq('is_published', true).order('sort_order'),
    supabase.from('gallery').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('opening_hours').select('*').order('day_of_week'),
    supabase.from('social_links').select('*').eq('is_active', true),
  ])

  // Helper to get content block value
  const content = (key: string, fallback = '') =>
    contentBlocks?.find(b => b.key === key)?.value ?? fallback

  const heroImage = gallery?.find(g => g.section === 'hero')?.url
  const aboutImage = gallery?.find(g => g.section === 'about')?.url

  return (
    <main>
      <Navbar />
      <Hero
        headline={content('hero_headline', 'Din lokale frisør i Skedsmokorset')}
        subheading={content('hero_subheading', 'Profesjonell hårpleie med personlig service')}
        heroImageUrl={heroImage}
      />
      <About
        heading={content('about_heading', 'Om Blue Point')}
        text={content('about_text', '')}
        imageUrl={aboutImage}
      />
      <Services services={services ?? []} />
      <Pricing services={servicesWithPricing ?? []} />
      <Booking
        services={services ?? []}
        initialTimeslots={timeslots ?? []}
        bookingWindowDays={salonConfig.bookingWindowDays}
      />
      <Testimonials testimonials={testimonials ?? []} />
      <Contact
        heading={content('contact_heading', 'Ta kontakt')}
        subheading={content('contact_subheading', 'Book en time eller send oss en melding')}
        openingHours={openingHours ?? []}
        socialLinks={socialLinks ?? []}
      />
      <Footer
        tagline={content('footer_tagline', 'Profesjonell hårpleie med personlig touch siden 1986.')}
        socialLinks={socialLinks ?? []}
      />
    </main>
  )
}
