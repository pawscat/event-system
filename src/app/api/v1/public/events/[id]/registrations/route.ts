import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const eventId = params.id
  
  try {
    const body = await request.json()
    const { fullName, email, phone, institution, jobTitle, privacyPolicy } = body

    if (!fullName || !email || !phone || !privacyPolicy) {
      return NextResponse.json({ 
        error: { code: 'VALIDATION_ERROR', message: 'Semua field wajib diisi.' }
      }, { status: 422 })
    }

    const emailNormalized = email.toLowerCase().trim()

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for public API to bypass RLS
      {
        cookies: {
          getAll() { return cookieStore.getAll() }
        }
      }
    )

    // Check if event is valid and open
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select('status, registration_open_at, registration_close_at, capacity')
      .eq('id', eventId)
      .single()

    if (!event || event.status !== 'published') {
      return NextResponse.json({ error: { code: 'EVENT_NOT_FOUND', message: 'Acara tidak tersedia.' } }, { status: 404 })
    }

    const now = new Date()
    if (event.registration_open_at && new Date(event.registration_open_at) > now) {
      return NextResponse.json({ error: { code: 'REGISTRATION_CLOSED', message: 'Pendaftaran belum dibuka.' } }, { status: 400 })
    }
    if (event.registration_close_at && new Date(event.registration_close_at) < now) {
      return NextResponse.json({ error: { code: 'REGISTRATION_CLOSED', message: 'Pendaftaran sudah ditutup.' } }, { status: 400 })
    }

    // Check capacity (simplified check, no transaction lock here)
    const { count } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .not('status', 'eq', 'cancelled')

    if (event.capacity && count !== null && count >= event.capacity) {
      return NextResponse.json({ error: { code: 'EVENT_FULL', message: 'Kapasitas acara sudah penuh.' } }, { status: 400 })
    }

    // Check email uniqueness
    const { data: existingParticipant } = await supabase
      .from('participants')
      .select('id')
      .eq('event_id', eventId)
      .eq('email_normalized', emailNormalized)
      .single()

    if (existingParticipant) {
      return NextResponse.json({ error: { code: 'EMAIL_REGISTERED', message: 'Email sudah terdaftar untuk acara ini.' } }, { status: 409 })
    }

    // Generate secure ticket tokens
    const guestId = 'GST-' + crypto.randomBytes(4).toString('hex').toUpperCase()
    const qrToken = crypto.randomBytes(32).toString('hex')
    const checkinCode = crypto.randomBytes(4).toString('hex').toUpperCase()
    
    // Hash tokens
    const salt = process.env.SECURITY_SALT || 'default-salt-for-dev'
    const qrTokenHash = crypto.createHmac('sha256', salt).update(qrToken).digest('hex')
    const checkinCodeHash = crypto.createHmac('sha256', salt).update(checkinCode).digest('hex')

    // Begin simulated transaction via Supabase RPC or sequential inserts (Supabase JS doesn't do real transactions without RPC)
    // For MVP, sequential insert is acceptable if we handle cleanup on failure. 
    // Ideally we use RPC for atomic insert. Let's do sequential for now.
    
    // 1. Insert Participant
    const { data: participant, error: partError } = await supabase
      .from('participants')
      .insert({
        event_id: eventId,
        full_name: fullName,
        email_normalized: emailNormalized,
        phone_number: phone,
        organization: institution || null,
        job_title: jobTitle || null,
        privacy_consent_at: new Date().toISOString(),
        registration_source: 'public_form',
        status: 'active'
      })
      .select()
      .single()

    if (partError) {
      console.error(partError)
      return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Gagal membuat peserta.' } }, { status: 500 })
    }

    // 2. Insert Ticket
    const { error: ticketError } = await supabase
      .from('tickets')
      .insert({
        event_id: eventId,
        participant_id: participant.id,
        guest_id: guestId,
        qr_token_hash: qrTokenHash,
        checkin_code_hash: checkinCodeHash,
        ticket_status: 'active',
        qr_version: 1
      })

    if (ticketError) {
      // Rollback participant
      await supabase.from('participants').delete().eq('id', participant.id)
      return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Gagal membuat tiket.' } }, { status: 500 })
    }

    // 3. Queue Email Job (Outbox pattern)
    // Find ticket delivery template
    const { data: template } = await supabase
      .from('email_templates')
      .select('id')
      .eq('event_id', eventId)
      .eq('type', 'ticket_delivery')
      .single()

    await supabase
      .from('email_messages')
      .insert({
        event_id: eventId,
        participant_id: participant.id,
        template_id: template?.id || null,
        message_type: 'ticket',
        recipient_email: emailNormalized,
        status: 'queued'
      })

    // Return success. Do NOT return the raw QR token in the API response payload, 
    // it will be sent via email or shown if necessary, but here we just return success.
    return NextResponse.json({ 
      success: true, 
      message: 'Pendaftaran berhasil.',
      guestId 
    })
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message: errorMessage } }, { status: 500 })
  }
}
