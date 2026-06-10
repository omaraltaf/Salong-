#!/usr/bin/env node

/**
 * Seed script to populate timeslots for testing
 * Run with: node scripts/seed-timeslots.js
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = {}

envContent.split('\n').forEach((line) => {
  if (line && !line.startsWith('#')) {
    const [key, value] = line.split('=')
    if (key && value) {
      envVars[key.trim()] = value.split('#')[0].trim()
    }
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Define opening hours (9:00 - 18:00)
const OPENING_TIME = '09:00'
const CLOSING_TIME = '18:00'
const SLOT_DURATION = 60 // 60 minutes per slot

async function generateTimeslots() {
  const timeslots = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Generate timeslots for next 30 days
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(today)
    date.setDate(date.getDate() + dayOffset)
    const dayOfWeek = date.getDay()

    // Skip Sundays (0)
    if (dayOfWeek === 0) continue

    const dateStr = date.toISOString().split('T')[0]

    // Generate time slots from 9:00 to 18:00
    const [openHour, openMin] = OPENING_TIME.split(':').map(Number)
    const [closeHour, closeMin] = CLOSING_TIME.split(':').map(Number)

    let currentHour = openHour
    let currentMin = openMin

    while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
      const startTime = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`
      currentMin += SLOT_DURATION

      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60)
        currentMin = currentMin % 60
      }

      const endTime = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`

      // Only add if end time is before closing time
      if (currentHour < closeHour || (currentHour === closeHour && currentMin <= closeMin)) {
        timeslots.push({
          date: dateStr,
          start_time: startTime,
          end_time: endTime,
          is_available: true,
        })
      }
    }
  }

  return timeslots
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting seed...')

    // Generate timeslots
    const timeslots = await generateTimeslots()
    console.log(`📅 Generated ${timeslots.length} timeslots`)

    // Delete existing timeslots
    const { error: deleteError } = await supabase.from('timeslots').delete().gt('id', 0)
    if (deleteError && deleteError.code !== 'PGRST116') {
      console.error('❌ Error deleting timeslots:', deleteError)
      process.exit(1)
    }
    console.log('🗑️  Cleared existing timeslots')

    // Insert timeslots in batches
    const batchSize = 100
    for (let i = 0; i < timeslots.length; i += batchSize) {
      const batch = timeslots.slice(i, i + batchSize)
      const { error: insertError } = await supabase.from('timeslots').insert(batch)

      if (insertError) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, insertError)
        process.exit(1)
      }
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} timeslots)`)
    }

    console.log('✨ Seed completed successfully!')
    console.log(`📊 Total timeslots created: ${timeslots.length}`)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

seedDatabase()
