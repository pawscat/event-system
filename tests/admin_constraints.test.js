const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Load environment variables manually
const envPath = path.join(__dirname, '../.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (match) {
      let val = match[2] || ''
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
      else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1)
      process.env[match[1]] = val
    }
  })
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function runTests() {
  console.log('--- Mulai Testing Constraint Admin ---')
  
  // Asumsi ada 2 event di DB
  const { data: events } = await supabase.from('events').select('id').limit(2)
  if (!events || events.length < 2) {
    console.log('Test butuh minimal 2 event aktif di database.')
    return
  }

  const event1 = events[0].id
  const event2 = events[1].id

  // 1. Cek User yang sudah ada
  const email = 'test.admin.constraint@eventku.com'
  let { data: user } = await supabase.from('users').select('id').eq('email', email).single()

  if (!user) {
    // Buat dummy user
    const { data: newUser } = await supabase.from('users').insert({
      email,
      full_name: 'Test Constraint',
      role: 'admin',
      status: 'active'
    }).select().single()
    user = newUser
  }

  console.log('1. Menugaskan ke Event 1...')
  // Hapus semua assignment user ini agar bersih
  await supabase.from('event_staff_assignments').delete().eq('user_id', user.id)

  const { error: err1 } = await supabase.from('event_staff_assignments').insert({
    event_id: event1,
    user_id: user.id,
    role: 'registration_admin',
    status: 'active'
  })

  if (err1) {
    console.error('X Gagal assign ke Event 1:', err1.message)
  } else {
    console.log('V Berhasil assign ke Event 1')
  }

  console.log('2. Mencoba menugaskan ke Event 2 (Harus GAGAL karena status Event 1 masih active)')
  const { error: err2 } = await supabase.from('event_staff_assignments').insert({
    event_id: event2,
    user_id: user.id,
    role: 'scanner_admin',
    status: 'active'
  })

  if (err2) {
    console.log('V Gagal menugaskan ke event kedua (Sesuai Aturan):', err2.message)
  } else {
    console.error('X FATAL: Berhasil menugaskan ke event kedua! Constraint database gagal.')
  }

  console.log('3. Menonaktifkan Event 1...')
  await supabase.from('event_staff_assignments').update({ status: 'inactive' }).eq('user_id', user.id).eq('event_id', event1)

  console.log('4. Mencoba menugaskan ke Event 2 kembali (Harus BERHASIL)')
  const { error: err3 } = await supabase.from('event_staff_assignments').insert({
    event_id: event2,
    user_id: user.id,
    role: 'scanner_admin',
    status: 'active'
  })

  if (err3) {
    console.error('X Gagal assign ke Event 2:', err3.message)
  } else {
    console.log('V Berhasil assign ke Event 2 setelah assignment lama dinonaktifkan!')
  }

  console.log('--- Testing Selesai ---')
  process.exit(0)
}

runTests().catch(console.error)
