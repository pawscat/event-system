import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(
  request: Request,
  props: { params: Promise<{ eventId: string }> }
) {
  const params = await props.params;
  const { eventId } = params;

  try {
    const { code, method = 'qr' } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Kode tidak valid' }, { status: 400 })
    }

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

    // 1. Check user auth and role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (method === 'manual') {
      const { data: assignment } = await supabase
        .from('event_staff_assignments')
        .select('manual_checkin_allowed')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()
      
      if (!assignment?.manual_checkin_allowed) {
        return NextResponse.json({ error: 'Anda tidak diizinkan melakukan check-in manual' }, { status: 403 })
      }
    }

    // 2. Find ticket based on the code (assuming the code is guest_id for now)
    // You could also match checkin_code_hash if it's manual checkin
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, participant_id, ticket_status, guest_id')
      .eq('event_id', eventId)
      .eq('guest_id', code)
      .single()

    if (ticketError || !ticket) {
      // Maybe try checking if it's a manual code (checkin_code_hash)
      return NextResponse.json({ error: 'Tiket tidak ditemukan' }, { status: 404 })
    }

    if (ticket.ticket_status !== 'active') {
      return NextResponse.json({ error: 'Tiket tidak aktif / sudah dibatalkan' }, { status: 400 })
    }

    // 2. Check if already checked in
    const { data: existingAttendance } = await supabase
      .from('attendances')
      .select('id, checked_in_at')
      .eq('ticket_id', ticket.id)
      .single()

    if (existingAttendance) {
      return NextResponse.json({ 
        error: 'Peserta sudah check-in',
        checked_in_at: existingAttendance.checked_in_at
      }, { status: 400 })
    }

    // 3. Record attendance
    const { error: insertError } = await supabase
      .from('attendances')
      .insert({
        event_id: eventId,
        participant_id: ticket.participant_id,
        ticket_id: ticket.id,
        method: method, // 'qr' or 'manual'
        checked_in_by: user.id
      })

    if (insertError) {
      console.error('Checkin Error:', insertError)
      return NextResponse.json({ error: 'Gagal melakukan check-in' }, { status: 500 })
    }

    // 4. Get Participant Details for success response
    const { data: participant } = await supabase
      .from('participants')
      .select('full_name, organization')
      .eq('id', ticket.participant_id)
      .single()

    return NextResponse.json({ 
      success: true, 
      message: 'Check-in berhasil',
      participant: {
        name: participant?.full_name,
        organization: participant?.organization,
        guest_id: ticket.guest_id
      }
    })

  } catch (error: any) {
    console.error('Scan Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
