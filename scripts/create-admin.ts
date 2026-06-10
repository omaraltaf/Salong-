import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Create admin user for the salon
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
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Default admin credentials
const ADMIN_EMAIL = 'admin@bluepoint.no'
const ADMIN_PASSWORD = 'BluePont2024!' // Change this!

async function createAdmin() {
  try {
    console.log('👤 Creating admin user...')

    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    })

    if (error) {
      if (error.message.includes('already exists') || error.code === 'email_exists') {
        console.log('⚠️  Admin user already exists')
        console.log('\n✅ Admin credentials:')
        console.log(`   Email:    ${ADMIN_EMAIL}`)
        console.log(`   Password: ${ADMIN_PASSWORD}`)
        return
      }
      throw error
    }

    console.log('✅ Admin user created successfully!')
    console.log('\n📋 Admin credentials:')
    console.log(`   Email:    ${ADMIN_EMAIL}`)
    console.log(`   Password: ${ADMIN_PASSWORD}`)
    console.log(`   User ID:  ${data.user?.id}`)
    console.log('\n🔒 Keep these credentials safe!')
    console.log('   Login at: /admin/login')
  } catch (error) {
    console.error('❌ Error creating admin:', error)
    process.exit(1)
  }
}

createAdmin()
