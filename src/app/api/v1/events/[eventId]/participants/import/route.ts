import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import * as xlsx from 'xlsx'
import { getUserAuthData } from '@/lib/actions/auth-actions'

export async function POST(request: Request, props: { params: Promise<{ eventId: string }> }) {
  const params = await props.params;
  const eventId = params.eventId;

  if (!eventId) {
    return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
  }

  // Verify Role Assignment
  const authData = await getUserAuthData()
  if (!authData) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isSuperAdmin = authData.role === 'super_admin'
  const isAssigned = authData.assignments.some(
    a => a.event_id === eventId && (a.role === 'event_admin' || a.role === 'registration_admin')
  )

  if (!isSuperAdmin && !isAssigned) {
    return NextResponse.json({ error: 'Forbidden: No access to this event' }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const wb = xlsx.read(buffer, { type: 'buffer' })
    const sheetName = wb.SheetNames[0]
    const ws = wb.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(ws)

    if (data.length === 0) {
      return NextResponse.json({ error: 'Excel file is empty' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // For simplicity, we assume we want to insert into a generic event if not provided,
    // or the excel has an 'event_id' column. In a real app, you'd strictly validate this.
    // Let's just fetch the first event as a fallback
    let fallbackEventId = eventId
    if (!fallbackEventId) {
      const { data: events } = await supabase.from('events').select('id').limit(1)
      if (events && events.length > 0) fallbackEventId = events[0].id
    }

    if (!fallbackEventId) {
      return NextResponse.json({ error: 'No events exist in database to attach participants to.' }, { status: 400 })
    }

    let insertedCount = 0

    // Process each row
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const row of data as any[]) {
      const email = row['Email'] || row['email']
      const name = row['Nama Lengkap'] || row['Nama'] || row['name']
      
      if (!email || !name) continue // Skip invalid rows

      // Normalize
      const emailNormalized = email.toLowerCase().trim()

      // Insert participant (ignore if exists)
      const { data: participant, error: pError } = await supabase
        .from('participants')
        .upsert({
          event_id: fallbackEventId,
          full_name: name,
          email_normalized: emailNormalized,
          phone_number: row['No. Telepon'] || row['phone'] || null,
          organization: row['Institusi/Organisasi'] || row['company'] || null,
          job_title: row['Jabatan'] || row['job_title'] || null,
          registration_source: 'import',
          status: 'active'
        }, { onConflict: 'event_id, email_normalized' })
        .select()
        .single()

      if (participant) {
        insertedCount++
        
        // Ensure ticket exists
        const guestId = `IMP-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase()
        try {
          await supabase
            .from('tickets')
            .insert({
              event_id: fallbackEventId,
              participant_id: participant.id,
              guest_id: guestId,
              qr_token_hash: guestId,
              checkin_code_hash: guestId,
              ticket_status: 'active'
            })
        } catch (e) {
          // Ignore if ticket already exists
        }
      }
    }

    return NextResponse.json({ success: true, inserted: insertedCount })
  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
