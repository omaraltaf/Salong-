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

  const content = (key: string, fallback = '') =>
    contentBlocks?.find(b => b.key === key)?.value ?? fallback

  const heroImage = gallery?.find(g => g.section === 'hero')?.url
  const aboutImage = gallery?.find(g => g.section === 'about')?.url

  return (
    <main className="bg-[var(--color-background)] text-[var(--color-foreground)]">
      <Navbar />
      <Hero
        headline={content('hero_headline', 'Velkommen til Blue Point')}
        subheading={content('hero_subheading', 'Frisyre, farge og styling med ekte kvalitet')}
        heroImageUrl={heroImage}
      />
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-14 md:px-8">
        <section className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-4 py-2 text-sm font-semibold text-[var(--color-primary)]">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
              Skedsmokorset • Moderne salong • Trygg booking
            </div>
            <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-[var(--color-foreground)] sm:text-4xl">
              Alt du trenger for en fresh, tidløs look — uten kompromiss.
            </h2>
            <p className="max-w-xl text-base leading-7 text-[var(--color-foreground)]/70 sm:text-lg">
              Blue Point leverer personlig rådgivning, premium hårpleie og en profesjonell behandling hver gang. Vi gjør det enkelt å booke, få riktig klipp og føle seg hjemme i stolen.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl  bg-[var(--color-secondary)] p-6 shadow-lg shadow-black/30 flex flex-col">
                <p className="text-lg font-semibold text-[var(--color-foreground)] flex-1">Ekspertteam med kunnskap om alle hårtyper</p>
                <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-foreground)]/60 mt-4">Høydepunkter</p>
              </div>
              <div className="rounded-2xl  bg-[var(--color-secondary)] p-6 shadow-lg shadow-black/30 flex flex-col">
                <p className="text-lg font-semibold text-[var(--color-foreground)] flex-1">Rask time, trygg behandling, resultater du kan føle</p>
                <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-foreground)]/60 mt-4">Service</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 rounded-[2rem] bg-[var(--color-secondary)] p-6 shadow-lg shadow-black/30 sm:p-8 flex flex-col">
            <div className="flex-1">
              <div className="mt-3 grid gap-2 text-sm text-[var(--color-foreground)]/80">
                <span>Mandag - Fredag: 09:00 - 18:00</span>
                <span>Lørdag: 09:00 - 15:00</span>
                <span>Søndag: Stengt</span>
              </div>
            </div>
            <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-foreground)]/60 mt-4">Åpningstider</p>
            <div className="rounded-2xl bg-[var(--color-secondary)] p-6 shadow-lg shadow-black/30">
              <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-foreground)]/60">Bestill raskt</p>
              <p className="mt-4 text-xl font-semibold text-[var(--color-foreground)]">Book time direkte i dag — eller ring oss for raskeste respons.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#booking" className="inline-flex rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-black transition hover:opacity-95">
                  Book time
                </a>
                <a href="#contact" className="inline-flex rounded-full bg-[var(--color-secondary)] px-6 py-3 text-sm font-semibold text-[var(--color-accent)] transition hover:bg-[var(--color-secondary)]/80">
                  Kontakt oss
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
      <About heading={content('about_heading', 'Om Blue Point')} text={content('about_text', '')} imageUrl={aboutImage} />
      <Services services={services ?? []} />
      <Pricing services={servicesWithPricing ?? []} />
      <Booking services={services ?? []} initialTimeslots={timeslots ?? []} bookingWindowDays={salonConfig.bookingWindowDays} />
      <Testimonials testimonials={testimonials ?? []} />
      <Contact heading={content('contact_heading', 'Ta kontakt')} subheading={content('contact_subheading', 'Book en time eller send oss en melding')} openingHours={openingHours ?? []} socialLinks={socialLinks ?? []} />
      <Footer tagline={content('footer_tagline', 'Profesjonell hårpleie med personlig touch siden 1986.')} socialLinks={socialLinks ?? []} />
    </main>
  )
}
