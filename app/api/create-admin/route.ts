import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * API to create admin user
 * POST /api/create-admin
 * Body: { email, password, secretKey }
 */

const ADMIN_SECRET_KEY = process.env.ADMIN_CREATE_SECRET || 'super-secret-admin-key'

export async function POST(request: Request) {
  try {
    const { email, password, secretKey } = await request.json()

    // Verify secret key
    if (secretKey !== ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Create user with admin role
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Admin user created successfully',
        userId: data.user?.id,
        email: data.user?.email,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}
