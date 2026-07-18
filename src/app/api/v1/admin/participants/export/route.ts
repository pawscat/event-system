import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import * as xlsx from 'xlsx'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() }
      }
    }
  )

  let query = supabase
    .from('participants')
    .select(`
      id,
      full_name,
      email_normalized,
      phone_number,
      organization,
      job_title,
      status,
      created_at,
      events (name),
      tickets (ticket_status, qr_token_hash, checkin_code_hash),
      attendances (checked_in_at, method)
    `)
    .order('created_at', { ascending: false })

  if (eventId) {
    query = query.eq('event_id', eventId)
  }

  const { data: participants, error } = await query

  if (error || !participants) {
    return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 })
  }

  // Map to flat structure for Excel
  const flatData = participants.map(p => {
    const event = Array.isArray(p.events) ? p.events[0] : p.events
    const ticket = Array.isArray(p.tickets) ? p.tickets[0] : p.tickets
    const attendance = Array.isArray(p.attendances) ? p.attendances[0] : p.attendances

    return {
      'Nama Lengkap': p.full_name,
      'Email': p.email_normalized,
      'No. Telepon': p.phone_number || '',
      'Institusi/Organisasi': p.organization || '',
      'Jabatan': p.job_title || '',
      'Acara': event?.name || '',
      'Status Pendaftaran': p.status,
      'Status Tiket': ticket?.ticket_status || '',
      'Waktu Check-in': attendance?.checked_in_at ? new Date(attendance.checked_in_at).toLocaleString('id-ID') : 'Belum Check-in',
      'Metode Check-in': attendance?.method || '',
      'Waktu Daftar': new Date(p.created_at).toLocaleString('id-ID')
    }
  })

  // Create workbook
  const wb = xlsx.utils.book_new()
  const ws = xlsx.utils.json_to_sheet(flatData)
  xlsx.utils.book_append_sheet(wb, ws, 'Peserta')

  // Generate buffer
  const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' })

  // Send as downloadable file
  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Disposition': `attachment; filename="Data_Peserta_${eventId || 'Semua'}_${new Date().toISOString().split('T')[0]}.xlsx"`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  })
}
