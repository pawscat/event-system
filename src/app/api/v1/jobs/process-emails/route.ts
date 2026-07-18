import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

// This endpoint could be triggered by Vercel Cron or Supabase pg_cron
export async function GET(request: Request) {
  // Use Service Role to bypass RLS for background jobs
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Fetch up to 50 queued emails
  const { data: messages, error: fetchError } = await supabase
    .from('email_messages')
    .select(`
      id,
      recipient_email,
      message_type,
      attempt_count,
      participants (full_name),
      events (name),
      email_templates (subject, body)
    `)
    .eq('status', 'queued')
    .limit(50)

  if (fetchError) {
    console.error('Failed to fetch queued emails:', fetchError)
    return NextResponse.json({ error: 'Database fetch failed' }, { status: 500 })
  }

  if (!messages || messages.length === 0) {
    return NextResponse.json({ message: 'No emails in queue' })
  }

  let successCount = 0
  let failCount = 0

  // 2. Process each email
  for (const msg of messages) {
    const template = Array.isArray(msg.email_templates) ? msg.email_templates[0] : msg.email_templates
    const participant = Array.isArray(msg.participants) ? msg.participants[0] : msg.participants
    const event = Array.isArray(msg.events) ? msg.events[0] : msg.events
    
    let subject = template?.subject || `Notification for ${event?.name || 'Event'}`
    let html = template?.body || `<p>Hello ${participant?.full_name || 'Participant'},</p><p>This is a notification regarding ${event?.name || 'your event'}.</p>`

    // Simple template variable replacement
    subject = subject.replace(/{{event\.name}}/g, event?.name || 'Event')
    html = html.replace(/{{event\.name}}/g, event?.name || 'Event')
    html = html.replace(/{{participant\.name}}/g, participant?.full_name || 'Participant')
    
    // For ticket QR, in a real app we'd fetch the ticket token
    // For now, we mock the ticket data replacement
    html = html.replace(/{{ticket\.guest_id}}/g, 'GUEST-XXXX')
    html = html.replace(/{{ticket\.qr_token}}/g, 'mock-qr-token')

    // Send via Nodemailer (or mock)
    const result = await sendEmail({
      to: msg.recipient_email,
      subject,
      html
    })

    if (result.success) {
      successCount++
      // Update status to sent
      await supabase
        .from('email_messages')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          provider_message_id: result.messageId,
          attempt_count: (msg.attempt_count || 0) + 1
        })
        .eq('id', msg.id)
    } else {
      failCount++
      // Update status to failed or queued depending on attempt count
      const nextAttempt = (msg.attempt_count || 0) + 1
      await supabase
        .from('email_messages')
        .update({
          status: nextAttempt >= 3 ? 'failed' : 'queued',
          attempt_count: nextAttempt
        })
        .eq('id', msg.id)
    }
  }

  return NextResponse.json({
    message: 'Batch processed',
    processed: messages.length,
    success: successCount,
    failed: failCount
  })
}
