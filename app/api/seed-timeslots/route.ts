import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * API endpoint to seed timeslots for testing
 * GET /api/seed-timeslots?key=your-secret-key
 */

const SEED_SECRET_KEY = process.env.SEED_SECRET_KEY || 'test-seed-key'

const OPENING_TIME = '09:00'
const CLOSING_TIME = '18:00'
const SLOT_DURATION = 60 // 60 minutes per slot

function generateTimeslots() {
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    // Verify secret key
    if (key !== SEED_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Generate timeslots
    const timeslots = generateTimeslots()
    console.log(`Generated ${timeslots.length} timeslots`)

    // Delete existing timeslots
    const { error: deleteError } = await supabase.from('timeslots').delete().gt('id', 0)
    if (deleteError && deleteError.code !== 'PGRST116') {
      console.error('Error deleting timeslots:', deleteError)
      return NextResponse.json({ error: 'Failed to delete existing timeslots' }, { status: 500 })
    }
    console.log('Cleared existing timeslots')

    // Insert timeslots in batches
    const batchSize = 100
    let inserted = 0

    for (let i = 0; i < timeslots.length; i += batchSize) {
      const batch = timeslots.slice(i, i + batchSize)
      const { error: insertError, data } = await supabase.from('timeslots').insert(batch).select()

      if (insertError) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, insertError)
        return NextResponse.json(
          { error: `Failed to insert batch ${Math.floor(i / batchSize) + 1}` },
          { status: 500 }
        )
      }

      inserted += batch.length
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} timeslots)`)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Seed completed successfully!',
        timeslotsCreated: inserted,
        dateRange: {
          start: new Date().toISOString().split('T')[0],
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Seed failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
