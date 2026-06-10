import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Production Database Seeder
 * Populates Supabase with test data for end-to-end testing
 */

// Load env from .env.local
const envPath = path.join(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env: Record<string, string> = {}

envContent.split('\n').forEach((line) => {
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=')
    if (key) {
      const value = valueParts.join('=').split('#')[0].trim()
      if (key.trim() && value) {
        env[key.trim()] = value
      }
    }
  }
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

console.log(`🔗 Connecting to: ${supabaseUrl}`)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedTimeslots() {
  console.log('\n📅 Seeding Timeslots...')

  const timeslots = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Generate 30 days of timeslots
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(today)
    date.setDate(date.getDate() + dayOffset)
    const dayOfWeek = date.getDay()

    // Skip Sundays
    if (dayOfWeek === 0) continue

    const dateStr = date.toISOString().split('T')[0]

    // 9:00 AM to 6:00 PM, 60-minute slots
    for (let hour = 9; hour < 18; hour++) {
      timeslots.push({
        date: dateStr,
        start_time: `${hour.toString().padStart(2, '0')}:00`,
        end_time: `${(hour + 1).toString().padStart(2, '0')}:00`,
        is_available: true,
      })
    }
  }

  // Clear existing
  await supabase.from('timeslots').delete().gt('id', 0)

  // Insert in batches
  for (let i = 0; i < timeslots.length; i += 100) {
    const batch = timeslots.slice(i, i + 100)
    const { error } = await supabase.from('timeslots').insert(batch)
    if (error) {
      console.error('❌ Error inserting timeslots:', error)
      process.exit(1)
    }
  }

  console.log(`✅ Created ${timeslots.length} timeslots`)
}

async function seedTestimonials() {
  console.log('\n⭐ Seeding Testimonials...')

  const testimonials = [
    {
      author_name: 'Kari Johnsen',
      content: 'Fantastisk opplevelse! Frisørene er veldig dyktige og hyggelige. Jeg har vært hos dem flere ganger og er alltid fornøyd.',
      rating: 5,
      is_published: true,
      sort_order: 1,
    },
    {
      author_name: 'Per Hansen',
      content: 'Beste frisøren jeg har vært på. Skikkelig god kutting og stilig farge. Anbefaler sterkt!',
      rating: 5,
      is_published: true,
      sort_order: 2,
    },
    {
      author_name: 'Anna Olsen',
      content: 'Veldig imøtekommende og profesjonelt. De hørte på hva jeg ville og leverte perfekt resultat.',
      rating: 5,
      is_published: true,
      sort_order: 3,
    },
    {
      author_name: 'Marte Berg',
      content: 'Kjempefin atmosfære og utrolig dyktig personal. Har blitt min favoritt frisør!',
      rating: 5,
      is_published: true,
      sort_order: 4,
    },
    {
      author_name: 'Lars Eriksen',
      content: 'Rask service og høy kvalitet. Prisen er rimelig for den kvaliteten man får. Kommer tilbake!',
      rating: 5,
      is_published: true,
      sort_order: 5,
    },
  ]

  // Clear existing
  await supabase.from('testimonials').delete().gt('id', 0)

  const { error } = await supabase.from('testimonials').insert(testimonials)
  if (error) {
    console.error('❌ Error inserting testimonials:', error)
    process.exit(1)
  }

  console.log(`✅ Created ${testimonials.length} testimonials`)
}

async function seedGallery() {
  console.log('\n🖼️ Seeding Gallery Images...')

  const gallery = [
    {
      section: 'hero',
      url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80',
      sort_order: 1,
      is_active: true,
    },
    {
      section: 'about',
      url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
      sort_order: 1,
      is_active: true,
    },
    {
      section: 'gallery',
      url: 'https://images.unsplash.com/photo-1517852716899-b0d1cfaf1e66?w=600&q=80',
      sort_order: 1,
      is_active: true,
    },
    {
      section: 'gallery',
      url: 'https://images.unsplash.com/photo-1519074069444-1ba904ff2722?w=600&q=80',
      sort_order: 2,
      is_active: true,
    },
    {
      section: 'gallery',
      url: 'https://images.unsplash.com/photo-1549465220-1a2991c509d4?w=600&q=80',
      sort_order: 3,
      is_active: true,
    },
  ]

  // Clear existing gallery
  await supabase.from('gallery').delete().gt('id', 0)

  const { error } = await supabase.from('gallery').insert(gallery)
  if (error) {
    console.error('❌ Error inserting gallery:', error)
    process.exit(1)
  }

  console.log(`✅ Created ${gallery.length} gallery images`)
}

async function seedOpeningHours() {
  console.log('\n⏰ Seeding Opening Hours...')

  const openingHours = [
    { day_of_week: 1, open_time: '09:00', close_time: '18:00', is_closed: false }, // Monday
    { day_of_week: 2, open_time: '09:00', close_time: '18:00', is_closed: false }, // Tuesday
    { day_of_week: 3, open_time: '09:00', close_time: '18:00', is_closed: false }, // Wednesday
    { day_of_week: 4, open_time: '09:00', close_time: '18:00', is_closed: false }, // Thursday
    { day_of_week: 5, open_time: '09:00', close_time: '18:00', is_closed: false }, // Friday
    { day_of_week: 6, open_time: '09:00', close_time: '15:00', is_closed: false }, // Saturday
    { day_of_week: 0, open_time: null, close_time: null, is_closed: true }, // Sunday
  ]

  // Clear existing
  await supabase.from('opening_hours').delete().gt('id', 0)

  const { error } = await supabase.from('opening_hours').insert(openingHours)
  if (error) {
    console.error('❌ Error inserting opening hours:', error)
    process.exit(1)
  }

  console.log(`✅ Created ${openingHours.length} opening hour entries`)
}

async function seedContentBlocks() {
  console.log('\n📝 Seeding Content Blocks...')

  const contentBlocks = [
    {
      key: 'about_heading',
      value: 'Om Blue Point',
    },
    {
      key: 'about_text',
      value: `<p>Blue Point Frisørsalong har vært en del av Skedsmokorset siden 1986. Vi er kjent for vår profesjonelle service, dyktige frisører og personlig touch.</p>
<p>Vi tilbyr et bredt spekter av hårpleieprodukter og tjenester for både damer, herrer og barn. Vårt mål er at du skal forlate salongen følelse deg flott og fornøyd.</p>`,
    },
    {
      key: 'contact_heading',
      value: 'Ta kontakt',
    },
    {
      key: 'contact_subheading',
      value: 'Book en time eller send oss en melding',
    },
    {
      key: 'footer_tagline',
      value: 'Profesjonell hårpleie med personlig touch siden 1986.',
    },
  ]

  // Upsert content blocks (update if exists, insert if not)
  const { error } = await supabase.from('content_blocks').upsert(contentBlocks, { onConflict: 'key' })
  if (error) {
    console.error('❌ Error inserting content blocks:', error)
    process.exit(1)
  }

  console.log(`✅ Created ${contentBlocks.length} content blocks`)
}

async function seedSocialLinks() {
  console.log('\n📱 Seeding Social Links...')

  const socialLinks = [
    {
      platform: 'Facebook',
      url: 'https://facebook.com/bluepointfrisor',
      is_active: true,
    },
    {
      platform: 'Instagram',
      url: 'https://instagram.com/bluepointfrisor',
      is_active: true,
    },
    {
      platform: 'Google',
      url: 'https://google.com/maps/place/Blue+Point+Fris%C3%B8rsalong',
      is_active: true,
    },
  ]

  // Clear existing
  await supabase.from('social_links').delete().gt('id', 0)

  const { error } = await supabase.from('social_links').insert(socialLinks)
  if (error) {
    console.error('❌ Error inserting social links:', error)
    process.exit(1)
  }

  console.log(`✅ Created ${socialLinks.length} social links`)
}

async function main() {
  console.log('🌱 Starting Database Seed...')
  console.log('=' .repeat(50))

  try {
    await seedTimeslots()
    await seedTestimonials()
    await seedGallery()
    await seedOpeningHours()
    await seedContentBlocks()
    await seedSocialLinks()

    console.log('\n' + '='.repeat(50))
    console.log('✨ Database seed completed successfully!')
    console.log('\n✅ You can now:')
    console.log('   • View available timeslots in booking')
    console.log('   • Test the entire booking flow')
    console.log('   • See testimonials on the page')
    console.log('   • Access admin panel to manage everything')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

main()
